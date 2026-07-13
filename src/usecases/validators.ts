import { DIFFICULTIES, EQUIPMENT, GOAL_CATEGORIES, GOAL_STATUSES, MUSCLE_GROUPS, SESSION_STATUSES, SET_TYPES, SUPERSET_GROUPS } from "../domain/constants";
import { inferExerciseTrackingType } from "../domain/exerciseTracking";
import { maxLoadForExercise, maxRepsForExercise } from "./goalProgressUseCase";
import { ensure } from "./errors";

export const asNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const asPositiveNumber = (value, field) => {
  const parsed = asNumber(value);
  ensure(parsed > 0, `${field} deve essere maggiore di zero.`);
  return parsed;
};

export const requireText = (value, field) => {
  const text = String(value ?? "").trim();
  ensure(text.length > 0, `${field} e obbligatorio.`);
  return text;
};

export const ensureDate = (value, field) => {
  const date = new Date(value);
  ensure(!Number.isNaN(date.getTime()), `${field} deve essere una data valida.`);
  return date.toISOString();
};

export const ensureIn = (value, list, field) => {
  ensure(list.includes(value), `${field} non valido.`);
  return value;
};

const startOfWeek = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return date;
};

const endOfWeek = (value) => {
  const date = startOfWeek(value);
  date.setDate(date.getDate() + 6);
  date.setHours(23, 59, 59, 999);
  return date;
};

export const validateExerciseInput = (input) => ({
  ...input,
  name: requireText(input.name, "Nome esercizio"),
  description: String(input.description ?? "").trim(),
  primaryMuscle: ensureIn(input.primaryMuscle, MUSCLE_GROUPS, "Gruppo muscolare"),
  secondaryMuscles: Array.isArray(input.secondaryMuscles)
    ? input.secondaryMuscles.filter((item) => MUSCLE_GROUPS.includes(item) && item !== input.primaryMuscle)
    : [],
  difficulty: ensureIn(input.difficulty, DIFFICULTIES, "Difficolta"),
  equipment: ensureIn(input.equipment, EQUIPMENT, "Attrezzatura"),
  recommendedReps: String(input.recommendedReps ?? "").trim(),
  estimatedDuration: Math.max(0, asNumber(input.estimatedDuration)),
  trackingType: inferExerciseTrackingType(input),
  notes: String(input.notes ?? "").trim()
});

export const validatePlanInput = (input, exercises) => {
  const items = Array.isArray(input.exercises) ? input.exercises : [];
  ensure(items.length > 0, "Una scheda deve contenere almeno un esercizio.");
  const exerciseIds = new Set(exercises.map((exercise) => exercise.id));
  const normalizedItems = items
    .map((item, index) => {
      const fallbackSetCount = Math.max(1, Math.round(asNumber(item.sets, 1)));
      const sourceTargets = Array.isArray(item.setTargets) && item.setTargets.length
        ? item.setTargets
        : Array.from({ length: fallbackSetCount }).map(() => ({
            type: item.type || "Normale",
            reps: item.reps,
            loadKg: item.loadKg,
            durationSeconds: item.durationSeconds,
            distanceKm: 0
          }));
      const setTargets = sourceTargets.map((target) => ({
        type: ensureIn(target.type || "Normale", SET_TYPES, "Tipo serie"),
        reps: Math.max(0, Math.round(asNumber(target.reps, 0))),
        loadKg: Math.max(0, asNumber(target.loadKg, 0)),
        durationSeconds: Math.max(0, Math.round(asNumber(target.durationSeconds, 0))),
        distanceKm: Math.max(0, asNumber(target.distanceKm, 0))
      }));
      const referenceTarget = setTargets[0];

      return {
        ...item,
        exerciseId: requireText(item.exerciseId, "Esercizio della scheda"),
        supersetGroup: ensureIn(item.supersetGroup || "", SUPERSET_GROUPS, "Superset"),
        type: referenceTarget.type,
        sets: setTargets.length,
        reps: referenceTarget.reps,
        restSeconds: Math.min(180, Math.max(30, Math.round(asNumber(item.restSeconds, 90) / 15) * 15)),
        loadKg: referenceTarget.loadKg,
        setTargets,
        durationSeconds: Math.max(0, Math.round(asNumber(item.durationSeconds, 0))),
        order: index + 1,
        notes: String(item.notes ?? "").trim()
      };
    });

  normalizedItems.forEach((item) => ensure(exerciseIds.has(item.exerciseId), "La scheda contiene un esercizio inesistente."));

  return {
    ...input,
    name: requireText(input.name, "Nome scheda"),
    description: String(input.description ?? "").trim(),
    goal: String(input.goal ?? "").trim() || "Allenamento generale",
    level: String(input.level ?? "").trim() || "Starter",
    expectedDuration: Math.max(1, asNumber(input.expectedDuration, 45)),
    recommendedFrequency: String(input.recommendedFrequency ?? "").trim(),
    exercises: normalizedItems,
    notes: String(input.notes ?? "").trim()
  };
};

