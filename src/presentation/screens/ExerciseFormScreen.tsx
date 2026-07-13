import { Save } from "lucide-react-native";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import { DIFFICULTIES, EQUIPMENT, MUSCLE_GROUPS } from "../../domain/constants";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { AppSelect } from "../components/AppSelect";
import { MultiSelect } from "../components/MultiSelect";
import { PageHeader } from "../components/PageHeader";
import { ScreenContainer } from "../components/ScreenContainer";
import { showValidationAlert } from "../utils/alerts";
import { useIronHabitStore } from "../store/useIronHabitStore";

const blankExercise = {
  name: "",
  description: "",
  primaryMuscle: "Full body",
  secondaryMuscles: [],
  difficulty: "Base",
  equipment: "Corpo libero",
  recommendedReps: "",
  estimatedDuration: "5",
  notes: ""
};

export function ExerciseFormScreen({ navigation, route }) {
  const id = route.params?.id;
  const existing = useIronHabitStore((state) => state.exercises.find((exercise) => exercise.id === id));
  const addExercise = useIronHabitStore((state) => state.addExercise);
  const updateExercise = useIronHabitStore((state) => state.updateExercise);
  const [form, setForm] = useState(() => existing || blankExercise);

  const secondaryOptions = useMemo(() => MUSCLE_GROUPS.filter((group) => group !== form.primaryMuscle), [form.primaryMuscle]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

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
    <ScreenContainer>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <PageHeader title={id ? "Modifica esercizio" : "Nuovo esercizio"} />

          <View className="gap-4">
            <AppInput label="Nome" value={form.name} onChangeText={(value) => setField("name", value)} placeholder="Es. Military press" />
            <AppInput label="Descrizione" value={form.description} onChangeText={(value) => setField("description", value)} multiline />
            <AppSelect label="Gruppo principale" options={MUSCLE_GROUPS} value={form.primaryMuscle} onChange={(value) => setField("primaryMuscle", value)} />
            <MultiSelect label="Gruppi secondari" options={secondaryOptions} value={form.secondaryMuscles} onChange={(value) => setField("secondaryMuscles", value)} />
            <AppSelect label="Difficolta" options={DIFFICULTIES} value={form.difficulty} onChange={(value) => setField("difficulty", value)} />
            <AppSelect label="Attrezzatura" options={EQUIPMENT} value={form.equipment} onChange={(value) => setField("equipment", value)} />
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
