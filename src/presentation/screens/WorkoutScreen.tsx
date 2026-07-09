import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { workoutPlans } from "../../domain/mockData";
import { ScreenLayout } from "../components/ScreenLayout";
import { WorkoutPlanCard } from "../components/WorkoutPlanCard";
import { colors } from "../theme/colors";

export function WorkoutScreen() {
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const activePlan = useMemo(
    () => workoutPlans.find((plan) => plan.id === activePlanId) ?? null,
    [activePlanId]
  );

  return (
    <ScreenLayout
      title="Allenamento"
      subtitle="Il punto di partenza per creare schede e avviare una sessione."
      footer={activePlan ? (
        <View style={styles.footerSession}>
          <View style={styles.footerCopy}>
            <Text style={styles.footerEyebrow}>In esecuzione</Text>
            <Text style={styles.footerTitle}>{activePlan.title}</Text>
          </View>
          <Text style={styles.footerAction} onPress={() => setActivePlanId(null)}>Termina</Text>
        </View>
      ) : null}
    >
      {activePlan ? (
        <View style={styles.activeSession}>
          <View style={styles.activeCopy}>
            <Text style={styles.activeEyebrow}>Sessione in corso</Text>
            <Text style={styles.activeTitle}>{activePlan.title}</Text>
            <Text style={styles.activeMeta}>
              {activePlan.exercises} esercizi · {activePlan.duration}
            </Text>
          </View>
          <Text style={styles.finishAction} onPress={() => setActivePlanId(null)}>
            Termina
          </Text>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Le mie schede</Text>
        <Text style={styles.sectionMeta}>
          {activePlan ? "1 in corso" : `${workoutPlans.length} attive`}
        </Text>
      </View>

      <View style={styles.list}>
        {workoutPlans.map((plan) => (
          <WorkoutPlanCard
            key={plan.id}
            title={plan.title}
            description={plan.description}
            exercises={plan.exercises}
            duration={plan.duration}
            rest={plan.rest}
            exercisePreview={plan.exercisePreview}
            active={activePlanId === plan.id}
            onStart={() => setActivePlanId(plan.id)}
          />
        ))}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  activeSession: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: 18,
    backgroundColor: "#132318"
  },
  activeCopy: {
    flex: 1
  },
  activeEyebrow: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1
  },
  activeTitle: {
    marginTop: 6,
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  activeMeta: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  finishAction: {
    color: colors.success,
    fontSize: 14,
    fontWeight: "900"
  },
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
  },
  footerSession: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  footerCopy: {
    flex: 1
  },
  footerEyebrow: {
    color: colors.success,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1
  },
  footerTitle: {
    marginTop: 3,
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  footerAction: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "900"
  }
});
