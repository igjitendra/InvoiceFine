import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { strings } from '@/constants/strings';
import { routes } from '@/constants/routes';
import { theme } from '@/constants/theme';
import { getBusinessProfile, saveBusinessProfile } from '@/db/repositories/business-settings';
import {
  validateGstin,
  validateInvoiceNumber,
  validateInvoicePrefix,
  validateOptionalEmail,
  validatePhone,
  validateRequired,
  validateStateCode,
} from '@/lib/validation';
import { pickBusinessImage } from '@/services/image-picker';
import type { BusinessProfileFormValues } from '@/types/business';

import { ImageField } from './ImageField';

const defaultValues: BusinessProfileFormValues = {
  businessName: '',
  gstin: '',
  stateCode: '',
  address: '',
  phone: '',
  email: '',
  logoUri: null,
  signatureUri: null,
  invoicePrefix: 'INV',
  nextInvoiceNumber: '1',
  taxEnabled: false,
  invoicePageSize: 'a4',
};

export function BusinessProfileForm() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<BusinessProfileFormValues>({ defaultValues, mode: 'onBlur' });
  const taxEnabled = watch('taxEnabled');
  const logoUri = watch('logoUri');
  const signatureUri = watch('signatureUri');

  useEffect(() => {
    let active = true;
    void getBusinessProfile().then((profile) => {
      if (!active || !profile) return;
      reset({
        businessName: profile.businessName, gstin: profile.gstin ?? '', stateCode: profile.stateCode ?? '',
        address: profile.address, phone: profile.phone, email: profile.email ?? '', logoUri: profile.logoUri,
        signatureUri: profile.signatureUri, invoicePrefix: profile.invoicePrefix,
        nextInvoiceNumber: String(profile.nextInvoiceNumber), taxEnabled: profile.taxEnabled,
        invoicePageSize: profile.invoicePageSize,
      });
    });
    return () => { active = false; };
  }, [reset]);

  async function chooseImage(
    field: 'logoUri' | 'signatureUri',
    aspect: [number, number],
  ) {
    try {
      const uri = await pickBusinessImage({ aspect });
      if (uri) {
        setValue(field, uri, { shouldDirty: true });
      }
    } catch {
      Alert.alert(
        strings.onboarding.messages.imageErrorTitle,
        strings.onboarding.messages.imageErrorDescription,
      );
    }
  }

  const submit = handleSubmit(async (values) => {
    try {
      await saveBusinessProfile({
        businessName: values.businessName,
        gstin: values.gstin,
        stateCode: values.stateCode,
        address: values.address,
        phone: values.phone,
        email: values.email,
        logoUri: values.logoUri,
        signatureUri: values.signatureUri,
        invoicePrefix: values.invoicePrefix,
        nextInvoiceNumber: Number(values.nextInvoiceNumber),
        taxEnabled: values.taxEnabled,
        invoicePageSize: values.invoicePageSize,
      });
      router.replace(routes.dashboard);
    } catch {
      Alert.alert(
        strings.onboarding.messages.saveErrorTitle,
        strings.onboarding.messages.saveErrorDescription,
      );
    }
  });

  return (
    <ScreenContainer keyboardAware contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{strings.onboarding.eyebrow}</Text>
        <Text style={styles.title}>{strings.onboarding.title}</Text>
        <Text style={styles.description}>{strings.onboarding.description}</Text>
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.onboarding.sections.identity}</Text>
        <Controller
          control={control}
          name="businessName"
          rules={{ validate: validateRequired }}
          render={({ field, fieldState }) => (
            <Input
              label={strings.onboarding.fields.businessName}
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
          name="address"
          rules={{ validate: validateRequired }}
          render={({ field, fieldState }) => (
            <Input
              label={strings.onboarding.fields.address}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              multiline
              numberOfLines={3}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          rules={{ validate: validatePhone }}
          render={({ field, fieldState }) => (
            <Input
              label={strings.onboarding.fields.phone}
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
              label={strings.onboarding.fields.email}
              helperText={strings.onboarding.helpers.email}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          )}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.onboarding.sections.tax}</Text>
        <Controller
          control={control}
          name="taxEnabled"
          render={({ field }) => (
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{strings.onboarding.fields.taxEnabled}</Text>
              <Switch
                accessibilityLabel={strings.onboarding.fields.taxEnabled}
                value={field.value}
                onValueChange={field.onChange}
                trackColor={{ false: theme.colors.borderStrong, true: theme.colors.primarySoft }}
                thumbColor={field.value ? theme.colors.primary : theme.colors.disabled}
              />
            </View>
          )}
        />
        <Controller
          control={control}
          name="gstin"
          rules={{ validate: (value) => validateGstin(value, taxEnabled) }}
          render={({ field, fieldState }) => (
            <Input
              label={strings.onboarding.fields.gstin}
              helperText={strings.onboarding.helpers.gstin}
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
          rules={{ validate: (value) => validateStateCode(value, taxEnabled) }}
          render={({ field, fieldState }) => (
            <Input
              label={strings.onboarding.fields.stateCode}
              helperText={strings.onboarding.helpers.stateCode}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              keyboardType="number-pad"
              maxLength={2}
            />
          )}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.onboarding.sections.numbering}</Text>
        <Controller
          control={control}
          name="invoicePrefix"
          rules={{ validate: validateInvoicePrefix }}
          render={({ field, fieldState }) => (
            <Input
              label={strings.onboarding.fields.invoicePrefix}
              helperText={strings.onboarding.helpers.invoicePrefix}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              autoCapitalize="characters"
              maxLength={10}
            />
          )}
        />
        <Controller
          control={control}
          name="nextInvoiceNumber"
          rules={{ validate: validateInvoiceNumber }}
          render={({ field, fieldState }) => (
            <Input
              label={strings.onboarding.fields.nextInvoiceNumber}
              value={field.value}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
              keyboardType="number-pad"
            />
          )}
        />
      </Card>


      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.onboarding.sections.printing}</Text>
        <Text style={styles.switchLabel}>{strings.onboarding.fields.invoicePageSize}</Text>
        <Controller control={control} name="invoicePageSize" render={({ field }) => (
          <View style={styles.pageSizes}>
            {(['a4', '4x6'] as const).map((size) => (
              <Pressable key={size} accessibilityRole="button" onPress={() => field.onChange(size)} style={[styles.pageSize, field.value === size && styles.pageSizeActive]}>
                <Text style={[styles.pageSizeText, field.value === size && styles.pageSizeTextActive]}>{size === 'a4' ? strings.pdf.a4 : strings.pdf.compact}</Text>
              </Pressable>
            ))}
          </View>
        )} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.onboarding.sections.branding}</Text>
        <ImageField
          label={strings.onboarding.fields.logo}
          helperText={strings.onboarding.helpers.logo}
          value={logoUri}
          onChoose={() => void chooseImage('logoUri', [1, 1])}
          onRemove={() => setValue('logoUri', null, { shouldDirty: true })}
        />
        <ImageField
          label={strings.onboarding.fields.signature}
          helperText={strings.onboarding.helpers.signature}
          value={signatureUri}
          onChoose={() => void chooseImage('signatureUri', [4, 1])}
          onRemove={() => setValue('signatureUri', null, { shouldDirty: true })}
        />
      </Card>

      <Button
        label={strings.common.save}
        loading={isSubmitting}
        onPress={() => void submit()}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.spacing[5] },
  header: { gap: theme.spacing[2] },
  eyebrow: { color: theme.colors.primary, ...theme.typography.eyebrow },
  title: { color: theme.colors.textPrimary, ...theme.typography.screenTitle },
  description: { color: theme.colors.textSecondary, ...theme.typography.body },
  section: { gap: theme.spacing[4] },
  sectionTitle: { color: theme.colors.textPrimary, ...theme.typography.sectionTitle },
  switchRow: {
    minHeight: theme.layout.minimumTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[4],
  },
  switchLabel: { flex: 1, color: theme.colors.textPrimary, ...theme.typography.body },
  pageSizes: { flexDirection: 'row', gap: theme.spacing[2] },
  pageSize: { flex: 1, minHeight: theme.layout.minimumTouchTarget, alignItems: 'center', justifyContent: 'center', borderWidth: theme.layout.borderWidth, borderColor: theme.colors.border, borderRadius: theme.radii.small },
  pageSizeActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
  pageSizeText: { color: theme.colors.textSecondary, ...theme.typography.secondary },
  pageSizeTextActive: { color: theme.colors.primary, fontWeight: '700' },
});
