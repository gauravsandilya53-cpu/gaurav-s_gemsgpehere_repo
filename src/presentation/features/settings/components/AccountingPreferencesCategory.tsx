/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * AccountingPreferencesCategory.tsx — Opening Balances & Accounting Preferences.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../../core/theme';
import { GlassCard } from '../../../components/ui/GlassCard';
import { PremiumButton } from '../../../components/ui/PremiumButton';
import { useSettingsStore } from '../settingsStore';

interface Props {
  onShowToast: (message: string) => void;
}

export const AccountingPreferencesCategory: React.FC<Props> = ({ onShowToast }) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const store = useSettingsStore();

  const [form, setForm] = useState({
    defaultCashAccount: store.defaultCashAccount,
    defaultBankAccount: store.defaultBankAccount,
    openingBalanceDate: store.openingBalanceDate,
  });

  const handleSave = async () => {
    await store.updateSettings(form);
    onShowToast('Accounting preferences updated!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={[Typography.h2, { color: Palette.text }]}>Opening Balances & Accounting Preferences</Text>
        <Text style={[Typography.body, { color: Palette.textMuted, marginTop: 2 }]}>
          Configure chart of accounts defaults, cash/bank ledgers, and financial year opening entries.
        </Text>
      </View>

      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>DEFAULT ACCOUNT LEDGERS</Text>

        <View style={styles.row}>
          <View style={[styles.col, { marginRight: Spacing.md }]}>
            <Text style={[styles.label, { color: Palette.text }]}>Default Cash Account</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={form.defaultCashAccount}
              onChangeText={(text) => setForm({ ...form, defaultCashAccount: text })}
              placeholder="Petty Cash"
              placeholderTextColor={Palette.textMuted}
            />
          </View>

          <View style={styles.col}>
            <Text style={[styles.label, { color: Palette.text }]}>Default Bank Account</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={form.defaultBankAccount}
              onChangeText={(text) => setForm({ ...form, defaultBankAccount: text })}
              placeholder="HDFC Current Account"
              placeholderTextColor={Palette.textMuted}
            />
          </View>
        </View>

        <View style={{ marginTop: Spacing.md }}>
          <Text style={[styles.label, { color: Palette.text }]}>Opening Balance Effective Date</Text>
          <TextInput
            style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
            value={form.openingBalanceDate}
            onChangeText={(text) => setForm({ ...form, openingBalanceDate: text })}
            placeholder="YYYY-MM-DD e.g. 2025-04-01"
            placeholderTextColor={Palette.textMuted}
          />
        </View>
      </GlassCard>

      {/* Opening Balances Overview */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>OPENING BALANCE ADJUSTMENTS SUMMARY</Text>

        <View style={[styles.ledgerRow, { borderBottomColor: Palette.border }]}>
          <Text style={[Typography.bodySemibold, { color: Palette.text, flex: 2 }]}>Cash Ledger Opening Balance</Text>
          <Text style={[Typography.bodySemibold, { color: Palette.success, flex: 1, textAlign: 'right' }]}>₹ 25,000.00 Dr</Text>
        </View>
        <View style={[styles.ledgerRow, { borderBottomColor: Palette.border }]}>
          <Text style={[Typography.bodySemibold, { color: Palette.text, flex: 2 }]}>Bank Current Account Opening Balance</Text>
          <Text style={[Typography.bodySemibold, { color: Palette.success, flex: 1, textAlign: 'right' }]}>₹ 1,50,000.00 Dr</Text>
        </View>
        <View style={styles.ledgerRow}>
          <Text style={[Typography.bodySemibold, { color: Palette.text, flex: 2 }]}>Capital Account / Equity Opening Balance</Text>
          <Text style={[Typography.bodySemibold, { color: Palette.primary, flex: 1, textAlign: 'right' }]}>₹ 1,75,000.00 Cr</Text>
        </View>
      </GlassCard>

      <View style={styles.saveBar}>
        <PremiumButton
          label="Save Accounting Settings"
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
  ledgerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.md, borderBottomWidth: 1 },
  saveBar: { marginTop: Spacing.sm, marginBottom: Spacing.xxl, alignItems: 'flex-start' },
});
