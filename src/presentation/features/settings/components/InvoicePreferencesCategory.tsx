/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * InvoicePreferencesCategory.tsx — Invoice & Document Customization with Live Template Preview.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../../core/theme';
import { GlassCard } from '../../../components/ui/GlassCard';
import { PremiumButton } from '../../../components/ui/PremiumButton';
import { useSettingsStore } from '../settingsStore';

interface Props {
  onShowToast: (message: string) => void;
}

export const InvoicePreferencesCategory: React.FC<Props> = ({ onShowToast }) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const store = useSettingsStore();

  const [form, setForm] = useState({
    invoicePrefix: store.invoicePrefix,
    startingInvoiceNumber: store.startingInvoiceNumber,
    defaultPaymentTerms: store.defaultPaymentTerms,
    defaultDueDays: store.defaultDueDays,
    defaultNotes: store.defaultNotes,
    defaultTerms: store.defaultTerms,
    showLogoOnInvoice: store.showLogoOnInvoice,
    showCustomerAddress: store.showCustomerAddress,
    showGstinHsn: store.showGstinHsn,
    showItemDescription: store.showItemDescription,
    showDiscountBreakdown: store.showDiscountBreakdown,
    showBankDetails: store.showBankDetails,
    showSignatureLine: store.showSignatureLine,
    bankName: store.bankName,
    accountNumber: store.accountNumber,
    ifscCode: store.ifscCode,
    upiId: store.upiId,
    pageSize: store.pageSize,
    invoiceTemplate: store.invoiceTemplate,
  });

  const handleSave = async () => {
    await store.updateSettings(form);
    onShowToast('Invoice preferences & template saved!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={[Typography.h2, { color: Palette.text }]}>Invoice & Document Preferences</Text>
        <Text style={[Typography.body, { color: Palette.textMuted, marginTop: 2 }]}>
          Customize invoice numbering, default terms, visibility rules, bank details, and PDF templates.
        </Text>
      </View>

      {/* Numbering & Terms */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>NUMBERING & DUE PERIODS</Text>

        <View style={styles.row}>
          <View style={[styles.col, { marginRight: Spacing.md }]}>
            <Text style={[styles.label, { color: Palette.text }]}>Invoice Prefix</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={form.invoicePrefix}
              onChangeText={(text) => setForm({ ...form, invoicePrefix: text })}
              placeholder="e.g. INV-"
              placeholderTextColor={Palette.textMuted}
            />
          </View>
          <View style={[styles.col, { marginRight: Spacing.md }]}>
            <Text style={[styles.label, { color: Palette.text }]}>Next Invoice Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={String(form.startingInvoiceNumber)}
              onChangeText={(text) => setForm({ ...form, startingInvoiceNumber: Number(text) || 1001 })}
              keyboardType="numeric"
              placeholder="1001"
              placeholderTextColor={Palette.textMuted}
            />
          </View>
          <View style={styles.col}>
            <Text style={[styles.label, { color: Palette.text }]}>Default Due Period (Days)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={String(form.defaultDueDays)}
              onChangeText={(text) => setForm({ ...form, defaultDueDays: Number(text) || 15 })}
              keyboardType="numeric"
              placeholder="15"
              placeholderTextColor={Palette.textMuted}
            />
          </View>
        </View>

        <View style={{ marginTop: Spacing.md }}>
          <Text style={[styles.label, { color: Palette.text }]}>Default Payment Terms</Text>
          <View style={styles.pillGroup}>
            {(['Due on Receipt', 'Net 15', 'Net 30', 'Net 60'] as const).map((term) => (
              <TouchableOpacity
                key={term}
                style={[
                  styles.pillChoice,
                  {
                    backgroundColor: form.defaultPaymentTerms === term ? Palette.primary : Palette.background,
                    borderColor: Palette.border,
                  },
                ]}
                onPress={() => setForm({ ...form, defaultPaymentTerms: term })}
              >
                <Text
                  style={[
                    Typography.captionMedium,
                    { color: form.defaultPaymentTerms === term ? '#FFF' : Palette.text },
                  ]}
                >
                  {term}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </GlassCard>

      {/* Visibility Toggles */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>DOCUMENT DISPLAY & VISIBILITY</Text>

        {[
          { key: 'showLogoOnInvoice', label: 'Show Business Logo on Invoice', sub: 'Display high-resolution company logo' },
          { key: 'showCustomerAddress', label: 'Show Customer Billing & Shipping Address', sub: 'Include complete addresses on top' },
          { key: 'showGstinHsn', label: 'Show GSTIN & HSN/SAC Column', sub: 'Display tax breakdown numbers' },
          { key: 'showItemDescription', label: 'Show Item Sub-Descriptions', sub: 'Include extra details under product name' },
          { key: 'showDiscountBreakdown', label: 'Show Item & Transaction Discount Lines', sub: 'Explicitly display applied discounts' },
          { key: 'showBankDetails', label: 'Show Bank Account & Payment Details Footer', sub: 'Display bank name, account number & UPI' },
          { key: 'showSignatureLine', label: 'Show Authorized Signatory Line', sub: 'Include digital signature box' },
        ].map((item, idx) => (
          <View key={item.key} style={[styles.switchRow, idx > 0 && { marginTop: Spacing.md }]}>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.bodySemibold, { color: Palette.text }]}>{item.label}</Text>
              <Text style={[Typography.caption, { color: Palette.textMuted }]}>{item.sub}</Text>
            </View>
            <Switch
              value={(form as any)[item.key]}
              onValueChange={(val) => setForm({ ...form, [item.key]: val })}
              trackColor={{ false: Palette.border, true: Palette.primary }}
              thumbColor="#FFF"
            />
          </View>
        ))}
      </GlassCard>

      {/* Bank & Payment Details */}
      {form.showBankDetails && (
        <GlassCard style={styles.card}>
          <Text style={[styles.sectionTitle, { color: Palette.primary }]}>BANK & PAYMENT DETAILS FOR FOOTER</Text>

          <View style={styles.row}>
            <View style={[styles.col, { marginRight: Spacing.md }]}>
              <Text style={[styles.label, { color: Palette.text }]}>Bank Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
                value={form.bankName}
                onChangeText={(text) => setForm({ ...form, bankName: text })}
                placeholder="e.g. HDFC Bank"
                placeholderTextColor={Palette.textMuted}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: Palette.text }]}>Account Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
                value={form.accountNumber}
                onChangeText={(text) => setForm({ ...form, accountNumber: text })}
                keyboardType="numeric"
                placeholder="50200012345678"
                placeholderTextColor={Palette.textMuted}
              />
            </View>
          </View>

          <View style={[styles.row, { marginTop: Spacing.md }]}>
            <View style={[styles.col, { marginRight: Spacing.md }]}>
              <Text style={[styles.label, { color: Palette.text }]}>IFSC Code</Text>
              <TextInput
                style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
                value={form.ifscCode}
                onChangeText={(text) => setForm({ ...form, ifscCode: text.toUpperCase() })}
                placeholder="HDFC0000123"
                placeholderTextColor={Palette.textMuted}
              />
            </View>
            <View style={styles.col}>
              <Text style={[styles.label, { color: Palette.text }]}>UPI VPA ID</Text>
              <TextInput
                style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
                value={form.upiId}
                onChangeText={(text) => setForm({ ...form, upiId: text })}
                placeholder="gemsphere@hdfcbank"
                placeholderTextColor={Palette.textMuted}
              />
            </View>
          </View>
        </GlassCard>
      )}

      {/* Invoice Template Selection & Live Preview */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>TEMPLATE & PRINT PREVIEW</Text>

        <Text style={[styles.label, { color: Palette.text }]}>Invoice Theme / Template Style</Text>
        <View style={styles.pillGroup}>
          {(['Modern', 'Classic', 'Minimal', 'Elegant'] as const).map((style) => (
            <TouchableOpacity
              key={style}
              style={[
                styles.pillChoice,
                {
                  backgroundColor: form.invoiceTemplate === style ? Palette.primary : Palette.background,
                  borderColor: Palette.border,
                },
              ]}
              onPress={() => setForm({ ...form, invoiceTemplate: style })}
            >
              <Text
                style={[
                  Typography.captionMedium,
                  { color: form.invoiceTemplate === style ? '#FFF' : Palette.text },
                ]}
              >
                {style} Template
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Live Interactive Preview Box */}
        <View style={[styles.previewBox, { backgroundColor: Palette.background, borderColor: Palette.border }]}>
          <View style={styles.previewHeader}>
            <Text style={[Typography.caption, { color: Palette.primary, fontWeight: '700' }]}>
              LIVE TEMPLATE PREVIEW ({form.invoiceTemplate.toUpperCase()})
            </Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Paper Size: {form.pageSize}
            </Text>
          </View>

          <View style={[styles.previewCard, { backgroundColor: Palette.surface, borderColor: Palette.border }]}>
            <View style={styles.previewTop}>
              <View>
                <Text style={[Typography.bodySemibold, { color: Palette.text }]}>TAX INVOICE</Text>
                <Text style={[Typography.caption, { color: Palette.primary }]}>
                  {form.invoicePrefix}
                  {form.startingInvoiceNumber}
                </Text>
              </View>
              {form.showLogoOnInvoice && (
                <View style={[styles.miniLogo, { backgroundColor: `${Palette.primary}20` }]}>
                  <Text style={[Typography.caption, { color: Palette.primary, fontWeight: '700' }]}>LOGO</Text>
                </View>
              )}
            </View>

            {form.showCustomerAddress && (
              <View style={styles.previewSection}>
                <Text style={[Typography.captionMedium, { color: Palette.textMuted }]}>Billed To: ACME Corporation</Text>
              </View>
            )}

            <View style={[styles.previewTable, { borderColor: Palette.border }]}>
              <View style={styles.tableRow}>
                <Text style={[Typography.caption, { color: Palette.text, flex: 2, fontWeight: '600' }]}>Item</Text>
                {form.showGstinHsn && <Text style={[Typography.caption, { color: Palette.textMuted, flex: 1 }]}>HSN</Text>}
                <Text style={[Typography.caption, { color: Palette.text, flex: 1, textAlign: 'right', fontWeight: '600' }]}>Amount</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={[Typography.caption, { color: Palette.text, flex: 2 }]}>Consulting Service</Text>
                {form.showGstinHsn && <Text style={[Typography.caption, { color: Palette.textMuted, flex: 1 }]}>998311</Text>}
                <Text style={[Typography.caption, { color: Palette.text, flex: 1, textAlign: 'right' }]}>₹ 10,000</Text>
              </View>
            </View>

            {form.showBankDetails && (
              <View style={[styles.previewFooter, { borderTopColor: Palette.border }]}>
                <Text style={[Typography.caption, { color: Palette.textMuted }]}>
                  Bank: {form.bankName || 'HDFC Bank'} | A/C: {form.accountNumber || 'xxxx1234'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </GlassCard>

      <View style={styles.saveBar}>
        <PremiumButton
          label="Save Invoice Preferences"
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
  previewBox: { marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  previewCard: { padding: Spacing.md, borderRadius: Radius.sm, borderWidth: 1 },
  previewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miniLogo: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  previewSection: { marginVertical: 6 },
  previewTable: { borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 6, marginVertical: 6 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  previewFooter: { borderTopWidth: 1, paddingTop: 4, marginTop: 4 },
  saveBar: { marginTop: Spacing.sm, marginBottom: Spacing.xxl, alignItems: 'flex-start' },
});
