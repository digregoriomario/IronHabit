import { Text, View } from "react-native";
import type { ReactNode } from "react";

import { cn } from "../../utils/cn";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <View className={cn("rounded-md border border-iron-line bg-iron-card p-4", className)}>{children}</View>;
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <View className={cn("mb-3 gap-1", className)}>{children}</View>;
}

export function CardTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <Text className={cn("text-base font-semibold leading-5 text-iron-text", className)}>{children}</Text>;
}

export function CardDescription({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <Text className={cn("text-sm leading-5 text-iron-muted", className)}>{children}</Text>;
}

export function CardContent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <View className={cn("gap-3", className)}>{children}</View>;
}

export function CardFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <View className={cn("mt-4 flex-row gap-2 border-t border-iron-line pt-3", className)}>{children}</View>;
}
