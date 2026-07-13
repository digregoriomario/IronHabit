import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ClipboardList, Clock3, Dumbbell, House, Target, Timer } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
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
import { WorkoutLogFormScreen } from "../screens/WorkoutLogFormScreen";
import { colors } from "../theme/colors";
import { useIronHabitStore } from "../store/useIronHabitStore";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs({ navigation }) {
  const insets = useSafeAreaInsets();
  const activeWorkout = useIronHabitStore((state) => state.activeWorkout);
  const resumeActiveWorkout = useIronHabitStore((state) => state.resumeActiveWorkout);

  const resume = () => {
    resumeActiveWorkout();
    navigation.navigate("GuidedWorkout");
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        id="IronHabitTabs"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.line,
            borderTopWidth: 1,
            minHeight: 68 + insets.bottom,
            paddingBottom: 9 + insets.bottom,
            paddingTop: 7
          },
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.muted,
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
                    backgroundColor: colors.text
                  }}
                />
                <Icon color={focused ? colors.text : colors.muted} size={22} strokeWidth={focused ? 2.7 : 2} />
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

      {activeWorkout?.minimized ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Riprendi ${activeWorkout.name}`}
          onPress={resume}
          style={{
            position: "absolute",
            left: 12 + insets.left,
            right: 12 + insets.right,
            bottom: 72 + insets.bottom,
            minHeight: 56,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.text,
            backgroundColor: colors.card,
            paddingHorizontal: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 12
          }}
        >
          <Timer size={22} color={colors.text} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "800", fontSize: 15 }}>{activeWorkout.name}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Allenamento attivo</Text>
          </View>
          <Text style={{ color: colors.text, fontWeight: "900" }}>Riprendi</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function AppNavigator() {
  const onboardingCompleted = useIronHabitStore((state) => state.settings.onboardingCompleted);
  const plannedSessions = useIronHabitStore((state) => state.plannedSessions);
  const refreshSessionStatuses = useIronHabitStore((state) => state.refreshSessionStatuses);
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.bg,
      card: colors.card,
      border: colors.line,
      text: colors.text,
      primary: colors.text
    }
  };

  useEffect(() => {
    if (onboardingCompleted) {
      refreshSessionStatuses();
    }
  }, [onboardingCompleted, plannedSessions, refreshSessionStatuses]);

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        id="IronHabitStack"
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "800" },
          contentStyle: { backgroundColor: colors.bg }
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
        <Stack.Screen name="WorkoutLogForm" component={WorkoutLogFormScreen} options={{ title: "Allenamento" }} />
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
  );
}
