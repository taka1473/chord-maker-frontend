"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type {
  WholeScore,
  ScoreFormData,
  EditableMeasure,
} from "@/features/scores/types";

function toMeasuresAttributes(measures: EditableMeasure[]) {
  return measures.map((measure) => ({
    id: measure.id,
    position: measure.position,
    key_name: measure.key_name ?? null,
    key_mode: measure.key_mode ?? null,
    row_break_before: measure.row_break_before ?? false,
    _destroy: measure._destroy,
    chords_attributes: measure.chords.map((chord) => ({
      id: chord.id,
      position: chord.position,
      root_offset: chord.root_offset,
      bass_offset: chord.bass_offset,
      chord_type: chord.chord_type,
      _destroy: chord._destroy,
    })),
  }));
}

export function useUpdateScore() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const updateScore = useCallback(
    async (
      slug: string,
      formData: ScoreFormData,
      measures: EditableMeasure[],
      published: boolean,
      guestToken?: string | null
    ) => {
      setError(null);
      setLoading(true);
      try {
        const body: Record<string, unknown> = {
          score: {
            title: formData.title,
            artist: formData.artist || null,
            key_name: formData.key_name,
            key_mode: formData.key_mode,
            tempo: formData.tempo ? Number(formData.tempo) : null,
            time_signature: formData.time_signature || null,
            published,
            tag_names: formData.tag_names,
            measures_attributes: toMeasuresAttributes(measures),
          },
        };
        if (guestToken) body["guest_token"] = guestToken;
        const result = await apiClient<WholeScore>(
          `/api/scores/${slug}/upsert_whole_score`,
          {
            method: "PATCH",
            body,
            requireAuth: guestToken ? false : true,
          }
        );
        return result;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update score");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateScore, error, loading };
}
