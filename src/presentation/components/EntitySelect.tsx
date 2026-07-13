import { Text, View } from "react-native";

import { Checkbox } from "./ui/checkbox";
import { Select } from "./ui/select";

export function EntitySelect({
  label,
  items,
  value,
  onChange,
  emptyLabel = "Nessuna selezione",
  includeEmpty = true,
  disabledIds = [],
  disabledDescription = undefined,
  helperText = undefined
}) {
  const disabledSet = new Set(disabledIds);
  const options = includeEmpty ? [{ id: "", name: emptyLabel }, ...items] : items;
  return (
    <View className="gap-2">
      {label ? <Text className="text-sm font-bold uppercase tracking-wide text-iron-muted">{label}</Text> : null}
      <Select
        options={options.map((item) => ({
          value: item.id,
          label: item.name,
          disabled: Boolean(item.id && disabledSet.has(item.id)),
          description: item.id && disabledSet.has(item.id) ? disabledDescription : undefined
        }))}
        value={value || ""}
        onValueChange={(nextValue) => onChange(nextValue || null)}
        label={label}
      />
      {helperText ? <Text className="text-xs font-medium leading-5 text-iron-muted">{helperText}</Text> : null}
    </View>
  );
}

export function EntityMultiSelect({ label, items, value = [], onChange }) {
  const toggle = (id) => {
    const next = value.includes(id) ? value.filter((item) => item !== id) : [...value, id];
    onChange(next);
  };

  return (
    <View className="gap-2">
      {label ? <Text className="text-sm font-bold uppercase tracking-wide text-iron-muted">{label}</Text> : null}
      <View className="gap-2">
        {items.map((item) => {
          const selected = value.includes(item.id);
          return (
            <View
              key={item.id}
              className="min-h-12 flex-row items-center gap-3 rounded-md border border-iron-line bg-iron-card px-3 py-2"
            >
              <Checkbox checked={selected} label={`${label || "Selezione multipla"}: ${item.name}`} onCheckedChange={() => toggle(item.id)} />
              <Text className="flex-1 text-sm font-semibold text-iron-text">{item.name}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
