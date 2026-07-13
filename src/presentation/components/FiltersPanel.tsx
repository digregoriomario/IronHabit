import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { colors } from "../theme/colors";
import { Badge } from "./ui/badge";

export function FiltersPanel({ children, activeCount = 0, initiallyOpen = false }) {
  const [open, setOpen] = useState(initiallyOpen);
  const Chevron = open ? ChevronUp : ChevronDown;

  return (
    <View className="mb-4 overflow-hidden rounded-lg border border-iron-line bg-iron-card">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={open ? "Nascondi filtri" : "Mostra filtri"}
        aria-label={open ? "Nascondi filtri" : "Mostra filtri"}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        className="min-h-12 flex-row items-center gap-3 px-4 py-3 active:opacity-75"
      >
        <SlidersHorizontal size={18} color={colors.muted} />
        <Text className="flex-1 text-sm font-semibold uppercase tracking-wide text-iron-text">Filtri</Text>
        {activeCount ? <Badge>{activeCount}</Badge> : null}
        <Chevron size={18} color={colors.muted} />
      </Pressable>
      {open ? <View className="gap-3 border-t border-iron-line p-4">{children}</View> : null}
    </View>
  );
}
