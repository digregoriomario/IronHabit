import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";

import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { AppSelect } from "../components/AppSelect";
import { EntitySelect } from "../components/EntitySelect";
import { IconButton } from "../components/IconButton";
import { PageHeader } from "../components/PageHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { maxLoadForExercise, maxRepsForExercise } from "../../usecases/goalProgressUseCase";
import { colors } from "../theme/colors";
import { FORM_SCREEN_EDGES, FORM_SCROLL_CONTENT_STYLE } from "../theme/layout";
import { showValidationAlert } from "../utils/alerts";
import { addWeeks, formatWeekRange, startOfLocalWeek, toLocalDateKey } from "../utils/date";
import { goalCategoryOptions } from "../utils/labels";
import { useIronHabitStore } from "../store/useIronHabitStore";

const blankGoal = {
  title: "",
  description: "",
  category: "frequency",
  targetValue: "",
  currentValue: "0",
  startDate: new Date().toISOString(),
  deadline: "",
  status: "in_progress",
  relatedExerciseId: null,
  notes: ""
};

const goalToForm = (goal) => ({
  ...blankGoal,
  ...goal,
  targetValue: String(goal?.targetValue ?? blankGoal.targetValue),
  currentValue: String(goal?.currentValue ?? blankGoal.currentValue),
  relatedExerciseId: goal?.relatedExerciseId || null,
  notes: goal?.notes || ""
});

