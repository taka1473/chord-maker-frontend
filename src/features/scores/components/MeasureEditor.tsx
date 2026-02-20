import { Fragment } from "react";
import type { EditableMeasure } from "@/features/scores/types";
import { ChordDisplay } from "@/features/scores/components/ChordDisplay";

type MeasureEditorProps = {
  measure: EditableMeasure;
  scoreKey: number;
  useFlats?: boolean;
  selectedChordTempId: string | null;
  isMeasureSelected: boolean;
  onSelectMeasure: () => void;
  onSelectChord: (chordTempId: string) => void;
  onAddChord: () => void;
  onInsertChord: (afterChordTempId: string | null) => void;
  selectedGapAfterChordTempId?: string | null | undefined;
};

function ChordGap({ onClick, isSelected }: { onClick: () => void; isSelected?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-2 shrink-0 cursor-pointer items-center justify-center self-stretch"
      title="コードを挿入"
    >
      <div className={[
        "h-full w-px transition-all",
        isSelected ? "w-0.5 bg-primary" : "bg-transparent group-hover:bg-primary",
      ].join(" ")} />
      <span className={[
        "absolute h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground shadow",
        isSelected ? "flex" : "hidden group-hover:flex",
      ].join(" ")}>
        +
      </span>
    </button>
  );
}

export function MeasureEditor({
  measure,
  scoreKey,
  useFlats = false,
  selectedChordTempId,
  isMeasureSelected,
  onSelectMeasure,
  onSelectChord,
  onAddChord,
  onInsertChord,
  selectedGapAfterChordTempId,
}: MeasureEditorProps) {
  const visibleChords = measure.chords.filter((c) => !c._destroy);

  return (
    <div
      className={[
        "cursor-pointer px-3 py-1 transition-colors",
        isMeasureSelected ? "bg-primary/5" : "",
      ].join(" ")}
      onClick={onSelectMeasure}
    >
      {measure.key_name && (
        <div className="mb-1">
          <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
            Key: {measure.key_name}
          </span>
        </div>
      )}

      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        {visibleChords.length > 0 ? (
          <>
            <ChordGap onClick={() => onInsertChord(null)} isSelected={selectedGapAfterChordTempId === null} />
            {visibleChords.map((chord) => (
              <Fragment key={chord.tempId}>
                <ChordDisplay
                  chord={chord}
                  scoreKey={scoreKey}
                  useFlats={useFlats}
                  isSelected={chord.tempId === selectedChordTempId}
                  onSelect={() => onSelectChord(chord.tempId)}
                />
                <ChordGap onClick={() => onInsertChord(chord.tempId)} isSelected={selectedGapAfterChordTempId === chord.tempId} />
              </Fragment>
            ))}
          </>
        ) : (
          <button
            type="button"
            onClick={onAddChord}
            className="rounded border border-dashed border-border px-3 py-1 text-xs text-muted transition-colors hover:border-primary/30 hover:text-foreground"
          >
            + コード追加
          </button>
        )}
      </div>
    </div>
  );
}
