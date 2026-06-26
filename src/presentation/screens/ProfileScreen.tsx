import { StyleSheet, Text, View } from "react-native";

import { profileStats } from "../../domain/mockData";
import { MetricCard } from "../components/MetricCard";
import { ScreenLayout } from "../components/ScreenLayout";
import { colors } from "../theme/colors";

export function ProfileScreen() {
  return (
    <ScreenLayout
      title="Profilo"
      subtitle="Statistiche personali, obiettivi e progressi saranno raccolti qui."
    >
      <View style={styles.metrics}>
        {profileStats.map((stat) => (
          <MetricCard key={stat.label} label={stat.label} value={stat.value} helper={stat.helper} />
        ))}
      </View>

      <View style={styles.goalCard}>
        <Text style={styles.goalEyebrow}>Obiettivo attuale</Text>
        <Text style={styles.goalTitle}>Allenarsi 3 volte a settimana</Text>
        <Text style={styles.goalDescription}>
          La base per monitorare costanza, storico e progressi personali è pronta per essere collegata ai dati reali.
        </Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20
  },
  goalCard: {
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.card
  },
  goalEyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1
  },
  goalTitle: {
    marginTop: 8,
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  goalDescription: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21
  }
});
