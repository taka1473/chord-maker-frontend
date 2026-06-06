"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Score } from "@/features/scores/types";

export function useClaimScore() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const claimScore = useCallback(async (slug: string, guestToken: string) => {
    setError(null);
    setLoading(true);
    try {
      const score = await apiClient<Score>(
        `/api/scores/${slug}/claim`,
        { method: "PATCH", body: { guest_token: guestToken }, requireAuth: true }
      );
      return score;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to claim score");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { claimScore, error, loading };
}
