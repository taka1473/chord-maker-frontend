"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { WholeScore } from "@/features/scores/types";
import {
  formatChord,
  formatKeyDisplay,
  isFlatKey,
  keyNameToNumber,
  getKeyNameFromNumber,
  KEY_NAMES,
} from "@/features/scores/types";
import type { KeyMode } from "@/features/scores/types";

type ChordChartProps = {
  wholeScore: WholeScore;
};

function buildMeasuresRenderable(
  sortedMeasures: WholeScore["measures"],
  baseKey: number,
  baseKeyMode: KeyMode,
  transposition: number,
  selectedUseFlats: boolean,
) {
  const baseKeyTransposed = (baseKey + transposition) % 12;
  let currentKey = baseKeyTransposed;
  let currentFlats = selectedUseFlats;
  let currentKeyMode: KeyMode = baseKeyMode;

  return sortedMeasures.map((measure) => {
    const prevKey = currentKey;

    if (measure.key_name && measure.key != null) {
      currentKey = (measure.key + transposition) % 12;
      currentFlats = isFlatKey(
        getKeyNameFromNumber(currentKey, isFlatKey(measure.key_name))
      );
      currentKeyMode = measure.key_mode ?? "major";
    } else if (!measure.key_name) {
      currentKey = baseKeyTransposed;
      currentFlats = selectedUseFlats;
      currentKeyMode = baseKeyMode;
    }

    const keyChanged = currentKey !== prevKey;
    const transposedKeyName = keyChanged
      ? getKeyNameFromNumber(currentKey, currentFlats)
      : null;
    return {
      measure,
      effectiveKey: currentKey,
      effectiveFlats: currentFlats,
      transposedKeyDisplay: transposedKeyName
        ? formatKeyDisplay(transposedKeyName, currentKeyMode)
        : null,
    };
  });
}

export function ChordChart({ wholeScore }: ChordChartProps) {
  const [selectedKeyName, setSelectedKeyName] = useState(wholeScore.key_name);

  const selectedKeyNumber = keyNameToNumber(selectedKeyName);
  const transposition = ((selectedKeyNumber - wholeScore.key) % 12 + 12) % 12;
  const selectedUseFlats = isFlatKey(selectedKeyName);

  const sortedMeasures = [...wholeScore.measures].sort(
    (a, b) => a.position - b.position
  );

  // 有効キーを小節順に走査して決定（転調オフセットを適用）
  const measuresRenderable = useMemo(
    () => buildMeasuresRenderable(sortedMeasures, wholeScore.key, wholeScore.key_mode, transposition, selectedUseFlats),
    [sortedMeasures, wholeScore.key, wholeScore.key_mode, transposition, selectedUseFlats],
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{wholeScore.title}</h1>
        {wholeScore.artist && (
          <p className="mt-1 text-sm text-muted">{wholeScore.artist}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted">
          <label className="flex items-center gap-1.5">
            Key:
            <select
              value={selectedKeyName}
              onChange={(e) => setSelectedKeyName(e.target.value)}
              className="rounded border border-border bg-background px-2 py-0.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none"
            >
              {KEY_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
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
              {row.map(({ measure, effectiveKey, effectiveFlats, transposedKeyDisplay }) => {
                const sortedChords = [...measure.chords].sort(
                  (a, b) => a.position - b.position
                );
                return (
                  <div
                    key={measure.id}
                    className="border-l border-border px-3 py-1 first:border-l-0 first:pl-0"
                  >
                    {transposedKeyDisplay && (
                      <div className="mb-1">
                        <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-medium text-accent">
                          Key: {transposedKeyDisplay}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {sortedChords.length === 0 ? (
                        <span className="font-mono text-sm text-muted whitespace-nowrap">―</span>
                      ) : (
                        sortedChords.map((chord) => (
                          <span key={chord.id} className="font-mono text-sm whitespace-nowrap">
                            {formatChord(chord, effectiveKey, effectiveFlats)}
                          </span>
                        ))
                      )}
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
