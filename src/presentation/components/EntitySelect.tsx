import { Check, ChevronDown, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../theme/colors";
import { cn } from "../utils/cn";
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
  helperText = undefined,
  variant = "chips"
}) {
  const disabledSet = new Set(disabledIds);
  const options = includeEmpty ? [{ id: "", name: emptyLabel }, ...items] : items;
  const selectOptions = options.map((item) => ({
    value: item.id,
    label: item.name,
    disabled: Boolean(item.id && disabledSet.has(item.id)),
    description: item.id && disabledSet.has(item.id) ? disabledDescription : undefined
  }));

  return (
    <View className="gap-2">
      {label ? <Text className="text-sm font-bold uppercase tracking-wide text-iron-muted">{label}</Text> : null}
      {variant === "dropdown" ? (
        <DropdownSelect
          options={selectOptions}
          value={value || ""}
          onValueChange={(nextValue) => onChange(nextValue || null)}
          label={label}
          placeholder={includeEmpty ? emptyLabel : "Seleziona"}
        />
      ) : (
        <Select
          options={selectOptions}
          value={value || ""}
          onValueChange={(nextValue) => onChange(nextValue || null)}
          label={label}
        />
      )}
      {helperText ? <Text className="text-xs font-medium leading-5 text-iron-muted">{helperText}</Text> : null}
    </View>
  );
}

function DropdownSelect({ options, value, onValueChange, label, placeholder }) {
  const [visible, setVisible] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const hasOptions = options.length > 0;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label || "Selezione"}
        accessibilityState={{ expanded: visible, disabled: !hasOptions }}
        disabled={!hasOptions}
        onPress={() => setVisible(true)}
        className={cn(
          "min-h-12 flex-row items-center rounded-md border border-iron-line bg-iron-card px-3 py-2",
          !hasOptions ? "opacity-60" : ""
        )}
      >
        <Text className={cn("min-w-0 flex-1 text-base font-semibold", selectedOption ? "text-iron-text" : "text-iron-muted")} numberOfLines={1}>
          {selectedOption?.label || (hasOptions ? placeholder : "Nessuna opzione disponibile")}
        </Text>
        <ChevronDown size={20} color={colors.muted} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        statusBarTranslucent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <SafeAreaView
            edges={["right", "bottom", "left"]}
            style={[styles.dropdownSheet, { borderTopColor: colors.line, backgroundColor: colors.card }]}
          >
            <View className="mb-4 flex-row items-center">
              <Text className="min-w-0 flex-1 text-xl font-semibold text-iron-text" numberOfLines={1}>
                {label || "Seleziona"}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Chiudi selezione"
                onPress={() => setVisible(false)}
                className="h-11 w-11 items-center justify-center rounded-md bg-iron-surface"
              >
                <X size={22} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView>
              {options.map((option) => {
                const selected = option.value === value;
                const disabled = Boolean(option.disabled);
                return (
                  <Pressable
                    key={String(option.value)}
                    accessibilityRole="button"
                    accessibilityLabel={`${label || "Selezione"}: ${option.label}`}
                    accessibilityState={{ selected, disabled }}
                    disabled={disabled}
                    onPress={() => {
                      onValueChange(option.value);
                      setVisible(false);
                    }}
                    className={cn(
                      "min-h-12 flex-row items-center border-b border-iron-line px-2 py-3",
                      disabled ? "opacity-45" : ""
                    )}
                  >
                    <View className="min-w-0 flex-1">
                      <Text className={cn("text-base font-semibold", selected ? "text-iron-infoText" : "text-iron-text")}>
                        {option.label}
                      </Text>
                      {option.description ? <Text className="mt-1 text-xs font-medium text-iron-muted">{option.description}</Text> : null}
                    </View>
                    {selected ? <Check size={20} color={colors.info} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </>
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

const styles = StyleSheet.create({
  dropdownSheet: {
    width: "100%",
    maxWidth: 820,
    maxHeight: "75%",
    alignSelf: "center",
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 16
  }
});
