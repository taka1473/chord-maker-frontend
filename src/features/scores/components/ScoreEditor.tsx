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
import { KEY_NAMES, isFlatKey, formatChord } from "@/features/scores/types";
import type { Selection } from "@/features/scores/lib/selection";
import { selectionEquals, buildNavItems } from "@/features/scores/lib/selection";
import { measuresReducer, nextTempId } from "@/features/scores/lib/measures-reducer";
import { Button } from "@/features/shared";

// --- Bar Line (clickable divider) ---

function BarLine({ onClick, onPaste, hasClipboard, isSelected, hideBar }: { onClick: () => void; onPaste?: () => void; hasClipboard?: boolean; isSelected?: boolean; hideBar?: boolean }) {
  const showButtons = isSelected;
  return (
    <div className="group relative flex w-3 shrink-0 items-center justify-center self-stretch">
      <div className={[
        "h-full w-px transition-all",
        hideBar && !isSelected ? "bg-transparent group-hover:bg-primary" : isSelected ? "w-0.5 bg-primary" : "bg-border group-hover:w-0.5 group-hover:bg-primary",
      ].join(" ")} />
      <div className={[
        "absolute flex-col gap-1",
        showButtons ? "flex" : "hidden group-hover:flex",
      ].join(" ")}>
        <button
          type="button"
          onClick={onClick}
          className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground shadow hover:opacity-90"
          title="小節を挿入"
        >
          +
        </button>
        {hasClipboard && onPaste && (
          <button
            type="button"
            onClick={onPaste}
            className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-secondary text-[10px] text-secondary-foreground shadow hover:opacity-90"
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
  scoreSlug: string;
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

export function ScoreEditor({ scoreSlug, initialData }: ScoreEditorProps) {
  const router = useRouter();
  const { updateScore, error, loading } = useUpdateScore();
  const cols = 4;

  const [formData, setFormData] = useState<ScoreFormData>({
    title: initialData.title,
    artist: initialData.artist ?? "",
    key_name: resolveKeyName(initialData),
    tempo: initialData.tempo?.toString() ?? "",
    time_signature: initialData.time_signature ?? "",
    tag_names: initialData.tag_names ?? [],
  });

  const [published, setPublished] = useState(initialData.published);
  const [measures, dispatch] = useReducer(measuresReducer, []);
  const [selection, setSelectionRaw] = useState<Selection>(null);
  const [clipboard, setClipboard] = useState<ClipboardMeasure | null>(null);
  const [pendingChord, setPendingChord] = useState<{ measureTempId: string; chordTempId: string } | null>(null);

  // 選択変更時に未確定コードをクリーンアップするラッパー
  function setSelection(next: Selection) {
    if (pendingChord) {
      const isSelectingPending = next?.type === "chord" && next.chordTempId === pendingChord.chordTempId;
      if (!isSelectingPending) {
        dispatch({ type: "REMOVE_CHORD", measureTempId: pendingChord.measureTempId, chordTempId: pendingChord.chordTempId });
      }
      setPendingChord(null);
    }
    setSelectionRaw(next);
  }

  useEffect(() => {
    dispatch({ type: "INIT", measures: wholeScoreToEditable(initialData) });
    setSelectionRaw(null);
    setPendingChord(null);
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

  // 選択中の小節データ
  const selectedMeasureData = useMemo<EditableMeasure | null>(() => {
    if (!selection || selection.type !== "measure") return null;
    return measures.find((m) => m.tempId === selection.measureTempId) ?? null;
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
    let nextIdx = direction === "left" ? currentIdx - 1 : currentIdx + 1;
    // 未確定コードから右ナビゲーション時、削除されるchord_gapをスキップ
    if (pendingChord && direction === "right") {
      const nextItem = navItems[nextIdx];
      if (nextItem?.type === "chord_gap" && nextItem.afterChordTempId === pendingChord.chordTempId) {
        nextIdx++;
      }
    }
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
    setPendingChord({ measureTempId, chordTempId });
    setSelectionRaw({ type: "chord", measureTempId, chordTempId });
  }

  function handleAddChord(measureTempId: string) {
    const chordTempId = nextTempId();
    dispatch({ type: "ADD_CHORD", measureTempId, chordTempId });
    setPendingChord({ measureTempId, chordTempId });
    setSelectionRaw({ type: "chord", measureTempId, chordTempId });
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
    setPendingChord({ measureTempId, chordTempId });
    setSelectionRaw({ type: "chord", measureTempId, chordTempId });
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

  function handleSelectMeasure(measureTempId: string) {
    setSelection({ type: "measure", measureTempId });
  }

  function handleUpdateField(field: string, value: number | string) {
    if (!selection || selection.type !== "chord") return;
    // 鍵盤UIでの編集で未確定コードを確定
    if (pendingChord) setPendingChord(null);
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
    const visChords = measure.chords.filter((c) => !c._destroy);
    setClipboard({
      key_name: measure.key_name,
      chords: visChords.map((c) => ({
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
    const result = await updateScore(scoreSlug, formData, measures, published);
    if (result) {
      router.push(`/scores/${scoreSlug}`);
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

  // Split visible measures into rows for bar-line layout
  const rows: EditableMeasure[][] = [];
  for (let i = 0; i < visibleMeasures.length; i += cols) {
    rows.push(visibleMeasures.slice(i, i + cols));
  }

  return (
    <div>
      <ScoreMetaForm formData={formData} onChange={setFormData} />

      <div className="mt-6">
        <h2 className="mb-3 text-xl font-semibold">コード譜</h2>

        {rows.length > 0 ? (
          <div className="space-y-2">
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} className="flex items-stretch flex-wrap">
                {/* Leading bar line for first row */}
                {rowIdx === 0 && (
                  <BarLine
                    onClick={() => handleInsertMeasure(null)}
                    onPaste={() => handlePasteMeasure(null)}
                    hasClipboard={!!clipboard}
                    isSelected={isBarLineSelected(null)}
                    hideBar
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
                      hideBar
                    />
                  );
                })()}

                {row.map((measure) => {
                  const ek = effectiveKeys.get(measure.tempId);
                  return (
                    <Fragment key={measure.tempId}>
                      <div>
                        <MeasureEditor
                          measure={measure}
                          scoreKey={ek?.scoreKey ?? scoreKey}
                          useFlats={ek?.useFlats ?? useFlats}
                          selectedChordTempId={
                            selection?.type === "chord" && selection.measureTempId === measure.tempId
                              ? selection.chordTempId
                              : null
                          }
                          isMeasureSelected={
                            selection?.type === "measure" && selection.measureTempId === measure.tempId
                          }
                          onSelectMeasure={() => handleSelectMeasure(measure.tempId)}
                          pendingChordTempId={pendingChord?.measureTempId === measure.tempId ? pendingChord.chordTempId : null}
                          selectedGapAfterChordTempId={getSelectedGap(measure.tempId)}
                          onSelectChord={(chordTempId) =>
                            handleSelectChord(measure.tempId, chordTempId)
                          }
                          onAddChord={() => handleAddChord(measure.tempId)}
                          onInsertChord={(afterChordTempId) =>
                            handleInsertChord(measure.tempId, afterChordTempId)
                          }
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
              className="rounded border border-dashed border-border px-4 py-2 text-sm text-muted transition-colors hover:border-primary/30 hover:text-foreground"
            >
              + 小節追加
            </button>
          </div>
        )}

      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-6 flex items-center gap-4">
        <Button type="button" onClick={handleSave} disabled={loading || !formData.title}>
          {loading ? "保存中..." : "保存"}
        </Button>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          公開する
        </label>
      </div>

      {/* 固定パネル分のスペーサー */}
      {visibleMeasures.length > 0 && <div className="h-[280px]" />}

      {/* 画面下部固定パネル */}
      {visibleMeasures.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-10 h-[280px] border-t border-border bg-background shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex h-full max-w-4xl flex-col px-4 py-3">
            {/* ナビゲーション + コード名/ステータス */}
            <div className="flex shrink-0 items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleNavigate("left")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-sm text-muted transition-colors hover:bg-primary/5 hover:text-foreground active:bg-primary/10"
              >
                ◀
              </button>
              {selection?.type === "chord" && selectedChordData ? (
                <span className={["font-mono text-xl font-bold", pendingChord ? "text-muted" : ""].join(" ")}>
                  {pendingChord ? "--" : formatChord(selectedChordData, selectedMeasureKey.scoreKey, selectedMeasureKey.useFlats)}
                </span>
              ) : (
                <span className="text-xs text-muted">
                  {!selection && "タップで選択"}
                  {selection?.type === "chord" && "コード選択中"}
                  {selection?.type === "chord_gap" && "コード挿入位置"}
                  {selection?.type === "bar_line" && "小節挿入位置"}
                  {selection?.type === "measure" && "小節選択中"}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleNavigate("right")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-sm text-muted transition-colors hover:bg-primary/5 hover:text-foreground active:bg-primary/10"
              >
                ▶
              </button>
            </div>

            {/* アクションパネル: 選択状態に応じて切り替え */}
            <div className="flex min-h-0 flex-1 items-start overflow-y-auto">
              <div className="w-full">
                {selection?.type === "chord" && (
                  <>
                    <ChordInputPanel
                      chord={selectedChordData}
                      scoreKey={selectedMeasureKey.scoreKey}
                      useFlats={selectedMeasureKey.useFlats}
                      isPending={!!pendingChord}
                      onUpdateField={handleUpdateField}
                    />
                    {selectedChordData && (
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveChord(selection.measureTempId, selection.chordTempId)}
                          className="rounded px-3 py-1 text-xs text-destructive transition-colors hover:bg-destructive/10"
                        >
                          コード削除
                        </button>
                      </div>
                    )}
                  </>
                )}

                {selection?.type === "chord_gap" && (
                  <div className="mt-3 flex items-center justify-center rounded-lg border border-dashed border-border py-4">
                    <button
                      type="button"
                      onClick={() => handleInsertChord(selection.measureTempId, selection.afterChordTempId)}
                      className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      + コードを挿入
                    </button>
                  </div>
                )}

                {selection?.type === "bar_line" && (
                  <div className="mt-3 flex items-center justify-center gap-3 rounded-lg border border-dashed border-border py-4">
                    <button
                      type="button"
                      onClick={() => handleInsertMeasure(selection.afterMeasureTempId)}
                      className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      + 小節を挿入
                    </button>
                    {clipboard && (
                      <button
                        type="button"
                        onClick={() => handlePasteMeasure(selection.afterMeasureTempId)}
                        className="rounded bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-opacity hover:opacity-90"
                      >
                        ペースト
                      </button>
                    )}
                  </div>
                )}

                {selection?.type === "measure" && selectedMeasureData && (
                  <div className="mt-3 space-y-3">
                    {/* 転調 */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted">転調:</span>
                      <select
                        className="rounded border border-border bg-background px-2 py-1 text-sm"
                        value={selectedMeasureData.key_name ?? ""}
                        onChange={(e) => {
                          dispatch({
                            type: "SET_MEASURE_KEY",
                            measureTempId: selection.measureTempId,
                            keyName: e.target.value || null,
                          });
                        }}
                      >
                        <option value="">なし</option>
                        {KEY_NAMES.map((k) => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>

                    {/* コピー・削除 */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyMeasure(selection.measureTempId)}
                        className="rounded border border-border px-3 py-1.5 text-sm transition-colors hover:bg-primary/5"
                      >
                        コピー
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveMeasure(selection.measureTempId)}
                        className="rounded border border-destructive/30 px-3 py-1.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
                      >
                        小節を削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
