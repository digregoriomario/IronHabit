import { Alert, ScrollView, Text, View } from "react-native";
import { Copy, Edit3 } from "lucide-react-native";

import { formatTrackingValue } from "../../domain/exerciseTracking";
import { estimateOneRepMax } from "../../usecases/workoutAnalyticsUseCases";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionHeader } from "../components/SectionHeader";
import { formatDate } from "../utils/date";
import { useIronHabitStore } from "../store/useIronHabitStore";

const logTotals = (log) => {
  const sets = log.exercises.flatMap((exercise) => exercise.sets).filter((set) => set.completed);
  return {
    sets: sets.length,
    reps: sets.reduce((total, set) => total + Number(set.reps || 0), 0),
    maxLoad: sets.reduce((max, set) => Math.max(max, Number(set.loadKg || 0)), 0),
    bestOneRepMax: sets.reduce((max, set) => Math.max(max, estimateOneRepMax(set.loadKg, set.reps)), 0)
  };
};

export function WorkoutDetailScreen({ navigation, route }) {
  const id = route.params?.id;
  const log = useIronHabitStore((state) => state.workoutLogs.find((item) => item.id === id));
  const logs = useIronHabitStore((state) => state.workoutLogs);
  const plans = useIronHabitStore((state) => state.plans);
  const exercises = useIronHabitStore((state) => state.exercises);
  const duplicateWorkoutAsPlan = useIronHabitStore((state) => state.duplicateWorkoutAsPlan);

  if (!log) {
    return (
      <ScreenContainer className="p-4">
        <EmptyState title="Allenamento non trovato" action={<AppButton title="Torna indietro" variant="secondary" onPress={() => navigation.goBack()} />} />
      </ScreenContainer>
    );
  }

  const plan = plans.find((item) => item.id === log.planId);
  const current = logTotals(log);
  const previous = logs
    .filter((item) => item.id !== log.id && item.planId === log.planId && new Date(item.date) < new Date(log.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const previousTotals = previous ? logTotals(previous) : null;

  const duplicate = () => {
    try {
      duplicateWorkoutAsPlan(id);
      Alert.alert("Scheda creata", "L'allenamento è stato copiato in una nuova scheda modificabile.");
    } catch (error) {
      Alert.alert("Duplicazione non riuscita", error.message);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <PageHeader title={plan?.name || "Allenamento libero"} />

        <View className="mt-5 flex-row gap-3">
          <AppButton title="Modifica" icon={Edit3} className="flex-1" variant="secondary" onPress={() => navigation.navigate("WorkoutLogForm", { id })} />
          <AppButton title="Crea scheda" icon={Copy} className="flex-1" variant="secondary" onPress={duplicate} />
        </View>

        <SectionHeader title="Riepilogo" />
        <Card className="gap-3">
          <Info label="Data" value={formatDate(log.date)} />
          <Info label="Durata" value={`${log.durationMinutes} min`} />
          <Info label="Fatica" value={`${log.fatigue}/10`} />
          <Info label="Serie completate" value={current.sets} />
          <Info label="Ripetizioni totali" value={current.reps} />
          <Info label="Carico massimo" value={`${current.maxLoad} kg`} />
          <Info label="1RM stimato" value={`${current.bestOneRepMax} kg`} />
          <Info label="Note" value={log.notes || "Nessuna nota"} />
        </Card>

        <SectionHeader title="Confronto" />
        <Card className="gap-3">
          {previousTotals ? (
            <>
              <Info label="Workout precedente" value={formatDate(previous.date)} />
              <Info label="Durata" value={`${Number(log.durationMinutes) - Number(previous.durationMinutes)} min rispetto al precedente`} />
              <Info label="Ripetizioni" value={`${current.reps - previousTotals.reps} ripetizioni`} />
              <Info label="Carico max" value={`${current.maxLoad - previousTotals.maxLoad} kg`} />
            </>
          ) : (
            <Text className="text-sm font-medium leading-5 text-iron-muted">Non ci sono allenamenti precedenti sulla stessa scheda.</Text>
          )}
        </Card>

        <SectionHeader title="Dettaglio esercizi" />
        <View className="gap-3">
          {log.exercises.map((item) => {
            const exercise = exercises.find((entry) => entry.id === item.exerciseId);
            return (
              <Card key={item.id} className="gap-2">
                <Text className="text-lg font-semibold leading-6 text-iron-text">{exercise?.name || "Esercizio"}</Text>
                {item.supersetGroup ? <Text className="text-sm font-semibold text-iron-text">Superset {item.supersetGroup}</Text> : null}
                {item.sets.map((set, index) => (
                  <Text key={index} className="text-sm font-medium leading-5 text-iron-muted">
                    Serie {index + 1}: {set.type || "Normale"} · {formatTrackingValue(exercise, set)} · recupero {set.restSeconds}s · {set.completed ? "ok" : "non completata"}
                  </Text>
                ))}
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function Info({ label, value }) {
  return (
    <View className="flex-row justify-between gap-4 border-b border-iron-line pb-3">
      <Text className="flex-1 text-sm font-medium text-iron-muted">{label}</Text>
      <Text className="flex-1 text-right text-sm font-semibold text-iron-text">{value}</Text>
    </View>
  );
}