export const validateSessionInput = (input, plans, _exercises) => {
  ensureDate(input.date, "Data sessione");
  const planIds = new Set(plans.map((plan) => plan.id));
  const plan = plans.find((item) => item.id === input.planId);
  const planId = input.planId || null;
  const title = planId ? (plan?.name || String(input.title ?? "").trim()) : requireText(input.title, "Titolo sessione");

  if (planId) {
    ensure(planIds.has(planId), "La sessione fa riferimento a una scheda inesistente.");
  }

  return {
    title,
    date: ensureDate(input.date, "Data sessione"),
    planId,
    exerciseIds: [],
    status: ensureIn(input.status || "planned", SESSION_STATUSES, "Stato sessione"),
    notes: String(input.notes ?? "").trim()
  };
};

export const validateWorkoutLogInput = (input, plans, sessions, exercises) => {
  const planIds = new Set(plans.map((plan) => plan.id));
  const sessionIds = new Set(sessions.map((session) => session.id));
  const exerciseIds = new Set(exercises.map((exercise) => exercise.id));
  const doneExercises = Array.isArray(input.exercises) ? input.exercises : [];

  ensure(doneExercises.length > 0, "Un allenamento registrato deve contenere almeno un esercizio.");
  if (input.planId) {
    ensure(planIds.has(input.planId), "Allenamento collegato a una scheda inesistente.");
  }
  if (input.sessionId) {
    ensure(sessionIds.has(input.sessionId), "Allenamento collegato a una sessione inesistente.");
  }

  const normalizedExercises = doneExercises.map((exercise) => {
    ensure(exerciseIds.has(exercise.exerciseId), "Allenamento con esercizio inesistente.");
    const sets = Array.isArray(exercise.sets) ? exercise.sets : [];
    ensure(sets.length > 0, "Ogni esercizio registrato deve avere almeno una serie.");
    return {
      ...exercise,
      supersetGroup: ensureIn(exercise.supersetGroup || "", SUPERSET_GROUPS, "Superset"),
      sets: sets.map((set, index) => ({
        setNumber: index + 1,
        type: ensureIn(set.type || "Normale", SET_TYPES, "Tipo serie"),
        reps: Math.max(0, Math.round(asNumber(set.reps, 0))),
        loadKg: Math.max(0, asNumber(set.loadKg, 0)),
        durationSeconds: Math.max(0, Math.round(asNumber(set.durationSeconds, 0))),
        distanceKm: Math.max(0, asNumber(set.distanceKm, 0)),
        restSeconds: Math.min(180, Math.max(30, Math.round(asNumber(set.restSeconds, 90) / 15) * 15)),
        rpe: Math.min(10, Math.max(0, asNumber(set.rpe, 0))),
        completed: Boolean(set.completed)
      })),
      notes: String(exercise.notes ?? "").trim()
    };
  });
  ensure(
    normalizedExercises.some((exercise) => exercise.sets.some((set) => set.completed)),
    "Completa almeno una serie prima di salvare l'allenamento."
  );

  return {
    ...input,
    date: ensureDate(input.date, "Data allenamento"),
    planId: input.planId || null,
    sessionId: input.sessionId || null,
    durationMinutes: asPositiveNumber(input.durationMinutes, "Durata allenamento"),
    fatigue: Math.min(10, Math.max(1, Math.round(asNumber(input.fatigue, 5)))),
    exercises: normalizedExercises,
    notes: String(input.notes ?? "").trim()
  };
};

