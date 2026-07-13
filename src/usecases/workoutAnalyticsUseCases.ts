export const estimateOneRepMax = (loadKg, reps) => {
  const load = Number(loadKg || 0);
  const count = Number(reps || 0);
  if (load <= 0 || count <= 0) return 0;
  return Math.round(load * (1 + count / 30) * 10) / 10;
};

export const getExerciseRecords = (logs, exerciseId) => {
  const sets = logs
    .flatMap((log) =>
      log.exercises
        .filter((exercise) => exercise.exerciseId === exerciseId)
        .flatMap((exercise) => exercise.sets.map((set) => ({ ...set, date: log.date })))
    )
    .filter((set) => set.completed);

  if (!sets.length) {
    return { sets: 0, bestLoad: 0, bestReps: 0, bestOneRepMax: 0, lastDate: "" };
  }

  return sets.reduce(
    (best, set) => {
      const load = Number(set.loadKg || 0);
      const reps = Number(set.reps || 0);
      const oneRepMax = estimateOneRepMax(load, reps);
      return {
        sets: best.sets + 1,
        bestLoad: Math.max(best.bestLoad, load),
        bestReps: Math.max(best.bestReps, reps),
        bestOneRepMax: Math.max(best.bestOneRepMax, oneRepMax),
        lastDate: !best.lastDate || new Date(set.date) > new Date(best.lastDate) ? set.date : best.lastDate
      };
    },
    { sets: 0, bestLoad: 0, bestReps: 0, bestOneRepMax: 0, lastDate: "" }
  );
};

export const buildWarmupSets = (targetSet, completed = true) => {
  const load = Number(targetSet?.loadKg || 0);
  if (load <= 0) return [];
  const restSeconds = Number(targetSet?.restSeconds || 90);
  return [
    { setNumber: 1, type: "Riscaldamento", reps: 8, loadKg: Math.round(load * 0.5 * 2) / 2, durationSeconds: 0, distanceKm: 0, restSeconds, rpe: 5, completed },
    { setNumber: 2, type: "Riscaldamento", reps: 5, loadKg: Math.round(load * 0.7 * 2) / 2, durationSeconds: 0, distanceKm: 0, restSeconds, rpe: 6, completed }
  ];
};

export const calculatePlatePlan = (loadKg, barWeight = 20) => {
  const load = Number(loadKg || 0);
  if (load <= barWeight) return "";
  let remaining = (load - barWeight) / 2;
  const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
  const pairs = [];

  plates.forEach((plate) => {
    const count = Math.floor((remaining + 0.001) / plate);
    if (count > 0) {
      pairs.push(`${count}x${plate}kg`);
      remaining = Math.round((remaining - count * plate) * 100) / 100;
    }
  });

  return pairs.length ? `${pairs.join(" + ")} per lato` : "";
};
