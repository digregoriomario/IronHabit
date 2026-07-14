import { Link2 } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { colors } from "../theme/colors";
import { Card } from "./Card";
import { cn } from "../utils/cn";

export function MetricStrip({ items }) {
  return (
    <Card className="flex-row p-0">
      {items.map((item, index) => {
        const Wrapper = item.onPress ? Pressable : View;
        return (
          <Wrapper
            key={item.label}
            accessibilityRole={item.onPress ? "button" : undefined}
            accessibilityLabel={item.onPress ? `Apri ${item.label}` : undefined}
            onPress={item.onPress}
            className={cn(
              "min-h-20 flex-1 items-center justify-center px-3 py-4",
              index ? "border-l border-iron-line" : "",
              item.onPress ? "active:opacity-80" : ""
            )}
          >
            <Text className="text-center text-xl font-semibold leading-6 text-iron-text">{item.value}</Text>
            <View className="mt-2 flex-row items-center justify-center gap-1">
              <Text className="text-center text-xs font-semibold uppercase tracking-wide text-iron-muted">{item.label}</Text>
              {item.onPress ? <Link2 size={12} color={colors.muted} /> : null}
            </View>
          </Wrapper>
        );
      })}
    </Card>
  );
}
