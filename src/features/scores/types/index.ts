import type { components } from "@/app/schema";

export type ChordType = components["schemas"]["ChordType"];

export type KeyMode = "major" | "minor";

export type Score = {
  id: number;
  slug: string;
  title: string;
  artist: string | null;
  key: number;
  key_name: string;
  key_mode: KeyMode;
  tempo: number | null;
  time_signature: string | null;
  lyrics: string | null;
  created_at: string;
  published: boolean;
  tag_names: string[];
  guest_token?: string | null;
};

export type Chord = {
  id: number;
  position: number;
  root_offset: number;
  bass_offset: number;
  chord_type: ChordType;
};

export type Measure = {
  id: number;
  position: number;
  key: number | null;
  key_name: string | null;
  key_mode: KeyMode | null;
  row_break_before: boolean;
  chords: Chord[];
};

export type WholeScore = {
  id: number;
  slug: string;
  title: string;
  artist: string | null;
  key: number;
  key_name: string;
  key_mode: KeyMode;
  tempo: number | null;
  time_signature: string | null;
  lyrics: string | null;
  published: boolean;
  tag_names: string[];
  measures: Measure[];
};

// A=0, A#=1, B=2, C=3, C#=4, D=5, D#=6, E=7, F=8, F#=9, G=10, G#=11
const NOTE_NAMES_SHARP = [
  "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#",
] as const;

const NOTE_NAMES_FLAT = [
  "A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab",
] as const;

const CHORD_TYPE_SUFFIX: Record<ChordType, string> = {
  major: "",
  minor: "m",
  "7": "7",
  maj7: "M7",
  min7: "m7",
  "min7-5": "m7-5",
  dim: "dim",
  dim7: "dim7",
  aug: "aug",
  sus2: "sus2",
  sus4: "sus4",
  add9: "add9",
};

export function getNoteName(offset: number, scoreKey: number, useFlats = false): string {
  const index = (scoreKey + offset) % 12;
  const names = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
  return names[index] ?? "?";
}

export function isFlatKey(keyName: string): boolean {
  return keyName === "F" || keyName.includes("b");
}

export function getChordTypeSuffix(chordType: ChordType): string {
  return CHORD_TYPE_SUFFIX[chordType];
}

// --- エディタ用の型 ---

export type EditableChord = {
  tempId: string;
  id?: number;
  position: number;
  root_offset: number;
  bass_offset: number;
  chord_type: ChordType;
  _destroy?: boolean;
};

export type EditableMeasure = {
  tempId: string;
  id?: number;
  position: number;
  key_name?: string | null;
  key_mode?: KeyMode | null;
  row_break_before?: boolean;
  chords: EditableChord[];
  _destroy?: boolean;
};

export type ScoreFormData = {
  title: string;
  artist: string;
  key_name: string;
  key_mode: KeyMode;
  tempo: string;
  time_signature: string;
  tag_names: string[];
};

// --- 定数 ---

export const KEY_NAMES = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
] as const;

export const CHORD_TYPES: readonly ChordType[] = [
  "major", "minor", "7", "maj7", "min7", "min7-5",
  "dim", "dim7", "aug", "sus2", "sus4", "add9",
];

export const TIME_SIGNATURES = ["4/4", "3/4", "2/4", "6/8"] as const;

const KEY_NAME_TO_NUMBER: Record<string, number> = {
  A: 0, "A#": 1, Bb: 1, B: 2, C: 3, "C#": 4, Db: 4,
  D: 5, "D#": 6, Eb: 6, E: 7, F: 8, "F#": 9, Gb: 9,
  G: 10, "G#": 11, Ab: 11,
};

export function keyNameToNumber(keyName: string): number {
  return KEY_NAME_TO_NUMBER[keyName] ?? 0;
}

export function getKeyNameFromNumber(keyNumber: number, useFlats: boolean): string {
  const names = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
  return names[((keyNumber % 12) + 12) % 12] ?? "C";
}

export function formatKeyDisplay(keyName: string, keyMode: KeyMode): string {
  return keyMode === "minor" ? `${keyName}m` : keyName;
}

// --- ユーティリティ ---

export function formatChord(chord: Pick<Chord, "root_offset" | "bass_offset" | "chord_type">, scoreKey: number, useFlats = false): string {
  const root = getNoteName(chord.root_offset, scoreKey, useFlats);
  const suffix = getChordTypeSuffix(chord.chord_type);
  const bass = getNoteName(chord.bass_offset, scoreKey, useFlats);

  if (chord.root_offset === chord.bass_offset) {
    return `${root}${suffix}`;
  }
  return `${root}${suffix}/${bass}`;
}
