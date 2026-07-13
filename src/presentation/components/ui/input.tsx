import { TextInput } from "react-native";
import type { ComponentPropsWithoutRef } from "react";

import { colors } from "../../theme/colors";
import { cn } from "../../utils/cn";

interface InputProps extends ComponentPropsWithoutRef<typeof TextInput> {
  className?: string;
}

export function Input({ className, multiline, ...props }: InputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      className={cn(
        "rounded-md border border-iron-line bg-iron-card px-3 py-3 text-base leading-5 text-iron-text",
        multiline ? "min-h-24" : "min-h-12",
        className
      )}
      {...props}
    />
  );
}
