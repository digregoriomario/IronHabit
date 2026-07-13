import { Text, View } from "react-native";

import { Card } from "./Card";
import { colors } from "../theme/colors";

export function MetricCard({ label, value, accent = colors.primary, icon: Icon }) {
  return (
    <Card className="min-h-24 flex-1">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-2xl font-semibold leading-7 text-iron-text">{value}</Text>
          <Text className="mt-2 text-xs font-semibold uppercase tracking-wide text-iron-muted">{label}</Text>
        </View>
        {Icon ? (
          <View className="h-9 w-9 items-center justify-center rounded-md border border-iron-line bg-iron-surface">
            <Icon size={18} color={accent} />
          </View>
        ) : null}
      </View>
    </Card>
  );
}
