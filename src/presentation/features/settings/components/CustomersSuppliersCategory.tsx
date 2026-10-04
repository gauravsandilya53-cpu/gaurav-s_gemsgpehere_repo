/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * CustomersSuppliersCategory.tsx — Customer & Supplier CRM Defaults.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../../core/theme';
import { GlassCard } from '../../../components/ui/GlassCard';
import { PremiumButton } from '../../../components/ui/PremiumButton';
import { useSettingsStore } from '../settingsStore';

interface Props {
  onShowToast: (message: string) => void;
}

export const CustomersSuppliersCategory: React.FC<Props> = ({ onShowToast }) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const store = useSettingsStore();

  const [form, setForm] = useState({
    customerCreditDays: store.customerCreditDays,
    supplierPaymentDays: store.supplierPaymentDays,
    requireCustomerGstin: store.requireCustomerGstin,
    defaultCommunicationChannel: store.defaultCommunicationChannel,
  });

  const handleSave = async () => {
    await store.updateSettings(form);
    onShowToast('Customer & Supplier preferences saved!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={[Typography.h2, { color: Palette.text }]}>Customers & Suppliers Preferences</Text>
        <Text style={[Typography.body, { color: Palette.textMuted, marginTop: 2 }]}>
          Set payment term defaults, mandatory GSTIN rules, and communication preferences for contacts.
        </Text>
      </View>

      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>CREDIT & PAYMENT TERMS</Text>

        <View style={styles.row}>
          <View style={[styles.col, { marginRight: Spacing.md }]}>
            <Text style={[styles.label, { color: Palette.text }]}>Customer Credit Period (Days)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={String(form.customerCreditDays)}
              onChangeText={(text) => setForm({ ...form, customerCreditDays: Number(text) || 30 })}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor={Palette.textMuted}
            />
          </View>

          <View style={styles.col}>
            <Text style={[styles.label, { color: Palette.text }]}>Supplier Payment Period (Days)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={String(form.supplierPaymentDays)}
              onChangeText={(text) => setForm({ ...form, supplierPaymentDays: Number(text) || 45 })}
              keyboardType="numeric"
              placeholder="45"
              placeholderTextColor={Palette.textMuted}
            />
          </View>
        </View>
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>MANDATORY FIELDS & COMMUNICATION</Text>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Require Customer GSTIN</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Prompt for customer GSTIN on new contact creation.
            </Text>
          </View>
          <Switch
            value={form.requireCustomerGstin}
            onValueChange={(val) => setForm({ ...form, requireCustomerGstin: val })}
            trackColor={{ false: Palette.border, true: Palette.primary }}
            thumbColor="#FFF"
          />
        </View>

        <View style={{ marginTop: Spacing.lg }}>
          <Text style={[styles.label, { color: Palette.text }]}>Default Reminder & Sharing Channel</Text>
          <View style={styles.pillGroup}>
            {(['WhatsApp', 'Email', 'SMS'] as const).map((channel) => (
              <TouchableOpacity
                key={channel}
                style={[
                  styles.pillChoice,
                  {
                    backgroundColor: form.defaultCommunicationChannel === channel ? Palette.primary : Palette.background,
                    borderColor: Palette.border,
                  },
                ]}
                onPress={() => setForm({ ...form, defaultCommunicationChannel: channel })}
              >
                <Text
                  style={[
                    Typography.captionMedium,
                    { color: form.defaultCommunicationChannel === channel ? '#FFF' : Palette.text },
                  ]}
                >
                  {channel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </GlassCard>

      <View style={styles.saveBar}>
        <PremiumButton
          label="Save Contact Preferences"
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
  container: { padding: Spacing.lg },
  header: { marginBottom: Spacing.lg },
  card: { padding: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: { ...Typography.caption, fontWeight: '700', letterSpacing: 1.2, marginBottom: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  col: { flex: 1 },
  label: { ...Typography.captionMedium, fontWeight: '600', marginBottom: 4 },
  input: { height: 44, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, ...Typography.body },
  pillGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pillChoice: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  saveBar: { marginTop: Spacing.sm, marginBottom: Spacing.xxl, alignItems: 'flex-start' },
});
