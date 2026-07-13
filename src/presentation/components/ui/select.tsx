import { Pressable, ScrollView, Text, View } from "react-native";

import { cn } from "../../utils/cn";

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  description?: string;
}

interface SelectProps {
  options: SelectOption[];
  value: any;
  onValueChange: (value: any) => void;
  horizontal?: boolean;
  label?: string;
  className?: string;
  accessibilityLabel?: string;
}

export function Select({ options, value, onValueChange, horizontal = true, label, className = "", accessibilityLabel }: SelectProps) {
  const content = options.map((item) => {
    const selected = item.value === value;
    const disabled = Boolean(item.disabled);
    return (
      <Pressable
        key={String(item.value)}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel || label || "Opzione"}: ${item.label}`}
        accessibilityState={{ selected, disabled }}
        disabled={disabled}
        onPress={() => onValueChange(item.value)}
        hitSlop={4}
        className={cn(
          "min-h-10 justify-center rounded-md border px-3 py-2",
          selected ? "border-iron-text bg-iron-text" : "border-iron-line bg-iron-card",
          disabled ? "opacity-45" : ""
        )}
      >
        <Text className={cn("text-sm font-semibold", selected ? "text-iron-inverseText" : "text-iron-text")}>{item.label}</Text>
        {item.description ? (
          <Text className={cn("mt-1 text-xs font-medium", selected ? "text-iron-inverseText" : "text-iron-muted")}>
            {item.description}
          </Text>
        ) : null}
      </Pressable>
    );
  });

  return horizontal ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} className={className}>
      {content}
    </ScrollView>
  ) : (
    <View className={cn("flex-row flex-wrap gap-2", className)}>{content}</View>
  );
}
