import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { workoutHistory } from "../../domain/mockData";
import { ScreenLayout } from "../components/ScreenLayout";
import { colors } from "../theme/colors";

export function HistoryScreen() {
  return (
    <ScreenLayout
      title="Storico"
      subtitle="Riepilogo degli ultimi allenamenti completati e del volume registrato."
    >
      <View style={styles.list}>
        {workoutHistory.map((workout) => (
          <View key={workout.id} style={styles.card}>
            <View style={styles.icon}>
              <MaterialCommunityIcons name="history" size={22} color={colors.success} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.title}>{workout.title}</Text>
              <Text style={styles.meta}>{workout.date} · {workout.duration}</Text>
            </View>
            <View style={styles.volumeBox}>
              <Text style={styles.volumeLabel}>Volume</Text>
              <Text style={styles.volumeValue}>{workout.volume}</Text>
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
  card: {
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
    backgroundColor: colors.successSoft
  },
  copy: {
    flex: 1
  },
  title: {
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
  volumeBox: {
    alignItems: "flex-end"
  },
  volumeLabel: {
    color: colors.subtle,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  volumeValue: {
    marginTop: 4,
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  }
});
