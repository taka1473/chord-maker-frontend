import { Fragment } from "react";
import type { EditableMeasure } from "@/features/scores/types";
import { ChordDisplay } from "@/features/scores/components/ChordDisplay";

type MeasureEditorProps = {
  measure: EditableMeasure;
  measureIndex: number;
  scoreKey: number;
  selectedChordTempId: string | null;
  onSelectChord: (chordTempId: string) => void;
  onAddChord: () => void;
  onInsertChord: (afterChordTempId: string | null) => void;
  onRemoveChord: (chordTempId: string) => void;
  onRemoveMeasure: () => void;
};

function ChordGap({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-2 shrink-0 cursor-pointer items-center justify-center self-stretch"
      title="コードを挿入"
    >
      <div className="h-full w-px bg-transparent transition-all group-hover:bg-blue-500" />
      <span className="absolute hidden h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] text-white shadow group-hover:flex">
        +
      </span>
    </button>
  );
}

export function MeasureEditor({
  measure,
  measureIndex,
  scoreKey,
  selectedChordTempId,
  onSelectChord,
  onAddChord,
  onInsertChord,
  onRemoveChord,
  onRemoveMeasure,
}: MeasureEditorProps) {
  const visibleChords = measure.chords.filter((c) => !c._destroy);

  return (
    <div className="p-2">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-foreground/40">
          {measureIndex + 1}
        </span>
        <button
          type="button"
          onClick={onRemoveMeasure}
          className="rounded px-1.5 py-0.5 text-[10px] text-red-500 transition-colors hover:bg-red-500/10"
        >
          削除
        </button>
      </div>

      <div className="flex flex-wrap items-center">
        {visibleChords.length > 0 ? (
          <>
            <ChordGap onClick={() => onInsertChord(null)} />
            {visibleChords.map((chord) => (
              <Fragment key={chord.tempId}>
                <ChordDisplay
                  chord={chord}
                  scoreKey={scoreKey}
                  isSelected={chord.tempId === selectedChordTempId}
                  onSelect={() => onSelectChord(chord.tempId)}
                  onRemove={() => onRemoveChord(chord.tempId)}
                />
                <ChordGap onClick={() => onInsertChord(chord.tempId)} />
              </Fragment>
            ))}
          </>
        ) : (
          <button
            type="button"
            onClick={onAddChord}
            className="rounded border border-dashed border-foreground/20 px-3 py-1 text-xs text-foreground/50 transition-colors hover:border-foreground/40 hover:text-foreground/80"
          >
            + コード追加
          </button>
        )}
      </div>
    </div>
  );
}
