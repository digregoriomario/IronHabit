import { Alert, ScrollView, Text, View } from "react-native";
import { Edit3, Target, Trash2, Trophy } from "lucide-react-native";

import { statusLabels } from "../../domain/constants";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { ProgressBar } from "../components/ProgressBar";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionHeader } from "../components/SectionHeader";
import { colors } from "../theme/colors";
import { formatDate } from "../utils/date";
import { goalStatusLabels, labelForGoalCategory } from "../utils/labels";
import { useIronHabitStore } from "../store/useIronHabitStore";

export function GoalDetailScreen({ navigation, route }) {
  const id = route.params?.id;
  const goal = useIronHabitStore((state) => state.goals.find((item) => item.id === id));
  const exercises = useIronHabitStore((state) => state.exercises);
  const deleteGoal = useIronHabitStore((state) => state.deleteGoal);

  if (!goal) {
    return (
      <ScreenContainer className="p-4">
        <EmptyState title="Obiettivo non trovato" action={<AppButton title="Torna indietro" variant="secondary" onPress={() => navigation.goBack()} />} />
      </ScreenContainer>
    );
  }

  const exercise = exercises.find((item) => item.id === goal.relatedExerciseId);

  const remove = () => {
    Alert.alert("Elimina obiettivo", "L'obiettivo verra rimosso senza modificare lo storico.", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: () => {
          deleteGoal(id);
          navigation.goBack();
        }
      }
    ]);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <PageHeader title={goal.title} action={<GoalStatusIcon completed={goal.status === "completed"} />} />
        <View className="mt-5">
          <ProgressBar current={goal.currentValue} target={goal.targetValue} />
        </View>

        <View className="mt-5 flex-row gap-3">
          <AppButton title="Modifica" icon={Edit3} className="flex-1" variant="secondary" onPress={() => navigation.navigate("GoalForm", { id })} />
          <AppButton title="Elimina" icon={Trash2} className="flex-1" variant="danger" onPress={remove} />
        </View>

        <SectionHeader title="Dettagli" />
        <Card className="gap-3">
          <Info label="Descrizione" value={goal.description || "Nessuna descrizione"} />
          <Info label="Categoria" value={labelForGoalCategory(goal.category)} />
          <Info label="Stato" value={goalStatusLabels[goal.status] || statusLabels[goal.status] || goal.status} />
          <Info label="Avanzamento" value={formatGoalProgress(goal)} />
          {goal.category === "frequency" ? (
            <>
              <Info label="Settimana" value={`${formatDate(goal.startDate)} - ${formatDate(goal.deadline)}`} />
              <Info label="Giorni richiesti" value={`${goal.targetValue}`} />
            </>
          ) : (
            <>
              <Info label="Esercizio" value={exercise?.name || "Nessuno"} />
              <Info label={goal.category === "load" ? "Carico target" : "Ripetizioni target"} value={formatGoalTarget(goal)} />
            </>
          )}
          <Info label="Note" value={goal.notes || "Nessuna nota"} />
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

function GoalStatusIcon({ completed }) {
  const Icon = completed ? Trophy : Target;
  return (
    <View className={`h-12 w-12 items-center justify-center rounded-md ${completed ? "bg-iron-warningSoft" : "bg-iron-infoSoft"}`}>
      <Icon size={22} color={completed ? colors.warningText : colors.infoText} />
    </View>
  );
}

function formatGoalProgress(goal) {
  if (goal.category === "load") return `${goal.currentValue} / ${goal.targetValue} kg`;
  if (goal.category === "reps") return `${goal.currentValue} / ${goal.targetValue} ripetizioni`;
  return `${goal.currentValue} / ${goal.targetValue} giorni`;
}

function formatGoalTarget(goal) {
  if (goal.category === "load") return `${goal.targetValue} kg`;
  if (goal.category === "reps") return `${goal.targetValue} ripetizioni`;
  return `${goal.targetValue}`;
}

function Info({ label, value }) {
  return (
    <View className="gap-1 border-b border-iron-line pb-3">
      <Text className="text-sm font-medium text-iron-muted">{label}</Text>
      <Text className="text-base font-semibold leading-6 text-iron-text">{value}</Text>
    </View>
  );
}
