import { Check } from "lucide-react-native";
import { Pressable, View } from "react-native";

import { colors } from "../../theme/colors";
import { cn } from "../../utils/cn";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onCheckedChange, label = "Selezione", disabled = false, className = "" }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={() => onCheckedChange?.(!checked)}
      className={cn("h-9 w-9 items-center justify-center", disabled ? "opacity-40" : "active:opacity-75", className)}
    >
      <View className={cn("h-7 w-7 items-center justify-center rounded-md border", checked ? "border-iron-text bg-iron-text" : "border-iron-line bg-iron-card")}>
        {checked ? <Check size={17} color={colors.inverseText} strokeWidth={3} /> : null}
      </View>
    </Pressable>
  );
}
