import { Text, View } from "react-native";

import { formatProgress } from "../utils/format";

export function ProgressBar({ current, target }) {
  const progress = formatProgress(current, target);
  return (
    <View className="gap-2">
      <View className="h-2 overflow-hidden rounded-full bg-iron-line">
        <View className="h-2 rounded-full bg-iron-text" style={{ width: `${progress}%` }} />
      </View>
      <Text className="text-xs font-semibold text-iron-muted">{progress}% completato</Text>
    </View>
  );
}
