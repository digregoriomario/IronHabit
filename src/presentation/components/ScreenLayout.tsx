import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

interface ScreenLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function ScreenLayout({ title, subtitle, children }: ScreenLayoutProps) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>IRONHABIT</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    marginBottom: 24
  },
  eyebrow: {
    marginBottom: 6,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800"
  },
  subtitle: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23
  }
});
