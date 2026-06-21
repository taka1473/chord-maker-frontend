import { describe, it, expect } from "vitest";
import { measuresReducer } from "@/features/scores/lib/measures-reducer";
import type { EditableMeasure } from "@/features/scores/types";

function makeMeasure(tempId: string, position: number, chords: EditableMeasure["chords"] = []): EditableMeasure {
  return { tempId, position, chords };
}

function makeChord(tempId: string, position: number, overrides: Partial<EditableMeasure["chords"][0]> = {}) {
  return { tempId, position, root_offset: 0, bass_offset: 0, chord_type: "major" as const, ...overrides };
}

describe("measuresReducer", () => {
  describe("INIT", () => {
    it("replaces state with given measures", () => {
      const measures = [makeMeasure("m1", 1)];
      const result = measuresReducer([], { type: "INIT", measures });
      expect(result).toEqual(measures);
    });
  });

  describe("ADD_MEASURE", () => {
    it("adds a measure with position after the last", () => {
      const state = [makeMeasure("m1", 1)];
      const result = measuresReducer(state, { type: "ADD_MEASURE", newTempId: "m2" });
      expect(result).toHaveLength(2);
      expect(result[1]!.tempId).toBe("m2");
      expect(result[1]!.position).toBe(2);
    });

    it("adds first measure at position 1", () => {
      const result = measuresReducer([], { type: "ADD_MEASURE", newTempId: "m1" });
      expect(result).toHaveLength(1);
      expect(result[0]!.position).toBe(1);
    });
  });

  describe("INSERT_MEASURE_AFTER", () => {
    it("inserts at the beginning when afterTempId is null", () => {
      const state = [makeMeasure("m1", 1), makeMeasure("m2", 2)];
      const result = measuresReducer(state, {
        type: "INSERT_MEASURE_AFTER",
        afterTempId: null,
        newTempId: "m_new",
      });
      expect(result[0]!.tempId).toBe("m_new");
      expect(result[0]!.position).toBe(1);
      expect(result[1]!.tempId).toBe("m1");
      expect(result[1]!.position).toBe(2);
      expect(result[2]!.tempId).toBe("m2");
      expect(result[2]!.position).toBe(3);
    });

    it("inserts after specified measure", () => {
      const state = [makeMeasure("m1", 1), makeMeasure("m2", 2)];
      const result = measuresReducer(state, {
        type: "INSERT_MEASURE_AFTER",
        afterTempId: "m1",
        newTempId: "m_new",
      });
      expect(result[0]!.tempId).toBe("m1");
      expect(result[1]!.tempId).toBe("m_new");
      expect(result[2]!.tempId).toBe("m2");
      // positions renumbered
      expect(result.map((m) => m.position)).toEqual([1, 2, 3]);
    });
  });

  describe("REMOVE_MEASURE", () => {
    it("removes a measure without id (no server record)", () => {
      const state = [makeMeasure("m1", 1), makeMeasure("m2", 2)];
      const result = measuresReducer(state, { type: "REMOVE_MEASURE", tempId: "m1" });
      // m1 has no id, so it's filtered out completely
      expect(result).toHaveLength(1);
      expect(result[0]!.tempId).toBe("m2");
    });

    it("marks a measure with id as _destroy", () => {
      const state: EditableMeasure[] = [
        { tempId: "m1", id: 100, position: 1, chords: [] },
        makeMeasure("m2", 2),
      ];
      const result = measuresReducer(state, { type: "REMOVE_MEASURE", tempId: "m1" });
      expect(result).toHaveLength(2);
      expect(result[0]!._destroy).toBe(true);
      expect(result[0]!.id).toBe(100);
    });
  });

  describe("ADD_CHORD", () => {
    it("adds a chord to the specified measure", () => {
      const state = [makeMeasure("m1", 1)];
      const result = measuresReducer(state, {
        type: "ADD_CHORD",
        measureTempId: "m1",
        chordTempId: "c1",
      });
      expect(result[0]!.chords).toHaveLength(1);
      expect(result[0]!.chords[0]!.tempId).toBe("c1");
      expect(result[0]!.chords[0]!.position).toBe(1);
      expect(result[0]!.chords[0]!.chord_type).toBe("major");
    });

    it("increments position for subsequent chords", () => {
      const state = [makeMeasure("m1", 1, [makeChord("c1", 1)])];
      const result = measuresReducer(state, {
        type: "ADD_CHORD",
        measureTempId: "m1",
        chordTempId: "c2",
      });
      expect(result[0]!.chords).toHaveLength(2);
      expect(result[0]!.chords[1]!.position).toBe(2);
    });
  });

  describe("INSERT_CHORD_AFTER", () => {
    it("inserts at the beginning when afterChordTempId is null", () => {
      const state = [makeMeasure("m1", 1, [makeChord("c1", 1)])];
      const result = measuresReducer(state, {
        type: "INSERT_CHORD_AFTER",
        measureTempId: "m1",
        afterChordTempId: null,
        chordTempId: "c_new",
      });
      expect(result[0]!.chords[0]!.tempId).toBe("c_new");
      expect(result[0]!.chords[0]!.position).toBe(1);
      expect(result[0]!.chords[1]!.tempId).toBe("c1");
      expect(result[0]!.chords[1]!.position).toBe(2);
    });

    it("inserts after specified chord", () => {
      const state = [makeMeasure("m1", 1, [makeChord("c1", 1), makeChord("c2", 2)])];
      const result = measuresReducer(state, {
        type: "INSERT_CHORD_AFTER",
        measureTempId: "m1",
        afterChordTempId: "c1",
        chordTempId: "c_new",
      });
      expect(result[0]!.chords.map((c) => c.tempId)).toEqual(["c1", "c_new", "c2"]);
      expect(result[0]!.chords.map((c) => c.position)).toEqual([1, 2, 3]);
    });
  });

  describe("REMOVE_CHORD", () => {
    it("removes chord without id", () => {
      const state = [makeMeasure("m1", 1, [makeChord("c1", 1), makeChord("c2", 2)])];
      const result = measuresReducer(state, {
        type: "REMOVE_CHORD",
        measureTempId: "m1",
        chordTempId: "c1",
      });
      expect(result[0]!.chords).toHaveLength(1);
      expect(result[0]!.chords[0]!.tempId).toBe("c2");
    });

    it("marks chord with id as _destroy", () => {
      const state: EditableMeasure[] = [
        {
          tempId: "m1",
          position: 1,
          chords: [{ ...makeChord("c1", 1), id: 200 }],
        },
      ];
      const result = measuresReducer(state, {
        type: "REMOVE_CHORD",
        measureTempId: "m1",
        chordTempId: "c1",
      });
      expect(result[0]!.chords).toHaveLength(1);
      expect(result[0]!.chords[0]!._destroy).toBe(true);
    });
  });

  describe("UPDATE_CHORD", () => {
    it("updates the specified field of a chord", () => {
      const state = [makeMeasure("m1", 1, [makeChord("c1", 1)])];
      const result = measuresReducer(state, {
        type: "UPDATE_CHORD",
        measureTempId: "m1",
        chordTempId: "c1",
        field: "root_offset",
        value: 5,
      });
      expect(result[0]!.chords[0]!.root_offset).toBe(5);
    });

    it("updates chord_type", () => {
      const state = [makeMeasure("m1", 1, [makeChord("c1", 1)])];
      const result = measuresReducer(state, {
        type: "UPDATE_CHORD",
        measureTempId: "m1",
        chordTempId: "c1",
        field: "chord_type",
        value: "minor",
      });
      expect(result[0]!.chords[0]!.chord_type).toBe("minor");
    });

    it("does not affect other measures", () => {
      const state = [
        makeMeasure("m1", 1, [makeChord("c1", 1)]),
        makeMeasure("m2", 2, [makeChord("c2", 1)]),
      ];
      const result = measuresReducer(state, {
        type: "UPDATE_CHORD",
        measureTempId: "m1",
        chordTempId: "c1",
        field: "root_offset",
        value: 3,
      });
      expect(result[1]!.chords[0]!.root_offset).toBe(0);
    });
  });

  describe("SET_MEASURE_KEY", () => {
    it("sets key_name on the specified measure", () => {
      const state = [makeMeasure("m1", 1)];
      const result = measuresReducer(state, {
        type: "SET_MEASURE_KEY",
        measureTempId: "m1",
        keyName: "Eb",
      });
      expect(result[0]!.key_name).toBe("Eb");
    });

    it("clears key_name when null", () => {
      const state: EditableMeasure[] = [
        { ...makeMeasure("m1", 1), key_name: "Eb" },
      ];
      const result = measuresReducer(state, {
        type: "SET_MEASURE_KEY",
        measureTempId: "m1",
        keyName: null,
      });
      expect(result[0]!.key_name).toBeNull();
    });
  });
});
