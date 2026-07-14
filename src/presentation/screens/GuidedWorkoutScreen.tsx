import {
  Check,
  ChevronDown,
  Dumbbell,
  MoreVertical,
  Plus,
  Trash2
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StatusBar, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  createTrackingTarget,
  formatTrackingValue,
  getTrackingFields
} from "../../domain/exerciseTracking";
import { getNextSetType, getSetBadgeLabel, getSetTitle, isWarmupSet, normalizeWarmupOrder } from "../../domain/setRules";
import { hasActiveWorkoutPlanChanges } from "../../usecases/guidedWorkoutUseCases";
import { playSetCompletionFeedback } from "../utils/sound";
import { AppButton } from "../components/AppButton";
import { Checkbox } from "../components/ui/checkbox";
import { EmptyState } from "../components/EmptyState";
import { RestTimerSelect } from "../components/RestTimerSelect";
import { ScreenContainer } from "../components/ScreenContainer";
import { useIronHabitStore } from "../store/useIronHabitStore";
import { colors } from "../theme/colors";
import { showValidationAlert } from "../utils/alerts";
import { formatSeconds } from "../utils/format";

const SET_TABLE_WIDTHS = {
  set: 52,
  ok: 60
};
const REST_TIMER_ACCENT = {
  bg: "#FEF3C7",
  border: "#F59E0B",
  text: "#92400E"
};

const getSetTypeMeta = (type, label) => {
  const setTypeMeta = {
    Normale: { label, bg: colors.card, text: colors.text },
    Riscaldamento: { label: "W", bg: colors.warningSoft, text: colors.warningText },
    "Drop set": { label: "D", bg: colors.line, text: colors.text },
    Failure: { label: "F", bg: colors.dangerSoft, text: colors.dangerText }
  };
  return setTypeMeta[type] || setTypeMeta.Normale;
};

