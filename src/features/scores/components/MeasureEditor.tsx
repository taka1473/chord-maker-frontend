import { Fragment, useState } from "react";
import type { EditableMeasure } from "@/features/scores/types";
import { KEY_NAMES } from "@/features/scores/types";
import { ChordDisplay } from "@/features/scores/components/ChordDisplay";

type MeasureEditorProps = {
  measure: EditableMeasure;
  measureIndex: number;
  scoreKey: number;
  useFlats?: boolean;
  selectedChordTempId: string | null;
  onSelectChord: (chordTempId: string) => void;
  onAddChord: () => void;
  onInsertChord: (afterChordTempId: string | null) => void;
  onRemoveChord: (chordTempId: string) => void;
  onRemoveMeasure: () => void;
  onSetKey: (keyName: string | null) => void;
  onCopy: () => void;
  onPaste?: () => void;
  hasClipboard?: boolean;
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
  measureIndex,
  scoreKey,
  useFlats = false,
  selectedChordTempId,
  onSelectChord,
  onAddChord,
  onInsertChord,
  onRemoveChord,
  onRemoveMeasure,
  onSetKey,
  onCopy,
  onPaste,
  hasClipboard = false,
  selectedGapAfterChordTempId,
}: MeasureEditorProps) {
  const visibleChords = measure.chords.filter((c) => !c._destroy);
  const [showKeySelect, setShowKeySelect] = useState(false);

  return (
    <div className="p-2">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted">
            {measureIndex + 1}
          </span>
          {measure.key_name ? (
            <span className="flex items-center gap-1">
              <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                Key: {measure.key_name}
              </span>
              <button
                type="button"
                onClick={() => onSetKey(null)}
                className="text-[10px] text-destructive hover:opacity-80"
                title="転調を解除"
              >
                ×
              </button>
            </span>
          ) : (
            <>
              {showKeySelect ? (
                <select
                  className="rounded border border-border bg-background px-1 py-0.5 text-[10px]"
                  value=""
                  onChange={(e) => {
                    onSetKey(e.target.value || null);
                    setShowKeySelect(false);
                  }}
                  onBlur={() => setShowKeySelect(false)}
                  autoFocus
                >
                  <option value="">選択...</option>
                  {KEY_NAMES.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowKeySelect(true)}
                  className="rounded px-1 py-0.5 text-[10px] text-muted transition-colors hover:bg-primary/5 hover:text-foreground"
                  title="転調を設定"
                >
                  転調
                </button>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCopy}
            className="rounded px-1.5 py-0.5 text-[10px] text-muted transition-colors hover:bg-primary/5 hover:text-foreground"
            title="小節をコピー"
          >
            コピー
          </button>
          {hasClipboard && onPaste && (
            <button
              type="button"
              onClick={onPaste}
              className="rounded px-1.5 py-0.5 text-[10px] text-secondary transition-colors hover:bg-secondary/10"
              title="この小節の後にペースト"
            >
              ペースト
            </button>
          )}
          <button
            type="button"
            onClick={onRemoveMeasure}
            className="rounded px-1.5 py-0.5 text-[10px] text-destructive transition-colors hover:bg-destructive/10"
          >
            削除
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center">
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
                  onRemove={() => onRemoveChord(chord.tempId)}
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
