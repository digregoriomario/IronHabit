import { createExercise, nowIso } from "../domain/entities";
import { ensure } from "./errors";
import { validateExerciseInput } from "./validators";

export const addExercise = (state, input) => {
  const exercise = createExercise(validateExerciseInput(input));
  return { ...state, exercises: [...state.exercises, exercise] };
};

export const updateExercise = (state, id, input) => {
  ensure(state.exercises.some((exercise) => exercise.id === id), "Esercizio non trovato.");
  const updated = validateExerciseInput(input);
  return {
    ...state,
    exercises: state.exercises.map((exercise) =>
      exercise.id === id ? { ...exercise, ...updated, id, updatedAt: nowIso() } : exercise
    )
  };
};

export const deleteExercise = (state, id) => {
  const usedByPlan = state.plans.some((plan) => plan.exercises.some((item) => item.exerciseId === id));
  const usedByWorkout = state.workoutLogs.some((log) => log.exercises.some((item) => item.exerciseId === id));
  const usedBySession = state.plannedSessions.some((session) => session.exerciseIds.includes(id));
  const usedByGoal = state.goals.some((goal) => goal.relatedExerciseId === id);
  ensure(!usedByPlan, "Impossibile eliminare un esercizio usato da una scheda.");
  ensure(!usedByWorkout, "Impossibile eliminare un esercizio presente nello storico allenamenti.");
  ensure(!usedBySession, "Impossibile eliminare un esercizio usato da una sessione pianificata.");
  ensure(!usedByGoal, "Impossibile eliminare un esercizio collegato a un obiettivo.");
  return { ...state, exercises: state.exercises.filter((exercise) => exercise.id !== id) };
};
