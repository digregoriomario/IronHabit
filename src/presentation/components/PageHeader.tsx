import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { cn } from "../utils/cn";

interface PageHeaderProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, action, className = "" }: PageHeaderProps) {
  return (
    <View className={cn("mb-5 flex-row items-center justify-between gap-3", className)}>
      <Text className="min-w-0 flex-1 text-2xl font-semibold leading-8 text-iron-text" numberOfLines={1}>
        {title}
      </Text>
      {action}
    </View>
  );
}
