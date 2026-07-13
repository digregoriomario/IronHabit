import { colors } from "../theme/colors";
import { Button, type ButtonVariant } from "./ui/button";

interface IconButtonProps {
  icon: any;
  onPress: () => void;
  color?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  hint?: string;
}

export function IconButton({
  icon: Icon,
  onPress,
  color = colors.primary,
  className = "",
  disabled = false,
  label = "Azione",
  hint
}: IconButtonProps) {
  const variant: ButtonVariant =
    color === colors.danger
      ? "destructive"
      : color === colors.success
        ? "success"
        : color === colors.info
          ? "info"
          : color === colors.warning
            ? "warning"
            : "secondary";

  const iconColor =
    color === colors.danger
      ? colors.dangerText
      : color === colors.success
        ? colors.successText
        : color === colors.info
          ? colors.infoText
          : color === colors.warning
            ? colors.warningText
            : colors.text;

  return (
    <Button
      accessibilityLabel={label}
      aria-label={label}
      accessibilityHint={hint}
      onPress={onPress}
      disabled={disabled}
      variant={variant}
      size="icon"
      className={className}
    >
      <Icon size={20} color={iconColor} />
    </Button>
  );
}
