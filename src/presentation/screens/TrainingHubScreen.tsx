import { Dumbbell, Edit3, Library, ListChecks, Play, Plus, Trash2 } from "lucide-react-native";
import { Alert, ScrollView, Text, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { IconButton } from "../components/IconButton";
import { ListRow } from "../components/ListRow";
import { PageHeader } from "../components/PageHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionHeader } from "../components/SectionHeader";
import { useIronHabitStore } from "../store/useIronHabitStore";
import { colors } from "../theme/colors";

export function TrainingHubScreen({ navigation }) {
  const exercises = useIronHabitStore((state) => state.exercises);
  const plans = useIronHabitStore((state) => state.plans);
  const startWorkout = useIronHabitStore((state) => state.startWorkout);
  const deletePlan = useIronHabitStore((state) => state.deletePlan);

  const beginEmpty = () => {
    startWorkout({ empty: true });
    navigation.navigate("GuidedWorkout");
  };

  const beginPlan = (planId) => {
    startWorkout({ planId });
    navigation.navigate("GuidedWorkout");
  };

  const removePlan = (plan) => {
    Alert.alert(
      "Elimina scheda",
      `Vuoi eliminare "${plan.name}"? L'operazione è consentita solo se la scheda non è collegata a sessioni o allenamenti registrati.`,
      [
        { text: "Annulla", style: "cancel" },
        {
          text: "Elimina",
          style: "destructive",
          onPress: () => {
            try {
              deletePlan(plan.id);
            } catch (error) {
              Alert.alert("Eliminazione non riuscita", error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <PageHeader title="Allenamento" />

        <Card>
          <Text className="text-xs font-semibold uppercase tracking-wide text-iron-muted">Allenamento libero</Text>
          <Text className="mb-4 mt-2 text-xl font-semibold leading-7 text-iron-text">Nuova sessione</Text>
          <AppButton title="Avvia sessione vuota" icon={Dumbbell} variant="success" onPress={beginEmpty} />
        </Card>

        <SectionHeader
          title="Le mie schede"
          action={<IconButton icon={Plus} label="Crea scheda" color={colors.info} onPress={() => navigation.navigate("PlanForm")} />}
        />
        <View className="gap-3">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <View className="flex-row items-start gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-lg bg-iron-surface">
                  <ListChecks size={21} color={colors.text} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold leading-6 text-iron-text" numberOfLines={2}>{plan.name}</Text>
                  <Text className="mt-1 text-sm font-medium leading-5 text-iron-muted">
                    {plan.exercises
                      .slice(0, 4)
                      .map((item) => exercises.find((exercise) => exercise.id === item.exerciseId)?.name)
                      .filter(Boolean)
                      .join(", ")}
                    {plan.exercises.length > 4 ? ` +${plan.exercises.length - 4}` : ""}
                  </Text>
                  <Text className="mt-2 text-xs font-semibold uppercase tracking-wide text-iron-muted">
                    {plan.exercises.length} {plan.exercises.length === 1 ? "esercizio" : "esercizi"}
                  </Text>
                </View>
              </View>
              <View className="mt-4 flex-row gap-2">
                <AppButton title="Avvia" icon={Play} variant="success" className="flex-1" onPress={() => beginPlan(plan.id)} />
                <IconButton icon={Edit3} label={`Modifica ${plan.name}`} onPress={() => navigation.navigate("PlanForm", { id: plan.id })} />
                <IconButton icon={Trash2} label={`Elimina ${plan.name}`} color={colors.danger} onPress={() => removePlan(plan)} />
              </View>
            </Card>
          ))}
        </View>

        <SectionHeader title="Esercizi" />
        <ListRow
          title="Database esercizi"
          meta={`${exercises.length} esercizi disponibili`}
          leading={<HubIcon icon={Library} color={colors.text} />}
          onPress={() => navigation.navigate("ExerciseList")}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

function HubIcon({ icon: Icon, color }) {
  return (
    <View className="h-10 w-10 items-center justify-center rounded-md border border-iron-line bg-iron-surface">
      <Icon size={19} color={color} />
    </View>
  );
}
