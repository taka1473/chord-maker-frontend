"use client";

import { useState, useEffect } from "react";
import type { EditableChord } from "@/features/scores/types";
import { formatChord } from "@/features/scores/types";
import { PianoKeyboard } from "@/features/scores/components/PianoKeyboard";
import { ChordTypeSelector } from "@/features/scores/components/ChordTypeSelector";

type NoteMode = "root" | "bass";

type ChordInputPanelProps = {
  chord: EditableChord | null;
  scoreKey: number;
  onUpdateField: (field: string, value: number | string) => void;
};

export function ChordInputPanel({
  chord,
  scoreKey,
  onUpdateField,
}: ChordInputPanelProps) {
  const [noteMode, setNoteMode] = useState<NoteMode>("root");

  // コード選択が変わったらルート音モードに戻す
  useEffect(() => {
    setNoteMode("root");
  }, [chord?.tempId]);

  if (!chord) {
    return (
      <div className="mt-4 rounded-lg border border-foreground/15 p-4">
        <p className="text-center text-sm text-foreground/40">
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
    <div className="mt-4 rounded-lg border border-foreground/15 p-4">
      <div className="mb-4 text-center font-mono text-xl font-bold">
        {formatChord(chord, scoreKey)}
      </div>

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
                ? "bg-blue-500 text-white"
                : "border border-foreground/20 text-foreground/50 hover:border-foreground/40 hover:text-foreground/80",
            ].join(" ")}
          >
            on
          </button>
          {noteMode === "bass" && (
            <span className="text-xs text-blue-500">
              ベース音を選択...
            </span>
          )}
          {noteMode === "root" && isBassSet && (
            <button
              type="button"
              onClick={() => onUpdateField("bass_offset", chord.root_offset)}
              className="rounded px-1.5 py-0.5 text-[10px] text-red-500 transition-colors hover:bg-red-500/10"
              title="ベース音をリセット"
            >
              on 解除
            </button>
          )}
        </div>
        <PianoKeyboard
          selectedOffset={selectedOffset}
          scoreKey={scoreKey}
          onSelect={handlePianoSelect}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground/60">
          コードタイプ
        </label>
        <ChordTypeSelector
          selectedType={chord.chord_type}
          onSelect={(type) => onUpdateField("chord_type", type)}
        />
      </div>
    </div>
  );
}
