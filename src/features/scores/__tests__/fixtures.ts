import type { WholeScore } from "@/features/scores/types";

// C key, 2 measures: [C, Am] | [F, G]
// root_offset=0→C, 9→A, 5→F, 7→G (with scoreKey=3=C, no flats)
export const twoMeasureScore: WholeScore = {
  id: 1,
  slug: "test-score",
  title: "Test Score",
  artist: null,
  key: 3,
  key_name: "C",
  tempo: null,
  time_signature: "4/4",
  lyrics: null,
  key_mode: "major",
  published: false,
  tag_names: [],
  measures: [
    {
      id: 1,
      position: 1,
      key: null,
      key_name: null,
      key_mode: null,
      row_break_before: false,
      chords: [
        { id: 1, position: 1, root_offset: 0, bass_offset: 0, chord_type: "major" },
        { id: 2, position: 2, root_offset: 9, bass_offset: 9, chord_type: "minor" },
      ],
    },
    {
      id: 2,
      position: 2,
      key: null,
      key_name: null,
      key_mode: null,
      row_break_before: false,
      chords: [
        { id: 3, position: 1, root_offset: 5, bass_offset: 5, chord_type: "major" },
        { id: 4, position: 2, root_offset: 7, bass_offset: 7, chord_type: "major" },
      ],
    },
  ],
};
