import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { HomeScreen } from "../screens/HomeScreen";
import { ExerciseLibraryScreen } from "../screens/ExerciseLibraryScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { WorkoutScreen } from "../screens/WorkoutScreen";
import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator();

const ironHabitTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    text: colors.text
  }
};

export function AppNavigator() {
  return (
    <NavigationContainer theme={ironHabitTheme}>
      <Tab.Navigator
        id="IronHabitTabs"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            minHeight: 66,
            paddingTop: 8,
            paddingBottom: 8,
            backgroundColor: colors.surface,
            borderTopColor: colors.border
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700"
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarIcon: ({ color, size }) => {
            const icons = {
              Home: "home-variant-outline",
              Allenamento: "dumbbell",
              Esercizi: "arm-flex-outline",
              Storico: "history",
              Profilo: "account-outline"
            } as const;

            return <MaterialCommunityIcons name={icons[route.name as keyof typeof icons]} size={size} color={color} />;
          }
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Allenamento" component={WorkoutScreen} />
        <Tab.Screen name="Esercizi" component={ExerciseLibraryScreen} />
        <Tab.Screen name="Storico" component={HistoryScreen} />
        <Tab.Screen name="Profilo" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
