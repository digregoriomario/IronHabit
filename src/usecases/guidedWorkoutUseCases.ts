import { createId } from "../domain/entities";
import { createTrackingTarget } from "../domain/exerciseTracking";
import type { ActiveWorkout, PlanExercise, WorkoutExercise, WorkoutPlan } from "../domain/types";
import { ensure } from "./errors";

const normalizedNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizedRest = (value) =>
  Math.min(180, Math.max(30, Math.round(normalizedNumber(value, 90) / 15) * 15));

const normalizedTarget = (target, fallbackType = "Normale") => ({
  type: target?.type || fallbackType,
  reps: Math.max(0, Math.round(normalizedNumber(target?.reps, 0))),
  loadKg: normalizedNumber(target?.loadKg, 0),
  durationSeconds: Math.max(0, Math.round(normalizedNumber(target?.durationSeconds, 0))),
  distanceKm: Math.max(0, normalizedNumber(target?.distanceKm, 0))
});

const planTargets = (item: PlanExercise) =>
  Array.isArray(item.setTargets) && item.setTargets.length
    ? item.setTargets.map((target) => normalizedTarget(target, item.type || "Normale"))
    : Array.from({ length: Math.max(1, Math.round(normalizedNumber(item.sets, 1))) }).map(() =>
        normalizedTarget(item, item.type || "Normale")
      );

const workoutTargets = (item: WorkoutExercise) =>
  item.sets.map((set) => normalizedTarget(set, set.type || "Normale"));

const planExerciseSignature = (item: PlanExercise, index: number) => ({
  exerciseId: item.exerciseId,
  supersetGroup: item.supersetGroup || "",
  restSeconds: normalizedRest(item.restSeconds),
  notes: String(item.notes ?? "").trim(),
  order: index + 1,
  setTargets: planTargets(item)
});

const workoutExerciseSignature = (item: WorkoutExercise, index: number) => ({
  exerciseId: item.exerciseId,
  supersetGroup: item.supersetGroup || "",
  restSeconds: normalizedRest(item.restSeconds ?? item.sets[0]?.restSeconds),
  notes: String(item.notes ?? "").trim(),
  order: index + 1,
  setTargets: workoutTargets(item)
});

export const hasActiveWorkoutPlanChanges = (activeWorkout: ActiveWorkout | null, plan?: WorkoutPlan | null) => {
  if (!activeWorkout?.planId || !plan || activeWorkout.planId !== plan.id) return false;
  const planSignature = plan.exercises
    .slice()
    .sort((left, right) => left.order - right.order)
    .map(planExerciseSignature);
  const workoutSignature = activeWorkout.exercises.map(workoutExerciseSignature);
  return JSON.stringify(planSignature) !== JSON.stringify(workoutSignature);
};

export const buildPlanUpdateFromActiveWorkout = (activeWorkout: ActiveWorkout, plan: WorkoutPlan) => ({
  ...plan,
  exercises: activeWorkout.exercises.map((item, index) => {
    const setTargets = workoutTargets(item);
    const firstTarget = setTargets[0] || normalizedTarget(null);
    return {
      id: item.target?.id,
      exerciseId: item.exerciseId,
      supersetGroup: item.supersetGroup || "",
      type: firstTarget.type,
      sets: Math.max(1, setTargets.length),
      reps: firstTarget.reps,
      restSeconds: normalizedRest(item.restSeconds ?? item.sets[0]?.restSeconds),
      loadKg: firstTarget.loadKg,
      durationSeconds: firstTarget.durationSeconds,
      setTargets,
      order: index + 1,
      notes: String(item.notes ?? "").trim()
    };
  })
});

export const buildGuidedWorkoutDraft = ({ plan, session, exercises = [] }) => {
  ensure(Boolean(plan), "Scheda non trovata per l'allenamento.");
  return {
    planId: plan.id,
    sessionId: session?.id || null,
    date: new Date().toISOString(),
    durationMinutes: Math.max(1, Number(plan.expectedDuration || 45)),
    fatigue: 5,
    notes: "",
    exercises: plan.exercises
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((item) => {
        const exercise = exercises.find((entry) => entry.id === item.exerciseId);
        return {
          id: createId("done"),
          exerciseId: item.exerciseId,
          supersetGroup: item.supersetGroup || "",
          restSeconds: normalizedRest(item.restSeconds),
          sets: (
            Array.isArray(item.setTargets) && item.setTargets.length
              ? item.setTargets
              : Array.from({ length: Number(item.sets || 1) }).map(() => ({
                  type: item.type || "Normale",
                  reps: item.reps,
                  loadKg: item.loadKg,
                  durationSeconds: item.durationSeconds,
                  distanceKm: item.distanceKm
                }))
          ).map((target, index) => {
            const normalizedTarget = createTrackingTarget(exercise, target);
            return {
              setNumber: index + 1,
              ...normalizedTarget,
              restSeconds: normalizedRest(item.restSeconds),
              rpe: 0,
              completed: false
            };
          }),
          target: item
        };
      })
  };
};

export const buildEmptyWorkoutDraft = ({ name = "Allenamento libero" } = {}) => ({
  planId: null,
  sessionId: null,
  name,
  date: new Date().toISOString(),
  durationMinutes: 1,
  fatigue: 5,
  notes: "",
  startedAt: Date.now(),
  minimized: false,
  restTimerEndsAt: null,
  restTimerDuration: 90,
  exercises: []
});

export const markGuidedSetCompleted = (draft, exerciseIndex, setIndex) => ({
  ...draft,
  exercises: draft.exercises.map((exercise, eIndex) =>
    eIndex !== exerciseIndex
      ? exercise
      : {
          ...exercise,
          sets: exercise.sets.map((set, sIndex) =>
            sIndex === setIndex ? { ...set, completed: true } : set
          )
        }
  )
});
