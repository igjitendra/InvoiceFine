import { StyleSheet, Text as NativeText, type TextProps } from "react-native";

import { useAppearance } from "@/hooks/useAppearance";

export function AppText({ style, ...props }: TextProps) {
  const { fontScale } = useAppearance();
  const flattened = StyleSheet.flatten(style);
  const scaledStyle =
    fontScale === 1
      ? undefined
      : {
          fontSize:
            typeof flattened?.fontSize === "number"
              ? Math.round(flattened.fontSize * fontScale)
              : Math.round(14 * fontScale),
          lineHeight:
            typeof flattened?.lineHeight === "number"
              ? Math.round(flattened.lineHeight * fontScale)
              : undefined,
        };

  return <NativeText style={[style, scaledStyle]} {...props} />;
}
