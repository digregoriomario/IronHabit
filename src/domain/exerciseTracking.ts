import type {
  Exercise,
  ExerciseTrackingType,
  PlanSetTarget,
  WorkoutSet
} from "./types";
import { EXERCISE_TRACKING_TYPE_VALUES } from "./constants";

export type TrackingField = "loadKg" | "reps" | "durationSeconds" | "distanceKm";

const trackingFields: Record<
  ExerciseTrackingType,
  Array<{ key: TrackingField; label: string; shortLabel: string; unit: string }>
> = {
  reps_weight: [
    { key: "loadKg", label: "Carico (kg)", shortLabel: "Kg", unit: "kg" },
    { key: "reps", label: "Ripetizioni", shortLabel: "Reps", unit: "reps" }
  ],
  bodyweight_reps: [{ key: "reps", label: "Ripetizioni", shortLabel: "Reps", unit: "reps" }],
  weighted_bodyweight: [
    { key: "loadKg", label: "Zavorra (kg)", shortLabel: "+Kg", unit: "kg" },
    { key: "reps", label: "Ripetizioni", shortLabel: "Reps", unit: "reps" }
  ],
  assisted_bodyweight: [
    { key: "loadKg", label: "Assistenza (kg)", shortLabel: "-Kg", unit: "kg" },
    { key: "reps", label: "Ripetizioni", shortLabel: "Reps", unit: "reps" }
  ],
  time: [{ key: "durationSeconds", label: "Tempo (secondi)", shortLabel: "Tempo", unit: "sec" }],
  weight_time: [
    { key: "loadKg", label: "Carico (kg)", shortLabel: "Kg", unit: "kg" },
    { key: "durationSeconds", label: "Tempo (secondi)", shortLabel: "Tempo", unit: "sec" }
  ],
  time_distance: [
    { key: "durationSeconds", label: "Tempo (secondi)", shortLabel: "Tempo", unit: "sec" },
    { key: "distanceKm", label: "Distanza (km)", shortLabel: "Km", unit: "km" }
  ],
  weight_distance: [
    { key: "loadKg", label: "Carico (kg)", shortLabel: "Kg", unit: "kg" },
    { key: "distanceKm", label: "Distanza (km)", shortLabel: "Km", unit: "km" }
  ]
};

export const inferExerciseTrackingType = (input: Partial<Exercise>): ExerciseTrackingType => {
  if (EXERCISE_TRACKING_TYPE_VALUES.includes(input.trackingType || "")) {
    return input.trackingType as ExerciseTrackingType;
  }
  if (String(input.trackingType || "") === "reps") {
    return "bodyweight_reps";
  }

  const name = String(input.name || "").toLowerCase();
  const recommended = String(input.recommendedReps || "").toLowerCase();

  if (
    input.equipment === "Cardio" ||
    /(bike|corsa|running|camminata|tapis roulant|ellittica|vogatore)/.test(name)
  ) {
    return "time_distance";
  }
  if (/(farmer|carry|trasporto|slitta|sled)/.test(name)) {
    return "weight_distance";
  }
  if (/(wall sit zavorrato|plank zavorrato|tenuta zavorrata)/.test(name)) {
    return "weight_time";
  }
  if (/(plank|wall sit|yoga|stretching|isometr)/.test(name)) {
    return "time";
  }
  if (/(sec|min|second|minut)/.test(recommended)) {
    return "time";
  }
  if (/(assistit|assisted)/.test(name) && /(pull.?up|trazion|dip)/.test(name)) {
    return "assisted_bodyweight";
  }
  if (/(zavorr|weighted)/.test(name) && /(pull.?up|trazion|dip)/.test(name)) {
    return "weighted_bodyweight";
  }
  if (/(piegament|push.?up|burpee|crunch|sit.?up)/.test(name)) {
    return "bodyweight_reps";
  }
  return "reps_weight";
};

export const getExerciseTrackingType = (exercise?: Partial<Exercise> | null): ExerciseTrackingType => {
  if (EXERCISE_TRACKING_TYPE_VALUES.includes(exercise?.trackingType || "")) {
    return exercise?.trackingType as ExerciseTrackingType;
  }
  if (String(exercise?.trackingType || "") === "reps") {
    return "bodyweight_reps";
  }
  return inferExerciseTrackingType(exercise || {});
};

export const getTrackingFields = (exercise?: Partial<Exercise> | null) =>
  trackingFields[getExerciseTrackingType(exercise)];

export const createTrackingTarget = (
  exercise?: Partial<Exercise> | null,
  partial: Partial<PlanSetTarget> = {}
): PlanSetTarget => {
  const type = getExerciseTrackingType(exercise);
  const hasReps = ["reps_weight", "bodyweight_reps", "weighted_bodyweight", "assisted_bodyweight"].includes(type);
  const hasLoad = ["reps_weight", "weighted_bodyweight", "assisted_bodyweight", "weight_time", "weight_distance"].includes(type);
  const hasDuration = ["time", "weight_time", "time_distance"].includes(type);
  const hasDistance = ["time_distance", "weight_distance"].includes(type);

  return {
    type: partial.type || "Normale",
    reps: hasReps ? Number(partial.reps ?? 10) : 0,
    loadKg: hasLoad ? Number(partial.loadKg ?? 0) : 0,
    durationSeconds: hasDuration ? Number(partial.durationSeconds ?? 60) : 0,
    distanceKm: hasDistance ? Number(partial.distanceKm ?? 1) : 0
  };
};

export const formatTrackingValue = (
  exercise: Partial<Exercise> | null | undefined,
  set: Partial<PlanSetTarget | WorkoutSet> | null | undefined
) => {
  if (!set) return "—";
  const trackingType = getExerciseTrackingType(exercise);
  const fields = getTrackingFields(exercise);
  const hasLoadAndReps = fields.some((field) => field.key === "loadKg") && fields.some((field) => field.key === "reps");
  if (hasLoadAndReps) {
    const load = Number(set.loadKg || 0);
    const reps = Number(set.reps || 0);
    if (trackingType === "weighted_bodyweight") return `+${load}kg x ${reps}`;
    if (trackingType === "assisted_bodyweight") return `-${load}kg x ${reps}`;
    return `${load}kg x ${reps}`;
  }
  return fields
    .map(({ key, unit }) => `${Number(set[key] || 0)} ${unit}`)
    .join(" · ");
};

export const compareTrackingProgress = (
  exercise: Partial<Exercise> | null | undefined,
  current: Partial<PlanSetTarget | WorkoutSet> | null | undefined,
  previous: Partial<PlanSetTarget | WorkoutSet> | null | undefined
) => {
  if (!current || !previous) return null;

  const values = getTrackingFields(exercise).map(({ key }) => ({
    current: Number(current[key] || 0),
    previous: Number(previous[key] || 0)
  }));

  if (!values.some(({ current, previous }) => current > 0 || previous > 0)) return null;

  const allSame = values.every(({ current, previous }) => current === previous);
  if (allSame) return "same";

  const allAtLeastPrevious = values.every(({ current, previous }) => current >= previous);
  const hasImprovement = values.some(({ current, previous }) => current > previous);

  return allAtLeastPrevious && hasImprovement ? "improved" : "below";
};
