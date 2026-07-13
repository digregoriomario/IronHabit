import { Text, View } from "react-native";
import type { KeyboardTypeOptions } from "react-native";

import { cn } from "../utils/cn";
import { Input } from "./ui/input";

interface AppInputProps {
  label?: string;
  value: any;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  className?: string;
  inputClassName?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function AppInput({ label, value, onChangeText, placeholder, multiline = false, keyboardType = "default", className = "", inputClassName = "", accessibilityLabel, accessibilityHint }: AppInputProps) {
  return (
    <View className={cn("gap-2", className)}>
      {label ? <Text className="text-sm font-bold uppercase tracking-wide text-iron-muted">{label}</Text> : null}
      <Input
        accessibilityLabel={accessibilityLabel || label || placeholder}
        accessibilityHint={accessibilityHint}
        value={String(value ?? "")}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        className={cn("font-normal", inputClassName)}
      />
    </View>
  );
}
