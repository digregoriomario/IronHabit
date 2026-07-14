import { ChevronDown, ChevronUp, Plus, Target, Trophy } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { filterGoals } from "../../usecases/filterUseCases";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { AppSelect } from "../components/AppSelect";
import { EmptyState } from "../components/EmptyState";
import { FiltersPanel } from "../components/FiltersPanel";
import { IconButton } from "../components/IconButton";
import { ListRow } from "../components/ListRow";
import { PageHeader } from "../components/PageHeader";
import { ProgressBar } from "../components/ProgressBar";
import { ScreenContainer } from "../components/ScreenContainer";
import { colors } from "../theme/colors";
import { useIronHabitStore } from "../store/useIronHabitStore";
import { goalCategoryOptions, goalSortOptions, labelForGoalCategory, withAll } from "../utils/labels";

export function GoalListScreen({ navigation }) {
  const goals = useIronHabitStore((state) => state.goals);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tutti");
  const [sort, setSort] = useState("deadline");
  const [prefixedOpen, setPrefixedOpen] = useState(true);
  const [completedOpen, setCompletedOpen] = useState(true);

  const filtered = useMemo(() => filterGoals(goals, { query, category, sort }), [goals, query, category, sort]);
  const prefixedGoals = useMemo(() => filtered.filter((goal) => goal.status !== "completed"), [filtered]);
  const completedGoals = useMemo(() => filtered.filter((goal) => goal.status === "completed"), [filtered]);
  const activeFilters = [category !== "Tutti", sort !== "deadline"].filter(Boolean).length;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <PageHeader
          title="Obiettivi"
          action={<IconButton icon={Plus} label="Crea obiettivo" color={colors.info} onPress={() => navigation.navigate("GoalForm")} />}
        />

        <AppInput
          value={query}
          onChangeText={setQuery}
          placeholder="Cerca obiettivo"
          className="mb-3"
        />
        <FiltersPanel activeCount={activeFilters}>
          <AppSelect label="Categoria" options={withAll(goalCategoryOptions)} value={category} onChange={setCategory} />
          <AppSelect label="Ordina" options={goalSortOptions} value={sort} onChange={setSort} />
        </FiltersPanel>

        {filtered.length ? (
          <>
            <GoalSection
              title="Prefissati"
              count={prefixedGoals.length}
              open={prefixedOpen}
              onToggle={() => setPrefixedOpen((value) => !value)}
            >
              {prefixedGoals.length ? (
                prefixedGoals.map((goal) => (
                  <GoalRow key={goal.id} goal={goal} navigation={navigation} />
                ))
              ) : (
                <Text className="mb-3 text-sm font-medium text-iron-muted">Nessun obiettivo prefissato.</Text>
              )}
            </GoalSection>

            <GoalSection
              title="Raggiunti"
              count={completedGoals.length}
              open={completedOpen}
              onToggle={() => setCompletedOpen((value) => !value)}
            >
              {completedGoals.length ? (
                completedGoals.map((goal) => (
                  <GoalRow key={goal.id} goal={goal} navigation={navigation} achieved />
                ))
              ) : (
                <Text className="mb-3 text-sm font-medium text-iron-muted">Nessun obiettivo raggiunto.</Text>
              )}
            </GoalSection>
          </>
        ) : (
          <EmptyState
            title="Nessun obiettivo"
            message="Crea un target misurabile per monitorare i progressi."
            action={<AppButton title="Crea obiettivo" variant="info" onPress={() => navigation.navigate("GoalForm")} />}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function GoalSection({ title, count, open, onToggle, children }) {
  const Icon = open ? ChevronUp : ChevronDown;
  return (
    <View className="mt-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${count}`}
        onPress={onToggle}
        className="mb-3 flex-row items-center justify-between rounded-md border border-iron-line bg-iron-surface px-3 py-3"
      >
        <Text className="text-base font-semibold leading-5 text-iron-text">{title} ({count})</Text>
        <Icon size={20} color={colors.text} />
      </Pressable>
      {open ? children : null}
    </View>
  );
}

function GoalRow({ goal, navigation, achieved = false }) {
  const Icon = achieved ? Trophy : Target;
  const iconColors = achieved
    ? { background: "bg-iron-warningSoft", color: colors.warningText }
    : { background: "bg-iron-infoSoft", color: colors.infoText };

  return (
    <ListRow
      title={goal.title}
      subtitle={labelForGoalCategory(goal.category)}
      meta={formatGoalMeta(goal)}
      onPress={() => navigation.navigate("GoalDetail", { id: goal.id })}
      leading={(
        <View className={`h-10 w-10 items-center justify-center rounded-md ${iconColors.background}`}>
          <Icon size={20} color={iconColors.color} />
        </View>
      )}
    >
      <ProgressBar current={goal.currentValue} target={goal.targetValue} />
    </ListRow>
  );
}

function formatGoalMeta(goal) {
  if (goal.category === "load") return `${goal.currentValue} / ${goal.targetValue} kg`;
  if (goal.category === "reps") return `${goal.currentValue} / ${goal.targetValue} ripetizioni`;
  return `${goal.currentValue} / ${goal.targetValue} giorni`;
}
