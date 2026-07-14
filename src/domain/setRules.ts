import { SET_TYPES } from "./constants";
import type { SetType } from "./types";

type SetLike = {
  type?: SetType | string | null;
};

const typeOf = (setOrType?: SetLike | string | null) =>
  typeof setOrType === "string" ? setOrType : setOrType?.type;

export const isWarmupSet = (setOrType?: SetLike | string | null) =>
  typeOf(setOrType) === "Riscaldamento";

export const canUseWarmupAt = (sets: SetLike[], index: number) =>
  sets.slice(0, index).every(isWarmupSet);

export const getAllowedSetTypes = (sets: SetLike[], index: number) =>
  SET_TYPES.filter((type) => type !== "Riscaldamento" || canUseWarmupAt(sets, index)) as SetType[];

export const getNextSetType = (sets: SetLike[], index: number): SetType => {
  const currentType = (sets[index]?.type || "Normale") as SetType;
  const currentIndex = Math.max(0, SET_TYPES.indexOf(currentType));
  const allowedTypes = getAllowedSetTypes(sets, index);

  for (let offset = 1; offset <= SET_TYPES.length; offset += 1) {
    const nextType = SET_TYPES[(currentIndex + offset) % SET_TYPES.length] as SetType;
    if (allowedTypes.includes(nextType)) return nextType;
  }

  return "Normale";
};

export const normalizeWarmupOrder = <T extends SetLike>(sets: T[]): T[] => {
  let workingSetsStarted = false;
  return sets.map((set) => {
    const type = set.type || "Normale";
    if (type === "Riscaldamento" && workingSetsStarted) {
      return { ...set, type: "Normale" as SetType } as T;
    }
    if (type !== "Riscaldamento") {
      workingSetsStarted = true;
    }
    return set;
  });
};

export const getWorkingSetNumber = (sets: SetLike[], index: number) =>
  sets.slice(0, index + 1).filter((set) => !isWarmupSet(set)).length;

export const getSetBadgeLabel = (sets: SetLike[], index: number) => {
  const type = sets[index]?.type || "Normale";
  if (type === "Riscaldamento") return "W";
  if (type === "Drop set") return "D";
  if (type === "Failure") return "F";
  return String(Math.max(1, getWorkingSetNumber(sets, index)));
};

export const getSetTitle = (sets: SetLike[], index: number) =>
  isWarmupSet(sets[index]) ? "Warm-up" : `Serie ${Math.max(1, getWorkingSetNumber(sets, index))}`;
