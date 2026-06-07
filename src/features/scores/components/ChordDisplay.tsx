import type { EditableChord } from "@/features/scores/types";
import { formatChord } from "@/features/scores/types";

type ChordDisplayProps = {
  chord: EditableChord;
  scoreKey: number;
  useFlats?: boolean;
  isSelected: boolean;
  isPending?: boolean;
  onSelect: () => void;
};

export function ChordDisplay({
  chord,
  scoreKey,
  useFlats = false,
  isSelected,
  isPending = false,
  onSelect,
}: ChordDisplayProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "font-mono text-sm whitespace-nowrap transition-colors",
        isPending && isSelected
          ? "rounded border border-primary px-1 text-primary"
          : isPending
            ? "rounded border border-dashed border-accent/50 px-1 text-muted"
            : isSelected
            ? "rounded bg-primary/10 text-primary ring-2 ring-primary px-1"
            : "hover:text-primary",
      ].join(" ")}
    >
      {isPending ? "--" : formatChord(chord, scoreKey, useFlats)}
    </button>
  );
}