export function GoalFormScreen({ navigation, route }) {
  const id = route.params?.id;
  const exercises = useIronHabitStore((state) => state.exercises);
  const workoutLogs = useIronHabitStore((state) => state.workoutLogs);
  const existing = useIronHabitStore((state) => state.goals.find((goal) => goal.id === id));
  const addGoal = useIronHabitStore((state) => state.addGoal);
  const updateGoal = useIronHabitStore((state) => state.updateGoal);
  const currentWeekStart = useMemo(() => startOfLocalWeek(), []);
  const [form, setForm] = useState(() => goalToForm(existing || blankGoal));
  const [weekStart, setWeekStart] = useState(() => startOfLocalWeek(existing?.startDate || blankGoal.startDate));
  const currentLoadRecord = useMemo(
    () => form.relatedExerciseId ? maxLoadForExercise(workoutLogs, form.relatedExerciseId) : 0,
    [form.relatedExerciseId, workoutLogs]
  );
  const currentRepsRecord = useMemo(
    () => form.relatedExerciseId ? maxRepsForExercise(workoutLogs, form.relatedExerciseId) : 0,
    [form.relatedExerciseId, workoutLogs]
  );

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const changeCategory = (category) => {
    setForm((current) => ({
      ...current,
      category,
      targetValue: "",
      relatedExerciseId: null
    }));
  };
  const targetText = String(form.targetValue ?? "").trim();
  const targetNumber = Number(targetText);
  const sameTargetAsBefore =
    existing &&
    existing.category === form.category &&
    existing.relatedExerciseId === form.relatedExerciseId &&
    Number(existing.targetValue) === targetNumber;
  const validPositiveNumber = targetText.length > 0 && Number.isFinite(targetNumber) && targetNumber > 0;
  const isSaveDisabled = useMemo(() => {
    if (form.category === "frequency") {
      return !validPositiveNumber || !Number.isInteger(targetNumber) || targetNumber < 1 || targetNumber > 7;
    }
    if (form.category === "load") {
      return !form.relatedExerciseId || !validPositiveNumber || (!sameTargetAsBefore && targetNumber <= currentLoadRecord);
    }
    if (form.category === "reps") {
      return (
        !form.relatedExerciseId ||
        !validPositiveNumber ||
        !Number.isInteger(targetNumber) ||
        (!sameTargetAsBefore && targetNumber <= currentRepsRecord)
      );
    }
    return true;
  }, [currentLoadRecord, currentRepsRecord, form.category, form.relatedExerciseId, sameTargetAsBefore, targetNumber, validPositiveNumber]);
  const canGoPreviousWeek = toLocalDateKey(weekStart) > toLocalDateKey(currentWeekStart);
  const changeWeek = (amount) => {
    setWeekStart((current) => {
      const next = addWeeks(current, amount);
      return next.getTime() < currentWeekStart.getTime() ? currentWeekStart : next;
    });
  };

  const save = () => {
    const isFrequency = form.category === "frequency";
    const payload = {
      ...form,
      title: "",
      description: "",
      currentValue: existing?.currentValue || 0,
      startDate: isFrequency ? weekStart.toISOString() : (existing?.startDate || new Date().toISOString()),
      deadline: "",
      status: "in_progress",
      relatedExerciseId: isFrequency ? null : form.relatedExerciseId
    };
    try {
      if (id) {
        updateGoal(id, payload);
      } else {
        addGoal(payload);
      }
      navigation.goBack();
    } catch (error) {
      showValidationAlert(error);
    }
  };
  return (
    <ScreenContainer edges={FORM_SCREEN_EDGES}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={FORM_SCROLL_CONTENT_STYLE}>
          <PageHeader title={id ? "Modifica obiettivo" : "Nuovo obiettivo"} />

          <View className="gap-4">
            <AppSelect label="Categoria" options={goalCategoryOptions} value={form.category} onChange={changeCategory} />

            {form.category === "frequency" ? (
              <>
                <View className="gap-2">
                  <Text className="text-sm font-bold uppercase tracking-wide text-iron-muted">Settimana</Text>
                  <View className="min-h-14 flex-row items-center justify-between rounded-md border border-iron-line bg-iron-card px-3 py-2">
                    <IconButton
                      icon={ChevronLeft}
                      label="Settimana precedente"
                      color={colors.info}
                      disabled={!canGoPreviousWeek}
                      onPress={() => changeWeek(-1)}
                    />
                    <Text className="flex-1 px-3 text-center text-base font-semibold text-iron-text">
                      {formatWeekRange(weekStart)}
                    </Text>
                    <IconButton
                      icon={ChevronRight}
                      label="Settimana successiva"
                      color={colors.info}
                      onPress={() => changeWeek(1)}
                    />
                  </View>
                </View>
                <AppInput
                  label="Quanti giorni ti vuoi allenare questa settimana?"
                  keyboardType="numeric"
                  value={form.targetValue}
                  onChangeText={(value) => setField("targetValue", value)}
                  accessibilityHint="Minimo 1, massimo 7"
                />
                <Text className="text-xs font-medium leading-5 text-iron-muted">
                  L'obiettivo viene raggiunto automaticamente contando i giorni con almeno un workout completato in quella settimana.
                </Text>
              </>
            ) : null}

            {form.category === "load" ? (
              <>
                <EntitySelect
                  label="Esercizio"
                  items={exercises}
                  value={form.relatedExerciseId}
                  onChange={(value) => setField("relatedExerciseId", value)}
                  includeEmpty={false}
                  helperText={exercises.length ? undefined : "Crea prima un esercizio."}
                  variant="dropdown"
                />
                <Text className="text-xs font-medium leading-5 text-iron-muted">
                  Record attuale: {currentLoadRecord} kg. Il nuovo target deve essere superiore.
                </Text>
                <AppInput
                  label="Carico da raggiungere (kg)"
                  keyboardType="numeric"
                  value={form.targetValue}
                  onChangeText={(value) => setField("targetValue", value)}
                />
              </>
            ) : null}

            {form.category === "reps" ? (
              <>
                <EntitySelect
                  label="Esercizio"
                  items={exercises}
                  value={form.relatedExerciseId}
                  onChange={(value) => setField("relatedExerciseId", value)}
                  includeEmpty={false}
                  helperText={exercises.length ? undefined : "Crea prima un esercizio."}
                  variant="dropdown"
                />
                <Text className="text-xs font-medium leading-5 text-iron-muted">
                  Record attuale: {currentRepsRecord} ripetizioni. Il nuovo target deve essere superiore.
                </Text>
                <AppInput
                  label="Ripetizioni da raggiungere"
                  keyboardType="numeric"
                  value={form.targetValue}
                  onChangeText={(value) => setField("targetValue", value)}
                />
              </>
            ) : null}

            <AppInput label="Note" value={form.notes} onChangeText={(value) => setField("notes", value)} multiline />
            <AppButton title="Imposta obiettivo" variant="info" disabled={isSaveDisabled} onPress={save} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
