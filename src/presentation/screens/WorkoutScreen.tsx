import { StyleSheet, Text, View } from "react-native";

import { workoutPlans } from "../../domain/mockData";
import { ScreenLayout } from "../components/ScreenLayout";
import { WorkoutPlanCard } from "../components/WorkoutPlanCard";
import { colors } from "../theme/colors";

export function WorkoutScreen() {
  return (
    <ScreenLayout
      title="Allenamento"
      subtitle="Il punto di partenza per creare schede e avviare una sessione."
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Le mie schede</Text>
        <Text style={styles.sectionMeta}>{workoutPlans.length} attive</Text>
      </View>

      <View style={styles.list}>
        {workoutPlans.map((plan) => (
          <WorkoutPlanCard
            key={plan.id}
            title={plan.title}
            description={plan.description}
            exercises={plan.exercises}
            duration={plan.duration}
          />
        ))}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  sectionMeta: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800"
  },
  list: {
    gap: 14
  }
});
