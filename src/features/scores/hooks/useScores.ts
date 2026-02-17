"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import type { Score } from "@/features/scores/types";

export type SortOption = "newest" | "oldest";

type UseScoresParams = {
  search?: string;
  tags?: string[];
  sort?: SortOption;
};

export function useScores(params: UseScoresParams = {}) {
  const { search, tags, sort } = params;
  const [scores, setScores] = useState<Score[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const tagsKey = tags?.join(",") ?? "";

  useEffect(() => {
    let cancelled = false;

    async function fetchScores() {
      setLoading(true);
      try {
        const qp = new URLSearchParams();
        if (search) qp.set("search", search);
        if (tags && tags.length > 0) {
          tags.forEach((t) => qp.append("tags[]", t));
        }
        if (sort) qp.set("sort", sort);
        const qs = qp.toString();
        const url = qs ? `/api/scores?${qs}` : "/api/scores";
        const data = await apiClient<Score[]>(url);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, tagsKey, sort]);

  return { scores, error, loading };
}
