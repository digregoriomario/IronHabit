import { View } from "react-native";

import { colors } from "../theme/colors";
import { cn } from "../utils/cn";
import { Button, ButtonText, getButtonIconColor, type ButtonSize, type ButtonVariant } from "./ui/button";

type AppButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "success" | "danger" | "warning" | "info";
type AppButtonSize = "sm" | "default" | "lg";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  icon?: any;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const variantMap: Record<AppButtonVariant, ButtonVariant> = {
  primary: "default",
  secondary: "secondary",
  outline: "outline",
  ghost: "ghost",
  success: "success",
  danger: "destructive",
  warning: "warning",
  info: "info"
};

const sizeMap: Record<AppButtonSize, ButtonSize> = {
  sm: "sm",
  default: "default",
  lg: "lg"
};

export function AppButton({
  title,
  onPress,
  icon: Icon,
  variant = "primary",
  size = "default",
  disabled = false,
  loading = false,
  className = "",
  accessibilityLabel,
  accessibilityHint
}: AppButtonProps) {
  const buttonVariant = variantMap[variant];
  const buttonSize = sizeMap[size];
  const foreground = loading ? colors.text : getButtonIconColor(buttonVariant);

  return (
    <Button
      accessibilityLabel={accessibilityLabel || title}
      aria-label={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      disabled={disabled || loading}
      loading={loading}
      variant={buttonVariant}
      size={buttonSize}
      className={className}
    >
      <View className="flex-row items-center justify-center gap-2">
        {Icon ? <Icon size={size === "lg" ? 21 : 19} color={foreground} /> : null}
        <ButtonText variant={buttonVariant} size={buttonSize} className={cn(size === "lg" ? "text-base" : "")}>{title}</ButtonText>
      </View>
    </Button>
  );
}
