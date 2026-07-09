import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import { radius } from "../theme/ui";

interface PlaceholderCardProps {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  description: string;
}

export function PlaceholderCard({ icon, title, description }: PlaceholderCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.card
  },
  icon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.surface
  },
  copy: {
    flex: 1
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800"
  },
  description: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  }
});
