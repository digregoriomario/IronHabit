import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import { radius } from "../theme/ui";

interface WorkoutPlanCardProps {
  title: string;
  description: string;
  exercises: number;
  duration: string;
  rest?: string;
  exercisePreview?: string[];
  active?: boolean;
  onStart: () => void;
}

export function WorkoutPlanCard({
  title,
  description,
  exercises,
  duration,
  rest,
  exercisePreview = [],
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

      {exercisePreview.length ? (
        <View style={styles.previewList}>
          {exercisePreview.map((item) => (
            <View key={item} style={styles.previewPill}>
              <Text style={styles.previewText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : null}

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
          {active ? "Sessione attiva" : rest ? `Avvia · rec. ${rest}` : "Avvia sessione"}
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
    borderRadius: radius.lg,
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
    borderRadius: radius.md,
    backgroundColor: colors.surface
  },
  titleBlock: {
    flex: 1
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
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
  previewList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14
  },
  previewPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceRaised
  },
  previewText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800"
  },
  startButton: {
    marginTop: 16,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radius.md,
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
