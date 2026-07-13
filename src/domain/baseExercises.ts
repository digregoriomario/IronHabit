import { createExercise } from "./entities";
import type { Exercise } from "./types";

const baseExercise = (
  id: string,
  name: string,
  primaryMuscle: string,
  equipment: string,
  description: string,
  recommendedReps: string,
  secondaryMuscles: string[] = [],
  difficulty: Exercise["difficulty"] = "Base",
  estimatedDuration = 6
) =>
  createExercise({
    id,
    name,
    description,
    primaryMuscle,
    secondaryMuscles,
    difficulty,
    equipment,
    recommendedReps,
    estimatedDuration,
    notes: ""
  });

export const buildBaseExercises = () => [
  baseExercise(
    "ex_base_squat",
    "Squat con bilanciere",
    "Gambe",
    "Bilanciere",
    "Scendi mantenendo schiena stabile, ginocchia in linea e risali spingendo dal centro del piede.",
    "5-8",
    ["Core"],
    "Intermedio",
    8
  ),
  baseExercise(
    "ex_base_bench",
    "Panca piana",
    "Petto",
    "Bilanciere",
    "Stabilizza le scapole, porta il bilanciere al petto e spingi mantenendo controllo.",
    "6-10",
    ["Spalle", "Braccia"],
    "Intermedio",
    7
  ),
  baseExercise(
    "ex_base_deadlift",
    "Stacco da terra",
    "Schiena",
    "Bilanciere",
    "Crea tensione dorsale, mantieni il bilanciere vicino al corpo ed estendi anche e ginocchia.",
    "3-6",
    ["Gambe", "Core"],
    "Avanzato",
    8
  ),
  baseExercise(
    "ex_base_ohp",
    "Military press",
    "Spalle",
    "Bilanciere",
    "Spingi il bilanciere sopra la testa mantenendo addome e glutei contratti.",
    "6-10",
    ["Braccia", "Core"],
    "Intermedio",
    6
  ),
  baseExercise(
    "ex_base_row",
    "Rematore con manubrio",
    "Schiena",
    "Manubri",
    "Tira il gomito verso il fianco e controlla la discesa senza ruotare il busto.",
    "8-12",
    ["Braccia"],
    "Base",
    6
  ),
  baseExercise(
    "ex_base_lat_machine",
    "Lat machine",
    "Schiena",
    "Macchine",
    "Porta la barra verso la parte alta del petto mantenendo spalle basse e movimento controllato.",
    "8-12",
    ["Braccia"],
    "Base",
    6
  ),
  baseExercise(
    "ex_base_lunge",
    "Affondi",
    "Gambe",
    "Corpo libero",
    "Esegui un passo avanti, scendi in controllo e risali mantenendo il busto stabile.",
    "8-12 per lato",
    ["Core"],
    "Base",
    6
  ),
  baseExercise(
    "ex_base_pushup",
    "Piegamenti sulle braccia",
    "Petto",
    "Corpo libero",
    "Mantieni il corpo allineato, scendi con controllo e spingi fino a estendere le braccia.",
    "8-20",
    ["Spalle", "Braccia"],
    "Base",
    5
  ),
  baseExercise(
    "ex_base_plank",
    "Plank",
    "Core",
    "Corpo libero",
    "Mantieni spalle, bacino e caviglie allineati contraendo addome e glutei.",
    "30-60 sec",
    ["Spalle"],
    "Base",
    4
  ),
  baseExercise(
    "ex_base_curl",
    "Curl con manubri",
    "Braccia",
    "Manubri",
    "Fletti il gomito senza slanciare il busto e controlla la fase di discesa.",
    "10-15",
    [],
    "Base",
    5
  ),
  baseExercise(
    "ex_base_pushdown",
    "Pushdown tricipiti",
    "Braccia",
    "Macchine",
    "Estendi i gomiti mantenendoli vicini al busto e controlla il ritorno.",
    "10-15",
    [],
    "Base",
    5
  ),
  baseExercise(
    "ex_base_bike",
    "Bike",
    "Cardio",
    "Cardio",
    "Pedala a intensita controllata o a intervalli, regolando resistenza e durata.",
    "20-30 min",
    ["Gambe"],
    "Base",
    20
  )
];
