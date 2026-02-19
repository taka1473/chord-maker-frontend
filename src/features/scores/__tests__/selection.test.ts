import { describe, it, expect } from "vitest";
import { selectionEquals, buildNavItems } from "@/features/scores/lib/selection";
import type { EditableMeasure } from "@/features/scores/types";

describe("selectionEquals", () => {
  it("returns true for identical chord selections", () => {
    const a = { type: "chord" as const, measureTempId: "m1", chordTempId: "c1" };
    const b = { type: "chord" as const, measureTempId: "m1", chordTempId: "c1" };
    expect(selectionEquals(a, b)).toBe(true);
  });

  it("returns false for chord selections with different chordTempId", () => {
    const a = { type: "chord" as const, measureTempId: "m1", chordTempId: "c1" };
    const b = { type: "chord" as const, measureTempId: "m1", chordTempId: "c2" };
    expect(selectionEquals(a, b)).toBe(false);
  });

  it("returns false for chord selections with different measureTempId", () => {
    const a = { type: "chord" as const, measureTempId: "m1", chordTempId: "c1" };
    const b = { type: "chord" as const, measureTempId: "m2", chordTempId: "c1" };
    expect(selectionEquals(a, b)).toBe(false);
  });

  it("returns true for identical chord_gap selections", () => {
    const a = { type: "chord_gap" as const, measureTempId: "m1", afterChordTempId: "c1" };
    const b = { type: "chord_gap" as const, measureTempId: "m1", afterChordTempId: "c1" };
    expect(selectionEquals(a, b)).toBe(true);
  });

  it("returns true for chord_gap with null afterChordTempId", () => {
    const a = { type: "chord_gap" as const, measureTempId: "m1", afterChordTempId: null };
    const b = { type: "chord_gap" as const, measureTempId: "m1", afterChordTempId: null };
    expect(selectionEquals(a, b)).toBe(true);
  });

  it("returns false for chord_gap with different afterChordTempId", () => {
    const a = { type: "chord_gap" as const, measureTempId: "m1", afterChordTempId: null };
    const b = { type: "chord_gap" as const, measureTempId: "m1", afterChordTempId: "c1" };
    expect(selectionEquals(a, b)).toBe(false);
  });

  it("returns true for identical bar_line selections", () => {
    const a = { type: "bar_line" as const, afterMeasureTempId: "m1" };
    const b = { type: "bar_line" as const, afterMeasureTempId: "m1" };
    expect(selectionEquals(a, b)).toBe(true);
  });

  it("returns true for bar_line with null afterMeasureTempId", () => {
    const a = { type: "bar_line" as const, afterMeasureTempId: null };
    const b = { type: "bar_line" as const, afterMeasureTempId: null };
    expect(selectionEquals(a, b)).toBe(true);
  });

  it("returns true for identical measure selections", () => {
    const a = { type: "measure" as const, measureTempId: "m1" };
    const b = { type: "measure" as const, measureTempId: "m1" };
    expect(selectionEquals(a, b)).toBe(true);
  });

  it("returns false for measure selections with different measureTempId", () => {
    const a = { type: "measure" as const, measureTempId: "m1" };
    const b = { type: "measure" as const, measureTempId: "m2" };
    expect(selectionEquals(a, b)).toBe(false);
  });

  it("returns false for different types", () => {
    const a = { type: "chord" as const, measureTempId: "m1", chordTempId: "c1" };
    const b = { type: "bar_line" as const, afterMeasureTempId: "m1" };
    expect(selectionEquals(a, b)).toBe(false);
  });

  it("returns false for measure vs chord with same measureTempId", () => {
    const a = { type: "measure" as const, measureTempId: "m1" };
    const b = { type: "chord" as const, measureTempId: "m1", chordTempId: "c1" };
    expect(selectionEquals(a, b)).toBe(false);
  });
});

