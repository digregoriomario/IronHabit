import { Alert, ScrollView, Text, View } from "react-native";
import { Edit3, Trash2 } from "lucide-react-native";

import { getExerciseRecords } from "../../usecases/workoutAnalyticsUseCases";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionHeader } from "../components/SectionHeader";
import { useIronHabitStore } from "../store/useIronHabitStore";

export function ExerciseDetailScreen({ navigation, route }) {
  const id = route.params?.id;
  const exercise = useIronHabitStore((state) => state.exercises.find((item) => item.id === id));
  const logs = useIronHabitStore((state) => state.workoutLogs);
  const deleteExercise = useIronHabitStore((state) => state.deleteExercise);

  if (!exercise) {
    return (
      <ScreenContainer className="p-4">
        <EmptyState title="Esercizio non trovato" action={<AppButton title="Torna indietro" variant="secondary" onPress={() => navigation.goBack()} />} />
      </ScreenContainer>
    );
  }

  const records = getExerciseRecords(logs, id);

  const remove = () => {
    Alert.alert("Elimina esercizio", "L'operazione e consentita solo se l'esercizio non e collegato ad altri dati.", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: () => {
          try {
            deleteExercise(id);
            navigation.goBack();
          } catch (error) {
            Alert.alert("Eliminazione bloccata", error.message);
          }
        }
      }
    ]);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <PageHeader title={exercise.name} />

        <View className="mt-5 flex-row gap-3">
          <AppButton title="Modifica" icon={Edit3} className="flex-1" variant="secondary" onPress={() => navigation.navigate("ExerciseForm", { id })} />
          <AppButton title="Elimina" icon={Trash2} className="flex-1" variant="danger" onPress={remove} />
        </View>

        <SectionHeader title="Dettagli" />
        <Card className="gap-3">
          <Info label="Descrizione" value={exercise.description || "Nessuna descrizione"} />
          <Info label="Gruppo principale" value={exercise.primaryMuscle} />
          <Info label="Gruppi secondari" value={exercise.secondaryMuscles.length ? exercise.secondaryMuscles.join(", ") : "Nessuno"} />
          <Info label="Difficolta" value={exercise.difficulty} />
          <Info label="Attrezzatura" value={exercise.equipment} />
          <Info label="Ripetizioni consigliate" value={exercise.recommendedReps || "Non indicate"} />
          <Info label="Durata stimata" value={`${exercise.estimatedDuration || 0} min`} />
        </Card>

        <SectionHeader title="Record" />
        <Card className="gap-3">
          <Info label="Serie registrate" value={records.sets} />
          <Info label="Ripetizioni max" value={records.bestReps} />
        </Card>

        <SectionHeader title="Note" />
        <Card>
          <Text className="text-base leading-6 text-iron-text">{exercise.notes || "Nessuna nota."}</Text>
        </Card>
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
