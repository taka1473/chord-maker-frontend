import { Fragment } from "react";
import type { EditableMeasure } from "@/features/scores/types";
import { ChordDisplay } from "@/features/scores/components/ChordDisplay";

type MeasureEditorProps = {
  measure: EditableMeasure;
  scoreKey: number;
  useFlats?: boolean;
  keyBadgeName?: string | null;
  selectedChordTempId: string | null;
  isMeasureSelected: boolean;
  onSelectMeasure: () => void;
  onSelectChord: (chordTempId: string) => void;
  onAddChord: () => void;
  onInsertChord: (afterChordTempId: string | null) => void;
  pendingChordTempId?: string | null;
  selectedGapAfterChordTempId?: string | null | undefined;
  isAddingChordDisabled?: boolean;
  isMeasureSelectMode?: boolean;
  isMeasureSelectSelected?: boolean;
  onMeasureTap?: () => void;
  isPreview?: boolean;
};

function ChordGap({ onClick, isSelected, disabled }: { onClick: () => void; isSelected?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex w-2 shrink-0 cursor-pointer items-center justify-center self-stretch disabled:pointer-events-none"
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
  keyBadgeName,
  selectedChordTempId,
  isMeasureSelected,
  onSelectMeasure,
  onSelectChord,
  onAddChord,
  onInsertChord,
  pendingChordTempId,
  selectedGapAfterChordTempId,
  isAddingChordDisabled = false,
  isMeasureSelectMode = false,
  isMeasureSelectSelected = false,
  onMeasureTap,
  isPreview = false,
}: MeasureEditorProps) {
  const visibleChords = measure.chords.filter((c) => !c._destroy);

  if (isMeasureSelectMode || isPreview) {
    return (
      <div
        className={[
          "px-3 py-1 transition-colors",
          isPreview
            ? "pointer-events-none opacity-50"
            : !onMeasureTap
              ? isMeasureSelectSelected
                ? "bg-primary/15 ring-2 ring-inset ring-primary"
                : ""
              : isMeasureSelectSelected
                ? "cursor-pointer bg-primary/15 ring-2 ring-inset ring-primary"
                : "cursor-pointer hover:bg-primary/5",
        ].join(" ")}
        onClick={isPreview ? undefined : onMeasureTap}
      >
        {keyBadgeName && (
          <div className="mb-1">
            <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
              Key: {keyBadgeName}
            </span>
          </div>
        )}
        <div className="flex items-center">
          {visibleChords.length > 0 ? (
            <>
              {visibleChords.map((chord) => (
                <ChordDisplay
                  key={chord.tempId}
                  chord={chord}
                  scoreKey={scoreKey}
                  useFlats={useFlats}
                  isSelected={false}
                  isPending={false}
                  onSelect={() => {}}
                />
              ))}
            </>
          ) : (
            <span className="font-mono text-sm text-muted">--</span>
          )}
        </div>
      </div>
    );
  }

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

      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        {visibleChords.length > 0 ? (
          <>
            <ChordGap onClick={() => onInsertChord(null)} isSelected={selectedGapAfterChordTempId === null} disabled={isAddingChordDisabled} />
            {visibleChords.map((chord) => (
              <Fragment key={chord.tempId}>
                <ChordDisplay
                  chord={chord}
                  scoreKey={scoreKey}
                  useFlats={useFlats}
                  isSelected={chord.tempId === selectedChordTempId}
                  isPending={chord.tempId === pendingChordTempId}
                  onSelect={() => onSelectChord(chord.tempId)}
                />
                <ChordGap onClick={() => onInsertChord(chord.tempId)} isSelected={selectedGapAfterChordTempId === chord.tempId} disabled={isAddingChordDisabled} />
              </Fragment>
            ))}
          </>
        ) : (
          <button
            type="button"
            onClick={onAddChord}
            disabled={isAddingChordDisabled}
            className={[
              "font-mono text-sm whitespace-nowrap rounded border px-1 transition-colors",
              isMeasureSelected
                ? "border-primary text-primary"
                : "border-dashed border-accent/50 text-muted hover:border-accent hover:text-foreground",
            ].join(" ")}
          >
            --
          </button>
        )}
      </div>
    </div>
  );
}
