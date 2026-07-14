import type { ViewStyle } from "react-native";
import type { Edge } from "react-native-safe-area-context";

export const FORM_SCREEN_EDGES: Edge[] = ["right", "bottom", "left"];

export const FORM_HEADER_TOP_PADDING = 8;

export const FORM_SCROLL_CONTENT_STYLE: ViewStyle = {
  paddingHorizontal: 16,
  paddingTop: FORM_HEADER_TOP_PADDING,
  paddingBottom: 32
};
