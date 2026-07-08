import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

interface WorkoutPlanCardProps {
  title: string;
  description: string;
  exercises: number;
  duration: string;
  active?: boolean;
  onStart: () => void;
}

export function WorkoutPlanCard({
  title,
  description,
  exercises,
  duration,
  active = false,
  onStart
}: WorkoutPlanCardProps) {
  return (
    <View style={[styles.card, active && styles.activeCard]}>
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

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={active ? `Sessione ${title} già attiva` : `Avvia sessione ${title}`}
        disabled={active}
        onPress={onStart}
        style={({ pressed }) => [
          styles.startButton,
          active && styles.activeButton,
          pressed && !active && styles.pressedButton
        ]}
      >
        <MaterialCommunityIcons
          name={active ? "check-circle-outline" : "play-circle-outline"}
          size={18}
          color={active ? "#07130B" : colors.text}
        />
        <Text style={[styles.startButtonText, active && styles.activeButtonText]}>
          {active ? "Sessione attiva" : "Avvia sessione"}
        </Text>
      </Pressable>
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
  activeCard: {
    borderColor: colors.success
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
  },
  startButton: {
    marginTop: 16,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    backgroundColor: colors.primary
  },
  activeButton: {
    backgroundColor: colors.success
  },
  pressedButton: {
    opacity: 0.78
  },
  startButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  activeButtonText: {
    color: "#07130B"
  }
});
