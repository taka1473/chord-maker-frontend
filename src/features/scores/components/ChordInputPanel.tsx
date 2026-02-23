"use client";

import { useState } from "react";
import type { EditableChord } from "@/features/scores/types";
import { PianoKeyboard } from "@/features/scores/components/PianoKeyboard";
import { ChordTypeSelector } from "@/features/scores/components/ChordTypeSelector";

type NoteMode = "root" | "bass";

type ChordInputPanelProps = {
  chord: EditableChord | null;
  scoreKey: number;
  useFlats?: boolean;
  isPending?: boolean;
  onUpdateField: (field: string, value: number | string) => void;
};

export function ChordInputPanel({
  chord,
  scoreKey,
  useFlats = false,
  isPending = false,
  onUpdateField,
}: ChordInputPanelProps) {
  const [noteMode, setNoteMode] = useState<NoteMode>("root");

  // コード選択が変わったらルート音モードに戻す
  const [prevChordTempId, setPrevChordTempId] = useState(chord?.tempId);
  if (chord?.tempId !== prevChordTempId) {
    setPrevChordTempId(chord?.tempId);
    setNoteMode("root");
  }

  if (!chord) {
    return (
      <div className="mt-3 rounded-lg border border-border p-4">
        <p className="text-center text-sm text-muted">
          コードを選択してください
        </p>
      </div>
    );
  }

  function handlePianoSelect(offset: number) {
    if (noteMode === "root") {
      if (chord!.root_offset === chord!.bass_offset) {
        onUpdateField("bass_offset", offset);
      }
      onUpdateField("root_offset", offset);
    } else {
      onUpdateField("bass_offset", offset);
      setNoteMode("root");
    }
  }

  const selectedOffset =
    noteMode === "root" ? chord.root_offset : chord.bass_offset;

  const isBassSet = chord.root_offset !== chord.bass_offset;

  return (
    <div className="mt-2 rounded-lg border border-border p-4">
      <div className="mb-3">
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className={[
              "text-xs font-medium",
              noteMode === "root"
                ? "text-foreground"
                : "text-foreground/40",
            ].join(" ")}
          >
            ルート音
          </span>
          <button
            type="button"
            onClick={() =>
              setNoteMode(noteMode === "root" ? "bass" : "root")
            }
            className={[
              "rounded px-2 py-0.5 text-xs font-medium transition-colors",
              noteMode === "bass"
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted hover:border-primary/30 hover:text-foreground",
            ].join(" ")}
          >
            on
          </button>
          {noteMode === "bass" && (
            <span className="text-xs text-primary">
              ベース音を選択...
            </span>
          )}
          {noteMode === "root" && isBassSet && (
            <button
              type="button"
              onClick={() => onUpdateField("bass_offset", chord.root_offset)}
              className="rounded px-1.5 py-0.5 text-[10px] text-destructive transition-colors hover:bg-destructive/10"
              title="ベース音をリセット"
            >
              on 解除
            </button>
          )}
        </div>
        <PianoKeyboard
          selectedOffset={isPending ? null : selectedOffset}
          scoreKey={scoreKey}
          useFlats={useFlats}
          onSelect={handlePianoSelect}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">
          コードタイプ
        </label>
        <ChordTypeSelector
          selectedType={isPending ? null : chord.chord_type}
          onSelect={(type) => onUpdateField("chord_type", type)}
        />
      </div>
    </div>
  );
}
