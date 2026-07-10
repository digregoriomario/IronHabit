import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { exerciseLibrary } from "../../domain/mockData";
import { ScreenLayout } from "../components/ScreenLayout";
import { colors } from "../theme/colors";

export function ExerciseLibraryScreen() {
  return (
    <ScreenLayout
      title="Esercizi"
      subtitle="Catalogo essenziale degli esercizi usati nelle schede e nello storico."
    >
      <View style={styles.list}>
        {exerciseLibrary.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.icon}>
              <MaterialCommunityIcons name="arm-flex-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.name}>{exercise.name}</Text>
              <Text style={styles.meta}>{exercise.muscle} · {exercise.equipment}</Text>
            </View>
            <View style={styles.bestBox}>
              <Text style={styles.bestLabel}>Best</Text>
              <Text style={styles.bestValue}>{exercise.best}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12
  },
  exerciseCard: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.card
  },
  icon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised
  },
  copy: {
    flex: 1
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  meta: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  bestBox: {
    alignItems: "flex-end"
  },
  bestLabel: {
    color: colors.subtle,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  bestValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  }
});
