const localDateKey = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const inGoalDateWindow = (log, goal) => {
  const date = localDateKey(log.date);
  const start = localDateKey(goal.startDate);
  const end = goal.deadline ? localDateKey(goal.deadline) : "9999-12-31";
  return date >= start && date <= end;
};

const completedSetsForExercise = (logs, exerciseId) =>
  logs
    .flatMap((log) => log.exercises)
    .filter((exercise) => exercise.exerciseId === exerciseId)
    .flatMap((exercise) => exercise.sets)
    .filter((set) => set.completed);

export const maxLoadForExercise = (logs, exerciseId) =>
  completedSetsForExercise(logs, exerciseId).reduce((max, set) => Math.max(max, Number(set.loadKg || 0)), 0);

export const maxRepsForExercise = (logs, exerciseId) =>
  completedSetsForExercise(logs, exerciseId).reduce((max, set) => Math.max(max, Number(set.reps || 0)), 0);

export const recalculateGoals = (goals, workoutLogs) =>
  goals.map((goal) => {
    let currentValue = goal.currentValue;
    if (goal.category === "frequency") {
      const logs = workoutLogs.filter((log) => inGoalDateWindow(log, goal));
      currentValue = new Set(logs.map((log) => localDateKey(log.date))).size;
    }
    if (goal.category === "reps") {
      currentValue = maxRepsForExercise(workoutLogs, goal.relatedExerciseId);
    }
    if (goal.category === "load") {
      currentValue = maxLoadForExercise(workoutLogs, goal.relatedExerciseId);
    }
    return {
      ...goal,
      currentValue,
      status: currentValue >= Number(goal.targetValue) ? "completed" : "in_progress"
    };
  });
