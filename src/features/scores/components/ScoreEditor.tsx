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
import { KEY_NAMES, isFlatKey } from "@/features/scores/types";

// --- Selection ---

type Selection =
  | { type: "chord"; measureTempId: string; chordTempId: string }
  | { type: "chord_gap"; measureTempId: string; afterChordTempId: string | null }
  | { type: "bar_line"; afterMeasureTempId: string | null }
  | null;

function selectionEquals(a: NonNullable<Selection>, b: NonNullable<Selection>): boolean {
  if (a.type !== b.type) return false;
  switch (a.type) {
    case "chord":
      return a.measureTempId === (b as typeof a).measureTempId && a.chordTempId === (b as typeof a).chordTempId;
    case "chord_gap":
      return a.measureTempId === (b as typeof a).measureTempId && a.afterChordTempId === (b as typeof a).afterChordTempId;
    case "bar_line":
      return a.afterMeasureTempId === (b as typeof a).afterMeasureTempId;
  }
}

function buildNavItems(visibleMeasures: EditableMeasure[]): NonNullable<Selection>[] {
  const items: NonNullable<Selection>[] = [];
  items.push({ type: "bar_line", afterMeasureTempId: null });
  for (const m of visibleMeasures) {
    const visChords = m.chords.filter((c) => !c._destroy);
    items.push({ type: "chord_gap", measureTempId: m.tempId, afterChordTempId: null });
    for (const c of visChords) {
      items.push({ type: "chord", measureTempId: m.tempId, chordTempId: c.tempId });
      items.push({ type: "chord_gap", measureTempId: m.tempId, afterChordTempId: c.tempId });
    }
    items.push({ type: "bar_line", afterMeasureTempId: m.tempId });
  }
  return items;
}

// --- Reducer ---

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
    }
  | { type: "SET_MEASURE_KEY"; measureTempId: string; keyName: string | null };

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

    case "SET_MEASURE_KEY":
      return state.map((m) =>
        m.tempId === action.measureTempId
          ? { ...m, key_name: action.keyName }
          : m
      );

    default:
      return state;
  }
}

// --- Bar Line (clickable divider) ---

function BarLine({ onClick, onPaste, hasClipboard, isSelected }: { onClick: () => void; onPaste?: () => void; hasClipboard?: boolean; isSelected?: boolean }) {
  const showButtons = isSelected;
  return (
    <div className="group relative flex w-3 shrink-0 items-center justify-center self-stretch">
      <div className={[
        "h-full w-px transition-all",
        isSelected ? "w-0.5 bg-blue-500" : "bg-foreground/30 group-hover:w-0.5 group-hover:bg-blue-500",
      ].join(" ")} />
      <div className={[
        "absolute flex-col gap-1",
        showButtons ? "flex" : "hidden group-hover:flex",
      ].join(" ")}>
        <button
          type="button"
          onClick={onClick}
          className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-blue-500 text-[10px] text-white shadow hover:bg-blue-600"
          title="小節を挿入"
        >
          +
        </button>
        {hasClipboard && onPaste && (
          <button
            type="button"
            onClick={onPaste}
            className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-green-500 text-[10px] text-white shadow hover:bg-green-600"
            title="コピーした小節をペースト"
          >
            ⎘
          </button>
        )}
      </div>
    </div>
  );
}

// --- Types ---

type ClipboardMeasure = {
  key_name?: string | null;
  chords: { root_offset: number; bass_offset: number; chord_type: string }[];
};

// --- Constants ---

