import { createPlannedSession, nowIso } from "../domain/entities";
import { ensure } from "./errors";
import { validateSessionInput } from "./validators";

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const padDatePart = (value) => String(value).padStart(2, "0");

const localDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
};

const withoutLegacyType = (session) => {
  const output = { ...session };
  delete output.type;
  return output;
};

const ensureUniquePlanForDay = (state, input, currentId = null) => {
  if (!input.planId) return;
  ensure(
    !state.plannedSessions.some((session) =>
      session.id !== currentId &&
      session.planId === input.planId &&
      localDateKey(session.date) === localDateKey(input.date)
    ),
    "Questa scheda e gia pianificata per questo giorno."
  );
};

export const refreshExpiredSessions = (state) => {
  const today = startOfToday();
  let changed = false;
  const plannedSessions = state.plannedSessions.map((session) => {
    const current = withoutLegacyType(session);
    if ("type" in session) {
      changed = true;
    }
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    if (session.status === "planned" && sessionDate.getTime() < today.getTime()) {
      changed = true;
      return { ...current, status: "skipped", updatedAt: nowIso() };
    }
    return current;
  });

  return changed ? { ...state, plannedSessions } : state;
};

export const addSession = (state, input) => {
  const validated = validateSessionInput(input, state.plans, state.exercises);
  ensureUniquePlanForDay(state, validated);
  const session = createPlannedSession(validated);
  return { ...state, plannedSessions: [...state.plannedSessions, session] };
};

export const updateSession = (state, id, input) => {
  ensure(state.plannedSessions.some((session) => session.id === id), "Sessione non trovata.");
  const updated = validateSessionInput(input, state.plans, state.exercises);
  ensureUniquePlanForDay(state, updated, id);
  return {
    ...state,
    plannedSessions: state.plannedSessions.map((session) =>
      session.id === id ? { ...withoutLegacyType(session), ...updated, id, updatedAt: nowIso() } : withoutLegacyType(session)
    )
  };
};

export const deleteSession = (state, id) => {
  const usedByWorkout = state.workoutLogs.some((log) => log.sessionId === id);
  ensure(!usedByWorkout, "Impossibile eliminare una sessione collegata a un allenamento svolto.");
  return { ...state, plannedSessions: state.plannedSessions.filter((session) => session.id !== id) };
};

export const updateSessionStatus = (state, id, status) => {
  ensure(["planned", "completed", "skipped"].includes(status), "Stato sessione non valido.");
  ensure(state.plannedSessions.some((session) => session.id === id), "Sessione non trovata.");
  return {
    ...state,
    plannedSessions: state.plannedSessions.map((session) =>
      session.id === id ? { ...withoutLegacyType(session), status, updatedAt: nowIso() } : withoutLegacyType(session)
    )
  };
};
