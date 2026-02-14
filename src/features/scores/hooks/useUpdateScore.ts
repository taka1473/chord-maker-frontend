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
      id: number,
      formData: ScoreFormData,
      measures: EditableMeasure[],
      published: boolean
    ) => {
      setError(null);
      setLoading(true);
      try {
        const result = await apiClient<WholeScore>(
          `/api/scores/${id}/upsert_whole_score`,
          {
            method: "PATCH",
            body: {
              score: {
                title: formData.title,
                artist: formData.artist || null,
                key_name: formData.key_name,
                tempo: formData.tempo ? Number(formData.tempo) : null,
                time_signature: formData.time_signature || null,
                published,
                tag_names: formData.tag_names,
                measures_attributes: toMeasuresAttributes(measures),
              },
            },
            requireAuth: true,
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
