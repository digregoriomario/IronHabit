export const MUSCLE_GROUPS = [
  "Petto",
  "Schiena",
  "Gambe",
  "Spalle",
  "Braccia",
  "Core",
  "Full body"
];

export const DIFFICULTIES = ["Base", "Intermedio", "Avanzato"];

export const EQUIPMENT = [
  "Corpo libero",
  "Manubri",
  "Bilanciere",
  "Disco",
  "Macchine",
  "Elastici",
  "Kettlebell",
  "Cardio"
];

export const PLAN_LEVELS = DIFFICULTIES;

export const SET_TYPES = ["Normale", "Riscaldamento", "Drop set", "Failure"];

export const EXERCISE_TRACKING_TYPES = [
  {
    value: "reps_weight",
    label: "Weight & Reps",
    description: "Esempio: Bench Press, Dumbbell Curls"
  },
  {
    value: "bodyweight_reps",
    label: "Bodyweight Reps",
    description: "Esempio: Pullups, Sit ups, Burpees"
  },
  {
    value: "weighted_bodyweight",
    label: "Weighted Bodyweight",
    description: "Esempio: Weighted Pull Ups, Weighted Dips"
  },
  {
    value: "assisted_bodyweight",
    label: "Assisted Bodyweight",
    description: "Esempio: Assisted Pullups, Assisted Dips"
  },
  {
    value: "time",
    label: "Duration",
    description: "Esempio: Planks, Yoga, Stretching"
  },
  {
    value: "weight_time",
    label: "Duration & Weight",
    description: "Esempio: Weighted Plank, Wall Sit"
  },
  {
    value: "time_distance",
    label: "Distance & Duration",
    description: "Esempio: Running, Cycling, Rowing"
  },
  {
    value: "weight_distance",
    label: "Weight & Distance",
    description: "Esempio: Farmers Walk, Suitcase Carry"
  }
];

export const EXERCISE_TRACKING_TYPE_VALUES = EXERCISE_TRACKING_TYPES.map((item) => item.value);

export const SUPERSET_GROUPS = ["", "A", "B", "C", "D"];

export const SESSION_STATUSES = ["planned", "completed", "skipped"];

export const GOAL_CATEGORIES = [
  "frequency",
  "load",
  "reps"
];

export const GOAL_STATUSES = ["in_progress", "completed"];

export const statusLabels = {
  planned: "Da svolgere",
  completed: "Completata",
  skipped: "Saltata",
  in_progress: "In corso"
};
