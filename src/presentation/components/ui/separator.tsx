import { View } from "react-native";

import { cn } from "../../utils/cn";

export function Separator({ className = "", vertical = false }: { className?: string; vertical?: boolean }) {
  return <View className={cn(vertical ? "h-full w-px bg-iron-line" : "h-px w-full bg-iron-line", className)} />;
}
