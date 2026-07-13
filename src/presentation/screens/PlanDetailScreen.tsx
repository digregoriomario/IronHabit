import { Alert, ScrollView, Text, View } from "react-native";
import { Edit3, Play, Trash2 } from "lucide-react-native";

import { createTrackingTarget, formatTrackingValue } from "../../domain/exerciseTracking";
import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { formatRestTime } from "../components/RestTimerSelect";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionHeader } from "../components/SectionHeader";
import { useIronHabitStore } from "../store/useIronHabitStore";

export function PlanDetailScreen({ navigation, route }) {
  const id = route.params?.id;
  const plan = useIronHabitStore((state) => state.plans.find((item) => item.id === id));
  const exercises = useIronHabitStore((state) => state.exercises);
  const deletePlan = useIronHabitStore((state) => state.deletePlan);
  const startWorkout = useIronHabitStore((state) => state.startWorkout);

  if (!plan) {
    return (
      <ScreenContainer className="p-4">
        <EmptyState title="Scheda non trovata" action={<AppButton title="Torna indietro" variant="secondary" onPress={() => navigation.goBack()} />} />
      </ScreenContainer>
    );
  }

  const remove = () => {
    Alert.alert("Elimina scheda", "La scheda non puo essere eliminata se usata da sessioni o storico.", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: () => {
          try {
            deletePlan(id);
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
        <PageHeader title={plan.name} />

        <View className="mt-5 gap-3">
          <AppButton
            title="Avvia allenamento"
            icon={Play}
            variant="success"
            onPress={() => {
              startWorkout({ planId: id });
              navigation.navigate("GuidedWorkout");
            }}
          />
          <AppButton title="Modifica" icon={Edit3} variant="secondary" onPress={() => navigation.navigate("PlanForm", { id })} />
          <AppButton title="Elimina" icon={Trash2} variant="danger" onPress={remove} />
        </View>

        <SectionHeader title="Dettagli" />
        <Card className="gap-3">
          <Info label="Descrizione" value={plan.description || "Nessuna descrizione"} />
          <Info label="Obiettivo" value={plan.goal || "Allenamento generale"} />
          <Info label="Livello" value={plan.level || "Starter"} />
          <Info label="Durata prevista" value={`${plan.expectedDuration} min`} />
          <Info label="Frequenza" value={plan.recommendedFrequency || "Non indicata"} />
          <Info label="Note" value={plan.notes || "Nessuna nota"} />
        </Card>

        <SectionHeader title="Sequenza esercizi" />
        <View className="gap-3">
          {plan.exercises
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((item, index) => {
              const exercise = exercises.find((entry) => entry.id === item.exerciseId);
              const setTargets = (
                item.setTargets?.length
                  ? item.setTargets
                  : Array.from({ length: item.sets }).map(() => ({
                      type: item.type,
                      reps: item.reps,
                      loadKg: item.loadKg,
                      durationSeconds: item.durationSeconds,
                      distanceKm: 0
                    }))
              ).map((target) => createTrackingTarget(exercise, target));
              return (
                <Card key={item.id} className="gap-2">
                  <Text className="text-lg font-semibold leading-6 text-iron-text">{index + 1}. {exercise?.name || "Esercizio rimosso"}</Text>
                  {item.supersetGroup ? <Text className="text-sm font-semibold text-iron-text">Superset {item.supersetGroup}</Text> : null}
                  {setTargets.map((target, setIndex) => (
                    <Text key={setIndex} className="text-sm font-medium leading-5 text-iron-muted">
                      Serie {setIndex + 1}: {target.type || "Normale"} · {formatTrackingValue(exercise, target)}
                    </Text>
                  ))}
                  <Text className="text-sm font-semibold text-iron-text">Recupero: {formatRestTime(item.restSeconds)}</Text>
                  {item.notes ? <Text className="text-sm text-iron-text">{item.notes}</Text> : null}
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
    <View className="gap-1 border-b border-iron-line pb-3">
      <Text className="text-sm font-medium text-iron-muted">{label}</Text>
      <Text className="text-base font-semibold leading-6 text-iron-text">{value}</Text>
    </View>
  );
}
