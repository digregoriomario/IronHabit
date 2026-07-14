import { useFocusEffect } from "@react-navigation/native";
import { Dumbbell, MoreVertical, Plus, Save } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { createPlanExercise } from "../../domain/entities";
import { createTrackingTarget, getTrackingFields } from "../../domain/exerciseTracking";
import { getNextSetType, getSetBadgeLabel, getSetTitle, isWarmupSet, normalizeWarmupOrder } from "../../domain/setRules";
import type { Exercise, PlanExercise, PlanSetTarget, SetType } from "../../domain/types";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { RestTimerSelect } from "../components/RestTimerSelect";
import { ScreenContainer } from "../components/ScreenContainer";
import { useIronHabitStore } from "../store/useIronHabitStore";
import { colors } from "../theme/colors";
import { FORM_HEADER_TOP_PADDING, FORM_SCREEN_EDGES } from "../theme/layout";
import { showValidationAlert, validationTitle } from "../utils/alerts";

const blankPlan = {
  name: "",
  description: "",
  goal: "Allenamento generale",
  level: "Base",
  expectedDuration: "45",
  recommendedFrequency: "",
  exercises: [],
  notes: ""
};

const SET_TABLE_WIDTHS = {
  set: 52
};

const targetsFor = (item: PlanExercise, exercise?: Exercise): PlanSetTarget[] =>
  normalizeWarmupOrder(Array.isArray(item.setTargets) && item.setTargets.length
    ? item.setTargets.map((target) => ({ ...createTrackingTarget(exercise), ...target }))
    : Array.from({ length: Math.max(1, Number(item.sets || 1)) }).map(() => ({
        ...createTrackingTarget(exercise, {
          type: item.type || "Normale",
          reps: Number(item.reps || 0),
          loadKg: Number(item.loadKg || 0),
          durationSeconds: Number(item.durationSeconds || 0),
          distanceKm: 0
        })
      })));

const hydratePlan = (plan, exercises: Exercise[]) => ({
  ...plan,
  exercises: plan.exercises.map((item) => ({
    ...item,
    setTargets: targetsFor(item, exercises.find((exercise) => exercise.id === item.exerciseId))
  }))
});

const getSetTypeMeta = (type: SetType, label: string): { label: string; background: string; text: string } => ({
  Normale: { label, background: colors.line, text: colors.text },
  Riscaldamento: { label: "W", background: colors.warningSoft, text: colors.warningText },
  "Drop set": { label: "D", background: colors.line, text: colors.text },
  Failure: { label: "F", background: colors.dangerSoft, text: colors.dangerText }
}[type]);

