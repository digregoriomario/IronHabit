import { Check, Dumbbell, Search, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, StatusBar, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MUSCLE_GROUPS } from "../../domain/constants";
import { createId } from "../../domain/entities";
import { createTrackingTarget } from "../../domain/exerciseTracking";
import { AppButton } from "../components/AppButton";
import { ScreenContainer } from "../components/ScreenContainer";
import { useIronHabitStore } from "../store/useIronHabitStore";
import { colors } from "../theme/colors";

export function PlanExercisePickerScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const exercises = useIronHabitStore((state) => state.exercises);
  const settings = useIronHabitStore((state) => state.settings);
  const activeWorkout = useIronHabitStore((state) => state.activeWorkout);
  const replaceActiveWorkout = useIronHabitStore((state) => state.replaceActiveWorkout);
  const setPendingPlanExerciseIds = useIronHabitStore((state) => state.setPendingPlanExerciseIds);
  const target = route.params?.target || "plan";
  const excludedIds = route.params?.excludedExerciseIds || [];
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("Tutti");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const topInset = Math.max(insets.top, Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0);

  const filtered = useMemo(
    () =>
      exercises
        .filter((exercise) => muscle === "Tutti" || exercise.primaryMuscle === muscle)
        .filter((exercise) => {
          const needle = query.trim().toLowerCase();
          return !needle
            || exercise.name.toLowerCase().includes(needle)
            || exercise.primaryMuscle.toLowerCase().includes(needle);
        })
        .sort((left, right) => left.name.localeCompare(right.name)),
    [exercises, muscle, query]
  );

  const toggle = (id: string) => {
    if (excludedIds.includes(id)) return;
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const confirm = () => {
    if (target === "activeWorkout" && activeWorkout) {
      const addedExercises = selectedIds.map((exerciseId) => {
        const exercise = exercises.find((item) => item.id === exerciseId);
        const trackingTarget = createTrackingTarget(exercise);
        return {
          id: createId("done"),
          exerciseId,
          supersetGroup: "",
          restSeconds: settings.defaultRestSeconds,
          notes: "",
          sets: Array.from({ length: 1 }).map((_, index) => ({
            setNumber: index + 1,
            ...trackingTarget,
            restSeconds: settings.defaultRestSeconds,
            rpe: 0,
            completed: false
          }))
        };
      });

      replaceActiveWorkout({
        ...activeWorkout,
        exercises: [...activeWorkout.exercises, ...addedExercises]
      });
    } else {
      setPendingPlanExerciseIds(selectedIds);
    }
    navigation.goBack();
  };

  return (
    <ScreenContainer edges={["right", "left"]}>
      <View className="flex-1 bg-iron-bg" style={{ minHeight: 0, overflow: "hidden" }}>
        <View className="flex-row items-center gap-3 border-b border-iron-line px-4 pb-3" style={{ paddingTop: topInset + 8 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Annulla selezione esercizi"
            onPress={() => navigation.goBack()}
            className="h-11 w-11 items-center justify-center rounded-md"
          >
            <X size={24} color={colors.text} />
          </Pressable>
          <View className="flex-1">
            <Text className="text-center text-lg font-semibold leading-6 text-iron-text">Aggiungi esercizi</Text>
            <Text className="text-center text-xs font-medium text-iron-muted">
              {selectedIds.length ? `${selectedIds.length} selezionati in ordine` : "Selezione multipla"}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Conferma esercizi selezionati"
            accessibilityState={{ disabled: selectedIds.length === 0 }}
            disabled={!selectedIds.length}
            onPress={confirm}
            className="h-11 min-w-11 items-center justify-center rounded-md"
          >
            <Check size={24} color={selectedIds.length ? colors.text : colors.muted} />
          </Pressable>
        </View>

        <View className="px-4 pt-3">
          <View className="min-h-12 flex-row items-center gap-3 rounded-md border border-iron-line bg-iron-card px-4">
            <Search size={20} color={colors.muted} />
            <TextInput
              accessibilityLabel="Cerca esercizio"
              value={query}
              onChangeText={setQuery}
              placeholder="Cerca esercizio"
              placeholderTextColor={colors.muted}
              className="flex-1 py-3 text-base font-semibold text-iron-text"
            />
          </View>
        </View>

        <View className="py-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          >
            {["Tutti", ...MUSCLE_GROUPS].map((item) => {
              const selected = muscle === item;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityLabel={`Muscolo: ${item}`}
                  accessibilityState={{ selected }}
                  onPress={() => setMuscle(item)}
                  className={`min-h-10 justify-center rounded-md border px-4 ${
                    selected ? "border-iron-text bg-iron-text" : "border-iron-line bg-iron-card"
                  }`}
                >
                  <Text className={`text-sm font-semibold ${selected ? "text-iron-inverseText" : "text-iron-text"}`}>{item}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView className="flex-1" style={{ minHeight: 0 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <View className="overflow-hidden rounded-lg border border-iron-line bg-iron-card">
            {filtered.map((exercise, index) => {
              const alreadyAdded = excludedIds.includes(exercise.id);
              const selectionIndex = selectedIds.indexOf(exercise.id);
              const selected = selectionIndex >= 0;
              return (
                <Pressable
                  key={exercise.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${exercise.name}, ${alreadyAdded ? "già aggiunto" : selected ? `selezione ${selectionIndex + 1}` : "non selezionato"}`}
                  accessibilityState={{ selected, disabled: alreadyAdded }}
                  disabled={alreadyAdded}
                  onPress={() => toggle(exercise.id)}
                  className={`min-h-18 flex-row items-center gap-3 px-4 py-3 ${
                    index < filtered.length - 1 ? "border-b border-iron-line" : ""
                  } ${selected ? "bg-iron-surface" : ""}`}
                >
                  <View className="h-12 w-12 items-center justify-center rounded-md border border-iron-line bg-iron-surface">
                    <Dumbbell size={22} color={selected ? colors.text : colors.muted} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className={`text-base font-semibold leading-5 ${alreadyAdded ? "text-iron-muted" : "text-iron-text"}`} numberOfLines={2}>
                      {exercise.name}
                    </Text>
                    <Text className="mt-1 text-sm font-medium text-iron-muted">
                      {exercise.primaryMuscle} · {exercise.equipment}
                    </Text>
                  </View>
                  {alreadyAdded ? (
                    <Text className="text-xs font-semibold uppercase tracking-wide text-iron-muted">Aggiunto</Text>
                  ) : selected ? (
                    <View className="h-8 w-8 items-center justify-center rounded-md border border-iron-success bg-iron-successSoft">
                      <Text className="font-semibold text-iron-successText">{selectionIndex + 1}</Text>
                    </View>
                  ) : (
                    <View className="h-8 w-8 rounded-md border border-iron-line bg-iron-card" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View className="border-t border-iron-line bg-iron-bg px-4 pt-4" style={{ paddingBottom: Math.max(16, insets.bottom + 16) }}>
          <AppButton
            title={selectedIds.length ? `Aggiungi ${selectedIds.length} ${selectedIds.length === 1 ? "esercizio" : "esercizi"}` : "Seleziona gli esercizi"}
            disabled={!selectedIds.length}
            variant="success"
            onPress={confirm}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
