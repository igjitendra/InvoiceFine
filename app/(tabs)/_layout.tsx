import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { strings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { useAppPalette } from '@/hooks/useAppPalette';

type IconName = ComponentProps<typeof Ionicons>['name'];

type TabIconProps = {
  color: ColorValue;
  focused: boolean;
  size: number;
};

function createTabIcon(active: IconName, inactive: IconName) {
  return function TabIcon({ color, focused, size }: TabIconProps) {
    return (
      <Ionicons
        name={focused ? active : inactive}
        color={color}
        size={size}
      />
    );
  };
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const palette = useAppPalette();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.muted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: theme.typography.tabLabel,
        tabBarItemStyle: {
          minHeight: theme.layout.minimumTouchTarget,
        },
        tabBarStyle: {
          height: theme.layout.tabBarHeight + insets.bottom,
          paddingTop: theme.spacing[2],
          paddingBottom: Math.max(insets.bottom, theme.spacing[2]),
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          borderTopWidth: theme.layout.borderWidth,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: strings.tabs.dashboard,
          tabBarIcon: createTabIcon('grid', 'grid-outline'),
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: strings.tabs.invoices,
          tabBarIcon: createTabIcon('document-text', 'document-text-outline'),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: strings.tabs.customers,
          tabBarIcon: createTabIcon('people', 'people-outline'),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: strings.tabs.catalog,
          tabBarIcon: createTabIcon('cube', 'cube-outline'),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: strings.tabs.more,
          tabBarIcon: createTabIcon('menu', 'menu-outline'),
        }}
      />
    </Tabs>
  );
}
