import { useMemo, useState } from "react";
import { ScrollView } from "react-native";

import { filterWorkoutLogs } from "../../usecases/filterUseCases";
import { AppInput } from "../components/AppInput";
import { AppSelect } from "../components/AppSelect";
import { EmptyState } from "../components/EmptyState";
import { FiltersPanel } from "../components/FiltersPanel";
import { ListRow } from "../components/ListRow";
import { PageHeader } from "../components/PageHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { formatDate } from "../utils/date";
import { workoutSortOptions } from "../utils/labels";
import { useIronHabitStore } from "../store/useIronHabitStore";

export function WorkoutHistoryScreen({ navigation }) {
  const logs = useIronHabitStore((state) => state.workoutLogs);
  const plans = useIronHabitStore((state) => state.plans);
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("Tutti");
  const [sort, setSort] = useState("dateDesc");

  const filtered = useMemo(() => filterWorkoutLogs(logs, { query, period, sort }, plans), [logs, query, period, sort, plans]);
  const activeFilters = [period !== "Tutti", sort !== "dateDesc"].filter(Boolean).length;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <PageHeader title="Storico" />

        <AppInput value={query} onChangeText={setQuery} placeholder="Cerca per scheda o note" className="mb-3" />
        <FiltersPanel activeCount={activeFilters}>
          <AppSelect label="Periodo" options={["Tutti", "7 giorni", "30 giorni", "90 giorni"]} value={period} onChange={setPeriod} />
          <AppSelect label="Ordina" options={workoutSortOptions} value={sort} onChange={setSort} />
        </FiltersPanel>

        {filtered.length ? (
          filtered.map((log) => {
            const plan = plans.find((item) => item.id === log.planId);
            const setCount = log.exercises.flatMap((exercise) => exercise.sets).filter((set) => set.completed).length;
            return (
              <ListRow
                key={log.id}
                title={plan?.name || "Allenamento libero"}
                subtitle={`${formatDate(log.date)} - ${log.durationMinutes} min - fatica ${log.fatigue}/10`}
                meta={`${log.exercises.length} esercizi - ${setCount} serie completate`}
                onPress={() => navigation.navigate("WorkoutDetail", { id: log.id })}
              />
            );
          })
        ) : (
          <EmptyState
            title="Nessun allenamento"
            message="Lo storico si popola automaticamente quando completi una scheda o una sessione guidata."
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
