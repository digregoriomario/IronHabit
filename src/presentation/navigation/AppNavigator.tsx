import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { HomeScreen } from "../screens/HomeScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { WorkoutScreen } from "../screens/WorkoutScreen";

const Tab = createBottomTabNavigator();

const ironHabitTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: "#0A84FF",
    background: "#0F0F12",
    card: "#17171C",
    border: "#2C2C32",
    text: "#FFFFFF"
  }
};

export function AppNavigator() {
  return (
    <NavigationContainer theme={ironHabitTheme}>
      <Tab.Navigator
        id="IronHabitTabs"
        screenOptions={{
          headerStyle: { backgroundColor: "#17171C" },
          headerTintColor: "#FFFFFF",
          tabBarStyle: {
            backgroundColor: "#17171C",
            borderTopColor: "#2C2C32"
          },
          tabBarActiveTintColor: "#0A84FF",
          tabBarInactiveTintColor: "#8E8E93"
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Allenamento" component={WorkoutScreen} />
        <Tab.Screen name="Profilo" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
