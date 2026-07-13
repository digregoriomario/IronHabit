import { Text, View } from "react-native";

import { Checkbox } from "./ui/checkbox";

export function MultiSelect({ label, options, value = [], onChange }) {
  const toggle = (option) => {
    const next = value.includes(option) ? value.filter((item) => item !== option) : [...value, option];
    onChange(next);
  };

  return (
    <View className="gap-2">
      {label ? <Text className="text-sm font-bold uppercase tracking-wide text-iron-muted">{label}</Text> : null}
      <View className="gap-2">
        {options.map((option) => {
          const selected = value.includes(option);
          return (
            <View
              key={option}
              className="min-h-12 flex-row items-center gap-3 rounded-md border border-iron-line bg-iron-card px-3 py-2"
            >
              <Checkbox checked={selected} label={`${label || "Selezione multipla"}: ${option}`} onCheckedChange={() => toggle(option)} />
              <Text className="flex-1 text-sm font-semibold text-iron-text">{option}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
