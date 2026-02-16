import { getNoteName } from "@/features/scores/types";

type PianoKeyboardProps = {
  selectedOffset: number;
  scoreKey: number;
  onSelect: (offset: number) => void;
  useFlats?: boolean;
  compact?: boolean;
};

// NOTE_NAMES index: A=0, A#=1, B=2, C=3, C#=4, D=5, D#=6, E=7, F=8, F#=9, G=10, G#=11
const WHITE_KEY_NOTE_INDICES = [3, 5, 7, 8, 10, 0, 2]; // C D E F G A B

const BLACK_KEY_DATA = [
  { noteIdx: 4, afterWhiteKey: 0 }, // C#
  { noteIdx: 6, afterWhiteKey: 1 }, // D#
  { noteIdx: 9, afterWhiteKey: 3 }, // F#
  { noteIdx: 11, afterWhiteKey: 4 }, // G#
  { noteIdx: 1, afterWhiteKey: 5 }, // A#
];

function noteIdxToOffset(noteIdx: number, scoreKey: number): number {
  return (noteIdx - scoreKey + 12) % 12;
}

export function PianoKeyboard({
  selectedOffset,
  scoreKey,
  onSelect,
  useFlats = false,
  compact = false,
}: PianoKeyboardProps) {
  const whiteHeight = compact ? "h-10" : "h-14";
  const blackHeight = compact ? "h-6" : "h-9";
  const fontSize = compact ? "text-[10px]" : "text-xs";
  const blackWidthPercent = (1 / 7) * 60;

  return (
    <div className="relative flex select-none">
      {WHITE_KEY_NOTE_INDICES.map((noteIdx, i) => {
        const offset = noteIdxToOffset(noteIdx, scoreKey);
        const isSelected = offset === selectedOffset;
        return (
          <button
            key={noteIdx}
            type="button"
            onClick={() => onSelect(offset)}
            className={[
              "flex-1 flex items-end justify-center pb-1",
              whiteHeight,
              fontSize,
              "border border-foreground/20 rounded-b transition-colors",
              i > 0 ? "-ml-px" : "",
              isSelected
                ? "bg-primary text-primary-foreground border-primary z-[5] font-bold"
                : "bg-background hover:bg-primary/5",
            ].join(" ")}
          >
            {getNoteName(offset, scoreKey, useFlats)}
          </button>
        );
      })}

      {BLACK_KEY_DATA.map(({ noteIdx, afterWhiteKey }) => {
        const offset = noteIdxToOffset(noteIdx, scoreKey);
        const isSelected = offset === selectedOffset;
        const leftPercent = ((afterWhiteKey + 1) / 7) * 100;

        return (
          <button
            key={noteIdx}
            type="button"
            onClick={() => onSelect(offset)}
            className={[
              "absolute top-0 flex items-end justify-center pb-0.5",
              blackHeight,
              fontSize,
              "rounded-b z-10 transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground font-bold"
                : "bg-foreground text-background hover:bg-foreground/80",
            ].join(" ")}
            style={{
              left: `calc(${leftPercent}% - ${blackWidthPercent / 2}%)`,
              width: `${blackWidthPercent}%`,
            }}
          >
            {getNoteName(offset, scoreKey, useFlats)}
          </button>
        );
      })}
    </div>
  );
}
