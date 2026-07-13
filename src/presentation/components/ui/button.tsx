import { cva, type VariantProps } from "class-variance-authority";
import { ActivityIndicator, Platform, Pressable, Text } from "react-native";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { colors } from "../../theme/colors";
import { cn } from "../../utils/cn";

export const buttonVariants = cva(
  cn(
    "group shrink-0 flex-row items-center justify-center gap-2 rounded-md border",
    Platform.select({
      web: "outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-iron-text/20 disabled:pointer-events-none"
    })
  ),
  {
    variants: {
      variant: {
        default: "border-iron-text bg-iron-text active:bg-iron-text/90",
        secondary: "border-iron-line bg-iron-surface active:bg-iron-line",
        outline: "border-iron-text bg-iron-card active:bg-iron-surface",
        ghost: "border-transparent bg-transparent active:bg-iron-surface",
        success: "border-iron-success bg-iron-successSoft active:bg-iron-successSoft/80",
        info: "border-iron-info bg-iron-infoSoft active:bg-iron-infoSoft/80",
        warning: "border-iron-warning bg-iron-warningSoft active:bg-iron-warningSoft/80",
        destructive: "border-iron-danger bg-iron-dangerSoft active:bg-iron-dangerSoft/80"
      },
      size: {
        sm: "min-h-10 px-3 py-2",
        default: "min-h-12 px-4 py-3",
        lg: "min-h-14 px-5 py-4",
        icon: "h-12 w-12 p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export const buttonTextVariants = cva("text-center font-semibold", {
  variants: {
    variant: {
      default: "text-iron-inverseText",
      secondary: "text-iron-text",
      outline: "text-iron-text",
      ghost: "text-iron-text",
      success: "text-iron-successText",
      info: "text-iron-infoText",
      warning: "text-iron-warningText",
      destructive: "text-iron-dangerText"
    },
    size: {
      sm: "text-sm",
      default: "text-base",
      lg: "text-base",
      icon: "text-base"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "default"
  }
});

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
type ButtonSize = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

interface ButtonProps extends ComponentPropsWithoutRef<typeof Pressable>, VariantProps<typeof buttonVariants> {
  children?: ReactNode;
  loading?: boolean;
}

export function Button({ className, variant, size, disabled, loading, children, ...props }: ButtonProps) {
  const isFilled = variant === "default";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading) }}
      disabled={disabled || loading}
      hitSlop={4}
      className={cn(buttonVariants({ variant, size }), disabled || loading ? "opacity-50" : "active:opacity-85", className)}
      {...props}
    >
      {loading ? <ActivityIndicator color={isFilled ? colors.inverseText : colors.text} /> : children}
    </Pressable>
  );
}

interface ButtonTextProps extends VariantProps<typeof buttonTextVariants> {
  children: ReactNode;
  className?: string;
  numberOfLines?: number;
}

export function ButtonText({ children, className, variant, size, numberOfLines = 1 }: ButtonTextProps) {
  return (
    <Text className={cn(buttonTextVariants({ variant, size }), className)} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function getButtonIconColor(variant: ButtonVariant = "default") {
  if (variant === "default") return colors.inverseText;
  if (variant === "success") return colors.successText;
  if (variant === "info") return colors.infoText;
  if (variant === "warning") return colors.warningText;
  if (variant === "destructive") return colors.dangerText;
  return colors.text;
}

export type { ButtonVariant, ButtonSize };
