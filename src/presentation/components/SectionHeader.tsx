import { Text, View } from "react-native";

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View className="mb-3 mt-6 flex-row items-center justify-between gap-3">
      <Text className="min-w-0 flex-1 text-lg font-semibold leading-6 text-iron-text" numberOfLines={1}>{title}</Text>
      {action}
    </View>
  );
}
