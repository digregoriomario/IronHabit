import { useFocusEffect } from "@react-navigation/native";
import { Dumbbell, GripVertical, Plus, Save, Trash2 } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { SET_TYPES } from "../../domain/constants";
import { createPlanExercise } from "../../domain/entities";
import { createTrackingTarget, getTrackingFields } from "../../domain/exerciseTracking";
import type { Exercise, PlanExercise, PlanSetTarget, SetType } from "../../domain/types";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { IconButton } from "../components/IconButton";
import { PageHeader } from "../components/PageHeader";
import { RestTimerSelect } from "../components/RestTimerSelect";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionHeader } from "../components/SectionHeader";
import { useIronHabitStore } from "../store/useIronHabitStore";
import { colors } from "../theme/colors";
import { showValidationAlert, validationTitle } from "../utils/alerts";

const blankPlan = {
  name: "",
  description: "",
  goal: "Allenamento generale",
  level: "Starter",
  expectedDuration: "45",
  recommendedFrequency: "",
  exercises: [],
  notes: ""
};

const targetsFor = (item: PlanExercise, exercise?: Exercise): PlanSetTarget[] =>
  Array.isArray(item.setTargets) && item.setTargets.length
    ? item.setTargets.map((target) => ({ ...createTrackingTarget(exercise), ...target }))
    : Array.from({ length: Math.max(1, Number(item.sets || 1)) }).map(() => ({
        ...createTrackingTarget(exercise, {
          type: item.type || "Normale",
          reps: Number(item.reps || 0),
          loadKg: Number(item.loadKg || 0),
          durationSeconds: Number(item.durationSeconds || 0),
          distanceKm: 0
        })
      }));

const hydratePlan = (plan, exercises: Exercise[]) => ({
  ...plan,
  exercises: plan.exercises.map((item) => ({
    ...item,
    setTargets: targetsFor(item, exercises.find((exercise) => exercise.id === item.exerciseId))
  }))
});

