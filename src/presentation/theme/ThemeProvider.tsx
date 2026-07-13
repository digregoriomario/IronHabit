import { StatusBar } from "expo-status-bar";
import { vars } from "nativewind";
import { useColorScheme, View } from "react-native";
import type { ReactNode } from "react";

import { useIronHabitStore } from "../store/useIronHabitStore";
import { applyThemeColors, themeVarsFor, type ThemeMode, type ThemeScheme } from "./colors";

interface ThemeProviderProps {
  children: ReactNode;
}

const normalizeThemeMode = (value?: string): ThemeMode =>
  value === "light" || value === "dark" || value === "system" ? value : "system";

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeMode = useIronHabitStore((state) => normalizeThemeMode(state.settings.themeMode));
  const systemScheme = useColorScheme();
  const resolvedScheme: ThemeScheme = themeMode === "system"
    ? systemScheme === "dark" ? "dark" : "light"
    : themeMode;

  applyThemeColors(resolvedScheme);

  return (
    <View
      className="flex-1 bg-iron-bg"
      style={vars(themeVarsFor(resolvedScheme) as Record<`--${string}`, string>)}
    >
      <StatusBar style={resolvedScheme === "dark" ? "light" : "dark"} />
      {children}
    </View>
  );
}
