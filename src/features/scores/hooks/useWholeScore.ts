"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import type { WholeScore } from "@/features/scores/types";

export function useWholeScore(slug: string, serverData?: WholeScore) {
  const [wholeScore, setWholeScore] = useState<WholeScore | null>(serverData ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!serverData);

  useEffect(() => {
    if (serverData) return;

    let cancelled = false;

    async function fetchWholeScore() {
      try {
        const data = await apiClient<WholeScore>(
          `/api/scores/${slug}/whole_score`,
          { requireAuth: "optional" }
        );
        if (!cancelled) {
          setWholeScore(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to fetch score detail"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchWholeScore();
    return () => {
      cancelled = true;
    };
  }, [slug, serverData]);

  return { wholeScore, error, loading };
}