export function GuidedWorkoutScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const exercises = useIronHabitStore((state) => state.exercises);
  const plans = useIronHabitStore((state) => state.plans);
  const workoutLogs = useIronHabitStore((state) => state.workoutLogs);
  const settings = useIronHabitStore((state) => state.settings);
  const activeWorkout = useIronHabitStore((state) => state.activeWorkout);
  const startWorkout = useIronHabitStore((state) => state.startWorkout);
  const replaceActiveWorkout = useIronHabitStore((state) => state.replaceActiveWorkout);
  const minimizeActiveWorkout = useIronHabitStore((state) => state.minimizeActiveWorkout);
  const discardActiveWorkout = useIronHabitStore((state) => state.discardActiveWorkout);
  const completeActiveWorkout = useIronHabitStore((state) => state.completeActiveWorkout);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const initializedRef = useRef(false);
  const topInset = Math.max(insets.top, Platform.OS === "android" ? StatusBar.currentHeight ?? 0 : 0);

  useEffect(() => {
    // Evita di creare una seconda sessione vuota mentre la modale si chiude dopo il salvataggio.
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (activeWorkout) return;
    if (route.params?.planId) startWorkout({ planId: route.params.planId });
    else if (route.params?.sessionId) startWorkout({ sessionId: route.params.sessionId });
    else startWorkout({ empty: true });
  }, [activeWorkout, route.params?.planId, route.params?.sessionId, startWorkout]);

  useEffect(() => {
    if (!activeWorkout?.restTimerEndsAt) {
      setSecondsLeft(0);
      return undefined;
    }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((activeWorkout.restTimerEndsAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [activeWorkout?.restTimerEndsAt]);

  useEffect(() => {
    if (!activeWorkout?.startedAt) return undefined;
    const tick = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - activeWorkout.startedAt) / 1000)));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout?.startedAt]);

  const totals = useMemo(() => {
    const sets = activeWorkout?.exercises.flatMap((exercise) => exercise.sets) || [];
    const completedSets = sets.filter((set) => set.completed);
    return {
      all: sets.length,
      completed: completedSets.length,
      volumeKg: completedSets.reduce((total, set) => total + Number(set.loadKg || 0) * Number(set.reps || 0), 0)
    };
  }, [activeWorkout]);

  const sourcePlan = useMemo(
    () => plans.find((plan) => plan.id === activeWorkout?.planId),
    [activeWorkout?.planId, plans]
  );

  const hasPlanChanges = useMemo(
    () => hasActiveWorkoutPlanChanges(activeWorkout, sourcePlan),
    [activeWorkout, sourcePlan]
  );

  if (!activeWorkout) {
    return (
      <ScreenContainer className="p-4">
        <EmptyState title="Preparazione allenamento..." />
      </ScreenContainer>
    );
  }

  const updateWorkout = (patch) => replaceActiveWorkout({ ...activeWorkout, ...patch });

  const updateExercise = (exerciseIndex, patch) => {
    updateWorkout({
      exercises: activeWorkout.exercises.map((exercise, index) =>
        index === exerciseIndex ? { ...exercise, ...patch } : exercise
      )
    });
  };

  const updateSet = (exerciseIndex, setIndex, patch) => {
    const workoutExercise = activeWorkout.exercises[exerciseIndex];
    const nextSet = { ...workoutExercise.sets[setIndex], ...patch };
    const shouldStartTimer = patch.completed === true && !workoutExercise.sets[setIndex].completed;
    const exerciseRestSeconds = Number(workoutExercise.restSeconds ?? nextSet.restSeconds ?? settings.defaultRestSeconds);
    const nextSetWithRest = { ...nextSet, restSeconds: exerciseRestSeconds };
    // Il recupero parte soltanto nel passaggio da serie aperta a serie completata.
    replaceActiveWorkout({
      ...activeWorkout,
      restTimerDuration: exerciseRestSeconds,
      restTimerEndsAt: shouldStartTimer
        ? Date.now() + exerciseRestSeconds * 1000
        : activeWorkout.restTimerEndsAt,
      exercises: activeWorkout.exercises.map((exercise, index) =>
        index !== exerciseIndex
          ? exercise
          : {
              ...exercise,
              sets: normalizeWarmupOrder(
                exercise.sets.map((set, indexOfSet) => indexOfSet === setIndex ? nextSetWithRest : set)
              )
            }
      )
    });
    if (shouldStartTimer) {
      playSetCompletionFeedback(settings);
    }
  };

  const updateExerciseRest = (exerciseIndex, restSeconds) => {
    const workoutExercise = activeWorkout.exercises[exerciseIndex];
    updateExercise(exerciseIndex, {
      restSeconds,
      sets: workoutExercise.sets.map((set) => ({ ...set, restSeconds }))
    });
  };

  const openExercisePicker = () => {
    navigation.navigate("PlanExercisePicker", {
      target: "activeWorkout",
      excludedExerciseIds: activeWorkout.exercises.map((exercise) => exercise.exerciseId)
    });
  };

  const removeExercise = (exerciseIndex) => {
    updateWorkout({ exercises: activeWorkout.exercises.filter((_, index) => index !== exerciseIndex) });
  };

  const moveExercise = (exerciseIndex, direction) => {
    const nextIndex = exerciseIndex + direction;
    if (nextIndex < 0 || nextIndex >= activeWorkout.exercises.length) return;
    const next = activeWorkout.exercises.slice();
    [next[exerciseIndex], next[nextIndex]] = [next[nextIndex], next[exerciseIndex]];
    updateWorkout({ exercises: next });
  };

  const addSet = (exerciseIndex) => {
    const workoutExercise = activeWorkout.exercises[exerciseIndex];
    const previous = workoutExercise.sets.at(-1);
    const exercise = exercises.find((item) => item.id === workoutExercise.exerciseId);
    const restSeconds = Number(workoutExercise.restSeconds ?? previous?.restSeconds ?? settings.defaultRestSeconds);
    updateExercise(exerciseIndex, {
      sets: normalizeWarmupOrder([
        ...workoutExercise.sets,
        {
          ...createTrackingTarget(exercise),
          ...previous,
          setNumber: workoutExercise.sets.length + 1,
          type: isWarmupSet(previous) ? "Normale" : previous?.type || "Normale",
          restSeconds,
          rpe: 0,
          completed: false
        }
      ])
    });
  };

  const removeSet = (exerciseIndex, setIndex) => {
    const workoutExercise = activeWorkout.exercises[exerciseIndex];
    if (workoutExercise.sets.length === 1) return;
    updateExercise(exerciseIndex, {
      sets: normalizeWarmupOrder(workoutExercise.sets
        .filter((_, index) => index !== setIndex)
        .map((set, index) => ({ ...set, setNumber: index + 1 })))
    });
  };

  const openExerciseMenu = (exerciseIndex, workoutExercise, exercise) => {
    const actions = [
      exerciseIndex > 0
        ? { text: "Sposta su", onPress: () => moveExercise(exerciseIndex, -1) }
        : null,
      exerciseIndex < activeWorkout.exercises.length - 1
        ? { text: "Sposta giu", onPress: () => moveExercise(exerciseIndex, 1) }
        : null,
      workoutExercise.sets.length > 1
        ? { text: "Rimuovi ultima serie", onPress: () => removeSet(exerciseIndex, workoutExercise.sets.length - 1) }
        : null,
      { text: "Rimuovi esercizio", style: "destructive", onPress: () => removeExercise(exerciseIndex) },
      { text: "Annulla", style: "cancel" }
    ].filter(Boolean) as any;

    Alert.alert(exercise?.name || "Esercizio", "Modifica questo esercizio.", actions);
  };

  const minimize = () => {
    minimizeActiveWorkout();
    navigation.goBack();
  };

  const deleteDraftWorkout = () => {
    discardActiveWorkout();
    navigation.goBack();
  };

  const confirmDeleteWorkout = () => {
    Alert.alert(
      "Eliminare allenamento?",
      "La sessione attiva verra eliminata e non sara salvata nello storico.",
      [
        { text: "Annulla", style: "cancel" },
        { text: "Elimina", style: "destructive", onPress: deleteDraftWorkout }
      ]
    );
  };

  const saveWorkout = (savePlanChanges = false) => {
    try {
      completeActiveWorkout({ savePlanChanges });
      navigation.goBack();
      Alert.alert(
        "Allenamento completato",
        savePlanChanges
          ? "La sessione è stata salvata nello storico e la scheda è stata aggiornata."
          : "La sessione è stata salvata nello storico."
      );
    } catch (error) {
      showValidationAlert(error);
    }
  };

  const confirmSaveWorkout = () => {
    if (hasPlanChanges) {
      Alert.alert(
        "Aggiornare anche la scheda?",
        "Durante l'allenamento hai modificato esercizi, ordine, serie o target. Vuoi salvare queste modifiche anche nella scheda di partenza?",
        [
          { text: "Annulla", style: "cancel" },
          { text: "Solo storico", onPress: () => saveWorkout(false) },
          { text: "Aggiorna scheda", onPress: () => saveWorkout(true) }
        ]
      );
      return;
    }

    saveWorkout(false);
  };

  const finish = () => {
    if (!activeWorkout.exercises.length) {
      Alert.alert("Allenamento vuoto", "Aggiungi almeno un esercizio prima di salvare.");
      return;
    }

    confirmSaveWorkout();
  };

  return (
    <ScreenContainer edges={["right", "left"]}>
      <View className="border-b border-iron-line bg-iron-card" style={{ paddingTop: topInset + 12 }}>
        <View className="flex-row items-center gap-2 px-4 pb-5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Riduci allenamento"
            onPress={minimize}
            className="h-12 w-12 items-center justify-center rounded-full border border-iron-line bg-iron-card"
          >
            <ChevronDown size={28} color={colors.text} />
          </Pressable>

          <Text className="min-w-0 flex-1 text-lg font-semibold text-iron-text" numberOfLines={1}>Allenamento</Text>

          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Elimina allenamento"
              onPress={confirmDeleteWorkout}
              className="h-12 w-12 items-center justify-center rounded-md border border-iron-danger bg-iron-dangerSoft"
            >
              <Trash2 size={22} color={colors.dangerText} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Completa allenamento"
              onPress={finish}
              className="h-12 w-12 items-center justify-center rounded-md border border-iron-success bg-iron-successSoft"
            >
              <Check size={24} color={colors.successText} />
            </Pressable>
          </View>
        </View>
      </View>

      <View className="border-b border-iron-line bg-iron-card px-4 py-5">
        <View className="flex-row items-center">
          <WorkoutMetric label="Durata" value={formatDurationShort(elapsedSeconds)} />
          <WorkoutMetric label="Volume" value={`${Math.round(totals.volumeKg)} kg`} />
          <WorkoutMetric label="Serie" value={`${totals.completed}/${totals.all}`} />
        </View>
        {activeWorkout.restTimerEndsAt && secondsLeft > 0 ? (
          <View
            className="mt-4 flex-row items-center justify-between rounded-md border px-4 py-3"
            style={{ backgroundColor: REST_TIMER_ACCENT.bg, borderColor: REST_TIMER_ACCENT.border }}
          >
            <Text className="font-semibold" style={{ color: REST_TIMER_ACCENT.text }}>Recupero</Text>
            <Text className="text-2xl font-semibold" style={{ color: REST_TIMER_ACCENT.text }}>{formatSeconds(secondsLeft)}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Aggiungi trenta secondi"
              onPress={() => replaceActiveWorkout({ ...activeWorkout, restTimerEndsAt: activeWorkout.restTimerEndsAt + 30000 })}
            >
              <Text className="font-semibold" style={{ color: REST_TIMER_ACCENT.text }}>+30s</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}>
        <View>
          {activeWorkout.exercises.map((workoutExercise, exerciseIndex) => {
            const exercise = exercises.find((item) => item.id === workoutExercise.exerciseId);
            const trackingFields = getTrackingFields(exercise);
            const restSeconds = Number(workoutExercise.restSeconds ?? workoutExercise.sets[0]?.restSeconds ?? settings.defaultRestSeconds);
            const completedForExercise = workoutExercise.sets.filter((set) => set.completed).length;
            return (
              <View key={workoutExercise.id} className="border-b border-iron-line bg-iron-card pb-8 pt-7">
                <View className="mb-4 flex-row items-center gap-3 px-4">
                  <View className="h-14 w-14 items-center justify-center rounded-xl bg-iron-surface">
                    <Dumbbell size={24} color={colors.muted} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-xl font-semibold leading-6 text-iron-text" numberOfLines={2}>
                      {exercise?.name || "Esercizio"}
                    </Text>
                    <Text className="mt-1 text-sm font-semibold text-iron-muted">
                      {completedForExercise}/{workoutExercise.sets.length} serie completate
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Opzioni ${exercise?.name || "esercizio"}`}
                    onPress={() => openExerciseMenu(exerciseIndex, workoutExercise, exercise)}
                    className="h-12 w-12 items-center justify-center"
                  >
                    <MoreVertical size={30} color={colors.text} />
                  </Pressable>
                </View>

                <TextInput
                  accessibilityLabel={`Note ${exercise?.name || "esercizio"}`}
                  value={workoutExercise.notes || ""}
                  onChangeText={(notes) => updateExercise(exerciseIndex, { notes })}
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
                    value={restSeconds}
                    onChange={(nextRestSeconds) => updateExerciseRest(exerciseIndex, nextRestSeconds)}
                  />
                </View>

                <SetTable
                  exercise={exercise}
                  workoutExercise={workoutExercise}
                  trackingFields={trackingFields}
                  workoutLogs={workoutLogs}
                  updateSet={(setIndex, patch) => updateSet(exerciseIndex, setIndex, patch)}
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
        </View>

        {!activeWorkout.exercises.length ? (
          <EmptyState title="Sessione vuota" message="Scegli un esercizio dal database per iniziare." />
        ) : null}

        <View className="px-4 pt-4">
          <AppButton title="Aggiungi esercizi" icon={Plus} variant="info" size="lg" className="min-h-16" onPress={openExercisePicker} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function SetTable({ exercise, workoutExercise, trackingFields, workoutLogs, updateSet }) {
  return (
    <View>
      <View className="flex-row items-center px-4 pb-3">
        <TableHeaderCell width={SET_TABLE_WIDTHS.set}>SET</TableHeaderCell>
        <TableHeaderCell flex={1.45}>PRECEDENTE</TableHeaderCell>
        {trackingFields.map((field) => (
          <TableHeaderCell key={field.key} flex={0.58}>{field.shortLabel.toUpperCase()}</TableHeaderCell>
        ))}
        <TableHeaderCell width={SET_TABLE_WIDTHS.ok}>✓</TableHeaderCell>
      </View>

      {workoutExercise.sets.map((set, setIndex) => {
        const previous = getPreviousSet(workoutLogs, workoutExercise.exerciseId, setIndex);
        const setTitle = getSetTitle(workoutExercise.sets, setIndex);
        const meta = getSetTypeMeta(set.type, getSetBadgeLabel(workoutExercise.sets, setIndex));
        const rowBackground = setIndex % 2 === 0 ? colors.card : colors.surface;
        const valueColor = set.completed ? colors.subtle : colors.text;

        return (
          <View key={`${workoutExercise.id}-${setIndex}`} style={{ backgroundColor: rowBackground }}>
            <View className="min-h-20 flex-row items-center px-4">
              <View className="justify-center" style={{ width: SET_TABLE_WIDTHS.set }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Tipo ${setTitle}: ${set.type || "Normale"}`}
                  accessibilityHint="Tocca per cambiare tipo di serie"
                  onPress={() => updateSet(setIndex, { type: getNextSetType(workoutExercise.sets, setIndex) })}
                  className="h-11 w-11 items-center justify-center rounded-md border border-iron-line"
                  style={{ backgroundColor: meta.bg }}
                >
                  <Text className="text-center text-xl font-semibold" style={{ color: meta.text }}>
                    {meta.label}
                  </Text>
                </Pressable>
              </View>

              <View className="justify-center px-2" style={{ flex: 1.45 }}>
                <Text className="text-center text-lg font-semibold text-iron-muted" numberOfLines={1}>
                  {formatTrackingValue(exercise, previous)}
                </Text>
              </View>

              {trackingFields.map((field) => (
                <View key={field.key} className="justify-center px-1" style={{ flex: 0.58 }}>
                  <TableNumberInput
                    accessibilityLabel={`${field.label} ${setTitle.toLowerCase()}`}
                    value={set[field.key]}
                    color={valueColor}
                    onChangeText={(value) => updateSet(setIndex, { [field.key]: value })}
                  />
                </View>
              ))}

              <View className="items-end justify-center" style={{ width: SET_TABLE_WIDTHS.ok }}>
                <Checkbox
                  checked={set.completed}
                  label={`${setTitle} completata`}
                  onCheckedChange={(checked) => updateSet(setIndex, { completed: checked })}
                />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function WorkoutMetric({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1">
      <Text className="text-base font-semibold text-iron-muted">{label}</Text>
      <Text className="mt-2 text-2xl font-semibold text-iron-text">{value}</Text>
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

function TableNumberInput({ value, onChangeText, accessibilityLabel, color }) {
  return (
    <TextInput
      accessibilityLabel={accessibilityLabel}
      keyboardType="numeric"
      value={String(value ?? "")}
      onChangeText={onChangeText}
      textAlign="center"
      className="min-h-14 px-0 py-0 text-center text-xl font-semibold"
      style={{ color }}
    />
  );
}

function formatDurationShort(value) {
  const seconds = Math.max(0, Math.floor(Number(value || 0)));
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${mins}m ${rest}s` : `${mins}m`;
}

function getPreviousSet(logs, exerciseId, setIndex) {
  const previousEntry = logs
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map((log) => log.exercises.find((exercise) => exercise.exerciseId === exerciseId))
    .find(Boolean);
  return previousEntry?.sets?.[setIndex] || previousEntry?.sets?.at(-1) || null;
}
