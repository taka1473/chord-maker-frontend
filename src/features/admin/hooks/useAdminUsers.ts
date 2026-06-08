"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export type AdminUser = {
  id: number;
  name: string;
  account_id: string;
  role: "user" | "admin";
  created_at: string;
  scores_count: number;
};

type AdminUsersResponse = {
  users: AdminUser[];
  total_count: number;
  page: number;
  per_page: number;
};

export function useAdminUsers(page: number) {
  const [data, setData] = useState<AdminUsersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchCount, setFetchCount] = useState(0);

  const refetch = useCallback(() => setFetchCount((c) => c + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient<AdminUsersResponse>(
          `/api/admin/users?page=${page}`,
          { requireAuth: true },
        );
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to fetch users");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [page, fetchCount]);

  const deleteUser = useCallback(
    async (id: number) => {
      await apiClient(`/api/admin/users/${id}`, {
        method: "DELETE",
        requireAuth: true,
      });
      refetch();
    },
    [refetch],
  );

  return { data, error, loading, deleteUser };
}
