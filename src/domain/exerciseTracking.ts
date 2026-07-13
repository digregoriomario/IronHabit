import type {
  Exercise,
  ExerciseTrackingType,
  PlanSetTarget,
  WorkoutSet
} from "./types";

export type TrackingField = "loadKg" | "reps" | "durationSeconds" | "distanceKm";

const trackingFields: Record<
  ExerciseTrackingType,
  Array<{ key: TrackingField; label: string; shortLabel: string; unit: string }>
> = {
  reps_weight: [
    { key: "loadKg", label: "Carico (kg)", shortLabel: "Kg", unit: "kg" },
    { key: "reps", label: "Ripetizioni", shortLabel: "Reps", unit: "reps" }
  ],
  reps: [{ key: "reps", label: "Ripetizioni", shortLabel: "Reps", unit: "reps" }],
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
  const name = String(input.name || "").toLowerCase();
  const recommended = String(input.recommendedReps || "").toLowerCase();

  if (
    input.primaryMuscle === "Cardio" ||
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
  if (/(piegament|push.?up|burpee|crunch|sit.?up)/.test(name)) {
    return "reps";
  }
  return "reps_weight";
};

export const getExerciseTrackingType = (exercise?: Partial<Exercise> | null): ExerciseTrackingType =>
  exercise?.trackingType || inferExerciseTrackingType(exercise || {});

export const getTrackingFields = (exercise?: Partial<Exercise> | null) =>
  trackingFields[getExerciseTrackingType(exercise)];

export const createTrackingTarget = (
  exercise?: Partial<Exercise> | null,
  partial: Partial<PlanSetTarget> = {}
): PlanSetTarget => {
  const type = getExerciseTrackingType(exercise);
  return {
    type: partial.type || "Normale",
    reps: type === "reps" || type === "reps_weight" ? Number(partial.reps ?? 10) : 0,
    loadKg: type === "reps_weight" || type === "weight_time" || type === "weight_distance"
      ? Number(partial.loadKg ?? 0)
      : 0,
    durationSeconds: type === "time" || type === "weight_time" || type === "time_distance"
      ? Number(partial.durationSeconds ?? 60)
      : 0,
    distanceKm: type === "time_distance" || type === "weight_distance"
      ? Number(partial.distanceKm ?? 1)
      : 0
  };
};

export const formatTrackingValue = (
  exercise: Partial<Exercise> | null | undefined,
  set: Partial<PlanSetTarget | WorkoutSet> | null | undefined
) => {
  if (!set) return "—";
  const fields = getTrackingFields(exercise);
  const hasLoadAndReps = fields.some((field) => field.key === "loadKg") && fields.some((field) => field.key === "reps");
  if (hasLoadAndReps) {
    return `${Number(set.loadKg || 0)}kg x ${Number(set.reps || 0)}`;
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
