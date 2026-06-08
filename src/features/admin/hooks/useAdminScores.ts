"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export type AdminScore = {
  id: number;
  slug: string;
  title: string;
  artist: string | null;
  key: number;
  key_name: string;
  published: boolean;
  created_at: string;
  tag_names: string[];
  user: { id: number; name: string } | null;
};

type AdminScoresResponse = {
  scores: AdminScore[];
  total_count: number;
  page: number;
  per_page: number;
};

export function useAdminScores(page: number) {
  const [data, setData] = useState<AdminScoresResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchCount, setFetchCount] = useState(0);

  const refetch = useCallback(() => setFetchCount((c) => c + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchScores() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient<AdminScoresResponse>(
          `/api/admin/scores?page=${page}`,
          { requireAuth: true },
        );
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to fetch scores");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchScores();
    return () => {
      cancelled = true;
    };
  }, [page, fetchCount]);

  const unpublishScore = useCallback(
    async (id: number) => {
      await apiClient(`/api/admin/scores/${id}/unpublish`, {
        method: "PATCH",
        requireAuth: true,
      });
      refetch();
    },
    [refetch],
  );

  const deleteScore = useCallback(
    async (id: number) => {
      await apiClient(`/api/admin/scores/${id}`, {
        method: "DELETE",
        requireAuth: true,
      });
      refetch();
    },
    [refetch],
  );

  return { data, error, loading, unpublishScore, deleteScore };
}
