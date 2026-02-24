import { describe, it, expect } from "vitest";
import {
  getNoteName,
  isFlatKey,
  getChordTypeSuffix,
  formatChord,
} from "@/features/scores/types";

describe("getNoteName", () => {
  // A=0, scoreKey for C=3
  it("returns root note name with sharp notation", () => {
    expect(getNoteName(0, 3)).toBe("C");    // offset 0, key C(3) → index 3 → C
    expect(getNoteName(4, 3)).toBe("E");    // offset 4, key C(3) → index 7 → E
    expect(getNoteName(7, 3)).toBe("G");    // offset 7, key C(3) → index 10 → G
  });

  it("returns note name with flat notation", () => {
    expect(getNoteName(0, 3, true)).toBe("C");
    expect(getNoteName(1, 3, true)).toBe("Db");
    expect(getNoteName(3, 3, true)).toBe("Eb");
  });

  it("returns sharp for non-flat mode", () => {
    expect(getNoteName(1, 3, false)).toBe("C#");
    expect(getNoteName(3, 3, false)).toBe("D#");
  });

  it("wraps around 12 semitones", () => {
    // offset 9, key C(3) → index 12 % 12 = 0 → A
    expect(getNoteName(9, 3)).toBe("A");
  });
});

describe("isFlatKey", () => {
  it("returns true for F", () => {
    expect(isFlatKey("F")).toBe(true);
  });

  it("returns true for keys containing 'b'", () => {
    expect(isFlatKey("Bb")).toBe(true);
    expect(isFlatKey("Eb")).toBe(true);
    expect(isFlatKey("Ab")).toBe(true);
    expect(isFlatKey("Db")).toBe(true);
    expect(isFlatKey("Gb")).toBe(true);
  });

  it("returns false for sharp keys", () => {
    expect(isFlatKey("C")).toBe(false);
    expect(isFlatKey("G")).toBe(false);
    expect(isFlatKey("D")).toBe(false);
    expect(isFlatKey("A")).toBe(false);
    expect(isFlatKey("E")).toBe(false);
    expect(isFlatKey("C#")).toBe(false);
  });
});

describe("getChordTypeSuffix", () => {
  it("returns empty string for major", () => {
    expect(getChordTypeSuffix("major")).toBe("");
  });

  it("returns 'm' for minor", () => {
    expect(getChordTypeSuffix("minor")).toBe("m");
  });

  it("returns correct suffix for each type", () => {
    expect(getChordTypeSuffix("7")).toBe("7");
    expect(getChordTypeSuffix("maj7")).toBe("M7");
    expect(getChordTypeSuffix("min7")).toBe("m7");
    expect(getChordTypeSuffix("min7-5")).toBe("m7-5");
    expect(getChordTypeSuffix("dim")).toBe("dim");
    expect(getChordTypeSuffix("dim7")).toBe("dim7");
    expect(getChordTypeSuffix("aug")).toBe("aug");
    expect(getChordTypeSuffix("sus2")).toBe("sus2");
    expect(getChordTypeSuffix("sus4")).toBe("sus4");
    expect(getChordTypeSuffix("add9")).toBe("add9");
  });
});

describe("formatChord", () => {
  const scoreKeyC = 3; // C

  it("formats a simple major chord", () => {
    const chord = { root_offset: 0, bass_offset: 0, chord_type: "major" };
    expect(formatChord(chord, scoreKeyC)).toBe("C");
  });

  it("formats a minor chord", () => {
    const chord = { root_offset: 4, bass_offset: 4, chord_type: "minor" };
    expect(formatChord(chord, scoreKeyC)).toBe("Em");
  });

  it("formats a chord with different bass (slash chord)", () => {
    const chord = { root_offset: 0, bass_offset: 7, chord_type: "major" };
    // root=C, bass=G → C/G
    expect(formatChord(chord, scoreKeyC)).toBe("C/G");
  });

  it("uses flat notation when specified", () => {
    const chord = { root_offset: 1, bass_offset: 1, chord_type: "minor" };
    expect(formatChord(chord, scoreKeyC, true)).toBe("Dbm");
    expect(formatChord(chord, scoreKeyC, false)).toBe("C#m");
  });
});
