import { DIFFICULTIES, EQUIPMENT, EXERCISE_TRACKING_TYPE_VALUES, GOAL_CATEGORIES, GOAL_STATUSES, MUSCLE_GROUPS, PLAN_LEVELS, SESSION_STATUSES, SET_TYPES, SUPERSET_GROUPS } from "../domain/constants";
import { getTrackingFields, inferExerciseTrackingType } from "../domain/exerciseTracking";
import { normalizeWarmupOrder } from "../domain/setRules";
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

const parseRequiredNumber = (value, field, { integer = false, min = null, max = null } = {}) => {
  const text = String(value ?? "").trim().replace(",", ".");
  ensure(text.length > 0, `${field} e obbligatorio.`);
  const parsed = Number(text);
  ensure(Number.isFinite(parsed), `${field} deve essere un numero valido.`);
  if (integer) ensure(Number.isInteger(parsed), `${field} deve essere un numero intero.`);
  if (min !== null) ensure(parsed >= min, `${field} deve essere almeno ${min}.`);
  if (max !== null) ensure(parsed <= max, `${field} deve essere al massimo ${max}.`);
  return parsed;
};

const parseOptionalNumber = (value, fallback, field, options = {}) =>
  value === undefined || value === null
    ? fallback
    : parseRequiredNumber(value, field, options);

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

const difficultyScore = {
  Base: 1,
  Intermedio: 2,
  Avanzato: 3
};

const legacyPlanLevels = {
  Starter: "Base",
  Intenso: "Avanzato"
};

const normalizePlanLevel = (value) => {
  const requested = String(value ?? "").trim();
  const normalized = legacyPlanLevels[requested] || requested;
  return PLAN_LEVELS.includes(normalized) ? normalized : "Base";
};

const inferPlanLevel = (items, exercises, fallback) => {
  const scores = items
    .map((item) => exercises.find((exercise) => exercise.id === item.exerciseId)?.difficulty)
    .filter((difficulty) => DIFFICULTIES.includes(difficulty))
    .map((difficulty) => difficultyScore[difficulty]);

  if (!scores.length) return normalizePlanLevel(fallback);

  const average = scores.reduce((total, score) => total + score, 0) / scores.length;
  if (average >= 2.5) return "Avanzato";
  if (average >= 1.5) return "Intermedio";
  return "Base";
};

export const validateExerciseInput = (input) => ({
  ...input,
  name: requireText(input.name, "Nome esercizio"),
  description: String(input.description ?? "").trim(),
  primaryMuscle: ensureIn(input.primaryMuscle, MUSCLE_GROUPS, "Gruppo muscolare"),
  secondaryMuscles: Array.isArray(input.secondaryMuscles)
    ? input.secondaryMuscles.filter((item) => MUSCLE_GROUPS.includes(item) && item !== input.primaryMuscle).slice(0, 1)
    : [],
  difficulty: ensureIn(input.difficulty, DIFFICULTIES, "Difficolta"),
  equipment: ensureIn(input.equipment, EQUIPMENT, "Attrezzatura"),
  recommendedReps: String(input.recommendedReps ?? "").trim(),
  estimatedDuration: Math.max(0, asNumber(input.estimatedDuration)),
  trackingType: ensureIn(input.trackingType || inferExerciseTrackingType(input), EXERCISE_TRACKING_TYPE_VALUES, "Tipo esercizio"),
  notes: String(input.notes ?? "").trim()
});

