import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { buildBaseExercises } from "../../domain/baseExercises";
import { createId, createPlanExercise, nowIso } from "../../domain/entities";
import type { ActiveWorkout, IronHabitData, UserSettings } from "../../domain/types";
import { ironHabitStorage } from "../../infrastructure/storage";
import { deleteExercise, addExercise as addExerciseUseCase, updateExercise as updateExerciseUseCase } from "../../usecases/exerciseUseCases";
import { deleteGoal, addGoal as addGoalUseCase, updateGoal as updateGoalUseCase } from "../../usecases/goalUseCases";
import { deleteSession, addSession as addSessionUseCase, refreshExpiredSessions, updateSession as updateSessionUseCase, updateSessionStatus } from "../../usecases/sessionUseCases";
import { buildStatistics } from "../../usecases/statisticsUseCases";
import { buildEmptyWorkoutDraft, buildGuidedWorkoutDraft, buildPlanUpdateFromActiveWorkout } from "../../usecases/guidedWorkoutUseCases";
import { addWorkoutLog as addWorkoutLogUseCase, updateWorkoutLog as updateWorkoutLogUseCase } from "../../usecases/workoutLogUseCases";
import { deletePlan, duplicateWorkoutAsPlan, addPlan as addPlanUseCase, updatePlan as updatePlanUseCase } from "../../usecases/workoutPlanUseCases";

const settings = {
  soundEnabled: true,
  vibrationEnabled: true,
  defaultRestSeconds: 90,
  profileName: "",
  themeMode: "dark" as const,
  onboardingCompleted: false
};

const buildInitialState = () => ({
  exercises: buildBaseExercises(),
  plans: [],
  plannedSessions: [],
  workoutLogs: [],
  goals: [],
  settings,
  activeWorkout: null,
  pendingPlanExerciseIds: null
});

const padDatePart = (value: number) => String(value).padStart(2, "0");

const localDateKey = (value: string | number | Date) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
};

const stripLegacySessionType = (session: any) => {
  const output = { ...session };
  delete output.type;
  return output;
};

const stripLegacySessionTypes = (sessions: any[]) => sessions.map(stripLegacySessionType);

interface IronHabitStore extends IronHabitData {
  settings: UserSettings;
  activeWorkout: ActiveWorkout | null;
  pendingPlanExerciseIds: string[] | null;
  addExercise: (input: any) => void;
  updateExercise: (id: string, input: any) => void;
  deleteExercise: (id: string) => void;
  addPlan: (input: any) => void;
  updatePlan: (id: string, input: any) => void;
  deletePlan: (id: string) => void;
  duplicateWorkoutAsPlan: (id: string) => void;
  addSession: (input: any) => void;
  updateSession: (id: string, input: any) => void;
  deleteSession: (id: string) => void;
  updateSessionStatus: (id: string, status: any) => void;
  refreshSessionStatuses: () => void;
  addWorkoutLog: (input: any) => void;
  updateWorkoutLog: (id: string, input: any) => void;
  addGoal: (input: any) => void;
  updateGoal: (id: string, input: any) => void;
  deleteGoal: (id: string) => void;
  startWorkout: (input?: { planId?: string | null; sessionId?: string | null; empty?: boolean }) => void;
  replaceActiveWorkout: (activeWorkout: ActiveWorkout) => void;
  minimizeActiveWorkout: () => void;
  resumeActiveWorkout: () => void;
  discardActiveWorkout: () => void;
  completeActiveWorkout: (options?: { savePlanChanges?: boolean }) => void;
  setPendingPlanExerciseIds: (ids: string[]) => void;
  clearPendingPlanExerciseIds: () => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  resetLocalData: () => void;
  getStatistics: () => any;
  getExerciseById: (id: string) => any;
  getPlanById: (id: string) => any;
  getSessionById: (id: string) => any;
  getWorkoutLogById: (id: string) => any;
  getGoalById: (id: string) => any;
}

