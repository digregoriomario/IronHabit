export const weeklySessions = [
  { day: "Lun", date: "08 lug", title: "Push day", status: "Completato", tone: "success" },
  { day: "Mer", date: "10 lug", title: "Gambe e core", status: "In programma", tone: "primary" },
  { day: "Ven", date: "12 lug", title: "Pull day", status: "Da fare", tone: "muted" }
];

export const workoutPlans = [
  {
    id: "push",
    title: "Push day",
    description: "Petto, spalle e tricipiti con focus sulla progressione dei carichi.",
    exercises: 5,
    duration: "55 min",
    rest: "90 sec",
    exercisePreview: ["Panca piana", "Military press", "Alzate laterali"],
    sets: [
      { label: "Panca piana", previous: "60kg x 8", kg: "62.5", reps: "8", done: false },
      { label: "Military press", previous: "35kg x 8", kg: "37.5", reps: "8", done: false },
      { label: "Pushdown", previous: "28kg x 12", kg: "30", reps: "12", done: false }
    ]
  },
  {
    id: "legs",
    title: "Gambe e core",
    description: "Fondamentali per gambe, stabilità e lavoro finale sull'addome.",
    exercises: 6,
    duration: "65 min",
    rest: "2 min",
    exercisePreview: ["Squat", "Leg press", "Plank"],
    sets: [
      { label: "Squat", previous: "80kg x 6", kg: "82.5", reps: "6", done: false },
      { label: "Leg press", previous: "130kg x 10", kg: "135", reps: "10", done: false },
      { label: "Plank", previous: "60 sec", kg: "-", reps: "60s", done: false }
    ]
  },
  {
    id: "pull",
    title: "Pull day",
    description: "Dorso e bicipiti con tirate verticali e orizzontali.",
    exercises: 5,
    duration: "50 min",
    rest: "90 sec",
    exercisePreview: ["Lat machine", "Rematore", "Curl"],
    sets: [
      { label: "Lat machine", previous: "55kg x 10", kg: "57.5", reps: "10", done: false },
      { label: "Rematore", previous: "28kg x 10", kg: "30", reps: "10", done: false },
      { label: "Curl manubri", previous: "12kg x 12", kg: "12", reps: "12", done: false }
    ]
  }
];

export const profileStats = [
  { label: "Workout", value: "12", helper: "registrati" },
  { label: "Streak", value: "4", helper: "giorni" },
  { label: "Volume", value: "18k", helper: "kg totali" }
];

export const exerciseLibrary = [
  { id: "bench", name: "Panca piana", muscle: "Petto", equipment: "Bilanciere", best: "67.5kg x 6" },
  { id: "squat", name: "Squat", muscle: "Gambe", equipment: "Bilanciere", best: "82.5kg x 6" },
  { id: "row", name: "Rematore manubrio", muscle: "Dorso", equipment: "Manubri", best: "30kg x 10" },
  { id: "plank", name: "Plank", muscle: "Core", equipment: "Corpo libero", best: "75 sec" }
];

export const workoutHistory = [
  { id: "h1", title: "Push day", date: "06 lug", volume: "3.240 kg", duration: "58 min" },
  { id: "h2", title: "Gambe e core", date: "04 lug", volume: "5.680 kg", duration: "66 min" },
  { id: "h3", title: "Pull day", date: "01 lug", volume: "3.900 kg", duration: "52 min" }
];

export const goals = [
  { title: "Allenarsi 3 volte a settimana", progress: 67, detail: "2 sessioni completate su 3" },
  { title: "Aumentare volume gambe", progress: 42, detail: "Target mensile 14.000 kg" }
];
