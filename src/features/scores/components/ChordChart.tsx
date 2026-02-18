"use client";

import Link from "next/link";
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

  const measuresRenderable = sortedMeasures.map((measure) => {
    if (measure.key_name && measure.key != null) {
      currentKey = measure.key;
      currentFlats = isFlatKey(measure.key_name);
    }
    return {
      measure,
      effectiveKey: currentKey,
      effectiveFlats: currentFlats,
    };
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{wholeScore.title}</h1>
        {wholeScore.artist && (
          <p className="mt-1 text-sm text-muted">{wholeScore.artist}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted">
          <span>Key: {wholeScore.key_name}</span>
          {wholeScore.tempo && <span>BPM: {wholeScore.tempo}</span>}
          {wholeScore.time_signature && (
            <span>{wholeScore.time_signature}</span>
          )}
        </div>
        {wholeScore.tag_names.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {wholeScore.tag_names.map((tag) => (
              <Link
                key={tag}
                href={`/?tag=${encodeURIComponent(tag)}`}
                className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary hover:bg-primary/20"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {(() => {
          const rows = [];
          for (let i = 0; i < measuresRenderable.length; i += 4) {
            rows.push(measuresRenderable.slice(i, i + 4));
          }
          return rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex items-stretch">
              {row.map(({ measure, effectiveKey, effectiveFlats }) => {
                const sortedChords = [...measure.chords].sort(
                  (a, b) => a.position - b.position
                );
                return (
                  <div
                    key={measure.id}
                    className="border-l border-border px-3 py-1 first:border-l-0 first:pl-0"
                  >
                    {measure.key_name && (
                      <div className="mb-1">
                        <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                          Key: {measure.key_name}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {sortedChords.map((chord) => (
                        <span key={chord.id} className="font-mono text-sm whitespace-nowrap">
                          {formatChord(chord, effectiveKey, effectiveFlats)}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
