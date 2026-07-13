import { Plus, Save, Trash2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";

import { SET_TYPES } from "../../domain/constants";
import { createId } from "../../domain/entities";
import {
  createTrackingTarget,
  formatTrackingValue,
  getTrackingFields
} from "../../domain/exerciseTracking";
import { AppButton } from "../components/AppButton";
import { AppInput } from "../components/AppInput";
import { AppSelect } from "../components/AppSelect";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { EntitySelect } from "../components/EntitySelect";
import { IconButton } from "../components/IconButton";
import { PageHeader } from "../components/PageHeader";
import { RestTimerSelect } from "../components/RestTimerSelect";
import { ScreenContainer } from "../components/ScreenContainer";
import { SectionHeader } from "../components/SectionHeader";
import { Checkbox } from "../components/ui/checkbox";
import { colors } from "../theme/colors";
import { showValidationAlert } from "../utils/alerts";
import { formatDate, fromDateInput, toDateInput } from "../utils/date";
import { supersetOptions } from "../utils/labels";
import { useIronHabitStore } from "../store/useIronHabitStore";

const blankLog = {
  date: new Date().toISOString(),
  planId: null,
  sessionId: null,
  durationMinutes: "45",
  fatigue: "5",
  exercises: [],
  notes: ""
};

const fromPlan = (plan, exercises) => ({
  planId: plan.id,
  exercises: plan.exercises.map((item) => ({
    id: createId("done"),
    exerciseId: item.exerciseId,
    supersetGroup: item.supersetGroup || "",
    sets: (
      Array.isArray(item.setTargets) && item.setTargets.length
        ? item.setTargets
        : Array.from({ length: Number(item.sets || 1) }).map(() => ({
            type: item.type || "Normale",
            reps: item.reps,
            loadKg: item.loadKg,
            durationSeconds: item.durationSeconds,
            distanceKm: item.distanceKm
          }))
    ).map((target, index) => ({
      setNumber: index + 1,
      ...createTrackingTarget(
        exercises.find((exercise) => exercise.id === item.exerciseId),
        target
      ),
      restSeconds: Number(item.restSeconds || 0),
      rpe: 0,
      completed: true
    })),
    notes: item.notes || ""
  }))
});

const getPreviousExerciseSummary = (logs, exercise, exerciseId, currentLogId) => {
  const previous = logs
    .filter((log) => log.id !== currentLogId)
    .map((log) => {
      const entry = log.exercises.find((item) => item.exerciseId === exerciseId);
      if (!entry) return null;
      const completedSets = entry.sets.filter((set) => set.completed);
      if (!completedSets.length) return null;
      return {
        date: log.date,
        sets: completedSets.length,
        lastSet: completedSets.at(-1)
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  if (!previous) return null;

  return `Ultima volta (${formatDate(previous.date)}): ${previous.sets} serie · ultima ${formatTrackingValue(exercise, previous.lastSet)}.`;
};

const getSetTypeMeta = (type, index) => {
  const setTypeMeta = {
    Normale: { label: "1", bg: colors.line, text: colors.text },
    Riscaldamento: { label: "W", bg: colors.warningSoft, text: colors.warningText },
    "Drop set": { label: "D", bg: colors.line, text: colors.text },
    Failure: { label: "F", bg: colors.dangerSoft, text: colors.dangerText }
  };
  const meta = setTypeMeta[type] || setTypeMeta.Normale;
  return type === "Normale" ? { ...meta, label: `${index + 1}` } : meta;
};

export function WorkoutLogFormScreen({ navigation, route }) {
  const id = route.params?.id;
  const plans = useIronHabitStore((state) => state.plans);
  const exercises = useIronHabitStore((state) => state.exercises);
  const sessions = useIronHabitStore((state) => state.plannedSessions);
  const logs = useIronHabitStore((state) => state.workoutLogs);
  const existing = useIronHabitStore((state) => state.workoutLogs.find((log) => log.id === id));
  const updateWorkoutLog = useIronHabitStore((state) => state.updateWorkoutLog);
  const [form, setForm] = useState(() => existing || blankLog);
  const [dateText, setDateText] = useState(() => toDateInput(existing?.date || blankLog.date));

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const currentPlan = useMemo(() => plans.find((plan) => plan.id === form.planId), [plans, form.planId]);

  const loadPlan = () => {
    if (!currentPlan) return;
    setForm((current) => ({ ...current, ...fromPlan(currentPlan, exercises) }));
  };

  const addExercise = () => {
    if (!exercises.length) return;
    const target = createTrackingTarget(exercises[0]);
    setField("exercises", [
      ...form.exercises,
      {
        id: createId("done"),
        exerciseId: exercises[0].id,
        supersetGroup: "",
        sets: [{ setNumber: 1, ...target, restSeconds: 90, rpe: 0, completed: true }],
        notes: ""
      }
    ]);
  };

  const updateExercise = (index, patch) => {
    setField(
      "exercises",
      form.exercises.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
  };

  const removeExercise = (index) => {
    setField(
      "exercises",
      form.exercises.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const updateSet = (exerciseIndex, setIndex, patch) => {
    const item = form.exercises[exerciseIndex];
    updateExercise(exerciseIndex, {
      sets: item.sets.map((set, index) => (index === setIndex ? { ...set, ...patch } : set))
    });
  };

  const addSet = (exerciseIndex) => {
    const item = form.exercises[exerciseIndex];
    updateExercise(exerciseIndex, {
      sets: [
        ...item.sets,
        {
          setNumber: item.sets.length + 1,
          type: item.sets.at(-1)?.type || "Normale",
          reps: item.sets.at(-1)?.reps || 10,
          loadKg: item.sets.at(-1)?.loadKg || 0,
          durationSeconds: item.sets.at(-1)?.durationSeconds || 0,
          distanceKm: item.sets.at(-1)?.distanceKm || 0,
          restSeconds: item.sets.at(-1)?.restSeconds || 90,
          rpe: item.sets.at(-1)?.rpe || 0,
          completed: true
        }
      ]
    });
  };

  const removeSet = (exerciseIndex, setIndex) => {
    const item = form.exercises[exerciseIndex];
    updateExercise(exerciseIndex, { sets: item.sets.filter((_, index) => index !== setIndex) });
  };

  const save = () => {
    const payload = { ...form, date: fromDateInput(dateText) };
    try {
      if (id) {
        updateWorkoutLog(id, payload);
      }
      navigation.goBack();
    } catch (error) {
      showValidationAlert(error);
    }
  };

  if (!id) {
    return (
      <ScreenContainer className="p-4">
        <EmptyState
          title="Avvia un allenamento"
          message="Lo storico si aggiorna quando completi una sessione guidata. Da qui puoi solo modificare workout gia salvati."
          action={<AppButton title="Avvia sessione libera" variant="success" onPress={() => navigation.navigate("GuidedWorkout")} />}
        />
      </ScreenContainer>
    );
  }

  if (!exercises.length) {
    return (
      <ScreenContainer className="p-4">
        <EmptyState title="Prima crea un esercizio" action={<AppButton title="Crea esercizio" variant="info" onPress={() => navigation.navigate("ExerciseForm")} />} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <PageHeader title="Modifica workout" />

          <View className="gap-4">
            <AppInput label="Data YYYY-MM-DD" value={dateText} onChangeText={setDateText} />
            <EntitySelect label="Scheda" items={plans} value={form.planId} onChange={(value) => setField("planId", value)} />
            <EntitySelect label="Sessione pianificata" items={sessions.map((session) => ({ id: session.id, name: session.title }))} value={form.sessionId} onChange={(value) => setField("sessionId", value)} />
            <View className="flex-row gap-3">
              <AppInput className="flex-1" label="Durata min" keyboardType="numeric" value={form.durationMinutes} onChangeText={(value) => setField("durationMinutes", value)} />
              <AppInput className="flex-1" label="Fatica 1-10" keyboardType="numeric" value={form.fatigue} onChangeText={(value) => setField("fatigue", value)} />
            </View>
            <AppInput label="Note" value={form.notes} onChangeText={(value) => setField("notes", value)} multiline />
            {currentPlan ? <AppButton title="Carica esercizi dalla scheda" variant="secondary" onPress={loadPlan} /> : null}
          </View>

          <SectionHeader title="Esercizi svolti" action={<AppButton title="Aggiungi" icon={Plus} variant="info" onPress={addExercise} />} />
          <View className="gap-3">
            {form.exercises.map((item, exerciseIndex) => {
              const exercise = exercises.find((entry) => entry.id === item.exerciseId);
              const trackingFields = getTrackingFields(exercise);
              const previousSummary = getPreviousExerciseSummary(logs, exercise, item.exerciseId, id);
              return (
                <Card key={item.id || exerciseIndex} className="gap-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="min-w-0 flex-1 text-lg font-semibold leading-6 text-iron-text" numberOfLines={2}>{exercise?.name || "Esercizio"}</Text>
                    <IconButton label={`Rimuovi ${exercise?.name || "esercizio"}`} icon={Trash2} color={colors.danger} onPress={() => removeExercise(exerciseIndex)} />
                  </View>
                  <EntitySelect
                    label="Esercizio"
                    items={exercises}
                    value={item.exerciseId}
                    onChange={(value) => {
                      const nextExercise = exercises.find((entry) => entry.id === value);
                      updateExercise(exerciseIndex, {
                        exerciseId: value,
                        sets: item.sets.map((set) => ({
                          ...set,
                          ...createTrackingTarget(nextExercise, { type: set.type })
                        }))
                      });
                    }}
                    emptyLabel="Scegli"
                  />
                  <AppSelect label="Superset" options={supersetOptions} value={item.supersetGroup || ""} onChange={(value) => updateExercise(exerciseIndex, { supersetGroup: value })} />
                  {previousSummary ? (
                    <View className="rounded-md border border-iron-line bg-iron-bg p-3" accessibilityRole="summary">
                      <Text className="text-base font-medium text-iron-text">{previousSummary}</Text>
                    </View>
                  ) : null}
                  {item.sets.map((set, setIndex) => {
                    const meta = getSetTypeMeta(set.type, setIndex);
                    return (
                    <View
                      key={setIndex}
                      className="rounded-md border p-3"
                      style={{
                        backgroundColor: colors.card,
                        borderColor: set.completed ? colors.text : colors.line
                      }}
                    >
                      <View className="mb-2 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <View className="h-8 w-8 items-center justify-center rounded-md border border-iron-line" style={{ backgroundColor: meta.bg }}>
                            <Text className="text-sm font-semibold" style={{ color: meta.text }}>{meta.label}</Text>
                          </View>
                          <Text className="text-base font-semibold text-iron-text">Serie {setIndex + 1}</Text>
                        </View>
                        <IconButton label={`Rimuovi serie ${setIndex + 1}`} icon={Trash2} color={colors.danger} onPress={() => removeSet(exerciseIndex, setIndex)} />
                      </View>
                      <AppSelect horizontal={false} label="Tipo serie" options={SET_TYPES} value={set.type || "Normale"} onChange={(value) => updateSet(exerciseIndex, setIndex, { type: value })} />
                      <View className="mt-2 flex-row gap-2">
                        {trackingFields.map((field) => (
                          <AppInput
                            key={field.key}
                            className="min-w-0 flex-1"
                            label={field.label}
                            keyboardType="numeric"
                            value={set[field.key]}
                            onChangeText={(value) => updateSet(exerciseIndex, setIndex, { [field.key]: value })}
                          />
                        ))}
                      </View>
                      <View className="mt-2 flex-row gap-2">
                        <View className="flex-1">
                          <RestTimerSelect
                            label="Recupero"
                            value={set.restSeconds}
                            onChange={(restSeconds) => updateSet(exerciseIndex, setIndex, { restSeconds })}
                          />
                        </View>
                        <AppInput className="flex-1" label="RPE" keyboardType="numeric" value={set.rpe} onChangeText={(value) => updateSet(exerciseIndex, setIndex, { rpe: value })} />
                      </View>
                      <View className="mt-2 flex-row items-center gap-3 rounded-md border border-iron-line bg-iron-card px-3 py-2">
                        <Checkbox
                          checked={Boolean(set.completed)}
                          label={`Serie ${setIndex + 1} completata`}
                          onCheckedChange={(value) => updateSet(exerciseIndex, setIndex, { completed: value })}
                        />
                        <Text className="text-sm font-semibold text-iron-text">Serie completata</Text>
                      </View>
                    </View>
                    );
                  })}
                  <View className="flex-row gap-2">
                    <AppButton title="Aggiungi serie" className="flex-1" variant="info" onPress={() => addSet(exerciseIndex)} />
                  </View>
                </Card>
              );
            })}
            {!form.exercises.length ? <EmptyState title="Nessun esercizio registrato" message="Aggiungi almeno un esercizio per salvare il workout." /> : null}
          </View>

          <View className="mt-5">
            <AppButton title="Salva allenamento" icon={Save} variant="info" onPress={save} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
