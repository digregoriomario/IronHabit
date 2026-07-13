import { Text, View } from "react-native";

import { cn } from "../utils/cn";
import { Select } from "./ui/select";

interface SelectOption {
  value: any;
  label: string;
}

interface AppSelectProps {
  label?: string;
  options: Array<SelectOption | string | number | boolean>;
  value: any;
  onChange: (value: any) => void;
  horizontal?: boolean;
  className?: string;
  accessibilityLabel?: string;
}

const normalizeOption = (option) =>
  option && typeof option === "object" && "value" in option
    ? { value: option.value, label: option.label || String(option.value) }
    : { value: option, label: String(option) };

export function AppSelect({ label, options, value, onChange, horizontal = true, className = "", accessibilityLabel }: AppSelectProps) {
  const normalizedOptions = options.map(normalizeOption);

  return (
    <View className={cn("gap-2", className)}>
      {label ? <Text className="text-sm font-bold uppercase tracking-wide text-iron-muted">{label}</Text> : null}
      <Select options={normalizedOptions} value={value} onValueChange={onChange} horizontal={horizontal} label={label} accessibilityLabel={accessibilityLabel} />
    </View>
  );
}
