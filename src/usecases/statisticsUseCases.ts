import type { Exercise } from "../domain/types";
import { estimateOneRepMax } from "./workoutAnalyticsUseCases";

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const padDatePart = (value: number) => String(value).padStart(2, "0");

const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;

const startOfWeek = (value: Date | string) => {
  const date = new Date(value);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getExerciseName = (exercises, id) =>
  exercises.find((exercise) => exercise.id === id)?.name || "Esercizio";

export const calculateWorkoutVolume = (log) =>
  log.exercises
    .flatMap((exercise) => exercise.sets)
    .filter((set) => set.completed)
    .reduce((total, set) => total + Number(set.loadKg || 0) * Number(set.reps || 0), 0);

export const countPersonalRecords = (log, allLogs) => {
  const previousLogs = allLogs.filter((item) => new Date(item.date) < new Date(log.date));
  return log.exercises.reduce((records, exercise) => {
    const previousBest = previousLogs
      .flatMap((item) => item.exercises.filter((entry) => entry.exerciseId === exercise.exerciseId))
      .flatMap((entry) => entry.sets)
      .filter((set) => set.completed)
      .reduce((max, set) => Math.max(max, estimateOneRepMax(set.loadKg, set.reps)), 0);
    const currentBest = exercise.sets
      .filter((set) => set.completed)
      .reduce((max, set) => Math.max(max, estimateOneRepMax(set.loadKg, set.reps)), 0);
    return records + (currentBest > previousBest && currentBest > 0 ? 1 : 0);
  }, 0);
};

export const calculateWeeklyStreak = (logs) => {
  if (!logs.length) return 0;
  const activeWeeks = new Set(logs.map((log) => localDateKey(startOfWeek(log.date))));
  const cursor = startOfWeek(new Date());
  if (!activeWeeks.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 7);
  }
  let streak = 0;
  while (activeWeeks.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
};

export const buildExerciseOneRepMaxTrend = (logs, exerciseId) =>
  logs
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((log) => {
      const entry = log.exercises.find((exercise) => exercise.exerciseId === exerciseId);
      if (!entry) return null;
      const value = entry.sets
        .filter((set) => set.completed)
        .reduce((max, set) => Math.max(max, estimateOneRepMax(set.loadKg, set.reps)), 0);
      return value
        ? {
            value,
            label: new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit" }).format(new Date(log.date))
          }
        : null;
    })
    .filter(Boolean);

export const buildStatistics = (state) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const weekAhead = new Date(now);
  weekAhead.setDate(now.getDate() + 7);

  const logsLast30 = state.workoutLogs.filter((log) => new Date(log.date) >= thirtyDaysAgo);
  const sessionsThisWeek = state.plannedSessions.filter((session) => {
    const date = new Date(session.date);
    return date >= startOfDay(now) && date <= weekAhead;
  });

  const exerciseById = new Map<string, Exercise>(state.exercises.map((exercise) => [exercise.id, exercise]));
  const muscleMap: Record<string, number> = state.workoutLogs.reduce((acc: Record<string, number>, log) => {
    log.exercises.forEach((entry) => {
      const muscle = exerciseById.get(entry.exerciseId)?.primaryMuscle || "Altro";
      const completedSets = entry.sets.filter((set) => set.completed).length;
      acc[muscle] = (acc[muscle] || 0) + completedSets;
    });
    return acc;
  }, {});
  const muscleTotal = Object.values(muscleMap).reduce((total, value) => total + value, 0) || 1;

  const trendRows = state.workoutLogs
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((log, index) => {
      const sets = log.exercises.flatMap((exercise) => exercise.sets).filter((set) => set.completed);
      return {
        value: sets.reduce((max, set) => Math.max(max, Number(set.loadKg || 0)), 0),
        reps: sets.reduce((total, set) => total + Number(set.reps || 0), 0),
        label: `${index + 1}`,
        date: log.date
      };
    });

  const currentWeekStart = startOfWeek(now);
  const todayKey = localDateKey(startOfDay(now));
  const weeklyVolume = Array.from({ length: 7 }).map((_, index) => {
    const day = new Date(currentWeekStart);
    day.setDate(currentWeekStart.getDate() + index);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    const value = state.workoutLogs
      .filter((log) => new Date(log.date) >= day && new Date(log.date) < nextDay)
      .reduce((total, log) => total + calculateWorkoutVolume(log), 0);
    const dayLabel = new Intl.DateTimeFormat("it-IT", { weekday: "short" })
      .format(day)
      .replace(".", "")
      .slice(0, 3);
    return {
      value: Math.round(value),
      label: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1),
      isToday: localDateKey(day) === todayKey
    };
  });

  return {
    totals: {
      exercises: state.exercises.length,
      plans: state.plans.length,
      sessions: state.plannedSessions.length,
      sessionsThisWeek: sessionsThisWeek.length,
      completedWorkouts: state.workoutLogs.length,
      totalDuration: state.workoutLogs.reduce((total, log) => total + Number(log.durationMinutes || 0), 0),
      weeklyFrequency: Number(((logsLast30.length / 30) * 7).toFixed(1)),
      weeklyStreak: calculateWeeklyStreak(state.workoutLogs),
      completedGoals: state.goals.filter((goal) => goal.status === "completed").length,
      activeGoals: state.goals.filter((goal) => goal.status === "in_progress").length
    },
    muscleDistribution: Object.entries(muscleMap).map(([label, value], index) => ({
      text: label,
      value,
      percentage: Math.round((value / muscleTotal) * 100),
      color: ["#000000", "#000000", "#E0E0E0", "#000000", "#888888", "#888888", "#000000", "#000000"][index % 8]
    })),
    weeklyVolume,
    loadTrend: trendRows.map((row) => ({ value: row.value, label: row.label })),
    repsTrend: trendRows.map((row) => ({ value: row.reps, label: row.label })),
    plannedCompleted: [
      { value: state.plannedSessions.filter((session) => session.status === "planned").length, label: "Da svolgere", color: "#BFDBFE" },
      { value: state.plannedSessions.filter((session) => session.status === "completed").length, label: "Completata", color: "#BBF7D0" },
      { value: state.plannedSessions.filter((session) => session.status === "skipped").length, label: "Saltata", color: "#FECACA" }
    ]
  };
};
