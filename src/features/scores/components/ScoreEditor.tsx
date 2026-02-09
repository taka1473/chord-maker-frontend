"use client";

import { Fragment, useReducer, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ScoreMetaForm } from "@/features/scores/components/ScoreMetaForm";
import { MeasureEditor } from "@/features/scores/components/MeasureEditor";
import { ChordInputPanel } from "@/features/scores/components/ChordInputPanel";
import { useUpdateScore } from "@/features/scores/hooks/useUpdateScore";
import type {
  WholeScore,
  ScoreFormData,
  EditableMeasure,
  EditableChord,
} from "@/features/scores/types";
import { KEY_NAMES } from "@/features/scores/types";

// --- Reducer ---

type SelectedChord = {
  measureTempId: string;
  chordTempId: string;
} | null;

type MeasureAction =
  | { type: "INIT"; measures: EditableMeasure[] }
  | { type: "ADD_MEASURE"; newTempId: string }
  | { type: "INSERT_MEASURE_AFTER"; afterTempId: string | null; newTempId: string }
  | { type: "REMOVE_MEASURE"; tempId: string }
  | { type: "ADD_CHORD"; measureTempId: string; chordTempId: string }
  | {
      type: "INSERT_CHORD_AFTER";
      measureTempId: string;
      afterChordTempId: string | null;
      chordTempId: string;
    }
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
      return [
        ...state,
        { tempId: action.newTempId, position: maxPos + 1, chords: [] },
      ];
    }

    case "INSERT_MEASURE_AFTER": {
      const newMeasure: EditableMeasure = {
        tempId: action.newTempId,
        position: 0,
        chords: [],
      };

      let insertIdx: number;
      if (action.afterTempId === null) {
        // Insert at the beginning
        const firstVisibleIdx = state.findIndex((m) => !m._destroy);
        insertIdx = firstVisibleIdx >= 0 ? firstVisibleIdx : 0;
      } else {
        insertIdx = state.findIndex((m) => m.tempId === action.afterTempId) + 1;
      }

      const newState = [...state];
      newState.splice(insertIdx, 0, newMeasure);

      // Renumber positions for non-destroyed measures
      let pos = 1;
      return newState.map((m) =>
        m._destroy ? m : { ...m, position: pos++ }
      );
    }

    case "REMOVE_MEASURE":
      return state
        .map((m) =>
          m.tempId === action.tempId
            ? m.id
              ? { ...m, _destroy: true }
              : { ...m, _destroy: true }
            : m
        )
        .filter((m) => (m._destroy ? m.id !== undefined : true));

    case "ADD_CHORD":
      return state.map((m) => {
        if (m.tempId !== action.measureTempId) return m;
        const maxPos = m.chords.reduce(
          (max, c) => (c._destroy ? max : Math.max(max, c.position)),
          0
        );
        const chord: EditableChord = {
          tempId: action.chordTempId,
          position: maxPos + 1,
          root_offset: 0,
          bass_offset: 0,
          chord_type: "major",
        };
        return { ...m, chords: [...m.chords, chord] };
      });

    case "INSERT_CHORD_AFTER":
      return state.map((m) => {
        if (m.tempId !== action.measureTempId) return m;

        const newChord: EditableChord = {
          tempId: action.chordTempId,
          position: 0,
          root_offset: 0,
          bass_offset: 0,
          chord_type: "major",
        };

        let insertIdx: number;
        if (action.afterChordTempId === null) {
          const firstVisibleIdx = m.chords.findIndex((c) => !c._destroy);
          insertIdx = firstVisibleIdx >= 0 ? firstVisibleIdx : 0;
        } else {
          insertIdx =
            m.chords.findIndex((c) => c.tempId === action.afterChordTempId) + 1;
        }

        const newChords = [...m.chords];
        newChords.splice(insertIdx, 0, newChord);

        let pos = 1;
        return {
          ...m,
          chords: newChords.map((c) =>
            c._destroy ? c : { ...c, position: pos++ }
          ),
        };
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

// --- Bar Line (clickable divider) ---

function BarLine({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-3 shrink-0 cursor-pointer items-center justify-center self-stretch"
      title="小節を挿入"
    >
      <div className="h-full w-px bg-foreground/30 transition-all group-hover:w-0.5 group-hover:bg-blue-500" />
      <span className="absolute hidden h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white shadow group-hover:flex">
        +
      </span>
    </button>
  );
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
  const [selectedChord, setSelectedChord] = useState<SelectedChord>(null);

  useEffect(() => {
    dispatch({ type: "INIT", measures: wholeScoreToEditable(initialData) });
    setSelectedChord(null);
  }, [initialData]);

  const visibleMeasures = measures.filter((m) => !m._destroy);

  const selectedChordData = useMemo<EditableChord | null>(() => {
    if (!selectedChord) return null;
    const measure = measures.find(
      (m) => m.tempId === selectedChord.measureTempId
    );
    if (!measure) return null;
    return (
      measure.chords.find((c) => c.tempId === selectedChord.chordTempId) ?? null
    );
  }, [measures, selectedChord]);

  // key_name → key (数値) の変換
  const KEY_MAP: Record<string, number> = {
    A: 0, "A#": 1, Bb: 1, B: 2, C: 3, "C#": 4, Db: 4,
    D: 5, "D#": 6, Eb: 6, E: 7, F: 8, "F#": 9, Gb: 9,
    G: 10, "G#": 11, Ab: 11,
  };
  const scoreKey = KEY_MAP[formData.key_name] ?? 3;

  function handleInsertMeasure(afterTempId: string | null) {
    const measureTempId = nextTempId();
    const chordTempId = nextTempId();
    dispatch({ type: "INSERT_MEASURE_AFTER", afterTempId, newTempId: measureTempId });
    dispatch({ type: "ADD_CHORD", measureTempId, chordTempId });
    setSelectedChord({ measureTempId, chordTempId });
  }

  function handleAddChord(measureTempId: string) {
    const chordTempId = nextTempId();
    dispatch({ type: "ADD_CHORD", measureTempId, chordTempId });
    setSelectedChord({ measureTempId, chordTempId });
  }

  function handleInsertChord(
    measureTempId: string,
    afterChordTempId: string | null
  ) {
    const chordTempId = nextTempId();
    dispatch({
      type: "INSERT_CHORD_AFTER",
      measureTempId,
      afterChordTempId,
      chordTempId,
    });
    setSelectedChord({ measureTempId, chordTempId });
  }

  function handleRemoveChord(measureTempId: string, chordTempId: string) {
    if (
      selectedChord?.measureTempId === measureTempId &&
      selectedChord?.chordTempId === chordTempId
    ) {
      setSelectedChord(null);
    }
    dispatch({ type: "REMOVE_CHORD", measureTempId, chordTempId });
  }

  function handleRemoveMeasure(measureTempId: string) {
    if (selectedChord?.measureTempId === measureTempId) {
      setSelectedChord(null);
    }
    dispatch({ type: "REMOVE_MEASURE", tempId: measureTempId });
  }

  function handleSelectChord(measureTempId: string, chordTempId: string) {
    setSelectedChord({ measureTempId, chordTempId });
  }

  function handleUpdateField(field: string, value: number | string) {
    if (!selectedChord) return;
    dispatch({
      type: "UPDATE_CHORD",
      measureTempId: selectedChord.measureTempId,
      chordTempId: selectedChord.chordTempId,
      field,
      value,
    });
  }

  async function handleSave() {
    const result = await updateScore(scoreId, formData, measures);
    if (result) {
      router.push(`/scores/${scoreId}`);
    }
  }

  // Split visible measures into rows of 4 for bar-line layout
  const rows: EditableMeasure[][] = [];
  for (let i = 0; i < visibleMeasures.length; i += 4) {
    rows.push(visibleMeasures.slice(i, i + 4));
  }

  return (
    <div>
      <ScoreMetaForm formData={formData} onChange={setFormData} />

      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">コード譜</h2>

        {rows.length > 0 ? (
          <div className="space-y-0">
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} className="flex items-stretch">
                {/* Leading bar line for first row */}
                {rowIdx === 0 && (
                  <BarLine
                    onClick={() => handleInsertMeasure(null)}
                  />
                )}
                {/* Non-first rows: leading bar line inserts after prev row's last measure */}
                {rowIdx > 0 && (
                  <BarLine
                    onClick={() => {
                      const prevRow = rows[rowIdx - 1]!;
                      const lastMeasure = prevRow[prevRow.length - 1]!;
                      handleInsertMeasure(lastMeasure.tempId);
                    }}
                  />
                )}

                {row.map((measure, colIdx) => {
                  const globalIndex = rowIdx * 4 + colIdx;
                  return (
                    <Fragment key={measure.tempId}>
                      <div className="min-h-[60px] flex-1 border-b border-foreground/15">
                        <MeasureEditor
                          measure={measure}
                          measureIndex={globalIndex}
                          scoreKey={scoreKey}
                          selectedChordTempId={
                            selectedChord?.measureTempId === measure.tempId
                              ? selectedChord.chordTempId
                              : null
                          }
                          onSelectChord={(chordTempId) =>
                            handleSelectChord(measure.tempId, chordTempId)
                          }
                          onAddChord={() => handleAddChord(measure.tempId)}
                          onInsertChord={(afterChordTempId) =>
                            handleInsertChord(measure.tempId, afterChordTempId)
                          }
                          onRemoveChord={(chordTempId) =>
                            handleRemoveChord(measure.tempId, chordTempId)
                          }
                          onRemoveMeasure={() =>
                            handleRemoveMeasure(measure.tempId)
                          }
                        />
                      </div>
                      {/* Bar line after each measure */}
                      <BarLine
                        onClick={() => handleInsertMeasure(measure.tempId)}
                      />
                    </Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <button
              type="button"
              onClick={() => {
                const measureTempId = nextTempId();
                const chordTempId = nextTempId();
                dispatch({ type: "ADD_MEASURE", newTempId: measureTempId });
                dispatch({ type: "ADD_CHORD", measureTempId, chordTempId });
                setSelectedChord({ measureTempId, chordTempId });
              }}
              className="rounded border border-dashed border-foreground/20 px-4 py-2 text-sm text-foreground/50 transition-colors hover:border-foreground/40 hover:text-foreground/80"
            >
              + 小節追加
            </button>
          </div>
        )}

        <ChordInputPanel
          chord={selectedChordData}
          scoreKey={scoreKey}
          onUpdateField={handleUpdateField}
        />
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
