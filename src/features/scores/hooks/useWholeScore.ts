"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import type { WholeScore } from "@/features/scores/types";

export function useWholeScore(slug: string) {
  const [wholeScore, setWholeScore] = useState<WholeScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [slug]);

  return { wholeScore, error, loading };
}
