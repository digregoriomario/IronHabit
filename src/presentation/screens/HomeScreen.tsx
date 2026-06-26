import { StyleSheet, Text, View } from "react-native";

import { weeklySessions } from "../../domain/mockData";
import { MetricCard } from "../components/MetricCard";
import { ScreenLayout } from "../components/ScreenLayout";
import { colors } from "../theme/colors";

export function HomeScreen() {
  return (
    <ScreenLayout
      title="Home"
      subtitle="Qui troverai il calendario settimanale e lo storico delle tue attività."
    >
      <View style={styles.metrics}>
        <MetricCard label="Settimana" value="3" helper="sessioni" />
        <MetricCard label="Minuti" value="170" helper="previsti" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Planner settimanale</Text>
        {weeklySessions.map((session) => (
          <View key={`${session.day}-${session.title}`} style={styles.sessionRow}>
            <Text style={styles.day}>{session.day}</Text>
            <View style={styles.sessionCopy}>
              <Text style={styles.sessionTitle}>{session.title}</Text>
              <Text style={styles.sessionStatus}>{session.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20
  },
  section: {
    gap: 12
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.card
  },
  day: {
    width: 44,
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800"
  },
  sessionCopy: {
    flex: 1
  },
  sessionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  sessionStatus: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 13
  }
});
