"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { Score, ScoreFormData } from "@/features/scores/types";

export function useCreateScore() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createScore = useCallback(async (formData: ScoreFormData) => {
    setError(null);
    setLoading(true);
    try {
      const score = await apiClient<Score>("/api/scores", {
        method: "POST",
        body: {
          score: {
            title: formData.title,
            artist: formData.artist || undefined,
            key_name: formData.key_name,
            tempo: formData.tempo ? Number(formData.tempo) : undefined,
            time_signature: formData.time_signature || undefined,
            tag_names: formData.tag_names.length > 0 ? formData.tag_names : undefined,
          },
        },
        requireAuth: "optional",
      });
      return score;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create score");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createScore, error, loading };
}
