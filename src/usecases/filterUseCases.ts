export const matchesText = (value, query) => String(value ?? "").toLowerCase().includes(query.trim().toLowerCase());

export const filterExercises = (exercises, { query = "", muscle = "Tutti", difficulty = "Tutti", equipment = "Tutti", sort = "name" }) => {
  const rows = exercises.filter((exercise) => {
    const textMatch = !query || matchesText(exercise.name, query) || matchesText(exercise.description, query);
    const muscleMatch = muscle === "Tutti" || exercise.primaryMuscle === muscle;
    const difficultyMatch = difficulty === "Tutti" || exercise.difficulty === difficulty;
    const equipmentMatch = equipment === "Tutti" || exercise.equipment === equipment;
    return textMatch && muscleMatch && difficultyMatch && equipmentMatch;
  });
  return rows.sort((a, b) => {
    if (sort === "difficulty") return a.difficulty.localeCompare(b.difficulty);
    if (sort === "muscle") return a.primaryMuscle.localeCompare(b.primaryMuscle);
    return a.name.localeCompare(b.name);
  });
};

export const filterPlans = (plans, { query = "", goal = "Tutti", level = "Tutti", sort = "name" }) => {
  const rows = plans.filter((plan) => {
    const textMatch = !query || matchesText(plan.name, query) || matchesText(plan.description, query) || matchesText(plan.goal, query);
    const goalMatch = goal === "Tutti" || plan.goal === goal;
    const levelMatch = level === "Tutti" || plan.level === level;
    return textMatch && goalMatch && levelMatch;
  });
  return rows.sort((a, b) => {
    if (sort === "duration") return Number(a.expectedDuration) - Number(b.expectedDuration);
    if (sort === "level") return a.level.localeCompare(b.level);
    return a.name.localeCompare(b.name);
  });
};

export const filterSessions = (sessions, { query = "", status = "Tutti", sort = "date" }) => {
  const rows = sessions.filter((session) => {
    const textMatch = !query || matchesText(session.title, query) || matchesText(session.notes, query);
    const statusMatch = status === "Tutti" || session.status === status;
    return textMatch && statusMatch;
  });
  return rows.sort((a, b) => {
    if (sort === "title") return a.title.localeCompare(b.title);
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
};

export const filterWorkoutLogs = (logs, { query = "", period = "Tutti", sort = "dateDesc" }, plans) => {
  const now = Date.now();
  const rows = logs.filter((log) => {
    const planName = plans.find((plan) => plan.id === log.planId)?.name || "";
    const textMatch = !query || matchesText(planName, query) || matchesText(log.notes, query);
    const date = new Date(log.date).getTime();
    const periodMatch =
      period === "Tutti" ||
      (period === "7 giorni" && now - date <= 7 * 86400000) ||
      (period === "30 giorni" && now - date <= 30 * 86400000) ||
      (period === "90 giorni" && now - date <= 90 * 86400000);
    return textMatch && periodMatch;
  });
  return rows.sort((a, b) => {
    if (sort === "duration") return Number(b.durationMinutes) - Number(a.durationMinutes);
    return sort === "dateAsc"
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};

export const filterGoals = (goals, { query = "", status = "Tutti", category = "Tutti", sort = "deadline" }) => {
  const rows = goals.filter((goal) => {
    const textMatch = !query || matchesText(goal.title, query) || matchesText(goal.description, query);
    const statusMatch = status === "Tutti" || goal.status === status;
    const categoryMatch = category === "Tutti" || goal.category === category;
    return textMatch && statusMatch && categoryMatch;
  });
  return rows.sort((a, b) => {
    if (sort === "progress") return b.currentValue / b.targetValue - a.currentValue / a.targetValue;
    return new Date(a.deadline || "2999-12-31").getTime() - new Date(b.deadline || "2999-12-31").getTime();
  });
};
