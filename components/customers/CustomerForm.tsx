import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { showFreePlanLimit } from "@/components/monetization/free-plan-alert";
import { strings } from "@/constants/strings";
import { theme } from "@/constants/theme";
import {
  archiveCustomer,
  createCustomer,
  updateCustomer,
} from "@/db/repositories/customers";
import { useAppPalette } from "@/hooks/useAppPalette";
import {
  validateOptionalEmail,
  validateOptionalGstin,
  validateOptionalPhone,
  validateOptionalStateCode,
  validateRequired,
} from "@/lib/validation";
import type { Customer, CustomerInput } from "@/types/customer";

type CustomerFormProps = {
  customer?: Customer;
  onSaved?: () => void;
  onCancel?: () => void;
};

const emptyValues: CustomerInput = {
  name: "",
  phone: "",
  email: "",
  gstin: "",
  stateCode: "",
  billingAddress: "",
  shippingAddress: "",
  stateName: "",
  pincode: "",
  notes: "",
};

function valuesFromCustomer(customer: Customer): CustomerInput {
  return {
    name: customer.name,
    phone: customer.phone ?? "",
    email: customer.email ?? "",
    gstin: customer.gstin ?? "",
    stateCode: customer.stateCode ?? "",
    billingAddress: customer.billingAddress ?? "",
    shippingAddress: customer.shippingAddress ?? "",
    stateName: customer.stateName ?? "",
    pincode: customer.pincode ?? "",
    notes: customer.notes ?? "",
  };
}

export function CustomerForm({
  customer,
  onSaved,
  onCancel,
}: CustomerFormProps) {
  const palette = useAppPalette();
  const router = useRouter();
  const editing = customer !== undefined;
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CustomerInput>({
    defaultValues: customer ? valuesFromCustomer(customer) : emptyValues,
    mode: "onBlur",
  });

  const submit = handleSubmit(async (values) => {
    try {
      if (customer) {
        await updateCustomer(customer.id, values);
        Alert.alert(
          strings.customers.messages.updateSuccessTitle,
          strings.customers.messages.updateSuccessDescription,
        );
        if (onSaved) onSaved();
        else router.back();
      } else {
        await createCustomer(values);
        router.back();
      }
    } catch (error) {
      if (showFreePlanLimit(error, () => router.push("/upgrade"))) return;
      Alert.alert(
        editing
          ? strings.customers.messages.updateErrorTitle
          : strings.customers.messages.createErrorTitle,
        strings.customers.messages.saveErrorDescription,
      );
    }
  });

  function confirmArchive() {
    if (!customer) return;
    Alert.alert(
      strings.customers.messages.archiveTitle,
      strings.customers.messages.archiveDescription,
      [
        { text: strings.common.cancel, style: "cancel" },
        {
          text: strings.common.archive,
          style: "destructive",
          onPress: () => {
            void archiveCustomer(customer.id)
              .then(() => router.replace("/(tabs)/customers"))
              .catch(() =>
                Alert.alert(
                  strings.customers.messages.archiveErrorTitle,
                  strings.customers.messages.archiveErrorDescription,
                ),
              );
          },
        },
      ],
    );
  }

  return (
    <ScreenContainer keyboardAware contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => (onCancel ? onCancel() : router.back())}
          style={({ pressed }) => [
            styles.back,
            { backgroundColor: palette.surface, borderColor: palette.border },
            pressed && { backgroundColor: palette.surfaceVariant },
          ]}
        >
          <Ionicons name="arrow-back" size={23} color={palette.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: palette.text }]}>
            {editing ? strings.customers.editTitle : strings.customers.newTitle}
          </Text>
          <Text style={[styles.description, { color: palette.muted }]}>
            {strings.customers.formDescription}
          </Text>
        </View>
      </View>

      <Card style={styles.formCard}>
        <SectionHeader
          icon="person-outline"
          title={strings.customers.sections.contact}
        />
        <Controller
          control={control}
          name="name"
          rules={{ validate: validateRequired }}
          render={({ field, fieldState }) => (
            <Input
              label={strings.customers.fields.name}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              autoCapitalize="words"
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          rules={{ validate: validateOptionalPhone }}
          render={({ field, fieldState }) => (
            <Input
              label={strings.customers.fields.phone}
              helperText={strings.customers.helpers.optional}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              keyboardType="phone-pad"
              maxLength={10}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          rules={{ validate: validateOptionalEmail }}
          render={({ field, fieldState }) => (
            <Input
              label={strings.customers.fields.email}
              helperText={strings.customers.helpers.optional}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
      </Card>

      <Card style={styles.formCard}>
        <SectionHeader
          icon="receipt-outline"
          title={strings.customers.sections.tax}
        />
        <Controller
          control={control}
          name="gstin"
          rules={{ validate: validateOptionalGstin }}
          render={({ field, fieldState }) => (
            <Input
              label={strings.customers.fields.gstin}
              helperText={strings.customers.helpers.optional}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              autoCapitalize="characters"
              maxLength={15}
            />
          )}
        />
        <Controller
          control={control}
          name="stateCode"
          rules={{ validate: validateOptionalStateCode }}
          render={({ field, fieldState }) => (
            <Input
              label={strings.customers.fields.stateCode}
              helperText={strings.customers.helpers.stateCode}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              keyboardType="number-pad"
              maxLength={2}
            />
          )}
        />
        <Controller
          control={control}
          name="billingAddress"
          render={({ field }) => (
            <Input
              label={strings.customers.fields.billingAddress}
              helperText={strings.customers.helpers.optional}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              multiline
              numberOfLines={3}
            />
          )}
        />
      </Card>

      <Card style={styles.formCard}>
        <SectionHeader
          icon="document-text-outline"
          title={strings.customers.sections.notes}
        />
        <Controller
          control={control}
          name="notes"
          render={({ field }) => (
            <Input
              label={strings.customers.fields.notes}
              helperText={strings.customers.helpers.optional}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              multiline
              numberOfLines={3}
            />
          )}
        />
      </Card>

      <Button
        label={
          editing
            ? strings.customers.actions.update
            : strings.customers.actions.create
        }
        loading={isSubmitting}
        onPress={() => void submit()}
      />
      {customer ? (
        <Button
          label={strings.payments.ledger}
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: "/customer/[id]/ledger",
              params: { id: customer.id },
            })
          }
        />
      ) : null}
      {editing ? (
        <Button
          label={strings.customers.actions.archive}
          variant="danger"
          onPress={confirmArchive}
        />
      ) : null}
    </ScreenContainer>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: "person-outline" | "receipt-outline" | "document-text-outline";
  title: string;
}) {
  const palette = useAppPalette();
  return (
    <View style={styles.sectionHeader}>
      <View
        style={[styles.sectionIcon, { backgroundColor: palette.primarySoft }]}
      >
        <Ionicons name={icon} size={20} color={palette.primary} />
      </View>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 4,
  },
  back: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 16,
  },
  headerCopy: { flex: 1 },
  title: { fontSize: 30, lineHeight: 37, fontWeight: "700" },
  description: { ...theme.typography.secondary, marginTop: 2 },
  formCard: { gap: 16, borderRadius: 22 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 2,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
  },
  sectionTitle: { ...theme.typography.sectionTitle },
});
