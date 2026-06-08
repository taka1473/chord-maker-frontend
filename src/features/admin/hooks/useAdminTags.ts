"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export type AdminTag = {
  id: number;
  name: string;
  created_at: string;
  scores_count: number;
};

type AdminTagsResponse = {
  tags: AdminTag[];
  total_count: number;
  page: number;
  per_page: number;
};

export function useAdminTags(page: number) {
  const [data, setData] = useState<AdminTagsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchCount, setFetchCount] = useState(0);

  const refetch = useCallback(() => setFetchCount((c) => c + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchTags() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient<AdminTagsResponse>(
          `/api/admin/tags?page=${page}`,
          { requireAuth: true },
        );
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to fetch tags");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTags();
    return () => {
      cancelled = true;
    };
  }, [page, fetchCount]);

  const deleteTag = useCallback(
    async (id: number) => {
      await apiClient(`/api/admin/tags/${id}`, {
        method: "DELETE",
        requireAuth: true,
      });
      refetch();
    },
    [refetch],
  );

  return { data, error, loading, deleteTag };
}
