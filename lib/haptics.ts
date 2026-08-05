import * as Haptics from "expo-haptics";
export type HapticFeedback =
  "selection" | "light" | "medium" | "success" | "warning" | "error";
export async function triggerHaptic(type: HapticFeedback): Promise<void> {
  try {
    if (type === "selection") {
      await Haptics.selectionAsync();
      return;
    }
    if (type === "light" || type === "medium") {
      await Haptics.impactAsync(
        type === "light"
          ? Haptics.ImpactFeedbackStyle.Light
          : Haptics.ImpactFeedbackStyle.Medium,
      );
      return;
    }
    const notification =
      type === "success"
        ? Haptics.NotificationFeedbackType.Success
        : type === "warning"
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Error;
    await Haptics.notificationAsync(notification);
  } catch {}
}
