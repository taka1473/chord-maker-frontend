"use client";

import { Fragment, useReducer, useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ScoreMetaForm } from "@/features/scores/components/ScoreMetaForm";
import { TagInput } from "@/features/scores/components/TagInput";
import { MeasureEditor } from "@/features/scores/components/MeasureEditor";
import { ChordInputPanel } from "@/features/scores/components/ChordInputPanel";
import { useUpdateScore } from "@/features/scores/hooks/useUpdateScore";
import { useClaimScore } from "@/features/scores/hooks/useClaimScore";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import type {
  WholeScore,
  ScoreFormData,
  EditableMeasure,
  EditableChord,
  ChordType,
} from "@/features/scores/types";
import { KEY_NAMES, isFlatKey, formatChord, keyNameToNumber, getKeyNameFromNumber } from "@/features/scores/types";
import type { Selection } from "@/features/scores/lib/selection";
import { selectionEquals, buildNavItems } from "@/features/scores/lib/selection";
import { measuresReducer, nextTempId } from "@/features/scores/lib/measures-reducer";
import { scoreDetailHref, scoreEditHref } from "@/features/scores/lib/score-urls";
import { Button, Dialog } from "@/features/shared";

// --- Bar Line (clickable divider) ---

function BarLine({
  onClick,
  isSelected,
  hideBar,
  isPastePhase,
  isPasteTarget,
  onSelectPasteTarget,
  hideButtons,
}: {
  onClick: () => void;
  isSelected?: boolean;
  hideBar?: boolean;
  isPastePhase?: boolean;
  isPasteTarget?: boolean;
  onSelectPasteTarget?: () => void;
  hideButtons?: boolean;
}) {
  // ペーストフェーズ中は常に↓ボタンを表示（モバイルでホバーなしにタップできるよう）
  const showButtons = !hideButtons && (isSelected || isPasteTarget || !!isPastePhase);
  return (
    <div className="group relative flex w-3 shrink-0 items-center justify-center self-stretch">
      <div className={[
        "h-full w-px transition-all",
        hideBar && !isSelected && !isPasteTarget
          ? hideButtons ? "bg-transparent" : "bg-transparent group-hover:bg-primary"
          : isSelected || isPasteTarget
            ? "w-0.5 bg-primary"
            : hideButtons ? "bg-border" : "bg-border group-hover:w-0.5 group-hover:bg-primary",
      ].join(" ")} />
      <div className={[
        "absolute flex-col gap-1",
        showButtons ? "flex" : hideButtons ? "hidden" : "hidden group-hover:flex",
      ].join(" ")}>
        {isPastePhase ? (
          <button
            type="button"
            onClick={onSelectPasteTarget}
            className={[
              "flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[10px] shadow hover:opacity-90",
              isPasteTarget
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground",
            ].join(" ")}
            title="ここにペースト"
          >
            ↓
          </button>
        ) : (
          <button
            type="button"
            onClick={onClick}
            className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground shadow hover:opacity-90"
            title="小節を挿入"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}

// --- Types ---

type ClipboardMeasure = {
  key_name?: string | null;
  chords: { root_offset: number; bass_offset: number; chord_type: ChordType }[];
};

type DisplayMeasure = EditableMeasure & { _preview?: boolean };

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
  guestToken?: string | null;
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

export function ScoreEditor({ scoreSlug, initialData, guestToken }: ScoreEditorProps) {
  const router = useRouter();
  const { updateScore, error, loading } = useUpdateScore();
  const { claimScore, loading: claimLoading } = useClaimScore();
  const { user } = useAuth();
  const cols = 4;
  const [showLoginPromo, setShowLoginPromo] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<ScoreFormData>({
    title: initialData.title,
    artist: initialData.artist ?? "",
    key_name: resolveKeyName(initialData),
    key_mode: initialData.key_mode ?? "major",
    tempo: initialData.tempo?.toString() ?? "",
    time_signature: initialData.time_signature ?? "",
    tag_names: initialData.tag_names ?? [],
  });

  const [published, setPublished] = useState(initialData.published);
  const [measures, dispatch] = useReducer(measuresReducer, []);
  const [selection, setSelectionRaw] = useState<Selection>(null);
  const [clipboard, setClipboard] = useState<ClipboardMeasure[] | null>(null);
  const [pendingChord, setPendingChord] = useState<{ measureTempId: string; chordTempId: string } | null>(null);
  const [metaOpen, setMetaOpen] = useState(false);
  const [pendingKeyChange, setPendingKeyChange] = useState<{ oldKeyName: string; newKeyName: string } | null>(null);
  const isDirtyRef = useRef(false);

  // 小節選択モード
  const [measureSelectMode, setMeasureSelectMode] = useState(false);
  const [selectedMeasureTempIds, setSelectedMeasureTempIds] = useState<string[]>([]);
  const [pastePhase, setPastePhase] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  // undefined=未選択, null=先頭前, string=その小節の後ろ
  const [pastePreviewAfterTempId, setPastePreviewAfterTempId] = useState<string | null | undefined>(undefined);

  // ページ離脱時の警告
  useEffect(() => {
    const msg = "変更が保存されていません。ページを離れますか？";

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirtyRef.current) {
        e.preventDefault();
      }
    }

    function handleClick(e: MouseEvent) {
      if (!isDirtyRef.current) return;
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor || !anchor.href) return;
      if (anchor.origin !== window.location.origin) return;
      if (!window.confirm(msg)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }

    window.history.pushState(null, "", window.location.href);
    function handlePopState() {
      if (isDirtyRef.current) {
        window.history.pushState(null, "", window.location.href);
        if (!window.confirm(msg)) return;
        isDirtyRef.current = false;
        window.history.back();
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

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

  const [prevInitialData, setPrevInitialData] = useState<WholeScore | null>(null);
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    const editable = wholeScoreToEditable(initialData);
    dispatch({ type: "INIT", measures: editable });
    setPendingChord(null);
    const visible = editable.filter((m) => !m._destroy);
    const lastMeasure = visible[visible.length - 1];
    const lastChords = lastMeasure?.chords.filter((c) => !c._destroy);
    const lastChord = lastChords?.[lastChords.length - 1];
    if (lastMeasure && lastChord) {
      setSelectionRaw({ type: "chord", measureTempId: lastMeasure.tempId, chordTempId: lastChord.tempId });
    } else if (lastMeasure) {
      setSelectionRaw({ type: "measure", measureTempId: lastMeasure.tempId });
    } else {
      setSelectionRaw(null);
    }
  }

  useEffect(() => {
    isDirtyRef.current = false;
    requestAnimationFrame(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));
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

  const selectedMeasureData = useMemo<EditableMeasure | null>(() => {
    if (!selection || selection.type !== "measure") return null;
    return measures.find((m) => m.tempId === selection.measureTempId) ?? null;
  }, [measures, selection]);

  const scoreKey = KEY_MAP[formData.key_name] ?? 3;
  const useFlats = isFlatKey(formData.key_name);

  function handleKeyNameChange(newKeyName: string) {
    if (newKeyName === formData.key_name) return;
    setPendingKeyChange({ oldKeyName: formData.key_name, newKeyName });
  }

  function applyKeyChange(mode: "relative" | "absolute") {
    if (!pendingKeyChange) return;
    const { oldKeyName, newKeyName } = pendingKeyChange;
    const oldKey = keyNameToNumber(oldKeyName);
    const newKey = keyNameToNumber(newKeyName);
    markDirty();
    dispatch({ type: "APPLY_KEY_CHANGE", oldKey, newKey, mode });
    setFormData((prev) => ({ ...prev, key_name: newKeyName }));
    setPendingKeyChange(null);
  }

  const firstVisibleChord = useMemo(() => {
    for (const m of visibleMeasures) {
      const chord = m.chords.find((c) => !c._destroy);
      if (chord) return { chord, measureKeyName: m.key_name ?? null };
    }
    return null;
  }, [visibleMeasures]);

  const effectiveKeys = useMemo(() => {
    const map = new Map<string, { scoreKey: number; useFlats: boolean }>();
    for (const m of visibleMeasures) {
      if (m.key_name) {
        map.set(m.tempId, { scoreKey: KEY_MAP[m.key_name] ?? scoreKey, useFlats: isFlatKey(m.key_name) });
      } else {
        map.set(m.tempId, { scoreKey, useFlats });
      }
    }
    return map;
  }, [visibleMeasures, scoreKey, useFlats]);

  const keyBadges = useMemo(() => {
    const map = new Map<string, string>();
    let prevKey = scoreKey;
    for (const m of visibleMeasures) {
      const ek = effectiveKeys.get(m.tempId);
      const curKey = ek?.scoreKey ?? scoreKey;
      if (curKey !== prevKey) {
        map.set(m.tempId, getKeyNameFromNumber(curKey, ek?.useFlats ?? useFlats));
      }
      prevKey = curKey;
    }
    return map;
  }, [visibleMeasures, effectiveKeys, scoreKey, useFlats]);

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

  function markDirty() { isDirtyRef.current = true; }

  function handleInsertMeasure(afterTempId: string | null) {
    markDirty();
    const measureTempId = nextTempId();
    const chordTempId = nextTempId();
    if (pendingChord) {
      dispatch({ type: "REMOVE_CHORD", measureTempId: pendingChord.measureTempId, chordTempId: pendingChord.chordTempId });
    }
    dispatch({ type: "INSERT_MEASURE_AFTER", afterTempId, newTempId: measureTempId });
    dispatch({ type: "ADD_CHORD", measureTempId, chordTempId });
    setPendingChord({ measureTempId, chordTempId });
    setSelectionRaw({ type: "chord", measureTempId, chordTempId });
  }

  function handleAddChord(measureTempId: string) {
    markDirty();
    const chordTempId = nextTempId();
    if (pendingChord) {
      dispatch({ type: "REMOVE_CHORD", measureTempId: pendingChord.measureTempId, chordTempId: pendingChord.chordTempId });
    }
    dispatch({ type: "ADD_CHORD", measureTempId, chordTempId });
    setPendingChord({ measureTempId, chordTempId });
    setSelectionRaw({ type: "chord", measureTempId, chordTempId });
  }

  function handleInsertChord(
    measureTempId: string,
    afterChordTempId: string | null
  ) {
    markDirty();
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
    markDirty();
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
    markDirty();
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
    markDirty();
    if (pendingChord) setPendingChord(null);
    dispatch({
      type: "UPDATE_CHORD",
      measureTempId: selection.measureTempId,
      chordTempId: selection.chordTempId,
      field,
      value,
    });
  }

  // --- 小節選択モード ---

  function handleToggleMeasureSelectMode() {
    if (measureSelectMode) {
      setMeasureSelectMode(false);
      setSelectedMeasureTempIds([]);
      setPastePhase(false);
      setPastePreviewAfterTempId(undefined);
    } else {
      setMeasureSelectMode(true);
      setSelectedMeasureTempIds([]);
      setPastePhase(false);
      setPastePreviewAfterTempId(undefined);
      setSelection(null);
    }
  }

  function handleMeasureTap(tempId: string) {
    const visibleIds = visibleMeasures.map((m) => m.tempId);
    const tapIdx = visibleIds.indexOf(tempId);
    if (tapIdx === -1) return;

    setSelectedMeasureTempIds((prev) => {
      if (prev.length === 0) return [tempId];

      const firstIdx = visibleIds.indexOf(prev[0]!);
      const lastIdx = visibleIds.indexOf(prev[prev.length - 1]!);

      // 端を縮小
      if (tapIdx === firstIdx && firstIdx === lastIdx) return [];
      if (tapIdx === firstIdx) return prev.slice(1);
      if (tapIdx === lastIdx) return prev.slice(0, -1);

      // 範囲拡張
      if (tapIdx === firstIdx - 1) return [tempId, ...prev];
      if (tapIdx === lastIdx + 1) return [...prev, tempId];

      // 非隣接: リセット
      return [tempId];
    });
  }

  function handleDeleteSelectedMeasures() {
    markDirty();
    for (const tempId of selectedMeasureTempIds) {
      dispatch({ type: "REMOVE_MEASURE", tempId });
    }
    setMeasureSelectMode(false);
    setSelectedMeasureTempIds([]);
    setPastePhase(false);
    setPastePreviewAfterTempId(undefined);
    setConfirmDeleteOpen(false);
    setSelection(null);
  }

  function handleCopySelectedMeasures() {
    const clips: ClipboardMeasure[] = selectedMeasureTempIds.map((tempId) => {
      const measure = measures.find((m) => m.tempId === tempId);
      if (!measure) return { chords: [] };
      const visChords = measure.chords.filter((c) => !c._destroy);
      return {
        key_name: measure.key_name,
        chords: visChords.map((c) => ({
          root_offset: c.root_offset,
          bass_offset: c.bass_offset,
          chord_type: c.chord_type,
        })),
      };
    });
    setClipboard(clips);
    setPastePhase(true);
    setPastePreviewAfterTempId(undefined);
  }

  function handleSelectPasteTarget(afterTempId: string | null) {
    setPastePreviewAfterTempId(afterTempId);
  }

  function handleConfirmPaste() {
    if (!clipboard || pastePreviewAfterTempId === undefined) return;
    markDirty();

    let prevTempId: string | null = pastePreviewAfterTempId;
    for (const clip of clipboard) {
      const measureTempId = nextTempId();
      dispatch({ type: "INSERT_MEASURE_AFTER", afterTempId: prevTempId, newTempId: measureTempId, initialKeyName: clip.key_name ?? null });
      for (const chord of clip.chords) {
        const chordTempId = nextTempId();
        dispatch({ type: "ADD_CHORD", measureTempId, chordTempId });
        dispatch({ type: "UPDATE_CHORD", measureTempId, chordTempId, field: "root_offset", value: chord.root_offset });
        dispatch({ type: "UPDATE_CHORD", measureTempId, chordTempId, field: "bass_offset", value: chord.bass_offset });
        dispatch({ type: "UPDATE_CHORD", measureTempId, chordTempId, field: "chord_type", value: chord.chord_type });
      }
      prevTempId = measureTempId;
    }

    // ペースト後: 最後に貼り付けた小節の後ろをプレビュー位置に設定してペーストフェーズを維持
    setPastePreviewAfterTempId(prevTempId);
  }

  function handleCancelPastePhase() {
    setPastePhase(false);
    setPastePreviewAfterTempId(undefined);
  }

  // ---

  async function handleSave() {
    const result = await updateScore(scoreSlug, formData, measures, published, guestToken);
    if (result) {
      isDirtyRef.current = false;
      if (guestToken) {
        setShowLoginPromo(true);
      } else {
        router.refresh();
        router.push(`/scores/${scoreSlug}`);
      }
    }
  }

  async function handleClaim() {
    if (!guestToken) return;
    const result = await claimScore(scoreSlug, guestToken);
    if (result) {
      router.push(`/scores/${scoreSlug}/edit`);
    }
  }

  function handleCopyUrl() {
    if (!guestToken) return;
    const url = window.location.origin + scoreEditHref(scoreSlug, guestToken);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function isBarLineSelected(afterMeasureTempId: string | null): boolean {
    return selection?.type === "bar_line" && selection.afterMeasureTempId === afterMeasureTempId;
  }

  function getSelectedGap(measureTempId: string): string | null | undefined {
    if (selection?.type === "chord_gap" && selection.measureTempId === measureTempId) {
      return selection.afterChordTempId;
    }
    return undefined;
  }

  function isPasteTargetBarLine(afterMeasureTempId: string | null): boolean {
    return pastePhase && pastePreviewAfterTempId !== undefined && pastePreviewAfterTempId === afterMeasureTempId;
  }

  const selectedMeasureKey = useMemo(() => {
    if (!selection || !("measureTempId" in selection)) return { scoreKey, useFlats };
    return effectiveKeys.get(selection.measureTempId) ?? { scoreKey, useFlats };
  }, [selection, effectiveKeys, scoreKey, useFlats]);

  // プレビュー小節を visibleMeasures に注入した displayMeasures を計算
  const displayMeasures = useMemo<DisplayMeasure[]>(() => {
    if (!pastePhase || pastePreviewAfterTempId === undefined || !clipboard) {
      return visibleMeasures;
    }

    let insertIdx: number;
    if (pastePreviewAfterTempId === null) {
      insertIdx = 0;
    } else {
      const targetIdx = visibleMeasures.findIndex((m) => m.tempId === pastePreviewAfterTempId);
      insertIdx = targetIdx >= 0 ? targetIdx + 1 : visibleMeasures.length;
    }

    const previewMeasures: DisplayMeasure[] = clipboard.map((clip, i) => ({
      tempId: `__preview_${i}`,
      position: 0,
      key_name: clip.key_name,
      chords: clip.chords.map((c, j) => ({
        tempId: `__preview_chord_${i}_${j}`,
        position: j + 1,
        root_offset: c.root_offset,
        bass_offset: c.bass_offset,
        chord_type: c.chord_type,
      })),
      _preview: true,
    }));

    const result = [...visibleMeasures] as DisplayMeasure[];
    result.splice(insertIdx, 0, ...previewMeasures);
    return result;
  }, [visibleMeasures, pastePhase, pastePreviewAfterTempId, clipboard]);

  // displayMeasures を rows に分割
  const rows: DisplayMeasure[][] = [];
  for (let i = 0; i < displayMeasures.length; i += cols) {
    rows.push(displayMeasures.slice(i, i + cols));
  }

  const keyChangeExample = (() => {
    if (!pendingKeyChange || !firstVisibleChord) return null;
    const { oldKeyName, newKeyName } = pendingKeyChange;
    const effectiveMeasureKey = firstVisibleChord.measureKeyName
      ? KEY_MAP[firstVisibleChord.measureKeyName] ?? scoreKey
      : scoreKey;
    const oldName = formatChord(firstVisibleChord.chord, effectiveMeasureKey, isFlatKey(oldKeyName));
    const newKey = KEY_MAP[newKeyName] ?? 3;
    const newName = formatChord(firstVisibleChord.chord, newKey, isFlatKey(newKeyName));
    return { oldName, newName };
  })();

  return (
    <>
    <Dialog
      open={confirmDeleteOpen}
      title={`${selectedMeasureTempIds.length}小節を削除しますか？`}
      onClose={() => setConfirmDeleteOpen(false)}
      actions={
        <div className="flex w-full justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDeleteOpen(false)}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleDeleteSelectedMeasures}>
            削除
          </Button>
        </div>
      }
    >
      <p className="text-sm text-muted">この操作は元に戻せません。</p>
    </Dialog>
    <Dialog
      open={pendingKeyChange !== null}
      title={`キーを ${pendingKeyChange?.oldKeyName ?? ""} から ${pendingKeyChange?.newKeyName ?? ""} に変更します`}
      onClose={() => setPendingKeyChange(null)}
      actions={
        <div className="flex w-full flex-col gap-3">
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => applyKeyChange("absolute")}>
              キーのみ変える
            </Button>
            <Button onClick={() => applyKeyChange("relative")}>
              そのまま移調
            </Button>
          </div>
          <div className="flex justify-center">
            <Button variant="ghost" onClick={() => setPendingKeyChange(null)}>
              キャンセル
            </Button>
          </div>
        </div>
      }
    >
      {keyChangeExample ? (
        <ul className="space-y-2">
          <li>
            <span className="font-medium">そのまま移調</span>：{keyChangeExample.oldName} → {keyChangeExample.newName} のように移調されます
          </li>
          <li>
            <span className="font-medium">キーのみ変える</span>：{keyChangeExample.oldName} → {keyChangeExample.oldName} のまま変わりません
          </li>
        </ul>
      ) : (
        <ul className="space-y-2">
          <li><span className="font-medium">そのまま移調</span>：すべてのコードが移調されます</li>
          <li><span className="font-medium">キーのみ変える</span>：コードの実音は変わらず、offsetが再計算されます</li>
        </ul>
      )}
    </Dialog>
    <div>
      {/* ゲストスコアバナー */}
      {guestToken && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/30">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                このスコアの編集URL（30日間有効）
              </p>
              <p className="mt-0.5 break-all text-xs text-amber-700 dark:text-amber-400">
                このURLを保存しておくと後で編集できます
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded bg-amber-100 px-2 py-1 text-xs dark:bg-amber-900/50">
                  {typeof window !== "undefined"
                    ? window.location.origin + scoreEditHref(scoreSlug, guestToken)
                    : ""}
                </code>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="shrink-0 rounded border border-amber-300 px-2 py-1 text-xs text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/50"
                >
                  {copied ? "コピー済" : "コピー"}
                </button>
              </div>
            </div>
            {user && (
              <button
                type="button"
                onClick={handleClaim}
                disabled={claimLoading}
                className="shrink-0 rounded bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:ml-4"
              >
                {claimLoading ? "移行中..." : "自分のアカウントに移す"}
              </button>
            )}
          </div>
          {!user && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              <a href="/login" className="font-medium underline">ログイン</a>するとスコアを自分のアカウントに移して無期限保存・マイページ管理ができます
            </p>
          )}
        </div>
      )}

      {/* ログイン促進ポップアップ */}
      {showLoginPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl bg-background p-6 shadow-xl">
            <h2 className="text-lg font-bold">保存しました！</h2>
            <p className="mt-2 text-sm text-muted">ログインすることで次のことができるようになります：</p>
            <ul className="mt-3 space-y-1 text-sm">
              <li className="flex items-center gap-2"><span className="text-primary">✓</span> 無期限でスコアを保存</li>
              <li className="flex items-center gap-2"><span className="text-primary">✓</span> マイページで一覧管理</li>
              <li className="flex items-center gap-2"><span className="text-primary">✓</span> スコアを公開してシェア</li>
            </ul>
            <div className="mt-5 flex gap-3">
              <a
                href="/login"
                className="flex-1 rounded bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                ログインはこちら
              </a>
              <button
                type="button"
                onClick={() => { setShowLoginPromo(false); router.push(scoreDetailHref(scoreSlug, guestToken)); }}
                className="flex-1 rounded border border-border px-4 py-2 text-sm transition-colors hover:bg-primary/5"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* メタ情報アコーディオン */}
      <div className="rounded-lg border border-border">
        <button
          type="button"
          onClick={() => setMetaOpen(!metaOpen)}
          className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-primary/5"
        >
          <div className="min-w-0 flex-1">
            <span className="text-sm font-medium">
              {formData.title || "無題"}{formData.artist ? ` - ${formData.artist}` : ""}
            </span>
            <span className="ml-2 text-sm text-muted">
              {formData.key_name}{formData.tempo ? ` / ${formData.tempo}bpm` : ""}
            </span>
          </div>
          <span className={[
            "ml-2 flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs transition-colors",
            metaOpen
              ? "text-muted"
              : "text-primary/70 hover:text-primary",
          ].join(" ")}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
              <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L3.05 10.476a1 1 0 0 0-.27.51l-.601 3.005a.5.5 0 0 0 .588.588l3.005-.601a1 1 0 0 0 .51-.27l7.963-7.963a1.75 1.75 0 0 0 0-2.475l-.757-.757Z" />
            </svg>
            {metaOpen ? "閉じる" : "編集"}
          </span>
        </button>
        {metaOpen && (
          <div className="border-t border-border px-4 py-4">
            <ScoreMetaForm
              formData={formData}
              onChange={(v) => { markDirty(); setFormData(v); }}
              onKeyNameChange={handleKeyNameChange}
            />
          </div>
        )}
      </div>

      <div className="mt-3">
        <TagInput
          tags={formData.tag_names}
          onChange={(tag_names) => { markDirty(); setFormData({ ...formData, tag_names }); }}
        />
      </div>

      <div className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">コード譜</h2>
          {visibleMeasures.length > 0 && (
            <button
              type="button"
              onClick={handleToggleMeasureSelectMode}
              className={[
                "rounded px-3 py-1 text-sm transition-colors",
                measureSelectMode
                  ? "bg-primary/10 font-medium text-primary hover:bg-primary/20"
                  : "text-muted hover:bg-primary/5 hover:text-foreground",
              ].join(" ")}
            >
              {measureSelectMode ? "キャンセル" : "小節を選択"}
            </button>
          )}
        </div>

        {rows.length > 0 ? (
          <div className="space-y-2">
            {rows.map((row, rowIdx) => {
              // 行頭バーラインの afterTempId を計算
              const leadingAfterTempId: string | null = rowIdx === 0
                ? null
                : (rows[rowIdx - 1]!.filter(m => !m._preview).at(-1)?.tempId ?? null);

              return (
                <div key={rowIdx} className="flex items-stretch flex-wrap">
                  <BarLine
                    onClick={() => handleInsertMeasure(leadingAfterTempId)}
                    isSelected={!measureSelectMode && isBarLineSelected(leadingAfterTempId)}
                    hideBar
                    isPastePhase={pastePhase}
                    isPasteTarget={isPasteTargetBarLine(leadingAfterTempId)}
                    onSelectPasteTarget={() => handleSelectPasteTarget(leadingAfterTempId)}
                    hideButtons={measureSelectMode && !pastePhase}
                  />

                  {row.map((measure) => {
                    const isPreview = !!(measure as DisplayMeasure)._preview;
                    const ek = isPreview ? undefined : effectiveKeys.get(measure.tempId);
                    const measureScoreKey = ek?.scoreKey ?? scoreKey;
                    const measureUseFlats = ek?.useFlats ?? useFlats;
                    // プレビュー小節の afterTempId は undefined（バーライン不要）
                    const trailingAfterTempId = isPreview ? null : measure.tempId;

                    return (
                      <Fragment key={measure.tempId}>
                        <div>
                          <MeasureEditor
                            measure={measure}
                            scoreKey={measureScoreKey}
                            useFlats={measureUseFlats}
                            keyBadgeName={keyBadges.get(measure.tempId) ?? null}
                            selectedChordTempId={
                              !measureSelectMode && selection?.type === "chord" && selection.measureTempId === measure.tempId
                                ? selection.chordTempId
                                : null
                            }
                            isMeasureSelected={
                              !measureSelectMode && selection?.type === "measure" && selection.measureTempId === measure.tempId
                            }
                            onSelectMeasure={() => handleSelectMeasure(measure.tempId)}
                            pendingChordTempId={pendingChord?.measureTempId === measure.tempId ? pendingChord.chordTempId : null}
                            selectedGapAfterChordTempId={!measureSelectMode ? getSelectedGap(measure.tempId) : undefined}
                            onSelectChord={(chordTempId) =>
                              handleSelectChord(measure.tempId, chordTempId)
                            }
                            onAddChord={() => handleAddChord(measure.tempId)}
                            onInsertChord={(afterChordTempId) =>
                              handleInsertChord(measure.tempId, afterChordTempId)
                            }
                            isAddingChordDisabled={pendingChord !== null}
                            isMeasureSelectMode={measureSelectMode || isPreview}
                            isMeasureSelectSelected={measureSelectMode && selectedMeasureTempIds.includes(measure.tempId)}
                            onMeasureTap={pastePhase ? undefined : () => handleMeasureTap(measure.tempId)}
                            isPreview={isPreview}
                          />
                        </div>
                        {!isPreview && (
                          <BarLine
                            onClick={() => handleInsertMeasure(trailingAfterTempId)}
                            isSelected={!measureSelectMode && isBarLineSelected(trailingAfterTempId)}
                            isPastePhase={pastePhase}
                            isPasteTarget={isPasteTargetBarLine(trailingAfterTempId)}
                            onSelectPasteTarget={() => handleSelectPasteTarget(trailingAfterTempId)}
                            hideButtons={measureSelectMode && !pastePhase}
                          />
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <button
              type="button"
              onClick={() => {
                markDirty();
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
            onChange={(e) => { markDirty(); setPublished(e.target.checked); }}
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

            {/* 小節選択モード: ペーストフェーズ */}
            {measureSelectMode && pastePhase ? (
              <div className="flex h-full flex-col items-center justify-center gap-4">
                {pastePreviewAfterTempId === undefined ? (
                  <>
                    <p className="text-sm text-muted">ペースト位置を選択してください</p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleToggleMeasureSelectMode}
                        className="rounded border border-border px-4 py-2 text-sm transition-colors hover:bg-primary/5"
                      >
                        選択モードを終了
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelPastePhase}
                        className="rounded border border-border px-4 py-2 text-sm transition-colors hover:bg-primary/5"
                      >
                        キャンセル
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted">
                      {clipboard?.length === 1 ? "1小節" : `${clipboard?.length}小節`}をここにペーストします
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleToggleMeasureSelectMode}
                        className="rounded border border-border px-4 py-2 text-sm transition-colors hover:bg-primary/5"
                      >
                        選択モードを終了
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelPastePhase}
                        className="rounded border border-border px-4 py-2 text-sm transition-colors hover:bg-primary/5"
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmPaste}
                        className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        ペースト
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : measureSelectMode ? (
              /* 小節選択モード: 選択フェーズ */
              <div className="flex h-full flex-col items-center justify-center gap-4">
                <p className="text-sm text-muted">
                  {selectedMeasureTempIds.length === 0
                    ? "操作する小節をタップして選択してください"
                    : `${selectedMeasureTempIds.length}小節を選択中`}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleToggleMeasureSelectMode}
                    className="rounded border border-border px-4 py-2 text-sm transition-colors hover:bg-primary/5"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    disabled={selectedMeasureTempIds.length === 0}
                    onClick={() => setConfirmDeleteOpen(true)}
                    className="rounded border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    削除
                  </button>
                  <button
                    type="button"
                    disabled={selectedMeasureTempIds.length === 0}
                    onClick={handleCopySelectedMeasures}
                    className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    コピー
                  </button>
                </div>
              </div>
            ) : (
              /* 通常モード */
              <>
                {/* ナビゲーション + コード名/ステータス */}
                <div className="flex shrink-0 items-center gap-3">
                  {/* 左: コード削除ボタン */}
                  <div className="w-16">
                    {selection?.type === "chord" && selectedChordData && !pendingChord && (
                      <button
                        type="button"
                        onClick={() => handleRemoveChord(selection.measureTempId, selection.chordTempId)}
                        className="rounded px-2 py-1 text-xs text-destructive transition-colors hover:bg-destructive/10"
                      >
                        削除
                      </button>
                    )}
                  </div>
                  {/* 中央: ナビ + コード名 */}
                  <div className="flex flex-1 items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleNavigate("left")}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-sm text-muted transition-colors hover:bg-primary/5 hover:text-foreground active:bg-primary/10"
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
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-sm text-muted transition-colors hover:bg-primary/5 hover:text-foreground active:bg-primary/10"
                    >
                      ▶
                    </button>
                  </div>
                  {/* 右: コード追加 + 小節追加 */}
                  <div className="flex w-16 items-center justify-end gap-1">
                    {selection && "measureTempId" in selection && (
                      <button
                        type="button"
                        title="コードを追加"
                        disabled={pendingChord !== null}
                        onClick={() => {
                          if (selection.type === "chord") {
                            handleInsertChord(selection.measureTempId, selection.chordTempId);
                          } else {
                            handleAddChord(selection.measureTempId);
                          }
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded border border-border text-xs text-muted transition-colors hover:bg-primary/5 hover:text-foreground active:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        +♩
                      </button>
                    )}
                    {selection && (
                      <button
                        type="button"
                        title="小節を追加"
                        onClick={() => {
                          const afterId = selection.type === "bar_line"
                            ? selection.afterMeasureTempId
                            : "measureTempId" in selection
                              ? selection.measureTempId
                              : null;
                          handleInsertMeasure(afterId);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded border border-border text-xs text-muted transition-colors hover:bg-primary/5 hover:text-foreground active:bg-primary/10"
                      >
                        +𝄁
                      </button>
                    )}
                  </div>
                </div>

                {/* アクションパネル: 選択状態に応じて切り替え */}
                <div className="flex min-h-0 flex-1 items-start overflow-y-auto">
                  <div className="w-full">
                    {selection?.type === "chord" && (
                      <ChordInputPanel
                        chord={selectedChordData}
                        scoreKey={selectedMeasureKey.scoreKey}
                        useFlats={selectedMeasureKey.useFlats}
                        isPending={!!pendingChord}
                        onUpdateField={handleUpdateField}
                      />
                    )}

                    {selection?.type === "chord_gap" && (
                      <div className="mt-3 flex items-center justify-center rounded-lg border border-dashed border-border py-4">
                        <button
                          type="button"
                          disabled={pendingChord !== null}
                          onClick={() => handleInsertChord(selection.measureTempId, selection.afterChordTempId)}
                          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
                      </div>
                    )}

                    {selection?.type === "measure" && selectedMeasureData && (
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted">転調:</span>
                          <select
                            className="rounded border border-border bg-background px-2 py-1 text-sm"
                            value={selectedMeasureData.key_name ?? ""}
                            onChange={(e) => {
                              markDirty();
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
                        <div className="flex items-center gap-2">
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
