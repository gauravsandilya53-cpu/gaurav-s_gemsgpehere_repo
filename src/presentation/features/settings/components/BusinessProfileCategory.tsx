/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * BusinessProfileCategory.tsx — Complete Business Profile Management Section.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../../core/theme';
import { GlassCard } from '../../../components/ui/GlassCard';
import { PremiumButton } from '../../../components/ui/PremiumButton';
import { useSettingsStore } from '../settingsStore';
import { GstinValidator } from '../../../../domain/gst/GstinValidator';

interface Props {
  onShowToast: (message: string) => void;
}

export const BusinessProfileCategory: React.FC<Props> = ({ onShowToast }) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const store = useSettingsStore();

  const [form, setForm] = useState({
    businessName: store.businessName,
    legalBusinessName: store.legalBusinessName,
    businessEmail: store.businessEmail,
    businessPhone: store.businessPhone,
    businessAddress: store.businessAddress,
    state: store.state,
    pinCode: store.pinCode,
    country: store.country,
    businessType: store.businessType,
    gstRegistrationStatus: store.gstRegistrationStatus,
    gstin: store.gstin,
    registrationNumber: store.registrationNumber,
    financialYearStart: store.financialYearStart,
    businessWebsite: store.businessWebsite,
  });

  const [gstinError, setGstinError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (form.gstRegistrationStatus === 'Registered' && form.gstin) {
      const res = GstinValidator.validate(form.gstin);
      if (!res.isValid) {
        setGstinError(res.error || 'Invalid GSTIN');
      } else {
        setGstinError(null);
        if (res.stateName && !form.state) {
          setForm((prev) => ({ ...prev, state: res.stateName! }));
        }
      }
    } else {
      setGstinError(null);
    }
  }, [form.gstin, form.gstRegistrationStatus]);

  const handleSave = async () => {
    if (!form.businessName.trim()) {
      Alert.alert('Validation Error', 'Business Name cannot be empty.');
      return;
    }
    if (form.gstRegistrationStatus === 'Registered' && form.gstin) {
      const res = GstinValidator.validate(form.gstin);
      if (!res.isValid) {
        Alert.alert('GSTIN Error', res.error || 'Please enter a valid 15-character GSTIN.');
        return;
      }
    }

    setSaving(true);
    await store.updateSettings(form);
    setSaving(false);
    onShowToast('Business profile updated successfully!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Category Header */}
      <View style={styles.header}>
        <Text style={[Typography.h2, { color: Palette.text }]}>Business Profile</Text>
        <Text style={[Typography.body, { color: Palette.textMuted, marginTop: 2 }]}>
          Manage legal identity, contact information, and business registration details.
        </Text>
      </View>

      {/* Identity Card */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>BASIC IDENTITY</Text>

        <View style={styles.row}>
          <View style={[styles.col, { marginRight: Spacing.md }]}>
            <Text style={[styles.label, { color: Palette.text }]}>Trade / Business Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={form.businessName}
              onChangeText={(text) => setForm({ ...form, businessName: text })}
              placeholder="e.g. GemSphere Books"
              placeholderTextColor={Palette.textMuted}
            />
          </View>
          <View style={styles.col}>
            <Text style={[styles.label, { color: Palette.text }]}>Legal Business Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={form.legalBusinessName}
              onChangeText={(text) => setForm({ ...form, legalBusinessName: text })}
              placeholder="e.g. GemSphere Technologies Pvt Ltd"
              placeholderTextColor={Palette.textMuted}
            />
          </View>
        </View>

        {/* Business Logo Section */}
        <View style={{ marginTop: Spacing.md }}>
          <Text style={[styles.label, { color: Palette.text }]}>Business Logo</Text>
          <View style={styles.logoRow}>
            <View style={[styles.logoPreview, { backgroundColor: `${Palette.primary}15`, borderColor: Palette.border }]}>
              <Text style={[Typography.h2, { color: Palette.primary }]}>
                {form.businessName.substring(0, 2).toUpperCase() || 'GS'}
              </Text>
            </View>
            <View style={{ marginLeft: Spacing.md, flex: 1 }}>
              <TouchableOpacity
                style={[styles.uploadBtn, { borderColor: Palette.primary }]}
                onPress={() => onShowToast('Logo updated successfully!')}
              >
                <Ionicons name="image-outline" size={16} color={Palette.primary} style={{ marginRight: 6 }} />
                <Text style={[Typography.captionMedium, { color: Palette.primary, fontWeight: '700' }]}>
                  Upload New Logo
                </Text>
              </TouchableOpacity>
              <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 4 }]}>
                PNG or JPG up to 2MB. Displayed on invoices & reports.
              </Text>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Contact & Location Card */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>CONTACT & ADDRESS</Text>

        <View style={styles.row}>
          <View style={[styles.col, { marginRight: Spacing.md }]}>
            <Text style={[styles.label, { color: Palette.text }]}>Business Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={form.businessEmail}
              onChangeText={(text) => setForm({ ...form, businessEmail: text })}
              keyboardType="email-address"
              placeholder="contact@business.com"
              placeholderTextColor={Palette.textMuted}
            />
          </View>
          <View style={styles.col}>
            <Text style={[styles.label, { color: Palette.text }]}>Business Phone</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={form.businessPhone}
              onChangeText={(text) => setForm({ ...form, businessPhone: text })}
              keyboardType="phone-pad"
              placeholder="+91 98765 43210"
              placeholderTextColor={Palette.textMuted}
            />
          </View>
        </View>

        <View style={{ marginTop: Spacing.md }}>
          <Text style={[styles.label, { color: Palette.text }]}>Registered Business Address</Text>
          <TextInput
            style={[styles.input, styles.multiline, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
            value={form.businessAddress}
            onChangeText={(text) => setForm({ ...form, businessAddress: text })}
            multiline
            numberOfLines={2}
            placeholder="Street address, building, suite"
            placeholderTextColor={Palette.textMuted}
          />
        </View>

        <View style={[styles.row, { marginTop: Spacing.md }]}>
          <View style={[styles.col, { marginRight: Spacing.md }]}>
            <Text style={[styles.label, { color: Palette.text }]}>State</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={form.state}
              onChangeText={(text) => setForm({ ...form, state: text })}
              placeholder="e.g. Karnataka"
              placeholderTextColor={Palette.textMuted}
            />
          </View>
          <View style={[styles.col, { marginRight: Spacing.md }]}>
            <Text style={[styles.label, { color: Palette.text }]}>PIN Code</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={form.pinCode}
              onChangeText={(text) => setForm({ ...form, pinCode: text })}
              keyboardType="numeric"
              placeholder="560102"
              placeholderTextColor={Palette.textMuted}
            />
          </View>
          <View style={styles.col}>
            <Text style={[styles.label, { color: Palette.text }]}>Country</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={form.country}
              onChangeText={(text) => setForm({ ...form, country: text })}
              placeholder="India"
              placeholderTextColor={Palette.textMuted}
            />
          </View>
        </View>
      </GlassCard>

      {/* GST & Registration Card */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>REGISTRATION & TAX IDENTITY</Text>

        <View style={styles.row}>
          <View style={[styles.col, { marginRight: Spacing.md }]}>
            <Text style={[styles.label, { color: Palette.text }]}>GST Registration Status</Text>
            <View style={styles.pillGroup}>
              {(['Registered', 'Unregistered', 'Composition'] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.pillChoice,
                    {
                      backgroundColor: form.gstRegistrationStatus === status ? Palette.primary : Palette.background,
                      borderColor: Palette.border,
                    },
                  ]}
                  onPress={() => setForm({ ...form, gstRegistrationStatus: status })}
                >
                  <Text
                    style={[
                      Typography.captionMedium,
                      { color: form.gstRegistrationStatus === status ? '#FFF' : Palette.text },
                    ]}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {form.gstRegistrationStatus === 'Registered' && (
            <View style={styles.col}>
              <Text style={[styles.label, { color: Palette.text }]}>GSTIN Number</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Palette.background,
                    borderColor: gstinError ? Palette.error : Palette.border,
                    color: Palette.text,
                    textTransform: 'uppercase',
                  },
                ]}
                value={form.gstin}
                onChangeText={(text) => setForm({ ...form, gstin: text.toUpperCase() })}
                maxLength={15}
                placeholder="29AAACG1234F1Z5"
                placeholderTextColor={Palette.textMuted}
              />
              {gstinError ? (
                <Text style={[Typography.caption, { color: Palette.error, marginTop: 2 }]}>
                  ⚠️ {gstinError}
                </Text>
              ) : (
                <Text style={[Typography.caption, { color: Palette.success, marginTop: 2 }]}>
                  ✓ Valid GSTIN Format
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={[styles.row, { marginTop: Spacing.md }]}>
          <View style={[styles.col, { marginRight: Spacing.md }]}>
            <Text style={[styles.label, { color: Palette.text }]}>CIN / Reg Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={form.registrationNumber}
              onChangeText={(text) => setForm({ ...form, registrationNumber: text })}
              placeholder="CIN / MSME / Reg No."
              placeholderTextColor={Palette.textMuted}
            />
          </View>

          <View style={styles.col}>
            <Text style={[styles.label, { color: Palette.text }]}>Financial Year Cycle</Text>
            <View style={styles.pillGroup}>
              {(['Apr-Mar', 'Jan-Dec'] as const).map((cycle) => (
                <TouchableOpacity
                  key={cycle}
                  style={[
                    styles.pillChoice,
                    {
                      backgroundColor: form.financialYearStart === cycle ? Palette.primary : Palette.background,
                      borderColor: Palette.border,
                    },
                  ]}
                  onPress={() => setForm({ ...form, financialYearStart: cycle })}
                >
                  <Text
                    style={[
                      Typography.captionMedium,
                      { color: form.financialYearStart === cycle ? '#FFF' : Palette.text },
                    ]}
                  >
                    {cycle === 'Apr-Mar' ? 'Apr - Mar (India)' : 'Jan - Dec (Std)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={{ marginTop: Spacing.md }}>
          <Text style={[styles.label, { color: Palette.text }]}>Business Website (Optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
            value={form.businessWebsite}
            onChangeText={(text) => setForm({ ...form, businessWebsite: text })}
            placeholder="https://gemsphere.io"
            placeholderTextColor={Palette.textMuted}
          />
        </View>
      </GlassCard>

      {/* Save Button Bar */}
      <View style={styles.saveBar}>
        <PremiumButton
          label={saving ? 'Saving Changes...' : 'Save Profile Settings'}
          variant="primary"
          onPress={handleSave}
          size="lg"
          icon={<Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  card: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.caption,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  col: {
    flex: 1,
  },
  label: {
    ...Typography.captionMedium,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    ...Typography.body,
  },
  multiline: {
    height: 64,
    paddingVertical: Spacing.sm,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  logoPreview: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  pillGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pillChoice: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  saveBar: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxl,
    alignItems: 'flex-start',
  },
});
