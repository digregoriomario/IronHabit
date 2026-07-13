export type ThemeScheme = "light" | "dark";
export type ThemeMode = ThemeScheme | "system";

export const themePalettes: Record<ThemeScheme, Record<string, string>> = {
  light: {
    bg: "#FFFFFF",
    surface: "#F5F5F5",
    card: "#FFFFFF",
    line: "#E0E0E0",
    strongLine: "#000000",
    text: "#000000",
    muted: "#666666",
    subtle: "#888888",
    primary: "#000000",
    primaryPressed: "#000000",
    success: "#15803D",
    successPressed: "#166534",
    successSoft: "#ECFDF3",
    successText: "#166534",
    warning: "#B45309",
    warningPressed: "#92400E",
    warningSoft: "#FFF7ED",
    warningText: "#92400E",
    info: "#2563EB",
    infoPressed: "#1D4ED8",
    infoSoft: "#EFF6FF",
    infoText: "#1D4ED8",
    danger: "#DC2626",
    dangerPressed: "#B91C1C",
    dangerSoft: "#FEF2F2",
    dangerText: "#B91C1C",
    red: "#DC2626",
    amber: "#B45309",
    cyan: "#2563EB",
    green: "#15803D",
    purple: "#6D28D9",
    inverseText: "#FFFFFF"
  },
  dark: {
    bg: "#09090B",
    surface: "#18181B",
    card: "#111113",
    line: "#2A2A2E",
    strongLine: "#FFFFFF",
    text: "#F7F7F8",
    muted: "#A1A1AA",
    subtle: "#71717A",
    primary: "#FFFFFF",
    primaryPressed: "#E4E4E7",
    success: "#22C55E",
    successPressed: "#16A34A",
    successSoft: "#052E16",
    successText: "#86EFAC",
    warning: "#F59E0B",
    warningPressed: "#D97706",
    warningSoft: "#451A03",
    warningText: "#FCD34D",
    info: "#60A5FA",
    infoPressed: "#3B82F6",
    infoSoft: "#172554",
    infoText: "#BFDBFE",
    danger: "#F87171",
    dangerPressed: "#EF4444",
    dangerSoft: "#450A0A",
    dangerText: "#FECACA",
    red: "#F87171",
    amber: "#F59E0B",
    cyan: "#60A5FA",
    green: "#22C55E",
    purple: "#A78BFA",
    inverseText: "#09090B"
  }
};

export const colors = { ...themePalettes.light };

export const applyThemeColors = (scheme: ThemeScheme) => {
  Object.assign(colors, themePalettes[scheme]);
};

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
};

export const themeVarsFor = (scheme: ThemeScheme) =>
  Object.fromEntries(
    Object.entries(themePalettes[scheme]).map(([key, value]) => [`--iron-${key}`, hexToRgb(value)])
  );
