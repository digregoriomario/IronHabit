import { Text, View } from "react-native";
import type { ReactNode } from "react";

import { cn } from "../../utils/cn";

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <View className={cn("min-h-7 items-center justify-center rounded-full border border-iron-line bg-iron-surface px-2.5", className)}>
      <Text className="text-xs font-semibold text-iron-text">{children}</Text>
    </View>
  );
}
