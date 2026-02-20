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
        "font-mono text-sm whitespace-nowrap transition-colors",
        isSelected
          ? "rounded bg-primary/10 text-primary ring-2 ring-primary px-1"
          : "hover:text-primary",
      ].join(" ")}
    >
      {formatChord(chord, scoreKey, useFlats)}
    </button>
  );
}
