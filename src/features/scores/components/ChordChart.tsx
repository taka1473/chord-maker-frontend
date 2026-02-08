import type { WholeScore } from "@/features/scores/types";
import { formatChord } from "@/features/scores/types";

type ChordChartProps = {
  wholeScore: WholeScore;
};

export function ChordChart({ wholeScore }: ChordChartProps) {
  const sortedMeasures = [...wholeScore.measures].sort(
    (a, b) => a.position - b.position
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{wholeScore.title}</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-foreground/60">
          <span>Key: {wholeScore.key_name}</span>
          {wholeScore.tempo && <span>BPM: {wholeScore.tempo}</span>}
          {wholeScore.time_signature && (
            <span>{wholeScore.time_signature}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 border-t border-l border-foreground/20">
        {sortedMeasures.map((measure) => {
          const sortedChords = [...measure.chords].sort(
            (a, b) => a.position - b.position
          );

          return (
            <div
              key={measure.id}
              className="min-h-16 border-r border-b border-foreground/20 p-2"
            >
              <div className="flex flex-wrap gap-2">
                {sortedChords.map((chord) => (
                  <span key={chord.id} className="font-mono text-sm">
                    {formatChord(chord, wholeScore.key)}
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
