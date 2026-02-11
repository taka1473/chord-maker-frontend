import type { EditableMeasure, EditableChord } from "@/features/scores/types";

let tempIdCounter = 0;
export function nextTempId(): string {
  return `temp_${++tempIdCounter}`;
}

export type MeasureAction =
  | { type: "INIT"; measures: EditableMeasure[] }
  | { type: "ADD_MEASURE"; newTempId: string }
  | { type: "INSERT_MEASURE_AFTER"; afterTempId: string | null; newTempId: string }
  | { type: "REMOVE_MEASURE"; tempId: string }
  | { type: "ADD_CHORD"; measureTempId: string; chordTempId: string }
  | {
      type: "INSERT_CHORD_AFTER";
      measureTempId: string;
      afterChordTempId: string | null;
      chordTempId: string;
    }
  | { type: "REMOVE_CHORD"; measureTempId: string; chordTempId: string }
  | {
      type: "UPDATE_CHORD";
      measureTempId: string;
      chordTempId: string;
      field: string;
      value: number | string;
    }
  | { type: "SET_MEASURE_KEY"; measureTempId: string; keyName: string | null };

export function measuresReducer(
  state: EditableMeasure[],
  action: MeasureAction
): EditableMeasure[] {
  switch (action.type) {
    case "INIT":
      return action.measures;

    case "ADD_MEASURE": {
      const maxPos = state.reduce(
        (max, m) => (m._destroy ? max : Math.max(max, m.position)),
        0
      );
      return [
        ...state,
        { tempId: action.newTempId, position: maxPos + 1, chords: [] },
      ];
    }

    case "INSERT_MEASURE_AFTER": {
      const newMeasure: EditableMeasure = {
        tempId: action.newTempId,
        position: 0,
        chords: [],
      };

      let insertIdx: number;
      if (action.afterTempId === null) {
        const firstVisibleIdx = state.findIndex((m) => !m._destroy);
        insertIdx = firstVisibleIdx >= 0 ? firstVisibleIdx : 0;
      } else {
        insertIdx = state.findIndex((m) => m.tempId === action.afterTempId) + 1;
      }

      const newState = [...state];
      newState.splice(insertIdx, 0, newMeasure);

      let pos = 1;
      return newState.map((m) =>
        m._destroy ? m : { ...m, position: pos++ }
      );
    }

    case "REMOVE_MEASURE":
      return state
        .map((m) =>
          m.tempId === action.tempId
            ? m.id
              ? { ...m, _destroy: true }
              : { ...m, _destroy: true }
            : m
        )
        .filter((m) => (m._destroy ? m.id !== undefined : true));

    case "ADD_CHORD":
      return state.map((m) => {
        if (m.tempId !== action.measureTempId) return m;
        const maxPos = m.chords.reduce(
          (max, c) => (c._destroy ? max : Math.max(max, c.position)),
          0
        );
        const chord: EditableChord = {
          tempId: action.chordTempId,
          position: maxPos + 1,
          root_offset: 0,
          bass_offset: 0,
          chord_type: "major",
        };
        return { ...m, chords: [...m.chords, chord] };
      });

    case "INSERT_CHORD_AFTER":
      return state.map((m) => {
        if (m.tempId !== action.measureTempId) return m;

        const newChord: EditableChord = {
          tempId: action.chordTempId,
          position: 0,
          root_offset: 0,
          bass_offset: 0,
          chord_type: "major",
        };

        let insertIdx: number;
        if (action.afterChordTempId === null) {
          const firstVisibleIdx = m.chords.findIndex((c) => !c._destroy);
          insertIdx = firstVisibleIdx >= 0 ? firstVisibleIdx : 0;
        } else {
          insertIdx =
            m.chords.findIndex((c) => c.tempId === action.afterChordTempId) + 1;
        }

        const newChords = [...m.chords];
        newChords.splice(insertIdx, 0, newChord);

        let pos = 1;
        return {
          ...m,
          chords: newChords.map((c) =>
            c._destroy ? c : { ...c, position: pos++ }
          ),
        };
      });

    case "REMOVE_CHORD":
      return state.map((m) => {
        if (m.tempId !== action.measureTempId) return m;
        return {
          ...m,
          chords: m.chords
            .map((c) =>
              c.tempId === action.chordTempId
                ? c.id
                  ? { ...c, _destroy: true }
                  : { ...c, _destroy: true }
                : c
            )
            .filter((c) => (c._destroy ? c.id !== undefined : true)),
        };
      });

    case "UPDATE_CHORD":
      return state.map((m) => {
        if (m.tempId !== action.measureTempId) return m;
        return {
          ...m,
          chords: m.chords.map((c) =>
            c.tempId === action.chordTempId
              ? { ...c, [action.field]: action.value }
              : c
          ),
        };
      });

    case "SET_MEASURE_KEY":
      return state.map((m) =>
        m.tempId === action.measureTempId
          ? { ...m, key_name: action.keyName }
          : m
      );

    default:
      return state;
  }
}
