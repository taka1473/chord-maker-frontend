import { CHORD_TYPES, getChordTypeSuffix } from "@/features/scores/types";

type ChordTypeSelectorProps = {
  selectedType: string;
  onSelect: (type: string) => void;
};

export function ChordTypeSelector({
  selectedType,
  onSelect,
}: ChordTypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {CHORD_TYPES.map((type) => {
        const isSelected = type === selectedType;
        const label = getChordTypeSuffix(type) || "M";
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={[
              "rounded px-2.5 py-1 text-xs transition-colors",
              isSelected
                ? "bg-foreground text-background font-bold"
                : "border border-foreground/20 hover:bg-foreground/5",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
