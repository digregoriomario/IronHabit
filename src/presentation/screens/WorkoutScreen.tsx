import { StyleSheet, Text, View } from "react-native";

export function WorkoutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Allenamento</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F0F12"
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700"
  }
});
