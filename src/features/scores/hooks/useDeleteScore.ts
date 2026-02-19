"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

export function useDeleteScore() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const deleteScore = useCallback(async (slug: string) => {
    setError(null);
    setLoading(true);
    try {
      await apiClient<void>(`/api/scores/${slug}`, {
        method: "DELETE",
        requireAuth: true,
      });
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete score");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteScore, error, loading };
}
