import type {
  Exercise,
  Goal,
  PlanExercise,
  PlannedSession,
  WorkoutLog,
  WorkoutPlan
} from "./types";
import { inferExerciseTrackingType } from "./exerciseTracking";

export const createId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const nowIso = () => new Date().toISOString();

const clean = <T extends object>(input: Partial<T> = {}) =>
  Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));

const cleanSession = (input: Partial<PlannedSession> = {}) => {
  const output = clean<PlannedSession>(input) as Partial<PlannedSession> & { type?: unknown };
  delete output.type;
  return output;
};

export const createExercise = (input: Partial<Exercise>): Exercise => ({
  id: createId("ex"),
  name: "",
  description: "",
  primaryMuscle: "Full body",
  secondaryMuscles: [],
  difficulty: "Base",
  equipment: "Corpo libero",
  recommendedReps: "",
  estimatedDuration: 0,
  trackingType: inferExerciseTrackingType(input),
  notes: "",
  createdAt: nowIso(),
  updatedAt: nowIso(),
  ...clean<Exercise>(input)
});

export const createPlan = (input: Partial<WorkoutPlan>): WorkoutPlan => ({
  id: createId("plan"),
  name: "",
  description: "",
  goal: "",
  level: "Starter",
  expectedDuration: 45,
  recommendedFrequency: "",
  exercises: [],
  notes: "",
  createdAt: nowIso(),
  updatedAt: nowIso(),
  ...clean<WorkoutPlan>(input)
});

export const createPlanExercise = (input: Partial<PlanExercise>): PlanExercise => ({
  id: createId("pex"),
  exerciseId: "",
  supersetGroup: "",
  type: "Normale",
  sets: 3,
  reps: 10,
  restSeconds: 90,
  loadKg: 0,
  setTargets: [],
  durationSeconds: 0,
  order: 1,
  notes: "",
  ...clean<PlanExercise>(input)
});

export const createPlannedSession = (input: Partial<PlannedSession>): PlannedSession => ({
  id: createId("ses"),
  title: "",
  date: new Date().toISOString(),
  planId: null,
  exerciseIds: [],
  status: "planned",
  notes: "",
  createdAt: nowIso(),
  updatedAt: nowIso(),
  ...cleanSession(input)
});

export const createWorkoutLog = (input: Partial<WorkoutLog>): WorkoutLog => ({
  id: createId("log"),
  date: new Date().toISOString(),
  planId: null,
  sessionId: null,
  durationMinutes: 45,
  fatigue: 5,
  exercises: [],
  notes: "",
  createdAt: nowIso(),
  updatedAt: nowIso(),
  ...clean<WorkoutLog>(input)
});

export const createGoal = (input: Partial<Goal>): Goal => ({
  id: createId("goal"),
  title: "",
  description: "",
  category: "frequency",
  targetValue: 1,
  currentValue: 0,
  startDate: new Date().toISOString(),
  deadline: "",
  status: "in_progress",
  relatedExerciseId: null,
  notes: "",
  createdAt: nowIso(),
  updatedAt: nowIso(),
  ...clean<Goal>(input)
});
