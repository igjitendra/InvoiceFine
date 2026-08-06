import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { SafeAreaView } from "react-native-safe-area-context";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { useAppPalette, type AppPalette } from "@/hooks/useAppPalette";
export type SelectionOption = {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string;
  recent?: boolean;
  favorite?: boolean;
};
export type SelectionCreateAction = {
  id: string;
  label: (query: string) => string;
  onCreate: (query: string) => void;
};
export function SelectionModal({
  visible,
  title,
  options,
  onSelect,
  onClose,
  searchPlaceholder,
  createActions = [],
  onToggleFavorite,
}: {
  visible: boolean;
  title: string;
  options: SelectionOption[];
  onSelect: (id: string) => void;
  onClose: () => void;
  searchPlaceholder?: string;
  createActions?: SelectionCreateAction[];
  onToggleFavorite?: (id: string, favorite: boolean) => void;
}) {
  const palette = useAppPalette();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (visible) setQuery("");
  }, [visible]);
  const filtered = useMemo(() => {
    const value = query.trim().toLocaleLowerCase();
    if (!value) return options;
    return options.filter((option) =>
      `${option.title} ${option.subtitle ?? ""} ${option.keywords ?? ""}`
        .toLocaleLowerCase()
        .includes(value),
    );
  }, [options, query]);
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={styles.close}
          >
            <Text style={styles.closeText}>{strings.invoiceDrafts.close}</Text>
          </Pressable>
        </View>
        <View style={styles.search}>
          <Ionicons name="search" size={20} color={palette.muted} />
          <TextInput
            autoFocus
            accessibilityLabel={searchPlaceholder ?? "Search"}
            placeholder={searchPlaceholder ?? "Search"}
            placeholderTextColor={palette.disabled}
            value={query}
            onChangeText={setQuery}
            style={styles.input}
          />
          {query ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setQuery("")}
            >
              <Ionicons name="close-circle" size={20} color={palette.muted} />
            </Pressable>
          ) : null}
        </View>
        <ScrollView keyboardShouldPersistTaps="handled">
          {createActions.map((action) => (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              onPress={() => action.onCreate(query.trim())}
              style={({ pressed }) => [
                styles.createRow,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.createIcon}>
                <Ionicons name="add" size={22} color={palette.textOnPrimary} />
              </View>
              <Text style={styles.createText}>
                {action.label(query.trim())}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={19}
                color={palette.primary}
              />
            </Pressable>
          ))}
          {filtered.map((option) => (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              onPress={() => onSelect(option.id)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.copy}>
                <View style={styles.titleRow}>
                  <Text style={styles.option}>{option.title}</Text>
                  {option.recent ? (
                    <Text style={styles.recent}>{strings.ux.recent}</Text>
                  ) : null}
                </View>
                {option.subtitle ? (
                  <Text style={styles.subtitle}>{option.subtitle}</Text>
                ) : null}
              </View>
              {onToggleFavorite ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    option.favorite
                      ? strings.speedTools.removeFavorite
                      : strings.speedTools.addFavorite
                  }
                  onPress={(event) => {
                    event.stopPropagation();
                    onToggleFavorite(option.id, !option.favorite);
                  }}
                  style={styles.favoriteButton}
                >
                  <Ionicons
                    name={option.favorite ? "star" : "star-outline"}
                    size={22}
                    color={option.favorite ? palette.warning : palette.muted}
                  />
                </Pressable>
              ) : null}
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={palette.primary}
              />
            </Pressable>
          ))}
          {filtered.length === 0 ? (
            <Text style={styles.empty}>{strings.common.noResults}</Text>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
function createStyles(palette: AppPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: palette.background },
    header: {
      minHeight: theme.layout.headerHeight,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.layout.screenHorizontalPadding,
    },
    title: { color: palette.text, ...theme.typography.sectionTitle },
    close: {
      minHeight: theme.layout.minimumTouchTarget,
      justifyContent: "center",
    },
    closeText: { color: palette.primary, ...theme.typography.body },
    search: {
      minHeight: 52,
      marginHorizontal: theme.layout.screenHorizontalPadding,
      marginBottom: theme.spacing[3],
      paddingHorizontal: theme.spacing[3],
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing[2],
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      borderRadius: 14,
    },
    input: { flex: 1, color: palette.text, ...theme.typography.body },
    row: {
      minHeight: 72,
      paddingHorizontal: theme.layout.screenHorizontalPadding,
      paddingVertical: theme.spacing[3],
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing[3],
      backgroundColor: palette.surface,
      borderBottomColor: palette.border,
      borderBottomWidth: theme.layout.borderWidth,
    },
    createRow: {
      minHeight: 64,
      marginHorizontal: theme.layout.screenHorizontalPadding,
      marginBottom: theme.spacing[2],
      paddingHorizontal: theme.spacing[3],
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing[3],
      backgroundColor: palette.primarySoft,
      borderWidth: 1,
      borderColor: palette.primary,
      borderRadius: 16,
    },
    createIcon: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 13,
      backgroundColor: palette.primary,
    },
    createText: {
      flex: 1,
      color: palette.primarySoftText,
      ...theme.typography.label,
    },
    pressed: { backgroundColor: palette.primarySoft },
    copy: { flex: 1 },
    favoriteButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing[2],
    },
    option: { color: palette.text, ...theme.typography.body },
    recent: {
      color: palette.primarySoftText,
      backgroundColor: palette.primarySoft,
      paddingHorizontal: theme.spacing[2],
      paddingVertical: 2,
      borderRadius: 99,
      ...theme.typography.caption,
    },
    subtitle: { color: palette.muted, ...theme.typography.secondary },
    empty: {
      padding: theme.spacing[5],
      textAlign: "center",
      color: palette.muted,
      ...theme.typography.body,
    },
  });
}
