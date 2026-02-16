import type { EditableChord } from "@/features/scores/types";
import { formatChord } from "@/features/scores/types";

type ChordDisplayProps = {
  chord: EditableChord;
  scoreKey: number;
  useFlats?: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
};

export function ChordDisplay({
  chord,
  scoreKey,
  useFlats = false,
  isSelected,
  onSelect,
  onRemove,
}: ChordDisplayProps) {
  return (
    <div className="group relative">
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
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute -top-1.5 -right-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] leading-none text-destructive-foreground group-hover:flex"
        title="コードを削除"
      >
        &times;
      </button>
    </div>
  );
}
