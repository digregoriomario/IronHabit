import { StatusBar } from "expo-status-bar";
import { vars } from "nativewind";
import { View } from "react-native";
import type { ReactNode } from "react";

import { useIronHabitStore } from "../store/useIronHabitStore";
import { applyThemeColors, normalizeThemeMode, themeVarsFor } from "./colors";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeMode = useIronHabitStore((state) => normalizeThemeMode(state.settings.themeMode));
  const resolvedScheme = themeMode;

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
