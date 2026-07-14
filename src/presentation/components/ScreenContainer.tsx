import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { StyleProp, ViewStyle } from "react-native";
import type { Edge } from "react-native-safe-area-context";
import type { ReactNode } from "react";

const DEFAULT_EDGES: Edge[] = ["top", "right", "bottom", "left"];

interface ScreenContainerProps {
  children: ReactNode;
  className?: string;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}

export function ScreenContainer({ children, className = "", edges = DEFAULT_EDGES, style }: ScreenContainerProps) {
  return (
    <SafeAreaView
      edges={edges}
      className={`flex-1 bg-iron-bg ${className}`}
      style={[styles.container, style]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 820,
    alignSelf: "center"
  }
});