const KEY_MAP: Record<string, number> = {
  A: 0, "A#": 1, Bb: 1, B: 2, C: 3, "C#": 4, Db: 4,
  D: 5, "D#": 6, Eb: 6, E: 7, F: 8, "F#": 9, Gb: 9,
  G: 10, "G#": 11, Ab: 11,
};

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
    key_name: m.key_name,
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
  const [selection, setSelection] = useState<Selection>(null);
  const [clipboard, setClipboard] = useState<ClipboardMeasure | null>(null);

  useEffect(() => {
    dispatch({ type: "INIT", measures: wholeScoreToEditable(initialData) });
    setSelection(null);
  }, [initialData]);

  const visibleMeasures = measures.filter((m) => !m._destroy);

  const selectedChordData = useMemo<EditableChord | null>(() => {
    if (!selection || selection.type !== "chord") return null;
    const measure = measures.find(
      (m) => m.tempId === selection.measureTempId
    );
    if (!measure) return null;
    return (
      measure.chords.find((c) => c.tempId === selection.chordTempId) ?? null
    );
  }, [measures, selection]);

  const scoreKey = KEY_MAP[formData.key_name] ?? 3;
  const useFlats = isFlatKey(formData.key_name);

  // 小節ごとの有効キーを算出（転調対応）
  const effectiveKeys = useMemo(() => {
    const map = new Map<string, { scoreKey: number; useFlats: boolean }>();
    let currentKey = scoreKey;
    let currentFlats = useFlats;
    for (const m of visibleMeasures) {
      if (m.key_name) {
        currentKey = KEY_MAP[m.key_name] ?? scoreKey;
        currentFlats = isFlatKey(m.key_name);
      }
      map.set(m.tempId, { scoreKey: currentKey, useFlats: currentFlats });
    }
    return map;
  }, [visibleMeasures, scoreKey, useFlats]);

  // ナビゲーションリスト
  const navItems = useMemo(() => buildNavItems(visibleMeasures), [visibleMeasures]);

  function handleNavigate(direction: "left" | "right") {
    if (!selection) {
      const first = navItems[0];
      if (first) setSelection(first);
      return;
    }
    const currentIdx = navItems.findIndex((item) => selectionEquals(item, selection));
    if (currentIdx === -1) return;
    const nextIdx = direction === "left" ? currentIdx - 1 : currentIdx + 1;
    const next = navItems[nextIdx];
    if (next) {
      setSelection(next);
    }
  }

  function handleInsertMeasure(afterTempId: string | null) {
    const measureTempId = nextTempId();
    const chordTempId = nextTempId();
    dispatch({ type: "INSERT_MEASURE_AFTER", afterTempId, newTempId: measureTempId });
    dispatch({ type: "ADD_CHORD", measureTempId, chordTempId });
    setSelection({ type: "chord", measureTempId, chordTempId });
  }

  function handleAddChord(measureTempId: string) {
    const chordTempId = nextTempId();
    dispatch({ type: "ADD_CHORD", measureTempId, chordTempId });
    setSelection({ type: "chord", measureTempId, chordTempId });
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
    setSelection({ type: "chord", measureTempId, chordTempId });
  }

  function handleRemoveChord(measureTempId: string, chordTempId: string) {
    if (
      selection?.type === "chord" &&
      selection.measureTempId === measureTempId &&
      selection.chordTempId === chordTempId
    ) {
      setSelection(null);
    }
    dispatch({ type: "REMOVE_CHORD", measureTempId, chordTempId });
  }

  function handleRemoveMeasure(measureTempId: string) {
    if (selection && "measureTempId" in selection && selection.measureTempId === measureTempId) {
      setSelection(null);
    }
    dispatch({ type: "REMOVE_MEASURE", tempId: measureTempId });
  }

  function handleSelectChord(measureTempId: string, chordTempId: string) {
    setSelection({ type: "chord", measureTempId, chordTempId });
  }

  function handleUpdateField(field: string, value: number | string) {
    if (!selection || selection.type !== "chord") return;
    dispatch({
      type: "UPDATE_CHORD",
      measureTempId: selection.measureTempId,
      chordTempId: selection.chordTempId,
      field,
      value,
    });
  }

  function handleCopyMeasure(measureTempId: string) {
    const measure = measures.find((m) => m.tempId === measureTempId);
    if (!measure) return;
    const visibleChords = measure.chords.filter((c) => !c._destroy);
    setClipboard({
      key_name: measure.key_name,
      chords: visibleChords.map((c) => ({
        root_offset: c.root_offset,
        bass_offset: c.bass_offset,
        chord_type: c.chord_type,
      })),
    });
  }

  function handlePasteMeasure(afterTempId: string | null) {
    if (!clipboard) return;
    const measureTempId = nextTempId();
    dispatch({ type: "INSERT_MEASURE_AFTER", afterTempId, newTempId: measureTempId });
    if (clipboard.key_name) {
      dispatch({ type: "SET_MEASURE_KEY", measureTempId, keyName: clipboard.key_name });
    }
    let firstChordTempId: string | null = null;
    for (const chord of clipboard.chords) {
      const chordTempId = nextTempId();
      if (!firstChordTempId) firstChordTempId = chordTempId;
      dispatch({ type: "ADD_CHORD", measureTempId, chordTempId });
      dispatch({ type: "UPDATE_CHORD", measureTempId, chordTempId, field: "root_offset", value: chord.root_offset });
      dispatch({ type: "UPDATE_CHORD", measureTempId, chordTempId, field: "bass_offset", value: chord.bass_offset });
      dispatch({ type: "UPDATE_CHORD", measureTempId, chordTempId, field: "chord_type", value: chord.chord_type });
    }
    if (firstChordTempId) {
      setSelection({ type: "chord", measureTempId, chordTempId: firstChordTempId });
    }
  }

  async function handleSave() {
    const result = await updateScore(scoreId, formData, measures);
    if (result) {
      router.push(`/scores/${scoreId}`);
    }
  }

  // BarLine の選択判定ヘルパー
  function isBarLineSelected(afterMeasureTempId: string | null): boolean {
    return selection?.type === "bar_line" && selection.afterMeasureTempId === afterMeasureTempId;
  }

  // ChordGap の選択判定ヘルパー
  function getSelectedGap(measureTempId: string): string | null | undefined {
    if (selection?.type === "chord_gap" && selection.measureTempId === measureTempId) {
      return selection.afterChordTempId;
    }
    return undefined; // このmeasureにギャップ選択なし
  }

  // 選択中コードが属する小節のキー
  const selectedMeasureKey = useMemo(() => {
    if (!selection || !("measureTempId" in selection)) return { scoreKey, useFlats };
    return effectiveKeys.get(selection.measureTempId) ?? { scoreKey, useFlats };
  }, [selection, effectiveKeys, scoreKey, useFlats]);

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
                    onPaste={() => handlePasteMeasure(null)}
                    hasClipboard={!!clipboard}
                    isSelected={isBarLineSelected(null)}
                  />
                )}
                {/* Non-first rows: leading bar line inserts after prev row's last measure */}
                {rowIdx > 0 && (() => {
                  const prevRow = rows[rowIdx - 1]!;
                  const lastMeasure = prevRow[prevRow.length - 1]!;
                  return (
                    <BarLine
                      onClick={() => handleInsertMeasure(lastMeasure.tempId)}
                      onPaste={() => handlePasteMeasure(lastMeasure.tempId)}
                      hasClipboard={!!clipboard}
                      isSelected={isBarLineSelected(lastMeasure.tempId)}
                    />
                  );
                })()}

                {row.map((measure, colIdx) => {
                  const globalIndex = rowIdx * 4 + colIdx;
                  const ek = effectiveKeys.get(measure.tempId);
                  return (
                    <Fragment key={measure.tempId}>
                      <div className="min-h-[60px] flex-1 border-b border-foreground/15">
                        <MeasureEditor
                          measure={measure}
                          measureIndex={globalIndex}
                          scoreKey={ek?.scoreKey ?? scoreKey}
                          useFlats={ek?.useFlats ?? useFlats}
                          selectedChordTempId={
                            selection?.type === "chord" && selection.measureTempId === measure.tempId
                              ? selection.chordTempId
                              : null
                          }
                          selectedGapAfterChordTempId={getSelectedGap(measure.tempId)}
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
                          onSetKey={(keyName: string | null) =>
                            dispatch({ type: "SET_MEASURE_KEY", measureTempId: measure.tempId, keyName })
                          }
                          onCopy={() => handleCopyMeasure(measure.tempId)}
                          onPaste={() => handlePasteMeasure(measure.tempId)}
                          hasClipboard={!!clipboard}
                        />
                      </div>
                      {/* Bar line after each measure */}
                      <BarLine
                        onClick={() => handleInsertMeasure(measure.tempId)}
                        onPaste={() => handlePasteMeasure(measure.tempId)}
                        hasClipboard={!!clipboard}
                        isSelected={isBarLineSelected(measure.tempId)}
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
                setSelection({ type: "chord", measureTempId, chordTempId });
              }}
              className="rounded border border-dashed border-foreground/20 px-4 py-2 text-sm text-foreground/50 transition-colors hover:border-foreground/40 hover:text-foreground/80"
            >
              + 小節追加
            </button>
          </div>
        )}

        {/* ナビゲーション矢印 */}
        {visibleMeasures.length > 0 && (
          <div className="mt-3 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => handleNavigate("left")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground/20 text-sm text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground active:bg-foreground/10"
            >
              ◀
            </button>
            <span className="text-xs text-foreground/40">
              {!selection && "タップで選択"}
              {selection?.type === "chord" && "コード選択中"}
              {selection?.type === "chord_gap" && "コード挿入位置"}
              {selection?.type === "bar_line" && "小節挿入位置"}
            </span>
            <button
              type="button"
              onClick={() => handleNavigate("right")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground/20 text-sm text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground active:bg-foreground/10"
            >
              ▶
            </button>
          </div>
        )}

        {/* アクションパネル: 選択状態に応じて切り替え */}
        {selection?.type === "chord" && (
          <ChordInputPanel
            chord={selectedChordData}
            scoreKey={selectedMeasureKey.scoreKey}
            useFlats={selectedMeasureKey.useFlats}
            onUpdateField={handleUpdateField}
          />
        )}

        {selection?.type === "chord_gap" && (
          <div className="mt-4 flex items-center justify-center rounded-lg border border-dashed border-foreground/20 py-6">
            <button
              type="button"
              onClick={() => handleInsertChord(selection.measureTempId, selection.afterChordTempId)}
              className="rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              + コードを挿入
            </button>
          </div>
        )}

        {selection?.type === "bar_line" && (
          <div className="mt-4 flex items-center justify-center gap-3 rounded-lg border border-dashed border-foreground/20 py-6">
            <button
              type="button"
              onClick={() => handleInsertMeasure(selection.afterMeasureTempId)}
              className="rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              + 小節を挿入
            </button>
            {clipboard && (
              <button
                type="button"
                onClick={() => handlePasteMeasure(selection.afterMeasureTempId)}
                className="rounded bg-green-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                ペースト
              </button>
            )}
          </div>
        )}

        {!selection && visibleMeasures.length > 0 && (
          <div className="mt-4 rounded-lg border border-dashed border-foreground/20 py-6 text-center text-sm text-foreground/40">
            コードを選択するか、◀ ▶ で移動してください
          </div>
        )}
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
