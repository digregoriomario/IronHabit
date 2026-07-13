import { Text, View } from "react-native";
import { Dumbbell } from "lucide-react-native";

import { Card } from "./Card";
import { colors } from "../theme/colors";

export function EmptyState({ title, message, action }: { title: string; message?: string; action?: React.ReactNode }) {
  return (
    <Card className="items-center gap-3 py-9">
      <View className="h-12 w-12 items-center justify-center rounded-md border border-iron-line bg-iron-surface">
        <Dumbbell size={24} color={colors.primary} />
      </View>
      <Text className="text-center text-lg font-semibold leading-6 text-iron-text">{title}</Text>
      {message ? <Text className="max-w-80 text-center text-sm font-medium leading-5 text-iron-muted">{message}</Text> : null}
      {action}
    </Card>
  );
}
