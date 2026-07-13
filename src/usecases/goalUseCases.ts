import { createGoal, nowIso } from "../domain/entities";
import { ensure } from "./errors";
import { recalculateGoals } from "./goalProgressUseCase";
import { validateGoalInput } from "./validators";

export const addGoal = (state, input) => {
  const goal = createGoal(validateGoalInput(input, state.exercises, state.workoutLogs));
  return { ...state, goals: recalculateGoals([...state.goals, goal], state.workoutLogs) };
};

export const updateGoal = (state, id, input) => {
  const existingGoal = state.goals.find((goal) => goal.id === id);
  ensure(Boolean(existingGoal), "Obiettivo non trovato.");
  const updated = validateGoalInput(input, state.exercises, state.workoutLogs, existingGoal);
  const goals = state.goals.map((goal) =>
    goal.id === id ? { ...goal, ...updated, id, updatedAt: nowIso() } : goal
  );
  return { ...state, goals: recalculateGoals(goals, state.workoutLogs) };
};

export const deleteGoal = (state, id) => ({
  ...state,
  goals: state.goals.filter((goal) => goal.id !== id)
});
