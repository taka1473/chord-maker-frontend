import type { EditableMeasure } from "@/features/scores/types";

export type Selection =
  | { type: "chord"; measureTempId: string; chordTempId: string }
  | { type: "chord_gap"; measureTempId: string; afterChordTempId: string | null }
  | { type: "bar_line"; afterMeasureTempId: string | null }
  | null;

export function selectionEquals(a: NonNullable<Selection>, b: NonNullable<Selection>): boolean {
  if (a.type !== b.type) return false;
  switch (a.type) {
    case "chord":
      return a.measureTempId === (b as typeof a).measureTempId && a.chordTempId === (b as typeof a).chordTempId;
    case "chord_gap":
      return a.measureTempId === (b as typeof a).measureTempId && a.afterChordTempId === (b as typeof a).afterChordTempId;
    case "bar_line":
      return a.afterMeasureTempId === (b as typeof a).afterMeasureTempId;
  }
}

export function buildNavItems(visibleMeasures: EditableMeasure[]): NonNullable<Selection>[] {
  const items: NonNullable<Selection>[] = [];
  items.push({ type: "bar_line", afterMeasureTempId: null });
  for (const m of visibleMeasures) {
    const visChords = m.chords.filter((c) => !c._destroy);
    items.push({ type: "chord_gap", measureTempId: m.tempId, afterChordTempId: null });
    for (const c of visChords) {
      items.push({ type: "chord", measureTempId: m.tempId, chordTempId: c.tempId });
      items.push({ type: "chord_gap", measureTempId: m.tempId, afterChordTempId: c.tempId });
    }
    items.push({ type: "bar_line", afterMeasureTempId: m.tempId });
  }
  return items;
}
