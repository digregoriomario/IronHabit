import { Plus } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";

import { statusLabels } from "../../domain/constants";
import { filterSessions } from "../../usecases/filterUseCases";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { AppSelect } from "../components/AppSelect";
import { EmptyState } from "../components/EmptyState";
import { FiltersPanel } from "../components/FiltersPanel";
import { IconButton } from "../components/IconButton";
import { ListRow } from "../components/ListRow";
import { PageHeader } from "../components/PageHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { SessionStatusBadge } from "../components/SessionStatusBadge";
import { colors } from "../theme/colors";
import { formatDate, toDateInput } from "../utils/date";
import { sessionSortOptions, sessionStatusOptions, withAll } from "../utils/labels";
import { useIronHabitStore } from "../store/useIronHabitStore";

export function SessionListScreen({ navigation }) {
  const sessions = useIronHabitStore((state) => state.plannedSessions);
  const updateSessionStatus = useIronHabitStore((state) => state.updateSessionStatus);
  const startWorkout = useIronHabitStore((state) => state.startWorkout);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Tutti");
  const [sort, setSort] = useState("date");

  const filtered = useMemo(() => filterSessions(sessions, { query, status, sort }), [sessions, query, status, sort]);
  const activeFilters = [status !== "Tutti", sort !== "date"].filter(Boolean).length;

  const markSkipped = (id) => {
    try {
      updateSessionStatus(id, "skipped");
    } catch (error) {
      Alert.alert("Stato non aggiornato", error.message);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <PageHeader
          title="Sessioni"
          action={<IconButton icon={Plus} label="Pianifica sessione" color={colors.info} onPress={() => navigation.navigate("SessionForm", { date: toDateInput(new Date()) })} />}
        />

        <AppInput value={query} onChangeText={setQuery} placeholder="Cerca sessione" className="mb-3" />
        <FiltersPanel activeCount={activeFilters}>
          <AppSelect label="Stato" options={withAll(sessionStatusOptions)} value={status} onChange={setStatus} />
          <AppSelect label="Ordina" options={sessionSortOptions} value={sort} onChange={setSort} />
        </FiltersPanel>

        {filtered.length ? (
          filtered.map((session) => (
            <ListRow
              key={session.id}
              title={session.title}
              subtitle={`${formatDate(session.date)} - ${statusLabels[session.status]}`}
              meta={session.status === "planned" ? "Dettagli e avvio" : "Storico pianificazione"}
              onPress={() => navigation.navigate("SessionDetail", { id: session.id })}
            >
              <View className="mt-3 self-start">
                <SessionStatusBadge status={session.status} compact />
              </View>
              {session.status === "planned" ? (
                <View className="mt-3 flex-row gap-2">
                  <AppButton
                    title="Avvia"
                    className="flex-1"
                    variant="success"
                    onPress={() => {
                      startWorkout({ sessionId: session.id });
                      navigation.navigate("GuidedWorkout");
                    }}
                  />
                  <AppButton title="Salta" className="flex-1" variant="warning" onPress={() => markSkipped(session.id)} />
                </View>
              ) : null}
            </ListRow>
          ))
        ) : (
          <EmptyState
            title="Nessuna sessione"
            message="Pianifica una scheda, una sessione cardio o un recupero."
            action={<AppButton title="Pianifica sessione" variant="info" onPress={() => navigation.navigate("SessionForm", { date: toDateInput(new Date()) })} />}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
