import { Save } from "lucide-react-native";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import { DIFFICULTIES, EQUIPMENT, EXERCISE_TRACKING_TYPE_VALUES, EXERCISE_TRACKING_TYPES, MUSCLE_GROUPS } from "../../domain/constants";
import { inferExerciseTrackingType } from "../../domain/exerciseTracking";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { AppSelect } from "../components/AppSelect";
import { PageHeader } from "../components/PageHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { FORM_SCREEN_EDGES, FORM_SCROLL_CONTENT_STYLE } from "../theme/layout";
import { showValidationAlert } from "../utils/alerts";
import { useIronHabitStore } from "../store/useIronHabitStore";

const blankExercise: any = {
  name: "",
  trackingType: "reps_weight",
  description: "",
  primaryMuscle: "Full body",
  secondaryMuscles: [],
  difficulty: "Base",
  equipment: "Corpo libero",
  recommendedReps: "",
  estimatedDuration: "5",
  notes: ""
};

const normalizeForm = (input: any = blankExercise) => {
  const next = {
    ...blankExercise,
    ...input,
    trackingType: EXERCISE_TRACKING_TYPE_VALUES.includes(input.trackingType)
      ? input.trackingType
      : inferExerciseTrackingType(input)
  };
  const primaryMuscle = MUSCLE_GROUPS.includes(next.primaryMuscle) ? next.primaryMuscle : "Full body";
  return {
    ...next,
    primaryMuscle,
    secondaryMuscles: Array.isArray(next.secondaryMuscles)
      ? next.secondaryMuscles.filter((group) => MUSCLE_GROUPS.includes(group) && group !== primaryMuscle).slice(0, 1)
      : []
  };
};

export function ExerciseFormScreen({ navigation, route }) {
  const id = route.params?.id;
  const existing = useIronHabitStore((state) => state.exercises.find((exercise) => exercise.id === id));
  const addExercise = useIronHabitStore((state) => state.addExercise);
  const updateExercise = useIronHabitStore((state) => state.updateExercise);
  const [form, setForm] = useState(() => normalizeForm(existing || blankExercise));

  const secondaryOptions = useMemo(() => MUSCLE_GROUPS.filter((group) => group !== form.primaryMuscle), [form.primaryMuscle]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const setPrimaryMuscle = (primaryMuscle) => setForm((current) => ({
    ...current,
    primaryMuscle,
    secondaryMuscles: current.secondaryMuscles?.[0] === primaryMuscle ? [] : current.secondaryMuscles
  }));

  const save = () => {
    try {
      if (id) {
        updateExercise(id, form);
      } else {
        addExercise(form);
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
          <PageHeader title={id ? "Modifica esercizio" : "Nuovo esercizio"} />

          <View className="gap-4">
            <AppInput label="Nome" value={form.name} onChangeText={(value) => setField("name", value)} placeholder="Es. Military press" />
            <AppSelect
              label="Tipo esercizio"
              options={EXERCISE_TRACKING_TYPES}
              value={form.trackingType}
              onChange={(value) => setField("trackingType", value)}
              variant="dropdown"
            />
            <AppInput label="Descrizione" value={form.description} onChangeText={(value) => setField("description", value)} multiline />
            <AppSelect label="Gruppo principale" options={MUSCLE_GROUPS} value={form.primaryMuscle} onChange={setPrimaryMuscle} variant="dropdown" />
            <AppSelect
              label="Gruppo secondario"
              options={[{ value: "", label: "Nessuno" }, ...secondaryOptions]}
              value={form.secondaryMuscles?.[0] || ""}
              onChange={(value) => setField("secondaryMuscles", value ? [value] : [])}
              variant="dropdown"
            />
            <AppSelect label="Difficolta" options={DIFFICULTIES} value={form.difficulty} onChange={(value) => setField("difficulty", value)} variant="dropdown" />
            <AppSelect label="Attrezzatura" options={EQUIPMENT} value={form.equipment} onChange={(value) => setField("equipment", value)} variant="dropdown" />
            <AppInput label="Ripetizioni consigliate" value={form.recommendedReps} onChangeText={(value) => setField("recommendedReps", value)} placeholder="Es. 8-12" />
            <AppInput label="Durata stimata minuti" value={form.estimatedDuration} keyboardType="numeric" onChangeText={(value) => setField("estimatedDuration", value)} />
            <AppInput label="Note" value={form.notes} onChangeText={(value) => setField("notes", value)} multiline />
            <AppButton title="Salva esercizio" icon={Save} variant="info" onPress={save} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
