import type { EditableMeasure } from "@/features/scores/types";
import { ChordDisplay } from "@/features/scores/components/ChordDisplay";

type MeasureEditorProps = {
  measure: EditableMeasure;
  measureIndex: number;
  scoreKey: number;
  selectedChordTempId: string | null;
  onSelectChord: (chordTempId: string) => void;
  onAddChord: () => void;
  onRemoveChord: (chordTempId: string) => void;
  onRemoveMeasure: () => void;
};

export function MeasureEditor({
  measure,
  measureIndex,
  scoreKey,
  selectedChordTempId,
  onSelectChord,
  onAddChord,
  onRemoveChord,
  onRemoveMeasure,
}: MeasureEditorProps) {
  const visibleChords = measure.chords.filter((c) => !c._destroy);

  return (
    <div className="rounded border border-foreground/15 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-foreground/50">
          小節 {measureIndex + 1}
        </span>
        <button
          type="button"
          onClick={onRemoveMeasure}
          className="rounded px-2 py-0.5 text-xs text-red-500 transition-colors hover:bg-red-500/10"
        >
          削除
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {visibleChords.map((chord) => (
          <ChordDisplay
            key={chord.tempId}
            chord={chord}
            scoreKey={scoreKey}
            isSelected={chord.tempId === selectedChordTempId}
            onSelect={() => onSelectChord(chord.tempId)}
            onRemove={() => onRemoveChord(chord.tempId)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddChord}
        className="mt-2 rounded border border-dashed border-foreground/20 px-3 py-1 text-xs text-foreground/50 transition-colors hover:border-foreground/40 hover:text-foreground/80"
      >
        + コード追加
      </button>
    </div>
  );
}
