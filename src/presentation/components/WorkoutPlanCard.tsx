import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

interface WorkoutPlanCardProps {
  title: string;
  description: string;
  exercises: number;
  duration: string;
}

export function WorkoutPlanCard({ title, description, exercises, duration }: WorkoutPlanCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <View style={styles.icon}>
          <MaterialCommunityIcons name="dumbbell" size={22} color={colors.primary} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.meta}>
            {exercises} esercizi · {duration}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.card
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  icon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.surface
  },
  titleBlock: {
    flex: 1
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  meta: {
    marginTop: 4,
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700"
  },
  description: {
    marginTop: 14,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  }
});
