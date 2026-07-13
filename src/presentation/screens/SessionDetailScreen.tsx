import { Alert, ScrollView, Text, View } from "react-native";
import { Edit3, Play, Trash2 } from "lucide-react-native";

import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionHeader } from "../components/SectionHeader";
import { SessionStatusBadge } from "../components/SessionStatusBadge";
import { formatDate } from "../utils/date";
import { useIronHabitStore } from "../store/useIronHabitStore";

export function SessionDetailScreen({ navigation, route }) {
  const id = route.params?.id;
  const session = useIronHabitStore((state) => state.plannedSessions.find((item) => item.id === id));
  const plans = useIronHabitStore((state) => state.plans);
  const deleteSession = useIronHabitStore((state) => state.deleteSession);
  const startWorkout = useIronHabitStore((state) => state.startWorkout);

  if (!session) {
    return (
      <ScreenContainer className="p-4">
        <EmptyState title="Sessione non trovata" action={<AppButton title="Torna indietro" variant="secondary" onPress={() => navigation.goBack()} />} />
      </ScreenContainer>
    );
  }

  const plan = plans.find((item) => item.id === session.planId);

  const remove = () => {
    Alert.alert("Elimina sessione", "La sessione non puo essere eliminata se collegata a un allenamento svolto.", [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: () => {
          try {
            deleteSession(id);
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
        <PageHeader title={session.title} />

        <View className="mt-5 gap-3">
          {session.status === "planned" ? (
            <AppButton
              title="Avvia allenamento"
              icon={Play}
              variant="success"
              onPress={() => {
                startWorkout({ sessionId: id });
                navigation.navigate("GuidedWorkout");
              }}
            />
          ) : null}
          <View className="flex-row gap-3">
            <AppButton title="Modifica" icon={Edit3} className="flex-1" variant="secondary" onPress={() => navigation.navigate("SessionForm", { id })} />
            <AppButton title="Elimina" icon={Trash2} className="flex-1" variant="danger" onPress={remove} />
          </View>
        </View>

        <SectionHeader title="Associazioni" />
        <Card className="gap-3">
          <Info label="Data" value={formatDate(session.date)} />
          <View className="gap-2 border-b border-iron-line pb-3">
            <Text className="text-sm font-medium text-iron-muted">Stato</Text>
            <View className="self-start">
              <SessionStatusBadge status={session.status} />
            </View>
          </View>
          <Info label="Scheda" value={plan?.name || "Nessuna scheda"} />
          <Info label="Note" value={session.notes || "Nessuna nota"} />
        </Card>
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