const getSetTypeMeta = (type: SetType): { label: string; background: string; text: string } => ({
  Normale: { label: "", background: colors.line, text: colors.text },
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
                sets: 3,
                reps: target.reps,
                loadKg: target.loadKg,
                durationSeconds: target.durationSeconds,
                setTargets: Array.from({ length: 3 }).map(() => ({ ...target }))
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

  const updateSetTarget = (exerciseIndex: number, setIndex: number, patch: Partial<PlanSetTarget>) => {
    const item = form.exercises[exerciseIndex];
    const exercise = exercises.find((entry) => entry.id === item.exerciseId);
    const setTargets = targetsFor(item, exercise).map((target, index) =>
      index === setIndex ? { ...target, ...patch } : target
    );
    updateRow(exerciseIndex, { setTargets, sets: setTargets.length });
  };

  const addSet = (exerciseIndex: number) => {
    const item = form.exercises[exerciseIndex];
    const exercise = exercises.find((entry) => entry.id === item.exerciseId);
    const currentTargets = targetsFor(item, exercise);
    const previous = currentTargets.at(-1) || createTrackingTarget(exercise);
    const setTargets = [...currentTargets, { ...previous }];
    updateRow(exerciseIndex, { setTargets, sets: setTargets.length });
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const item = form.exercises[exerciseIndex];
    const exercise = exercises.find((entry) => entry.id === item.exerciseId);
    const currentTargets = targetsFor(item, exercise);
    if (currentTargets.length === 1) return;
    const setTargets = currentTargets.filter((_, index) => index !== setIndex);
    updateRow(exerciseIndex, { setTargets, sets: setTargets.length });
  };

  const cycleSetType = (exerciseIndex: number, setIndex: number) => {
    const item = form.exercises[exerciseIndex];
    const exercise = exercises.find((entry) => entry.id === item.exerciseId);
    const currentType = targetsFor(item, exercise)[setIndex].type;
    const nextType = SET_TYPES[(SET_TYPES.indexOf(currentType) + 1) % SET_TYPES.length] as SetType;
    updateSetTarget(exerciseIndex, setIndex, { type: nextType });
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
    <ScreenContainer>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <PageHeader title={id ? "Modifica scheda" : "Nuova scheda"} />

          <View className="gap-4">
            <AppInput label="Nome scheda" value={form.name} onChangeText={(value) => setField("name", value)} placeholder="Es. Push day" />
            <AppInput label="Descrizione (opzionale)" value={form.description} onChangeText={(value) => setField("description", value)} multiline placeholder="Obiettivo e indicazioni della scheda" />
          </View>

          <SectionHeader
            title="Esercizi"
            action={<AppButton title="Aggiungi esercizi" icon={Plus} variant="info" onPress={openExercisePicker} />}
          />

          <View className="gap-4">
            {form.exercises.map((item, exerciseIndex) => {
              const exercise = exercises.find((entry) => entry.id === item.exerciseId);
              const setTargets = targetsFor(item, exercise);
              const trackingFields = getTrackingFields(exercise);
              return (
                <Card key={item.id || exerciseIndex} className="overflow-hidden p-0">
                  <View className="flex-row items-center gap-3 border-b border-iron-line p-4">
                    <View className="h-12 w-12 items-center justify-center rounded-md border border-iron-line bg-iron-surface">
                      <Dumbbell size={22} color={colors.text} />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text className="text-lg font-semibold leading-6 text-iron-text" numberOfLines={2}>{exercise?.name || "Esercizio"}</Text>
                      <Text className="mt-1 text-sm font-medium text-iron-muted">{exercise?.primaryMuscle || "Gruppo muscolare"}</Text>
                    </View>
                    <GripVertical size={20} color={colors.muted} />
                    <IconButton
                      label={`Rimuovi ${exercise?.name || "esercizio"}`}
                      icon={Trash2}
                      color={colors.danger}
                      onPress={() => removeRow(exerciseIndex)}
                    />
                  </View>

                  <View className="gap-3 p-4">
                    <TextInput
                      accessibilityLabel={`Note per ${exercise?.name || "esercizio"}`}
                      value={item.notes}
                      onChangeText={(notes) => updateRow(exerciseIndex, { notes })}
                      placeholder="Note esercizio"
                      placeholderTextColor={colors.muted}
                      multiline
                      className="min-h-12 rounded-md border border-iron-line bg-iron-card px-3 py-3 text-base font-normal text-iron-text"
                    />

                    <RestTimerSelect
                      label="Timer di recupero"
                      value={item.restSeconds ?? 90}
                      onChange={(restSeconds) => updateRow(exerciseIndex, { restSeconds })}
                    />

                    <View className="flex-row items-center gap-2 px-1">
                      <Text className="w-11 text-center text-xs font-semibold uppercase tracking-wide text-iron-muted">Set</Text>
                      {trackingFields.map((field) => (
                        <Text key={field.key} className="min-w-0 flex-1 text-center text-xs font-semibold uppercase tracking-wide text-iron-muted">
                          {field.shortLabel}
                        </Text>
                      ))}
                      <View className="w-11" />
                    </View>

                    {setTargets.map((target, setIndex) => {
                      const meta = getSetTypeMeta(target.type);
                      return (
                        <View key={`${item.id}-${setIndex}`} className="flex-row items-center gap-2">
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Tipo serie ${setIndex + 1}: ${target.type}`}
                            accessibilityHint="Tocca per cambiare tipo di serie"
                            onPress={() => cycleSetType(exerciseIndex, setIndex)}
                            className="h-11 w-11 items-center justify-center rounded-md border border-iron-line"
                            style={{ backgroundColor: meta.background }}
                          >
                            <Text className="font-semibold" style={{ color: meta.text }}>
                              {meta.label || setIndex + 1}
                            </Text>
                          </Pressable>
                          {trackingFields.map((field) => (
                            <SetInput
                              key={field.key}
                              label={`${field.label} serie ${setIndex + 1}`}
                              value={target[field.key]}
                              onChangeText={(value) => updateSetTarget(exerciseIndex, setIndex, { [field.key]: value })}
                            />
                          ))}
                          <IconButton
                            label={`Rimuovi serie ${setIndex + 1}`}
                            icon={Trash2}
                            color={colors.danger}
                            disabled={setTargets.length === 1}
                            onPress={() => removeSet(exerciseIndex, setIndex)}
                          />
                        </View>
                      );
                    })}

                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Aggiungi serie a ${exercise?.name || "esercizio"}`}
                      onPress={() => addSet(exerciseIndex)}
                      className="min-h-11 flex-row items-center justify-center gap-2 rounded-md border border-iron-line bg-iron-card"
                    >
                      <Plus size={18} color={colors.text} />
                      <Text className="font-semibold text-iron-text">Aggiungi serie</Text>
                    </Pressable>
                  </View>
                </Card>
              );
            })}

            {!form.exercises.length ? (
              <EmptyState
                title="Aggiungi il primo esercizio"
                message="Cerca nella libreria, filtra per muscolo e seleziona più esercizi nell'ordine desiderato."
                action={<AppButton title="Aggiungi esercizi" icon={Plus} variant="info" onPress={openExercisePicker} />}
              />
            ) : null}
          </View>

          <View className="mt-6">
            <AppButton title="Salva scheda" icon={Save} variant="info" disabled={!form.exercises.length} onPress={save} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function SetInput({ label, value, onChangeText }) {
  return (
    <TextInput
      accessibilityLabel={label}
      value={String(value ?? "")}
      onChangeText={onChangeText}
      keyboardType="numeric"
      placeholder="-"
      placeholderTextColor={colors.muted}
      className="h-11 min-w-0 flex-1 rounded-md border border-iron-line bg-iron-card px-2 text-center text-base font-normal text-iron-text"
    />
  );
}
