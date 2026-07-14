import { GOAL_CATEGORIES, SESSION_STATUSES, statusLabels } from "../../domain/constants";

export const allOption = { value: "Tutti", label: "Tutti" };

export const goalCategoryLabels = {
  frequency: "Frequenza",
  load: "Forza",
  reps: "Ripetizioni"
};

export const goalStatusLabels = {
  in_progress: "Prefissato",
  completed: "Raggiunto"
};

export const sessionStatusOptions = SESSION_STATUSES.map((value) => ({
  value,
  label: statusLabels[value] || value
}));

export const goalCategoryOptions = GOAL_CATEGORIES.map((value) => ({
  value,
  label: goalCategoryLabels[value] || value
}));

export const exerciseSortOptions = [
  { value: "name", label: "Nome" },
  { value: "muscle", label: "Gruppo" },
  { value: "difficulty", label: "Difficolta" }
];

export const planSortOptions = [
  { value: "name", label: "Nome" },
  { value: "duration", label: "Durata" },
  { value: "level", label: "Livello" }
];

export const sessionSortOptions = [
  { value: "date", label: "Data" },
  { value: "title", label: "Titolo" }
];

export const workoutSortOptions = [
  { value: "dateDesc", label: "Piu recenti" },
  { value: "dateAsc", label: "Meno recenti" },
  { value: "duration", label: "Durata" }
];

export const goalSortOptions = [
  { value: "deadline", label: "Scadenza" },
  { value: "progress", label: "Avanzamento" }
];

export const yesNoOptions = [
  { value: true, label: "Si" },
  { value: false, label: "No" }
];

export const themeModeOptions = [
  { value: "light", label: "Chiaro" },
  { value: "dark", label: "Scuro" }
];

export const supersetOptions = [
  { value: "", label: "Nessuno" },
  { value: "A", label: "Superset A" },
  { value: "B", label: "Superset B" },
  { value: "C", label: "Superset C" },
  { value: "D", label: "Superset D" }
];

export const withAll = (options) => [allOption, ...options];

export const labelForGoalCategory = (value) => goalCategoryLabels[value] || value;
