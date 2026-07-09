import { StyleSheet, Text, View } from "react-native";

import { weeklySessions, workoutHistory } from "../../domain/mockData";
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

      <View style={styles.nextSession}>
        <Text style={styles.nextEyebrow}>Prossima sessione</Text>
        <Text style={styles.nextTitle}>Gambe e core</Text>
        <Text style={styles.nextMeta}>Mer 10 lug · 65 min · recupero 2 min</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Planner settimanale</Text>
          <Text style={styles.sectionAction}>3 sessioni</Text>
        </View>
        {weeklySessions.map((session) => {
          const dotStyle = session.tone === "success"
            ? styles.successDot
            : session.tone === "primary"
              ? styles.primaryDot
              : styles.mutedDot;

          return (
            <View key={`${session.day}-${session.title}`} style={styles.sessionRow}>
              <View style={styles.dayBox}>
                <Text style={styles.day}>{session.day}</Text>
                <Text style={styles.date}>{session.date}</Text>
              </View>
              <View style={styles.sessionCopy}>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <Text style={styles.sessionStatus}>{session.status}</Text>
              </View>
              <View style={[styles.statusDot, dotStyle]} />
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Storico recente</Text>
          <Text style={styles.sectionAction}>Ultimi workout</Text>
        </View>
        {workoutHistory.slice(0, 2).map((item) => (
          <View key={item.id} style={styles.historyRow}>
            <View>
              <Text style={styles.sessionTitle}>{item.title}</Text>
              <Text style={styles.sessionStatus}>{item.date} · {item.duration}</Text>
            </View>
            <Text style={styles.historyVolume}>{item.volume}</Text>
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
    gap: 12,
    marginBottom: 22
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900"
  },
  sectionAction: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900"
  },
  nextSession: {
    marginBottom: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 18,
    backgroundColor: colors.primarySoft
  },
  nextEyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1
  },
  nextTitle: {
    marginTop: 8,
    color: colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  nextMeta: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700"
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
  dayBox: {
    width: 58
  },
  day: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900"
  },
  date: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
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
    fontSize: 13,
    fontWeight: "700"
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border
  },
  successDot: {
    backgroundColor: colors.success
  },
  primaryDot: {
    backgroundColor: colors.primary
  },
  mutedDot: {
    backgroundColor: colors.borderStrong
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.card
  },
  historyVolume: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  }
});
