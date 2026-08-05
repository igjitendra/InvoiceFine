import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { useAppPalette } from "@/hooks/useAppPalette";
import { useBusinessType } from "@/hooks/useBusinessType";

type IconName = ComponentProps<typeof Ionicons>["name"];
type IconProps = { color: ColorValue; focused: boolean; size: number };

function icon(active: IconName, inactive: IconName) {
  return function TabIcon({ color, focused, size }: IconProps) {
    return (
      <Ionicons name={focused ? active : inactive} color={color} size={size} />
    );
  };
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const palette = useAppPalette();
  const businessType = useBusinessType();
  const catalogTitle =
    businessType === "product"
      ? strings.tabs.products
      : businessType === "service"
        ? strings.tabs.services
        : strings.tabs.catalog;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: theme.typography.tabLabel,
        tabBarItemStyle: { minHeight: 44 },
        tabBarStyle: {
          height: 66 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          borderTopWidth: 1,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: strings.tabs.dashboard,
          tabBarIcon: icon("grid", "grid-outline"),
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: strings.tabs.invoices,
          tabBarIcon: icon("document-text", "document-text-outline"),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: catalogTitle,
          tabBarIcon: icon(
            businessType === "service" ? "construct" : "cube",
            businessType === "service" ? "construct-outline" : "cube-outline",
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: strings.tabs.customers,
          tabBarIcon: icon("people", "people-outline"),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: strings.tabs.reports,
          tabBarIcon: icon("bar-chart", "bar-chart-outline"),
        }}
      />
      <Tabs.Screen name="more" options={{ href: null }} />
    </Tabs>
  );
}