export const validatePlanInput = (input, exercises) => {
  const items = Array.isArray(input.exercises) ? input.exercises : [];
  ensure(items.length > 0, "Una scheda deve contenere almeno un esercizio.");
  ensure(items.length <= 40, "Una scheda puo contenere al massimo 40 esercizi.");
  const exerciseIds = new Set(exercises.map((exercise) => exercise.id));
  const normalizedItems = items
    .map((item, index) => {
      const exerciseId = requireText(item.exerciseId, "Esercizio della scheda");
      ensure(exerciseIds.has(exerciseId), "La scheda contiene un esercizio inesistente.");
      const exercise = exercises.find((entry) => entry.id === exerciseId);
      const exerciseLabel = exercise?.name || `Esercizio ${index + 1}`;
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
      ensure(sourceTargets.length <= 40, `${exerciseLabel}: usa al massimo 40 serie.`);
      const trackingFields = getTrackingFields(exercise);
      const setTargets = normalizeWarmupOrder(sourceTargets.map((target, targetIndex) => {
        const fieldLabel = (label) => `${exerciseLabel}, serie ${targetIndex + 1}: ${label}`;
        const normalizedTarget = {
          type: ensureIn(target.type || "Normale", SET_TYPES, "Tipo serie"),
          reps: 0,
          loadKg: 0,
          durationSeconds: 0,
          distanceKm: 0
        };

        trackingFields.forEach((field) => {
          if (field.key === "reps") {
            normalizedTarget.reps = parseRequiredNumber(target.reps, fieldLabel("Ripetizioni"), {
              integer: true,
              min: 1,
              max: 500
            });
          }
          if (field.key === "loadKg") {
            normalizedTarget.loadKg = parseRequiredNumber(target.loadKg, fieldLabel("Carico"), {
              min: 0,
              max: 1000
            });
          }
          if (field.key === "durationSeconds") {
            normalizedTarget.durationSeconds = parseRequiredNumber(target.durationSeconds, fieldLabel("Tempo"), {
              integer: true,
              min: 1,
              max: 10800
            });
          }
          if (field.key === "distanceKm") {
            normalizedTarget.distanceKm = parseRequiredNumber(target.distanceKm, fieldLabel("Distanza"), {
              min: 0.01,
              max: 300
            });
          }
        });

        return normalizedTarget;
      }));
      const referenceTarget = setTargets[0] as any;
      const restSeconds = parseOptionalNumber(item.restSeconds, 90, `${exerciseLabel}: Recupero`, {
        integer: true,
        min: 30,
        max: 180
      });
      ensure(restSeconds % 15 === 0, `${exerciseLabel}: Recupero deve essere impostato a intervalli di 15 secondi.`);

      return {
        ...item,
        exerciseId,
        supersetGroup: ensureIn(item.supersetGroup || "", SUPERSET_GROUPS, "Superset"),
        type: referenceTarget.type,
        sets: setTargets.length,
        reps: referenceTarget.reps,
        restSeconds,
        loadKg: referenceTarget.loadKg,
        setTargets,
        durationSeconds: Math.max(0, Math.round(asNumber(item.durationSeconds, 0))),
        order: index + 1,
        notes: String(item.notes ?? "").trim()
      };
    });

  return {
    ...input,
    name: requireText(input.name, "Nome scheda"),
    description: String(input.description ?? "").trim(),
    goal: String(input.goal ?? "").trim() || "Allenamento generale",
    level: inferPlanLevel(normalizedItems, exercises, input.level),
    expectedDuration: parseOptionalNumber(input.expectedDuration, 45, "Durata prevista", {
      integer: true,
      min: 1,
      max: 360
    }),
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
      sets: normalizeWarmupOrder(sets.map((set, index) => ({
        setNumber: index + 1,
        type: ensureIn(set.type || "Normale", SET_TYPES, "Tipo serie"),
        reps: Math.max(0, Math.round(asNumber(set.reps, 0))),
        loadKg: Math.max(0, asNumber(set.loadKg, 0)),
        durationSeconds: Math.max(0, Math.round(asNumber(set.durationSeconds, 0))),
        distanceKm: Math.max(0, asNumber(set.distanceKm, 0)),
        restSeconds: Math.min(180, Math.max(30, Math.round(asNumber(set.restSeconds, 90) / 15) * 15)),
        rpe: Math.min(10, Math.max(0, asNumber(set.rpe, 0))),
        completed: Boolean(set.completed)
      }))),
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
    frequency: "Numero di giorni",
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
    ensure(Number.isInteger(targetValue), "I giorni di allenamento devono essere un numero intero.");
    ensure(target >= 1 && target <= 7, "I giorni di allenamento devono essere tra 1 e 7.");
    const weekStart = startOfWeek(startDate);
    startDate = weekStart.toISOString();
    deadline = endOfWeek(startDate).toISOString();
    title = title || `${target} giorni di allenamento nella settimana`;
    description = description || "Giorni allenati nella settimana.";
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
