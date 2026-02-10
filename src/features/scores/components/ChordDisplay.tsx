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
            ? "bg-blue-500/10 text-blue-600 ring-2 ring-blue-500 dark:text-blue-400"
            : "border border-foreground/20 hover:border-foreground/40",
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
        className="absolute -top-1.5 -right-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white group-hover:flex"
        title="コードを削除"
      >
        &times;
      </button>
    </div>
  );
}