export function PlanFormScreen({ navigation, route }) {
  const id = route.params?.id;
  const exercises = useIronHabitStore((state) => state.exercises);
  const existing = useIronHabitStore((state) => state.plans.find((plan) => plan.id === id));
  const pendingPlanExerciseIds = useIronHabitStore((state) => state.pendingPlanExerciseIds);
  const clearPendingPlanExerciseIds = useIronHabitStore((state) => state.clearPendingPlanExerciseIds);
  const addPlan = useIronHabitStore((state) => state.addPlan);
  const updatePlan = useIronHabitStore((state) => state.updatePlan);
  const [form, setForm] = useState(() => hydratePlan(existing || blankPlan, exercises));

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  useFocusEffect(
    useCallback(() => {
      if (!pendingPlanExerciseIds?.length) return;
      setForm((current) => ({
        ...current,
        exercises: [
          ...current.exercises,
          ...pendingPlanExerciseIds.map((exerciseId, offset) =>
            {
              const exercise = exercises.find((item) => item.id === exerciseId);
              const target = createTrackingTarget(exercise);
              return createPlanExercise({
                exerciseId,
                order: current.exercises.length + offset + 1,
                sets: 1,
                reps: target.reps,
                loadKg: target.loadKg,
                durationSeconds: target.durationSeconds,
                setTargets: [{ ...target }]
              });
            }
          )
        ]
      }));
      clearPendingPlanExerciseIds();
    }, [clearPendingPlanExerciseIds, exercises, pendingPlanExerciseIds])
  );

  const openExercisePicker = () => {
    navigation.navigate("PlanExercisePicker", {
      excludedExerciseIds: form.exercises.map((item) => item.exerciseId)
    });
  };

  const updateRow = (index, patch) => {
    setField(
      "exercises",
      form.exercises.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  };

  const removeRow = (index) => {
    setField(
      "exercises",
      form.exercises
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({ ...item, order: itemIndex + 1 }))
    );
  };

  const moveRow = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= form.exercises.length) return;
    const next = form.exercises.slice();
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setField("exercises", next.map((item, itemIndex) => ({ ...item, order: itemIndex + 1 })));
  };

  const updateSetTarget = (exerciseIndex: number, setIndex: number, patch: Partial<PlanSetTarget>) => {
    const item = form.exercises[exerciseIndex];
    const exercise = exercises.find((entry) => entry.id === item.exerciseId);
    const setTargets = normalizeWarmupOrder(targetsFor(item, exercise).map((target, index) =>
      index === setIndex ? { ...target, ...patch } : target
    ));
    updateRow(exerciseIndex, { setTargets, sets: setTargets.length });
  };

  const addSet = (exerciseIndex: number) => {
    const item = form.exercises[exerciseIndex];
    const exercise = exercises.find((entry) => entry.id === item.exerciseId);
    const currentTargets = targetsFor(item, exercise);
    const previous = currentTargets.at(-1) || createTrackingTarget(exercise);
    const setTargets = normalizeWarmupOrder([
      ...currentTargets,
      {
        ...previous,
        type: isWarmupSet(previous) ? "Normale" : previous.type
      }
    ]);
    updateRow(exerciseIndex, { setTargets, sets: setTargets.length });
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const item = form.exercises[exerciseIndex];
    const exercise = exercises.find((entry) => entry.id === item.exerciseId);
    const currentTargets = targetsFor(item, exercise);
    if (currentTargets.length === 1) return;
    const setTargets = normalizeWarmupOrder(currentTargets.filter((_, index) => index !== setIndex));
    updateRow(exerciseIndex, { setTargets, sets: setTargets.length });
  };

  const cycleSetType = (exerciseIndex: number, setIndex: number) => {
    const item = form.exercises[exerciseIndex];
    const exercise = exercises.find((entry) => entry.id === item.exerciseId);
    const nextType = getNextSetType(targetsFor(item, exercise), setIndex);
    updateSetTarget(exerciseIndex, setIndex, { type: nextType });
  };

  const openExerciseMenu = (exerciseIndex: number, item: PlanExercise, exercise?: Exercise) => {
    const setTargets = targetsFor(item, exercise);
    const actions = [
      exerciseIndex > 0
        ? { text: "Sposta su", onPress: () => moveRow(exerciseIndex, -1) }
        : null,
      exerciseIndex < form.exercises.length - 1
        ? { text: "Sposta giu", onPress: () => moveRow(exerciseIndex, 1) }
        : null,
      setTargets.length > 1
        ? { text: "Rimuovi ultima serie", onPress: () => removeSet(exerciseIndex, setTargets.length - 1) }
        : null,
      { text: "Rimuovi esercizio", style: "destructive", onPress: () => removeRow(exerciseIndex) },
      { text: "Annulla", style: "cancel" }
    ].filter(Boolean) as any;

    Alert.alert(exercise?.name || "Esercizio", "Modifica questo esercizio.", actions);
  };

  const save = () => {
    if (!form.exercises.length) {
      Alert.alert(validationTitle, "Aggiungi almeno un esercizio prima di salvare.");
      return;
    }

    try {
      if (id) updatePlan(id, form);
      else addPlan(form);
      navigation.goBack();
    } catch (error) {
      showValidationAlert(error);
    }
  };

  if (!exercises.length) {
    return (
      <ScreenContainer className="p-4">
        <EmptyState
          title="Prima crea un esercizio"
          message="Le schede non possono essere vuote e devono riferirsi a esercizi validi."
          action={<AppButton title="Crea esercizio" variant="info" onPress={() => navigation.navigate("ExerciseForm")} />}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={FORM_SCREEN_EDGES}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View className="border-b border-iron-line bg-iron-card px-4 pb-5" style={{ paddingTop: FORM_HEADER_TOP_PADDING }}>
            <PageHeader title={id ? "Modifica scheda" : "Nuova scheda"} />
            <View className="gap-4">
              <AppInput label="Nome scheda" value={form.name} onChangeText={(value) => setField("name", value)} placeholder="Es. Push day" />
              <AppInput label="Descrizione (opzionale)" value={form.description} onChangeText={(value) => setField("description", value)} multiline placeholder="Obiettivo e indicazioni della scheda" />
            </View>
          </View>

          <View className="border-b border-iron-line bg-iron-card px-4 py-4">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="text-xl font-semibold text-iron-text">Esercizi</Text>
              <AppButton title="Aggiungi esercizi" icon={Plus} variant="info" size="sm" onPress={openExercisePicker} />
            </View>
          </View>

          <View>
            {form.exercises.map((item, exerciseIndex) => {
              const exercise = exercises.find((entry) => entry.id === item.exerciseId);
              const setTargets = targetsFor(item, exercise);
              const trackingFields = getTrackingFields(exercise);
              return (
                <View key={item.id || exerciseIndex} className="border-b border-iron-line bg-iron-card pb-8 pt-7">
                  <View className="mb-4 flex-row items-center gap-3 px-4">
                    <View className="h-14 w-14 items-center justify-center rounded-xl bg-iron-surface">
                      <Dumbbell size={24} color={colors.muted} />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text className="text-xl font-semibold leading-6 text-iron-text" numberOfLines={2}>
                        {exercise?.name || "Esercizio"}
                      </Text>
                      <Text className="mt-1 text-sm font-semibold text-iron-muted">
                        {setTargets.length} {setTargets.length === 1 ? "serie pianificata" : "serie pianificate"}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Opzioni ${exercise?.name || "esercizio"}`}
                      onPress={() => openExerciseMenu(exerciseIndex, item, exercise)}
                      className="h-12 w-12 items-center justify-center"
                    >
                      <MoreVertical size={30} color={colors.text} />
                    </Pressable>
                  </View>

                  <TextInput
                    accessibilityLabel={`Note per ${exercise?.name || "esercizio"}`}
                    value={item.notes}
                    onChangeText={(notes) => updateRow(exerciseIndex, { notes })}
                    placeholder="Note..."
                    placeholderTextColor={colors.muted}
                    multiline
                    className="mx-4 mb-5 min-h-10 px-0 py-0 text-lg text-iron-text"
                  />

                  <View className="mb-5 px-4">
                    <RestTimerSelect
                      inline
                      tone="primary"
                      label="Recupero"
                      value={item.restSeconds ?? 90}
                      onChange={(restSeconds) => updateRow(exerciseIndex, { restSeconds })}
                    />
                  </View>

                  <PlanSetTable
                    setTargets={setTargets}
                    trackingFields={trackingFields}
                    cycleSetType={(setIndex) => cycleSetType(exerciseIndex, setIndex)}
                    updateSetTarget={(setIndex, patch) => updateSetTarget(exerciseIndex, setIndex, patch)}
                  />

                  <View className="mt-5 flex-row gap-2 px-4">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Aggiungi serie a ${exercise?.name || "esercizio"}`}
                      onPress={() => addSet(exerciseIndex)}
                      className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-md border border-iron-line bg-iron-card px-3 py-2"
                    >
                      <Plus size={21} color={colors.text} />
                      <Text className="text-base font-semibold text-iron-text">Aggiungi serie</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}

            {!form.exercises.length ? (
              <View className="px-4 py-6">
                <EmptyState
                  title="Aggiungi il primo esercizio"
                  message="Cerca nella libreria, filtra per muscolo e seleziona più esercizi nell'ordine desiderato."
                  action={<AppButton title="Aggiungi esercizi" icon={Plus} variant="info" onPress={openExercisePicker} />}
                />
              </View>
            ) : null}
          </View>

          <View className="px-4 pt-5">
            <AppButton title="Salva scheda" icon={Save} variant="info" size="lg" className="min-h-16" disabled={!form.exercises.length} onPress={save} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function PlanSetTable({ setTargets, trackingFields, cycleSetType, updateSetTarget }) {
  return (
    <View>
      <View className="flex-row items-center px-4 pb-3">
        <TableHeaderCell width={SET_TABLE_WIDTHS.set}>SET</TableHeaderCell>
        {trackingFields.map((field) => (
          <TableHeaderCell key={field.key} flex={1}>{field.shortLabel.toUpperCase()}</TableHeaderCell>
        ))}
      </View>

      {setTargets.map((target, setIndex) => {
        const setTitle = getSetTitle(setTargets, setIndex);
        const meta = getSetTypeMeta(target.type, getSetBadgeLabel(setTargets, setIndex));
        const rowBackground = setIndex % 2 === 0 ? colors.card : colors.surface;

        return (
          <View key={setIndex} style={{ backgroundColor: rowBackground }}>
            <View className="min-h-20 flex-row items-center px-4">
              <View className="justify-center" style={{ width: SET_TABLE_WIDTHS.set }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Tipo ${setTitle}: ${target.type || "Normale"}`}
                  accessibilityHint="Tocca per cambiare tipo di serie"
                  onPress={() => cycleSetType(setIndex)}
                  className="h-11 w-11 items-center justify-center rounded-md border border-iron-line"
                  style={{ backgroundColor: meta.background }}
                >
                  <Text className="text-center text-xl font-semibold" style={{ color: meta.text }}>
                    {meta.label}
                  </Text>
                </Pressable>
              </View>

              {trackingFields.map((field) => (
                <View key={field.key} className="justify-center px-1" style={{ flex: 1 }}>
                  <TableNumberInput
                    accessibilityLabel={`${field.label} ${setTitle.toLowerCase()}`}
                    keyboardType={field.key === "loadKg" || field.key === "distanceKm" ? "decimal-pad" : "numeric"}
                    value={target[field.key]}
                    onChangeText={(value) => updateSetTarget(setIndex, { [field.key]: value })}
                  />
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function TableHeaderCell({ children, width, flex }: { children: any; width?: number; flex?: number }) {
  return (
    <View
      className="min-h-8 justify-center px-1"
      style={{ width, flex }}
    >
      <Text className="text-center text-base font-semibold uppercase text-iron-muted">{children}</Text>
    </View>
  );
}

function TableNumberInput({ value, onChangeText, accessibilityLabel, keyboardType }) {
  return (
    <TextInput
      accessibilityLabel={accessibilityLabel}
      keyboardType={keyboardType}
      value={String(value ?? "")}
      onChangeText={onChangeText}
      textAlign="center"
      placeholder="-"
      placeholderTextColor={colors.muted}
      className="min-h-14 px-0 py-0 text-center text-xl font-semibold text-iron-text"
    />
  );
}
