"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import type { Score } from "@/features/scores/types";

export function useMyScores() {
  const [scores, setScores] = useState<Score[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchScores() {
      try {
        const data = await apiClient<Score[]>("/api/me/scores", {
          requireAuth: true,
        });
        if (!cancelled) {
          setScores(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to fetch scores");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchScores();
    return () => {
      cancelled = true;
    };
  }, []);

  return { scores, error, loading };
}
