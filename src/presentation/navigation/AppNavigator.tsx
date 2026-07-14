import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ClipboardList, Clock3, Dumbbell, House, Play, Target, Trash2 } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DashboardScreen } from "../screens/DashboardScreen";
import { ExerciseDetailScreen } from "../screens/ExerciseDetailScreen";
import { ExerciseFormScreen } from "../screens/ExerciseFormScreen";
import { ExerciseListScreen } from "../screens/ExerciseListScreen";
import { GoalDetailScreen } from "../screens/GoalDetailScreen";
import { GoalFormScreen } from "../screens/GoalFormScreen";
import { GoalListScreen } from "../screens/GoalListScreen";
import { GuidedWorkoutScreen } from "../screens/GuidedWorkoutScreen";
import { InitialSetupScreen } from "../screens/InitialSetupScreen";
import { PlanDetailScreen } from "../screens/PlanDetailScreen";
import { PlanExercisePickerScreen } from "../screens/PlanExercisePickerScreen";
import { PlanFormScreen } from "../screens/PlanFormScreen";
import { PlanListScreen } from "../screens/PlanListScreen";
import { SessionDetailScreen } from "../screens/SessionDetailScreen";
import { SessionFormScreen } from "../screens/SessionFormScreen";
import { SessionListScreen } from "../screens/SessionListScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { WorkoutDetailScreen } from "../screens/WorkoutDetailScreen";
import { WorkoutHistoryScreen } from "../screens/WorkoutHistoryScreen";
import { normalizeThemeMode, themePalettes } from "../theme/colors";
import { useIronHabitStore } from "../store/useIronHabitStore";
import { formatSeconds } from "../utils/format";
import { playTimerFeedback } from "../utils/sound";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const TIMER_COMPLETION_GRACE_MS = 10000;
const REST_TIMER_ACCENT = {
  bg: "#FEF3C7",
  border: "#F59E0B",
  text: "#92400E"
};

const formatElapsedTime = (value) => {
  const seconds = Math.max(0, Math.floor(Number(value || 0)));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
  return `${rest}s`;
};

function ActiveWorkoutFeedbackWatcher() {
  const restTimerEndsAt = useIronHabitStore((state) => state.activeWorkout?.restTimerEndsAt ?? null);
  const settings = useIronHabitStore((state) => state.settings);
  const notifiedTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!restTimerEndsAt) {
      notifiedTimerRef.current = null;
      return undefined;
    }

    const notifyIfNeeded = () => {
      const delay = Date.now() - restTimerEndsAt;
      if (delay < 0 || delay > TIMER_COMPLETION_GRACE_MS || notifiedTimerRef.current === restTimerEndsAt) return;
      notifiedTimerRef.current = restTimerEndsAt;
      void playTimerFeedback({
        soundEnabled: settings.soundEnabled,
        vibrationEnabled: settings.vibrationEnabled
      });
    };

    notifyIfNeeded();
    const timeout = setTimeout(notifyIfNeeded, Math.max(0, restTimerEndsAt - Date.now()) + 80);
    return () => clearTimeout(timeout);
  }, [restTimerEndsAt, settings.soundEnabled, settings.vibrationEnabled]);

  return null;
}

function ActiveWorkoutMiniPlayer({ navigation, palette, insets }) {
  const activeWorkout = useIronHabitStore((state) => state.activeWorkout);
  const resumeActiveWorkout = useIronHabitStore((state) => state.resumeActiveWorkout);
  const discardActiveWorkout = useIronHabitStore((state) => state.discardActiveWorkout);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!activeWorkout?.minimized) return undefined;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [activeWorkout?.minimized, activeWorkout?.restTimerEndsAt, activeWorkout?.startedAt]);

  if (!activeWorkout?.minimized) return null;

  const secondsLeft = activeWorkout.restTimerEndsAt
    ? Math.max(0, Math.ceil((activeWorkout.restTimerEndsAt - now) / 1000))
    : 0;
  const elapsedSeconds = Math.max(0, Math.floor((now - activeWorkout.startedAt) / 1000));
  const hasRestTimer = secondsLeft > 0;
  const timeLabel = hasRestTimer ? "Recupero" : "Tempo";
  const timeValue = hasRestTimer ? formatSeconds(secondsLeft) : formatElapsedTime(elapsedSeconds);

  const resume = () => {
    resumeActiveWorkout();
    navigation.navigate("GuidedWorkout");
  };

  const confirmDiscard = () => {
    Alert.alert(
      "Eliminare allenamento?",
      "La sessione attiva verrà eliminata e non sarà salvata nello storico.",
      [
        { text: "Annulla", style: "cancel" },
        { text: "Elimina", style: "destructive", onPress: discardActiveWorkout }
      ]
    );
  };

  return (
    <View
      style={{
        position: "absolute",
        left: 12 + insets.left,
        right: 12 + insets.right,
        bottom: 72 + insets.bottom,
        minHeight: 64,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: palette.strongLine,
        backgroundColor: palette.card,
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 10
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ color: palette.text, fontWeight: "800", fontSize: 15 }} numberOfLines={1}>
          {activeWorkout.name}
        </Text>
      </View>

      <View
        style={{
          minWidth: 82,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          borderWidth: 1,
          borderColor: hasRestTimer ? REST_TIMER_ACCENT.border : palette.line,
          backgroundColor: hasRestTimer ? REST_TIMER_ACCENT.bg : palette.surface,
          paddingHorizontal: 8,
          paddingVertical: 6
        }}
      >
        <Text style={{ color: hasRestTimer ? REST_TIMER_ACCENT.text : palette.muted, fontSize: 10, fontWeight: "800" }}>
          {timeLabel}
        </Text>
        <Text style={{ color: hasRestTimer ? REST_TIMER_ACCENT.text : palette.text, fontSize: 15, fontWeight: "900" }}>
          {timeValue}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Elimina allenamento attivo"
        onPress={confirmDiscard}
        style={{
          height: 44,
          width: 44,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          borderWidth: 1,
          borderColor: palette.danger,
          backgroundColor: palette.dangerSoft
        }}
      >
        <Trash2 size={20} color={palette.dangerText} />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Riprendi allenamento"
        onPress={resume}
        style={{
          height: 44,
          width: 44,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          borderWidth: 1,
          borderColor: palette.success,
          backgroundColor: palette.successSoft
        }}
      >
        <Play size={22} color={palette.successText} fill={palette.successText} />
      </Pressable>
    </View>
  );
}