describe("buildNavItems", () => {
  it("returns only opening bar_line for empty measures", () => {
    const items = buildNavItems([]);
    expect(items).toEqual([
      { type: "bar_line", afterMeasureTempId: null },
    ]);
  });

  it("generates correct sequence for one measure with one chord", () => {
    const measures: EditableMeasure[] = [
      {
        tempId: "m1",
        position: 1,
        chords: [
          { tempId: "c1", position: 1, root_offset: 0, bass_offset: 0, chord_type: "major" },
        ],
      },
    ];

    const items = buildNavItems(measures);
    expect(items).toEqual([
      { type: "bar_line", afterMeasureTempId: null },
      { type: "measure", measureTempId: "m1" },
      { type: "chord_gap", measureTempId: "m1", afterChordTempId: null },
      { type: "chord", measureTempId: "m1", chordTempId: "c1" },
      { type: "chord_gap", measureTempId: "m1", afterChordTempId: "c1" },
      { type: "bar_line", afterMeasureTempId: "m1" },
    ]);
  });

  it("generates correct sequence for two measures with multiple chords", () => {
    const measures: EditableMeasure[] = [
      {
        tempId: "m1",
        position: 1,
        chords: [
          { tempId: "c1", position: 1, root_offset: 0, bass_offset: 0, chord_type: "major" },
          { tempId: "c2", position: 2, root_offset: 4, bass_offset: 4, chord_type: "minor" },
        ],
      },
      {
        tempId: "m2",
        position: 2,
        chords: [
          { tempId: "c3", position: 1, root_offset: 7, bass_offset: 7, chord_type: "major" },
        ],
      },
    ];

    const items = buildNavItems(measures);
    expect(items).toEqual([
      { type: "bar_line", afterMeasureTempId: null },
      // m1
      { type: "measure", measureTempId: "m1" },
      { type: "chord_gap", measureTempId: "m1", afterChordTempId: null },
      { type: "chord", measureTempId: "m1", chordTempId: "c1" },
      { type: "chord_gap", measureTempId: "m1", afterChordTempId: "c1" },
      { type: "chord", measureTempId: "m1", chordTempId: "c2" },
      { type: "chord_gap", measureTempId: "m1", afterChordTempId: "c2" },
      { type: "bar_line", afterMeasureTempId: "m1" },
      // m2
      { type: "measure", measureTempId: "m2" },
      { type: "chord_gap", measureTempId: "m2", afterChordTempId: null },
      { type: "chord", measureTempId: "m2", chordTempId: "c3" },
      { type: "chord_gap", measureTempId: "m2", afterChordTempId: "c3" },
      { type: "bar_line", afterMeasureTempId: "m2" },
    ]);
  });

  it("skips destroyed chords", () => {
    const measures: EditableMeasure[] = [
      {
        tempId: "m1",
        position: 1,
        chords: [
          { tempId: "c1", position: 1, root_offset: 0, bass_offset: 0, chord_type: "major" },
          { tempId: "c2", position: 2, root_offset: 4, bass_offset: 4, chord_type: "minor", _destroy: true },
        ],
      },
    ];

    const items = buildNavItems(measures);
    // c2 is destroyed, so only c1 should appear
    const chordItems = items.filter((i) => i.type === "chord");
    expect(chordItems).toHaveLength(1);
    expect(chordItems[0]).toEqual({ type: "chord", measureTempId: "m1", chordTempId: "c1" });
  });

  it("generates correct items for measure with no chords", () => {
    const measures: EditableMeasure[] = [
      { tempId: "m1", position: 1, chords: [] },
    ];

    const items = buildNavItems(measures);
    expect(items).toEqual([
      { type: "bar_line", afterMeasureTempId: null },
      { type: "measure", measureTempId: "m1" },
      { type: "chord_gap", measureTempId: "m1", afterChordTempId: null },
      { type: "bar_line", afterMeasureTempId: "m1" },
    ]);
  });
});
