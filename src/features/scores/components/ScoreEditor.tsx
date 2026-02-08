"use client";

import { useReducer, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ScoreMetaForm } from "@/features/scores/components/ScoreMetaForm";
import { MeasureEditor } from "@/features/scores/components/MeasureEditor";
import { useUpdateScore } from "@/features/scores/hooks/useUpdateScore";
import type {
  WholeScore,
  ScoreFormData,
  EditableMeasure,
  EditableChord,
} from "@/features/scores/types";
import { KEY_NAMES } from "@/features/scores/types";

// --- Reducer ---

type MeasureAction =
  | { type: "INIT"; measures: EditableMeasure[] }
  | { type: "ADD_MEASURE" }
  | { type: "REMOVE_MEASURE"; tempId: string }
  | { type: "ADD_CHORD"; measureTempId: string }
  | { type: "REMOVE_CHORD"; measureTempId: string; chordTempId: string }
  | {
      type: "UPDATE_CHORD";
      measureTempId: string;
      chordTempId: string;
      field: string;
      value: number | string;
    };

let tempIdCounter = 0;
function nextTempId(): string {
  return `temp_${++tempIdCounter}`;
}

function newChord(position: number): EditableChord {
  return {
    tempId: nextTempId(),
    position,
    root_offset: 0,
    bass_offset: 0,
    chord_type: "major",
  };
}

function newMeasure(position: number): EditableMeasure {
  return {
    tempId: nextTempId(),
    position,
    chords: [],
  };
}

function measuresReducer(
  state: EditableMeasure[],
  action: MeasureAction
): EditableMeasure[] {
  switch (action.type) {
    case "INIT":
      return action.measures;

    case "ADD_MEASURE": {
      const maxPos = state.reduce(
        (max, m) => (m._destroy ? max : Math.max(max, m.position)),
        0
      );
      return [...state, newMeasure(maxPos + 1)];
    }

    case "REMOVE_MEASURE":
      return state.map((m) =>
        m.tempId === action.tempId
          ? m.id
            ? { ...m, _destroy: true }
            : { ...m, _destroy: true }
          : m
      ).filter((m) => m._destroy ? m.id !== undefined : true);

    case "ADD_CHORD":
      return state.map((m) => {
        if (m.tempId !== action.measureTempId) return m;
        const maxPos = m.chords.reduce(
          (max, c) => (c._destroy ? max : Math.max(max, c.position)),
          0
        );
        return { ...m, chords: [...m.chords, newChord(maxPos + 1)] };
      });

    case "REMOVE_CHORD":
      return state.map((m) => {
        if (m.tempId !== action.measureTempId) return m;
        return {
          ...m,
          chords: m.chords
            .map((c) =>
              c.tempId === action.chordTempId
                ? c.id
                  ? { ...c, _destroy: true }
                  : { ...c, _destroy: true }
                : c
            )
            .filter((c) => (c._destroy ? c.id !== undefined : true)),
        };
      });

    case "UPDATE_CHORD":
      return state.map((m) => {
        if (m.tempId !== action.measureTempId) return m;
        return {
          ...m,
          chords: m.chords.map((c) =>
            c.tempId === action.chordTempId
              ? { ...c, [action.field]: action.value }
              : c
          ),
        };
      });

    default:
      return state;
  }
}

// --- Component ---

type ScoreEditorProps = {
  scoreId: number;
  initialData: WholeScore;
};

function wholeScoreToEditable(ws: WholeScore): EditableMeasure[] {
  return ws.measures.map((m) => ({
    tempId: nextTempId(),
    id: m.id,
    position: m.position,
    chords: m.chords.map((c) => ({
      tempId: nextTempId(),
      id: c.id,
      position: c.position,
      root_offset: c.root_offset,
      bass_offset: c.bass_offset,
      chord_type: c.chord_type,
    })),
  }));
}

function resolveKeyName(ws: WholeScore): string {
  if (KEY_NAMES.includes(ws.key_name as (typeof KEY_NAMES)[number])) {
    return ws.key_name;
  }
  return KEY_NAMES[0];
}

export function ScoreEditor({ scoreId, initialData }: ScoreEditorProps) {
  const router = useRouter();
  const { updateScore, error, loading } = useUpdateScore();

  const [formData, setFormData] = useState<ScoreFormData>({
    title: initialData.title,
    key_name: resolveKeyName(initialData),
    tempo: initialData.tempo?.toString() ?? "",
    time_signature: initialData.time_signature ?? "",
  });

  const [measures, dispatch] = useReducer(measuresReducer, []);

  useEffect(() => {
    dispatch({ type: "INIT", measures: wholeScoreToEditable(initialData) });
  }, [initialData]);

  const visibleMeasures = measures.filter((m) => !m._destroy);

  // key_name → key (数値) の変換
  const KEY_MAP: Record<string, number> = {
    A: 0, "A#": 1, Bb: 1, B: 2, C: 3, "C#": 4, Db: 4,
    D: 5, "D#": 6, Eb: 6, E: 7, F: 8, "F#": 9, Gb: 9,
    G: 10, "G#": 11, Ab: 11,
  };
  const scoreKey = KEY_MAP[formData.key_name] ?? 3;

  async function handleSave() {
    const result = await updateScore(scoreId, formData, measures);
    if (result) {
      router.push(`/scores/${scoreId}`);
    }
  }

  return (
    <div>
      <ScoreMetaForm formData={formData} onChange={setFormData} />

      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">コード譜</h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visibleMeasures.map((measure, index) => (
            <MeasureEditor
              key={measure.tempId}
              measure={measure}
              measureIndex={index}
              scoreKey={scoreKey}
              onAddChord={() =>
                dispatch({ type: "ADD_CHORD", measureTempId: measure.tempId })
              }
              onRemoveChord={(chordTempId) =>
                dispatch({
                  type: "REMOVE_CHORD",
                  measureTempId: measure.tempId,
                  chordTempId,
                })
              }
              onUpdateChord={(chordTempId, field, value) =>
                dispatch({
                  type: "UPDATE_CHORD",
                  measureTempId: measure.tempId,
                  chordTempId,
                  field,
                  value,
                })
              }
              onRemoveMeasure={() =>
                dispatch({ type: "REMOVE_MEASURE", tempId: measure.tempId })
              }
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: "ADD_MEASURE" })}
          className="mt-3 rounded border border-dashed border-foreground/20 px-4 py-2 text-sm text-foreground/50 transition-colors hover:border-foreground/40 hover:text-foreground/80"
        >
          + 小節追加
        </button>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <div className="mt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || !formData.title}
          className="rounded bg-foreground px-6 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "保存中..." : "保存"}
        </button>
      </div>
    </div>
  );
}
