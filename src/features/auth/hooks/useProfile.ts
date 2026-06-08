"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

type Profile = {
  id: number;
  name: string;
  handle_name_set: boolean;
  role: "user" | "admin";
};

type ApiProfile = {
  id: number;
  name: string;
  "handle_name_set?": boolean;
  role: "user" | "admin";
};

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        const data = await apiClient<ApiProfile>("/api/users/me", {
          requireAuth: true,
        });
        if (!cancelled) {
          setProfile({
            id: data.id,
            name: data.name,
            handle_name_set: data["handle_name_set?"],
            role: data.role,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to fetch profile");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateName = useCallback(async (name: string) => {
    setError(null);
    setUpdating(true);
    try {
      const data = await apiClient<ApiProfile>("/api/users/me", {
        method: "PATCH",
        body: { user: { name } },
        requireAuth: true,
      });
      setProfile({
        id: data.id,
        name: data.name,
        handle_name_set: data["handle_name_set?"],
        role: data.role,
      });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update name");
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  return { profile, error, loading, updating, updateName };
}
