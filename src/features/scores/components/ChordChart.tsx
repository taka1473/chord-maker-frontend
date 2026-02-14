import type { WholeScore } from "@/features/scores/types";
import { formatChord, isFlatKey } from "@/features/scores/types";

type ChordChartProps = {
  wholeScore: WholeScore;
};

export function ChordChart({ wholeScore }: ChordChartProps) {
  const baseUseFlats = isFlatKey(wholeScore.key_name);
  const sortedMeasures = [...wholeScore.measures].sort(
    (a, b) => a.position - b.position
  );

  // 有効キーを小節順に走査して決定
  let currentKey = wholeScore.key;
  let currentFlats = baseUseFlats;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{wholeScore.title}</h1>
        {wholeScore.artist && (
          <p className="mt-1 text-sm text-foreground/60">{wholeScore.artist}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-foreground/60">
          <span>Key: {wholeScore.key_name}</span>
          {wholeScore.tempo && <span>BPM: {wholeScore.tempo}</span>}
          {wholeScore.time_signature && (
            <span>{wholeScore.time_signature}</span>
          )}
        </div>
        {wholeScore.tag_names.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {wholeScore.tag_names.map((tag) => (
              <span
                key={tag}
                className="rounded bg-foreground/10 px-2 py-0.5 text-xs text-foreground/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 border-t border-l border-foreground/20">
        {sortedMeasures.map((measure) => {
          if (measure.key_name && measure.key != null) {
            currentKey = measure.key;
            currentFlats = isFlatKey(measure.key_name);
          }
          const effectiveKey = currentKey;
          const effectiveFlats = currentFlats;

          const sortedChords = [...measure.chords].sort(
            (a, b) => a.position - b.position
          );

          return (
            <div
              key={measure.id}
              className="min-h-16 border-r border-b border-foreground/20 p-2"
            >
              {measure.key_name && (
                <div className="mb-1">
                  <span className="rounded bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-medium text-purple-600 dark:text-purple-400">
                    Key: {measure.key_name}
                  </span>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {sortedChords.map((chord) => (
                  <span key={chord.id} className="font-mono text-sm">
                    {formatChord(chord, effectiveKey, effectiveFlats)}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
