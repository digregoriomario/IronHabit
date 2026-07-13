import { createWorkoutLog, nowIso } from "../domain/entities";
import { ensure } from "./errors";
import { recalculateGoals } from "./goalProgressUseCase";
import { updateSessionStatus } from "./sessionUseCases";
import { validateWorkoutLogInput } from "./validators";

export const addWorkoutLog = (state, input) => {
  const log = createWorkoutLog(validateWorkoutLogInput(input, state.plans, state.plannedSessions, state.exercises));
  const nextState = { ...state, workoutLogs: [...state.workoutLogs, log] };
  const withSession = log.sessionId ? updateSessionStatus(nextState, log.sessionId, "completed") : nextState;
  return { ...withSession, goals: recalculateGoals(withSession.goals, withSession.workoutLogs) };
};

export const updateWorkoutLog = (state, id, input) => {
  ensure(state.workoutLogs.some((log) => log.id === id), "Allenamento non trovato.");
  const updated = validateWorkoutLogInput(input, state.plans, state.plannedSessions, state.exercises);
  const nextState = {
    ...state,
    workoutLogs: state.workoutLogs.map((log) =>
      log.id === id ? { ...log, ...updated, id, updatedAt: nowIso() } : log
    )
  };
  return { ...nextState, goals: recalculateGoals(nextState.goals, nextState.workoutLogs) };
};