export const validateGoalInput = (input, exercises, workoutLogs = [], existingGoal = null) => {
  const category = ensureIn(input.category, GOAL_CATEGORIES, "Categoria obiettivo");
  const exerciseIds = new Set(exercises.map((exercise) => exercise.id));
  const targetLabels = {
    frequency: "Numero di allenamenti",
    load: "Carico da raggiungere",
    reps: "Ripetizioni da raggiungere"
  };
  ensure(String(input.targetValue ?? "").trim().length > 0, `${targetLabels[category]} e obbligatorio.`);
  const targetValue = asPositiveNumber(input.targetValue, targetLabels[category]);
  let startDate = ensureDate(input.startDate || new Date().toISOString(), "Data inizio");
  let deadline = input.deadline ? ensureDate(input.deadline, "Data limite") : "";
  let relatedExerciseId = null;
  let title = String(input.title ?? "").trim();
  let description = String(input.description ?? "").trim();

  if (category === "frequency") {
    const target = Math.round(targetValue);
    ensure(Number.isInteger(targetValue), "Gli allenamenti settimanali devono essere un numero intero.");
    ensure(target >= 1 && target <= 7, "Gli allenamenti settimanali devono essere tra 1 e 7.");
    const weekStart = startOfWeek(startDate);
    startDate = weekStart.toISOString();
    deadline = endOfWeek(startDate).toISOString();
    title = title || `${target} allenamenti nella settimana`;
    description = description || "Frequenza di allenamento settimanale.";
  }

  if (category === "load" || category === "reps") {
    relatedExerciseId = requireText(input.relatedExerciseId, "Esercizio collegato");
    ensure(exerciseIds.has(relatedExerciseId), "Obiettivo collegato a un esercizio inesistente.");
    const currentRecord = category === "load"
      ? maxLoadForExercise(workoutLogs, relatedExerciseId)
      : maxRepsForExercise(workoutLogs, relatedExerciseId);
    if (category === "reps") {
      ensure(Number.isInteger(targetValue), "Le ripetizioni target devono essere un numero intero.");
    }
    const sameTargetAsBefore =
      existingGoal &&
      existingGoal.category === category &&
      existingGoal.relatedExerciseId === relatedExerciseId &&
      Number(existingGoal.targetValue) === Number(targetValue);
    ensure(sameTargetAsBefore || targetValue > currentRecord, category === "load"
      ? `Il carico target deve superare il record attuale di ${currentRecord} kg.`
      : `Le ripetizioni target devono superare il record attuale di ${currentRecord}.`
    );
    const exercise = exercises.find((item) => item.id === relatedExerciseId);
    title = title || (category === "load"
      ? `${exercise?.name || "Esercizio"}: ${targetValue} kg`
      : `${exercise?.name || "Esercizio"}: ${Math.round(targetValue)} ripetizioni`);
    description = description || (category === "load"
      ? "Obiettivo di forza legato al carico."
      : "Obiettivo legato al numero di ripetizioni.");
    deadline = "";
  }

  if (deadline) {
    ensure(new Date(deadline).getTime() >= new Date(startDate).getTime(), "La data limite non puo precedere la data di inizio.");
  }

  return {
    title: requireText(title, "Titolo obiettivo"),
    description,
    category,
    targetValue: category === "frequency" || category === "reps" ? Math.round(targetValue) : targetValue,
    currentValue: Math.max(0, asNumber(input.currentValue, 0)),
    startDate,
    deadline,
    status: ensureIn(input.status || "in_progress", GOAL_STATUSES, "Stato obiettivo"),
    relatedExerciseId,
    notes: String(input.notes ?? "").trim()
  };
};
