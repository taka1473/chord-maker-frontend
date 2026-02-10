export type Score = {
  id: number;
  title: string;
  key: number;
  key_name: string;
  tempo: number | null;
  time_signature: string | null;
  lyrics: string | null;
  created_at: string;
};

export type Chord = {
  id: number;
  position: number;
  root_offset: number;
  bass_offset: number;
  chord_type: string;
};

export type Measure = {
  id: number;
  position: number;
  key: number | null;
  key_name: string | null;
  chords: Chord[];
};

export type WholeScore = {
  id: number;
  title: string;
  key: number;
  key_name: string;
  tempo: number | null;
  time_signature: string | null;
  lyrics: string | null;
  measures: Measure[];
};

// A=0, A#=1, B=2, C=3, C#=4, D=5, D#=6, E=7, F=8, F#=9, G=10, G#=11
const NOTE_NAMES_SHARP = [
  "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#",
] as const;

const NOTE_NAMES_FLAT = [
  "A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab",
] as const;

const CHORD_TYPE_SUFFIX: Record<string, string> = {
  major: "",
  minor: "m",
  dim: "dim",
  aug: "aug",
  sus2: "sus2",
  sus4: "sus4",
  add9: "add9",
  maj7: "M7",
  min7: "m7",
  dim7: "dim7",
  aug7: "aug7",
};

export function getNoteName(offset: number, scoreKey: number, useFlats = false): string {
  const index = (scoreKey + offset) % 12;
  const names = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
  return names[index] ?? "?";
}

export function isFlatKey(keyName: string): boolean {
  return keyName === "F" || keyName.includes("b");
}

export function getChordTypeSuffix(chordType: string): string {
  return CHORD_TYPE_SUFFIX[chordType] ?? chordType;
}

// --- エディタ用の型 ---

export type EditableChord = {
  tempId: string;
  id?: number;
  position: number;
  root_offset: number;
  bass_offset: number;
  chord_type: string;
  _destroy?: boolean;
};

export type EditableMeasure = {
  tempId: string;
  id?: number;
  position: number;
  key_name?: string | null;
  chords: EditableChord[];
  _destroy?: boolean;
};

export type ScoreFormData = {
  title: string;
  key_name: string;
  tempo: string;
  time_signature: string;
};

// --- 定数 ---

export const KEY_NAMES = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B",
] as const;

export const CHORD_TYPES = [
  "major", "minor", "dim", "aug", "sus2", "sus4", "add9", "maj7", "min7", "dim7", "aug7",
] as const;

export const TIME_SIGNATURES = ["4/4", "3/4", "2/4", "6/8"] as const;

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
