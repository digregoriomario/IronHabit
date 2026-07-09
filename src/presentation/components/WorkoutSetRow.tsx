import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

interface WorkoutSetRowProps {
  index: number;
  label: string;
  previous: string;
  kg: string;
  reps: string;
  completed: boolean;
  onToggle: () => void;
}

export function WorkoutSetRow({ index, label, previous, kg, reps, completed, onToggle }: WorkoutSetRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={`Serie ${index + 1} ${label}`}
      accessibilityState={{ checked: completed }}
      onPress={onToggle}
      style={[styles.row, completed && styles.completedRow]}
    >
      <Text style={styles.index}>{index + 1}</Text>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.previous}>Precedente {previous}</Text>
      </View>
      <Text style={styles.value}>{kg}</Text>
      <Text style={styles.value}>{reps}</Text>
      <View style={[styles.check, completed && styles.checked]}>
        {completed ? <MaterialCommunityIcons name="check" size={18} color={colors.background} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.card
  },
  completedRow: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft
  },
  index: {
    width: 24,
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  copy: {
    flex: 1
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  previous: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  value: {
    width: 44,
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center"
  },
  check: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10
  },
  checked: {
    borderColor: colors.success,
    backgroundColor: colors.success
  }
});
