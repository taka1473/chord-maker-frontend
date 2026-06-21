import type { EditableMeasure, EditableChord } from "@/features/scores/types";
import { keyNameToNumber, getKeyNameFromNumber, isFlatKey } from "@/features/scores/types";

let tempIdCounter = 0;
export function nextTempId(): string {
  return `temp_${++tempIdCounter}`;
}

export type MeasureAction =
  | { type: "INIT"; measures: EditableMeasure[] }
  | { type: "ADD_MEASURE"; newTempId: string }
  | { type: "INSERT_MEASURE_AFTER"; afterTempId: string | null; newTempId: string; initialKeyName?: string | null }
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
  | { type: "SET_MEASURE_KEY"; measureTempId: string; keyName: string | null }
  | { type: "APPLY_KEY_CHANGE"; oldKey: number; newKey: number; mode: "relative" | "absolute" };

export function measuresReducer(
  state: EditableMeasure[],
  action: MeasureAction
): EditableMeasure[] {
  switch (action.type) {
    case "INIT":
      return action.measures;

    case "ADD_MEASURE": {
      const visibleMeasures = state.filter((m) => !m._destroy);
      const lastMeasure = visibleMeasures[visibleMeasures.length - 1];
      const inheritedKeyName = lastMeasure?.key_name ?? null;
      const maxPos = visibleMeasures.reduce((max, m) => Math.max(max, m.position), 0);
      return [
        ...state,
        { tempId: action.newTempId, position: maxPos + 1, key_name: inheritedKeyName, chords: [] },
      ];
    }

    case "INSERT_MEASURE_AFTER": {
      const prevMeasure = action.afterTempId
        ? state.find((m) => m.tempId === action.afterTempId)
        : null;
      const newKeyName =
        action.initialKeyName !== undefined
          ? (action.initialKeyName ?? null)
          : (prevMeasure?.key_name ?? null);

      const newMeasure: EditableMeasure = {
        tempId: action.newTempId,
        position: 0,
        key_name: newKeyName,
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

    case "SET_MEASURE_KEY": {
      const targetIdx = state.findIndex((m) => m.tempId === action.measureTempId);
      if (targetIdx === -1) return state;

      const target = state[targetIdx]!;
      const oldKeyName = target.key_name ?? null;
      const newKeyName = action.keyName ?? null;

      if (oldKeyName === newKeyName) return state;

      const result = [...state];
      result[targetIdx] = { ...target, key_name: newKeyName };

      for (let i = targetIdx + 1; i < result.length; i++) {
        const m = result[i]!;
        if (m._destroy) continue;
        if ((m.key_name ?? null) !== oldKeyName) break;
        result[i] = { ...m, key_name: newKeyName };
      }

      return result;
    }

    case "APPLY_KEY_CHANGE": {
      const { oldKey, newKey, mode } = action;
      const delta = ((newKey - oldKey) % 12 + 12) % 12;
      if (delta === 0) return state;

      if (mode === "relative") {
        // 移調：offset はそのまま、小節キーオーバーライドをdelta分シフト
        return state.map((m) => {
          if (!m.key_name) return m;
          const currentMeasureKey = keyNameToNumber(m.key_name);
          const newMeasureKey = (currentMeasureKey + delta) % 12;
          const newKeyName = getKeyNameFromNumber(newMeasureKey, isFlatKey(m.key_name));
          return { ...m, key_name: newKeyName };
        });
      } else {
        // 絶対（音固定）：キーオーバーライドのない小節のoffsetを-delta調整
        return state.map((m) => {
          if (m.key_name) return m; // 小節キーあり → offset は小節キー基準なので変更不要
          return {
            ...m,
            chords: m.chords.map((c): EditableChord => ({
              ...c,
              root_offset: ((c.root_offset - delta) % 12 + 12) % 12,
              bass_offset: ((c.bass_offset - delta) % 12 + 12) % 12,
            })),
          };
        });
      }
    }

    default:
      return state;
  }
}