function Tabs({ navigation }) {
  const insets = useSafeAreaInsets();
  const themeMode = useIronHabitStore((state) => normalizeThemeMode(state.settings.themeMode));
  const palette = themePalettes[themeMode];

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        id="IronHabitTabs"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: palette.card,
            borderTopColor: palette.line,
            borderTopWidth: 1,
            minHeight: 68 + insets.bottom,
            paddingBottom: 9 + insets.bottom,
            paddingTop: 7
          },
          tabBarActiveTintColor: palette.text,
          tabBarInactiveTintColor: palette.muted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 1 },
          tabBarItemStyle: { outlineStyle: "none" } as any,
          tabBarIcon: ({ focused }) => {
            const icons = {
              HomeTab: House,
              PlansTab: ClipboardList,
              ExercisesTab: Dumbbell,
              HistoryTab: Clock3,
              GoalsTab: Target
            };
            const Icon = icons[route.name] || Dumbbell;
            return (
              <View
                style={{
                  width: 44,
                  height: 34,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    width: focused ? 18 : 0,
                    height: 3,
                    borderRadius: 999,
                    backgroundColor: palette.text
                  }}
                />
                <Icon color={focused ? palette.text : palette.muted} size={22} strokeWidth={focused ? 2.7 : 2} />
              </View>
            );
          }
        })}
      >
        <Tab.Screen name="HomeTab" component={DashboardScreen} options={{ title: "Home" }} />
        <Tab.Screen name="PlansTab" component={PlanListScreen} options={{ title: "Schede" }} />
        <Tab.Screen name="ExercisesTab" component={ExerciseListScreen} options={{ title: "Esercizi" }} />
        <Tab.Screen name="HistoryTab" component={WorkoutHistoryScreen} options={{ title: "Storico" }} />
        <Tab.Screen name="GoalsTab" component={GoalListScreen} options={{ title: "Obiettivi" }} />
      </Tab.Navigator>

      <ActiveWorkoutMiniPlayer navigation={navigation} palette={palette} insets={insets} />
    </View>
  );
}

export function AppNavigator() {
  const onboardingCompleted = useIronHabitStore((state) => state.settings.onboardingCompleted);
  const themeMode = useIronHabitStore((state) => normalizeThemeMode(state.settings.themeMode));
  const plannedSessions = useIronHabitStore((state) => state.plannedSessions);
  const refreshSessionStatuses = useIronHabitStore((state) => state.refreshSessionStatuses);
  const palette = themePalettes[themeMode];
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: palette.bg,
      card: palette.card,
      border: palette.line,
      text: palette.text,
      primary: palette.text
    }
  };

  useEffect(() => {
    if (onboardingCompleted) {
      refreshSessionStatuses();
    }
  }, [onboardingCompleted, plannedSessions, refreshSessionStatuses]);

  return (
    <>
      <ActiveWorkoutFeedbackWatcher />
      <NavigationContainer theme={theme}>
      <Stack.Navigator
        id="IronHabitStack"
        screenOptions={{
          headerStyle: { backgroundColor: palette.card },
          headerTintColor: palette.text,
          headerTitleStyle: { fontWeight: "800" },
          headerBackTitle: "",
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: palette.bg },
          navigationBarColor: palette.card
        }}
      >
        {!onboardingCompleted ? (
          <Stack.Screen name="InitialSetup" component={InitialSetupScreen} options={{ headerShown: false }} />
        ) : (
          <>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="ExerciseList" component={ExerciseListScreen} options={{ title: "Esercizi" }} />
        <Stack.Screen name="ExerciseForm" component={ExerciseFormScreen} options={{ title: "Esercizio" }} />
        <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: "Dettaglio esercizio" }} />
        <Stack.Screen name="PlanList" component={PlanListScreen} options={{ title: "Schede" }} />
        <Stack.Screen name="PlanForm" component={PlanFormScreen} options={{ title: "Scheda" }} />
        <Stack.Screen
          name="PlanExercisePicker"
          component={PlanExercisePickerScreen}
          options={{ headerShown: false, presentation: "fullScreenModal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="PlanDetail" component={PlanDetailScreen} options={{ title: "Dettaglio scheda" }} />
        <Stack.Screen name="SessionList" component={SessionListScreen} options={{ title: "Sessioni" }} />
        <Stack.Screen name="SessionForm" component={SessionFormScreen} options={{ title: "Sessione" }} />
        <Stack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: "Dettaglio sessione" }} />
        <Stack.Screen name="WorkoutHistory" component={WorkoutHistoryScreen} options={{ title: "Storico" }} />
        <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} options={{ title: "Dettaglio workout" }} />
        <Stack.Screen name="GoalForm" component={GoalFormScreen} options={{ title: "Obiettivo" }} />
        <Stack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: "Dettaglio obiettivo" }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Impostazioni" }} />
        <Stack.Screen
          name="GuidedWorkout"
          component={GuidedWorkoutScreen}
          options={{ headerShown: false, presentation: "fullScreenModal", animation: "slide_from_bottom" }}
        />
          </>
        )}
      </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
