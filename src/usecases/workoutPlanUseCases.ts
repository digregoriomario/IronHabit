import { createPlan, createPlanExercise, nowIso } from "../domain/entities";
import { ensure } from "./errors";
import { validatePlanInput } from "./validators";

export const normalizePlanExercises = (items) =>
  items.map((item, index) =>
    createPlanExercise({
      ...item,
      id: item.id || undefined,
      order: index + 1
    })
  );

export const addPlan = (state, input) => {
  const prepared = { ...input, exercises: normalizePlanExercises(input.exercises || []) };
  const plan = createPlan(validatePlanInput(prepared, state.exercises));
  return { ...state, plans: [...state.plans, plan] };
};

export const updatePlan = (state, id, input) => {
  ensure(state.plans.some((plan) => plan.id === id), "Scheda non trovata.");
  const prepared = { ...input, exercises: normalizePlanExercises(input.exercises || []) };
  const updated = validatePlanInput(prepared, state.exercises);
  return {
    ...state,
    plans: state.plans.map((plan) =>
      plan.id === id ? { ...plan, ...updated, id, updatedAt: nowIso() } : plan
    )
  };
};

export const deletePlan = (state, id) => {
  const usedBySession = state.plannedSessions.some((session) => session.planId === id);
  const usedByWorkout = state.workoutLogs.some((log) => log.planId === id);
  ensure(!usedBySession, "Impossibile eliminare una scheda usata da sessioni pianificate.");
  ensure(!usedByWorkout, "Impossibile eliminare una scheda presente nello storico allenamenti.");
  return { ...state, plans: state.plans.filter((plan) => plan.id !== id) };
};

export const duplicateWorkoutAsPlan = (state, workoutId) => {
  const workout = state.workoutLogs.find((log) => log.id === workoutId);
  ensure(Boolean(workout), "Allenamento non trovato.");
  const originalPlan = state.plans.find((plan) => plan.id === workout.planId);
  const exercises = workout.exercises.map((item, index) => {
    const completedSets = item.sets.filter((set) => set.completed);
    const referenceSet = completedSets.at(-1) || item.sets.at(-1);
    return createPlanExercise({
      exerciseId: item.exerciseId,
      supersetGroup: item.supersetGroup || "",
      type: referenceSet?.type || "Normale",
      sets: Math.max(1, completedSets.length || item.sets.length),
      reps: Number(referenceSet?.reps || 10),
      loadKg: Number(referenceSet?.loadKg || 0),
      durationSeconds: Number(referenceSet?.durationSeconds || 0),
      setTargets: (completedSets.length ? completedSets : item.sets).map((set) => ({
        type: set.type || "Normale",
        reps: Number(set.reps || 0),
        loadKg: Number(set.loadKg || 0),
        durationSeconds: Number(set.durationSeconds || 0),
        distanceKm: Number(set.distanceKm || 0)
      })),
      restSeconds: Number(referenceSet?.restSeconds || 90),
      order: index + 1,
      notes: item.notes || ""
    });
  });
  const copy = createPlan({
    name: `${originalPlan?.name || "Workout"} - copia`,
    description: "Scheda creata rapidamente da un allenamento dello storico.",
    goal: originalPlan?.goal || "Progressione",
    level: originalPlan?.level || "Intermedio",
    expectedDuration: Number(workout.durationMinutes || 45),
    recommendedFrequency: originalPlan?.recommendedFrequency || "Libera",
    exercises,
    notes: workout.notes || ""
  });
  return { ...state, plans: [...state.plans, copy] };
};
