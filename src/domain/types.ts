export type Difficulty = "Base" | "Intermedio" | "Avanzato";
export type SessionStatus = "planned" | "completed" | "skipped";
export type GoalStatus = "in_progress" | "completed";
export type GoalCategory = "frequency" | "load" | "reps";
export type SetType = "Normale" | "Riscaldamento" | "Drop set" | "Failure";
export type ExerciseTrackingType =
  | "reps_weight"
  | "bodyweight_reps"
  | "weighted_bodyweight"
  | "assisted_bodyweight"
  | "time"
  | "weight_time"
  | "time_distance"
  | "weight_distance";

export interface Exercise {
  id: string;
  name: string;
  description: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  difficulty: Difficulty;
  equipment: string;
  recommendedReps: string;
  estimatedDuration: number;
  trackingType: ExerciseTrackingType;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanExercise {
  id: string;
  exerciseId: string;
  supersetGroup: string;
  type: SetType;
  sets: number;
  reps: number;
  restSeconds: number;
  loadKg: number;
  setTargets: PlanSetTarget[];
  durationSeconds: number;
  order: number;
  notes: string;
}

export interface PlanSetTarget {
  type: SetType;
  reps: number;
  loadKg: number;
  durationSeconds: number;
  distanceKm: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  goal: string;
  level: string;
  expectedDuration: number;
  recommendedFrequency: string;
  exercises: PlanExercise[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlannedSession {
  id: string;
  title: string;
  date: string;
  planId: string | null;
  exerciseIds: string[];
  status: SessionStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSet {
  setNumber: number;
  type: SetType;
  reps: number;
  loadKg: number;
  durationSeconds: number;
  distanceKm: number;
  restSeconds: number;
  rpe: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  supersetGroup: string;
  restSeconds?: number;
  sets: WorkoutSet[];
  notes?: string;
  target?: PlanExercise;
}

export interface WorkoutLog {
  id: string;
  date: string;
  planId: string | null;
  sessionId: string | null;
  durationMinutes: number;
  fatigue: number;
  exercises: WorkoutExercise[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  startDate: string;
  deadline: string;
  status: GoalStatus;
  relatedExerciseId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  defaultRestSeconds: number;
  profileName: string;
  themeMode: "light" | "dark";
  onboardingCompleted: boolean;
}

export interface ActiveWorkout extends Omit<WorkoutLog, "id" | "createdAt" | "updatedAt"> {
  name: string;
  startedAt: number;
  minimized: boolean;
  restTimerEndsAt: number | null;
  restTimerDuration: number;
}

export interface IronHabitData {
  exercises: Exercise[];
  plans: WorkoutPlan[];
  plannedSessions: PlannedSession[];
  workoutLogs: WorkoutLog[];
  goals: Goal[];
}
