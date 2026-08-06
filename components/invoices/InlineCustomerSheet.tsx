import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import { createCustomer, getCustomer } from "@/db/repositories/customers";
import { useAppPalette } from "@/hooks/useAppPalette";
import {
  validateOptionalGstin,
  validatePhone,
  validateRequired,
} from "@/lib/validation";
import type { Customer } from "@/types/customer";

type Props = {
  visible: boolean;
  initialName: string;
  onClose: () => void;
  onSaved: (customer: Customer) => void;
};

export function InlineCustomerSheet({
  visible,
  initialName,
  onClose,
  onSaved,
}: Props) {
  const palette = useAppPalette();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(initialName.trim());
    setPhone("");
    setGstin("");
    setAddress("");
    setErrors({});
  }, [initialName, visible]);

  async function save() {
    const next: Record<string, string> = {};
    const nameResult = validateRequired(name);
    const phoneResult = validatePhone(phone);
    const gstinResult = validateOptionalGstin(gstin);
    if (nameResult !== true) next.name = nameResult;
    if (phoneResult !== true) next.phone = phoneResult;
    if (gstinResult !== true) next.gstin = gstinResult;
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      const id = await createCustomer({
        name,
        phone,
        gstin,
        billingAddress: address,
        email: "",
        stateCode: "",
        notes: "",
      });
      const customer = await getCustomer(id);
      if (!customer) throw new Error("Created customer could not be loaded.");
      onSaved(customer);
    } catch {
      Alert.alert(
        "Customer could not be created",
        "Check the customer details and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.overlay} edges={["top", "bottom"]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close customer form"
          style={styles.backdrop}
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={[
              styles.sheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View
              style={[styles.handle, { backgroundColor: palette.borderStrong }]}
            />
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={[styles.title, { color: palette.text }]}>
                  {strings.inlineAdd.newCustomer}
                </Text>
                <Text style={[styles.subtitle, { color: palette.muted }]}>
                  {strings.inlineAdd.customerSubtitle}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                style={styles.close}
              >
                <Ionicons name="close" size={23} color={palette.text} />
              </Pressable>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.form}
            >
              <Input
                label={strings.inlineAdd.customerName}
                value={name}
                onChangeText={setName}
                error={errors.name}
                autoCapitalize="words"
              />
              <Input
                label={strings.inlineAdd.phone}
                value={phone}
                onChangeText={setPhone}
                error={errors.phone}
                keyboardType="phone-pad"
                maxLength={10}
              />
              <Input
                label={strings.inlineAdd.gstin}
                value={gstin}
                onChangeText={setGstin}
                error={errors.gstin}
                autoCapitalize="characters"
                maxLength={15}
              />
              <Input
                label={strings.inlineAdd.billingAddress}
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
              />
              <Button
                label={strings.inlineAdd.saveAndSelect}
                loading={saving}
                onPress={() => void save()}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    maxHeight: "91%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  handle: {
    width: 42,
    height: 5,
    alignSelf: "center",
    borderRadius: 99,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  headerCopy: { flex: 1 },
  title: { ...theme.typography.sectionTitle },
  subtitle: { ...theme.typography.secondary, marginTop: 2 },
  close: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  form: { gap: 14, paddingBottom: 10 },
});
