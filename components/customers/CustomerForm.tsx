import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { strings } from '@/constants/strings';
import { theme } from '@/constants/theme';
import { archiveCustomer, createCustomer, updateCustomer } from '@/db/repositories/customers';
import {
  validateOptionalEmail,
  validateOptionalGstin,
  validateOptionalPhone,
  validateOptionalStateCode,
  validateRequired,
} from '@/lib/validation';
import type { Customer, CustomerInput } from '@/types/customer';

type CustomerFormProps = { customer?: Customer };

const emptyValues: CustomerInput = {
  name: '', phone: '', email: '', gstin: '', stateCode: '', billingAddress: '', notes: '',
};

function valuesFromCustomer(customer: Customer): CustomerInput {
  return {
    name: customer.name,
    phone: customer.phone ?? '',
    email: customer.email ?? '',
    gstin: customer.gstin ?? '',
    stateCode: customer.stateCode ?? '',
    billingAddress: customer.billingAddress ?? '',
    notes: customer.notes ?? '',
  };
}

export function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter();
  const editing = customer !== undefined;
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<CustomerInput>({
    defaultValues: customer ? valuesFromCustomer(customer) : emptyValues,
    mode: 'onBlur',
  });

  const submit = handleSubmit(async (values) => {
    try {
      if (customer) {
        await updateCustomer(customer.id, values);
        Alert.alert(
          strings.customers.messages.updateSuccessTitle,
          strings.customers.messages.updateSuccessDescription,
        );
        router.back();
      } else {
        await createCustomer(values);
        router.back();
      }
    } catch {
      Alert.alert(
        editing ? strings.customers.messages.updateErrorTitle : strings.customers.messages.createErrorTitle,
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
        { text: strings.common.cancel, style: 'cancel' },
        {
          text: strings.common.archive,
          style: 'destructive',
          onPress: () => {
            void archiveCustomer(customer.id)
              .then(() => router.replace('/(tabs)/customers'))
              .catch(() => Alert.alert(
                strings.customers.messages.archiveErrorTitle,
                strings.customers.messages.archiveErrorDescription,
              ));
          },
        },
      ],
    );
  }

  return (
    <ScreenContainer keyboardAware contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>{editing ? strings.customers.editTitle : strings.customers.newTitle}</Text>
      </View>
      <Card style={styles.form}>
        <Controller control={control} name="name" rules={{ validate: validateRequired }} render={({ field, fieldState }) => (
          <Input label={strings.customers.fields.name} value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} autoCapitalize="words" />
        )} />
        <Controller control={control} name="phone" rules={{ validate: validateOptionalPhone }} render={({ field, fieldState }) => (
          <Input label={strings.customers.fields.phone} helperText={strings.customers.helpers.optional} value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} keyboardType="phone-pad" maxLength={10} />
        )} />
        <Controller control={control} name="email" rules={{ validate: validateOptionalEmail }} render={({ field, fieldState }) => (
          <Input label={strings.customers.fields.email} helperText={strings.customers.helpers.optional} value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} keyboardType="email-address" autoCapitalize="none" />
        )} />
        <Controller control={control} name="gstin" rules={{ validate: validateOptionalGstin }} render={({ field, fieldState }) => (
          <Input label={strings.customers.fields.gstin} helperText={strings.customers.helpers.optional} value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} autoCapitalize="characters" maxLength={15} />
        )} />
        <Controller control={control} name="stateCode" rules={{ validate: validateOptionalStateCode }} render={({ field, fieldState }) => (
          <Input label={strings.customers.fields.stateCode} helperText={strings.customers.helpers.stateCode} value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} keyboardType="number-pad" maxLength={2} />
        )} />
        <Controller control={control} name="billingAddress" render={({ field }) => (
          <Input label={strings.customers.fields.billingAddress} helperText={strings.customers.helpers.optional} value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} multiline numberOfLines={3} />
        )} />
        <Controller control={control} name="notes" render={({ field }) => (
          <Input label={strings.customers.fields.notes} helperText={strings.customers.helpers.optional} value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} multiline numberOfLines={3} />
        )} />
      </Card>
      <Button label={editing ? strings.customers.actions.update : strings.customers.actions.create} loading={isSubmitting} onPress={() => void submit()} />
      {customer ? <Button label={strings.payments.ledger} onPress={() => router.push({ pathname: '/customer/[id]/ledger', params: { id: customer.id } })} /> : null}
      {editing ? <Button label={strings.customers.actions.archive} variant="danger" onPress={confirmArchive} /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.spacing[5] },
  header: { minHeight: theme.layout.headerHeight, flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] },
  back: { width: theme.layout.minimumTouchTarget, height: theme.layout.minimumTouchTarget, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, color: theme.colors.textPrimary, ...theme.typography.screenTitle },
  form: { gap: theme.spacing[4] },
});
