import type { EditableChord } from "@/features/scores/types";
import { CHORD_TYPES, getNoteName, getChordTypeSuffix } from "@/features/scores/types";

type ChordEditorProps = {
  chord: EditableChord;
  scoreKey: number;
  onUpdate: (field: string, value: number | string) => void;
  onRemove: () => void;
};

export function ChordEditor({
  chord,
  scoreKey,
  onUpdate,
  onRemove,
}: ChordEditorProps) {
  return (
    <div className="flex items-center gap-1">
      <select
        value={chord.root_offset}
        onChange={(e) => {
          const val = Number(e.target.value);
          onUpdate("root_offset", val);
          if (chord.root_offset === chord.bass_offset) {
            onUpdate("bass_offset", val);
          }
        }}
        className="w-16 rounded border border-foreground/20 bg-background px-1 py-1 text-sm focus:border-foreground/40 focus:outline-none"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={i}>
            {getNoteName(i, scoreKey)}
          </option>
        ))}
      </select>

      <select
        value={chord.chord_type}
        onChange={(e) => onUpdate("chord_type", e.target.value)}
        className="w-20 rounded border border-foreground/20 bg-background px-1 py-1 text-sm focus:border-foreground/40 focus:outline-none"
      >
        {CHORD_TYPES.map((type) => (
          <option key={type} value={type}>
            {getChordTypeSuffix(type) || "major"}
          </option>
        ))}
      </select>

      <select
        value={chord.bass_offset}
        onChange={(e) => onUpdate("bass_offset", Number(e.target.value))}
        className="w-16 rounded border border-foreground/20 bg-background px-1 py-1 text-sm focus:border-foreground/40 focus:outline-none"
        title="ベース音（分数コード用）"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={i}>
            {chord.root_offset === i ? "-" : `/${getNoteName(i, scoreKey)}`}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={onRemove}
        className="ml-1 rounded px-1.5 py-0.5 text-xs text-red-500 transition-colors hover:bg-red-500/10"
        title="コードを削除"
      >
        &times;
      </button>
    </div>
  );
}
