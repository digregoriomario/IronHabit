import { Pressable, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";

import { Card } from "./Card";
import { colors } from "../theme/colors";

export function ListRow({ title, subtitle, meta, onPress, children, leading }: {
  title: string;
  subtitle?: string;
  meta?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  leading?: React.ReactNode;
}) {
  const label = [title, subtitle, meta].filter(Boolean).join(". ");

  return (
    <Card className="mb-3">
      <Pressable
        onPress={onPress}
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityLabel={onPress ? label : undefined}
        aria-label={onPress ? label : undefined}
        disabled={!onPress}
        className={onPress ? "active:opacity-80" : ""}
      >
        <View className="flex-row items-center gap-3">
          {leading}
          <View className="flex-1">
            <Text className="text-base font-semibold leading-5 text-iron-text" numberOfLines={2}>{title}</Text>
            {subtitle ? <Text className="mt-1 text-sm font-medium leading-5 text-iron-muted">{subtitle}</Text> : null}
            {meta ? <Text className="mt-2 text-xs font-semibold uppercase tracking-wide text-iron-muted">{meta}</Text> : null}
          </View>
          {onPress ? <ChevronRight size={20} color={colors.muted} /> : null}
        </View>
      </Pressable>
      {children ? <View className="mt-3 border-t border-iron-line pt-3">{children}</View> : null}
    </Card>
  );
}
