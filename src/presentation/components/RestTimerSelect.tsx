import { Check, ChevronDown, Timer, X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import { colors } from "../theme/colors";

export const REST_TIMER_OPTIONS = Array.from({ length: 11 }).map((_, index) => 30 + index * 15);

export const formatRestTime = (seconds: number | string) => {
  const value = Number(seconds || 0);
  if (value < 60) return `${value} sec`;
  const minutes = Math.floor(value / 60);
  const remaining = value % 60;
  return remaining ? `${minutes} min ${remaining} sec` : `${minutes} min`;
};

export function RestTimerSelect({
  value,
  onChange,
  label = "Timer di recupero",
  compact = false,
  inline = false,
  tone = "warning"
}: {
  value: number | string;
  onChange: (value: number) => void;
  label?: string;
  compact?: boolean;
  inline?: boolean;
  tone?: "warning" | "info" | "primary";
}) {
  const [visible, setVisible] = useState(false);
  const normalizedValue = Math.min(180, Math.max(30, Math.round(Number(value || 90) / 15) * 15));
  const toneMap = {
    warning: { accent: colors.warningText, textClass: "text-iron-warningText" },
    info: { accent: colors.infoText, textClass: "text-iron-infoText" },
    primary: { accent: colors.text, textClass: "text-iron-text" }
  };
  const { accent, textClass: accentText } = toneMap[tone];

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatRestTime(normalizedValue)}`}
        onPress={() => setVisible(true)}
        className={`min-h-11 flex-row items-center gap-2 ${
          inline ? "bg-transparent px-0" : `rounded-md border border-iron-line bg-iron-card px-3 ${compact ? "justify-center" : ""}`
        }`}
      >
        <Timer size={inline ? 24 : 18} color={accent} />
        {inline ? (
          <Text className={`flex-1 text-xl font-semibold ${accentText}`} numberOfLines={1}>
            {label}: {formatRestTime(normalizedValue)}
          </Text>
        ) : (
          <>
            {compact ? null : <Text className={`flex-1 text-sm font-bold ${accentText}`}>{label}</Text>}
            <Text className="font-bold text-iron-text" numberOfLines={1}>{formatRestTime(normalizedValue)}</Text>
          </>
        )}
        <ChevronDown size={inline ? 16 : 18} color={inline ? accent : colors.muted} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        statusBarTranslucent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <SafeAreaView
            edges={["right", "bottom", "left"]}
            style={[styles.sheet, { borderTopColor: colors.line, backgroundColor: colors.card }]}
          >
            <View className="mb-4 flex-row items-center">
              <Text className="flex-1 text-xl font-semibold text-iron-text">Timer di recupero</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Chiudi timer di recupero"
                onPress={() => setVisible(false)}
                className="h-11 w-11 items-center justify-center rounded-md bg-iron-surface"
              >
                <X size={22} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView>
              {REST_TIMER_OPTIONS.map((seconds) => {
                const selected = seconds === normalizedValue;
                return (
                  <Pressable
                    key={seconds}
                    accessibilityRole="button"
                    accessibilityLabel={`Recupero ${formatRestTime(seconds)}`}
                    accessibilityState={{ selected }}
                    onPress={() => {
                      onChange(seconds);
                      setVisible(false);
                    }}
                    className="min-h-12 flex-row items-center border-b border-iron-line px-2 py-3"
                  >
                    <Text className={`flex-1 text-base font-semibold ${selected ? accentText : "text-iron-text"}`}>
                      {formatRestTime(seconds)}
                    </Text>
                    {selected ? <Check size={20} color={accent} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  sheet: {
    width: "100%",
    maxWidth: 820,
    maxHeight: "75%",
    alignSelf: "center",
    overflow: "hidden",
    borderTopWidth: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 16,
    paddingLeft: 16
  }
});
