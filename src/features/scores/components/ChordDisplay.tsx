import type { EditableChord } from "@/features/scores/types";
import { formatChord } from "@/features/scores/types";

type ChordDisplayProps = {
  chord: EditableChord;
  scoreKey: number;
  useFlats?: boolean;
  isSelected: boolean;
  onSelect: () => void;
};

export function ChordDisplay({
  chord,
  scoreKey,
  useFlats = false,
  isSelected,
  onSelect,
}: ChordDisplayProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "rounded px-3 py-1.5 text-sm font-mono transition-colors",
        isSelected
          ? "bg-primary/10 text-primary ring-2 ring-primary"
          : "border border-border hover:border-primary/30",
      ].join(" ")}
    >
      {formatChord(chord, scoreKey, useFlats)}
    </button>
  );
}
