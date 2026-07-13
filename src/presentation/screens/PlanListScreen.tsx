import { Play, Plus } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { PLAN_LEVELS } from "../../domain/constants";
import { filterPlans } from "../../usecases/filterUseCases";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { AppSelect } from "../components/AppSelect";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { FiltersPanel } from "../components/FiltersPanel";
import { PageHeader } from "../components/PageHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { planSortOptions } from "../utils/labels";
import { useIronHabitStore } from "../store/useIronHabitStore";

export function PlanListScreen({ navigation }) {
  const plans = useIronHabitStore((state) => state.plans);
  const exercises = useIronHabitStore((state) => state.exercises);
  const startWorkout = useIronHabitStore((state) => state.startWorkout);
  const goals = useMemo(() => ["Tutti", ...Array.from(new Set(plans.map((plan) => plan.goal).filter(Boolean)))], [plans]);
  const [query, setQuery] = useState("");
  const [goal, setGoal] = useState("Tutti");
  const [level, setLevel] = useState("Tutti");
  const [sort, setSort] = useState("name");

  const filtered = useMemo(() => filterPlans(plans, { query, goal, level, sort }), [plans, query, goal, level, sort]);
  const activeFilters = [goal !== "Tutti", level !== "Tutti", sort !== "name"].filter(Boolean).length;
  const beginPlan = (planId) => {
    startWorkout({ planId });
    navigation.navigate("GuidedWorkout");
  };
  const beginEmptyWorkout = () => {
    startWorkout({ empty: true });
    navigation.navigate("GuidedWorkout");
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <PageHeader
          title="Schede"
          action={<AppButton title="Nuova scheda" icon={Plus} variant="info" size="sm" onPress={() => navigation.navigate("PlanForm")} />}
        />

        <Card className="mb-4">
          <Text className="text-xs font-semibold uppercase tracking-wide text-iron-muted">Allenamento libero</Text>
          <Text className="mb-4 mt-2 text-xl font-semibold leading-7 text-iron-text">Sessione senza scheda</Text>
          <AppButton title="Avvia sessione libera" icon={Play} variant="success" onPress={beginEmptyWorkout} />
        </Card>

        <AppInput value={query} onChangeText={setQuery} placeholder="Cerca scheda o obiettivo" className="mb-3" />
        <FiltersPanel activeCount={activeFilters}>
          <AppSelect label="Obiettivo" options={goals} value={goal} onChange={setGoal} />
          <AppSelect label="Livello" options={["Tutti", ...PLAN_LEVELS]} value={level} onChange={setLevel} />
          <AppSelect label="Ordina" options={planSortOptions} value={sort} onChange={setSort} />
        </FiltersPanel>

        {filtered.length ? (
          filtered.map((plan) => (
            <Card key={plan.id} className="mb-4">
              <View className="gap-3">
                <View>
                  <Text className="text-xl font-semibold leading-7 text-iron-text" numberOfLines={2}>{plan.name}</Text>
                  <Text className="mt-2 text-xs font-semibold uppercase tracking-wide text-iron-muted">
                    {plan.exercises.length} {plan.exercises.length === 1 ? "esercizio" : "esercizi"} · {plan.expectedDuration} min
                  </Text>
                </View>

                <View className="gap-2 border-y border-iron-line py-3">
                  {plan.exercises.slice(0, 5).map((item, index) => {
                    const exercise = exercises.find((entry) => entry.id === item.exerciseId);
                    return (
                      <Text key={`${plan.id}-${item.exerciseId}-${index}`} className="text-base font-semibold leading-6 text-iron-text">
                        {index + 1}. {exercise?.name || "Esercizio"}
                      </Text>
                    );
                  })}
                  {plan.exercises.length > 5 ? (
                    <Text className="text-sm font-semibold uppercase tracking-wide text-iron-muted">+{plan.exercises.length - 5} altri esercizi</Text>
                  ) : null}
                </View>

                <View className="flex-row gap-2">
                  <AppButton title="Inizia allenamento" icon={Play} variant="success" className="flex-1" onPress={() => beginPlan(plan.id)} />
                  <AppButton title="Dettagli" variant="secondary" onPress={() => navigation.navigate("PlanDetail", { id: plan.id })} />
                </View>
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            title="Nessuna scheda trovata"
            message="Crea una routine associando almeno un esercizio."
            action={<AppButton title="Crea scheda" variant="info" onPress={() => navigation.navigate("PlanForm")} />}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