export const useIronHabitStore = create<IronHabitStore>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),

      addExercise: (input) => set((state) => addExerciseUseCase(state, input)),
      updateExercise: (id, input) => set((state) => updateExerciseUseCase(state, id, input)),
      deleteExercise: (id) => set((state) => deleteExercise(state, id)),

      addPlan: (input) => set((state) => addPlanUseCase(state, input)),
      updatePlan: (id, input) => set((state) => updatePlanUseCase(state, id, input)),
      deletePlan: (id) => set((state) => deletePlan(state, id)),
      duplicateWorkoutAsPlan: (id) => set((state) => duplicateWorkoutAsPlan(state, id)),

      addSession: (input) => set((state) => addSessionUseCase(state, input)),
      updateSession: (id, input) => set((state) => updateSessionUseCase(state, id, input)),
      deleteSession: (id) => set((state) => deleteSession(state, id)),
      updateSessionStatus: (id, status) => set((state) => updateSessionStatus(state, id, status)),
      refreshSessionStatuses: () => set((state) => refreshExpiredSessions(state)),

      addWorkoutLog: (input) => set((state) => addWorkoutLogUseCase(state, input)),
      updateWorkoutLog: (id, input) => set((state) => updateWorkoutLogUseCase(state, id, input)),

      addGoal: (input) => set((state) => addGoalUseCase(state, input)),
      updateGoal: (id, input) => set((state) => updateGoalUseCase(state, id, input)),
      deleteGoal: (id) => set((state) => deleteGoal(state, id)),

      startWorkout: ({ planId = null, sessionId = null, empty = false } = {}) => {
        const state = get();
        // La bozza attiva vive nello store per sopravvivere alla minimizzazione della modale.
        if (empty) {
          set({ activeWorkout: buildEmptyWorkoutDraft() });
          return;
        }
        const session = state.plannedSessions.find((item) => item.id === sessionId);
        let plan: any = state.plans.find((item) => item.id === (planId || session?.planId));
        if (!plan && session?.exerciseIds?.length) {
          plan = {
            id: null,
            name: session.title,
            description: "Sessione libera pianificata",
            goal: "Allenamento",
            level: "Base",
            expectedDuration: 40,
            recommendedFrequency: "",
            notes: session.notes || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            exercises: session.exerciseIds.map((exerciseId, index) =>
              createPlanExercise({
                id: createId("virtual"),
                exerciseId,
                sets: 1,
                reps: 10,
                restSeconds: state.settings.defaultRestSeconds,
                order: index + 1
              })
            )
          };
        }
        if (!plan && session) {
          set({
            activeWorkout: {
              ...buildEmptyWorkoutDraft({ name: session.title || "Sessione libera" }),
              sessionId: session.id,
              notes: session.notes || "",
              restTimerDuration: state.settings.defaultRestSeconds
            }
          });
          return;
        }
        const draft = buildGuidedWorkoutDraft({ plan, session, exercises: state.exercises });
        set({
          activeWorkout: {
            ...draft,
            name: plan.name,
            startedAt: Date.now(),
            minimized: false,
            restTimerEndsAt: null,
            restTimerDuration: state.settings.defaultRestSeconds
          }
        });
      },
      replaceActiveWorkout: (activeWorkout) => set({ activeWorkout }),
      minimizeActiveWorkout: () =>
        set((state) => ({
          activeWorkout: state.activeWorkout ? { ...state.activeWorkout, minimized: true } : null
        })),
      resumeActiveWorkout: () =>
        set((state) => ({
          activeWorkout: state.activeWorkout ? { ...state.activeWorkout, minimized: false } : null
        })),
      discardActiveWorkout: () => set({ activeWorkout: null }),
      completeActiveWorkout: ({ savePlanChanges = false } = {}) => {
        const state = get();
        if (!state.activeWorkout) return;
        // La durata viene calcolata al salvataggio, così include anche il tempo trascorso in modalità ridotta.
        const durationMinutes = Math.max(1, Math.round((Date.now() - state.activeWorkout.startedAt) / 60000));
        const payload = {
          ...state.activeWorkout,
          durationMinutes,
          exercises: state.activeWorkout.exercises.map(({ target, ...exercise }) => exercise)
        };
        const planToUpdate = savePlanChanges && state.activeWorkout.planId
          ? state.plans.find((plan) => plan.id === state.activeWorkout?.planId)
          : null;
        const stateWithUpdatedPlan = planToUpdate
          ? updatePlanUseCase(state, planToUpdate.id, buildPlanUpdateFromActiveWorkout(state.activeWorkout, planToUpdate))
          : state;
        const nextState = addWorkoutLogUseCase(stateWithUpdatedPlan, payload);
        const completedSessionId = state.activeWorkout.sessionId || state.plannedSessions.find((session) =>
          session.status === "planned" &&
          session.planId === state.activeWorkout?.planId &&
          localDateKey(session.date) === localDateKey(state.activeWorkout?.date || Date.now())
        )?.id;
        const plannedSessions = completedSessionId
          ? nextState.plannedSessions.map((session) =>
              session.id === completedSessionId
                ? { ...stripLegacySessionType(session), status: "completed" as const, updatedAt: nowIso() }
                : stripLegacySessionType(session)
            )
          : stripLegacySessionTypes(nextState.plannedSessions);
        set({ ...nextState, plannedSessions, activeWorkout: null });
      },
      setPendingPlanExerciseIds: (ids) => set({ pendingPlanExerciseIds: ids }),
      clearPendingPlanExerciseIds: () => set({ pendingPlanExerciseIds: null }),

      updateSettings: (patch) => set((state) => ({ ...state, settings: { ...state.settings, ...patch } })),
      resetLocalData: () => set(buildInitialState()),

      getStatistics: () => buildStatistics(get()),
      getExerciseById: (id) => get().exercises.find((exercise) => exercise.id === id),
      getPlanById: (id) => get().plans.find((plan) => plan.id === id),
      getSessionById: (id) => get().plannedSessions.find((session) => session.id === id),
      getWorkoutLogById: (id) => get().workoutLogs.find((log) => log.id === id),
      getGoalById: (id) => get().goals.find((goal) => goal.id === id)
    }),
    {
      name: "ironhabit-storage-v4",
      storage: createJSONStorage(() => ironHabitStorage),
      partialize: (state) => ({
        exercises: state.exercises,
        plans: state.plans,
        plannedSessions: stripLegacySessionTypes(state.plannedSessions),
        workoutLogs: state.workoutLogs,
        goals: state.goals,
        settings: state.settings,
        activeWorkout: state.activeWorkout
      })
    }
  )
);
