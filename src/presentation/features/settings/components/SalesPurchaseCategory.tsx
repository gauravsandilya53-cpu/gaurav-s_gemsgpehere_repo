/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * SalesPurchaseCategory.tsx — Sales & Purchase Transaction Configurations.
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

export const SalesPurchaseCategory: React.FC<Props> = ({ onShowToast }) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const store = useSettingsStore();

  const [form, setForm] = useState({
    defaultSalesType: store.defaultSalesType,
    defaultPaymentMethod: store.defaultPaymentMethod,
    enableItemDiscount: store.enableItemDiscount,
    enableTransactionDiscount: store.enableTransactionDiscount,
    enableShippingCharges: store.enableShippingCharges,
    defaultPurchaseNotes: store.defaultPurchaseNotes,
  });

  const handleSave = async () => {
    await store.updateSettings(form);
    onShowToast('Sales & Purchase preferences saved!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={[Typography.h2, { color: Palette.text }]}>Sales & Purchase Preferences</Text>
        <Text style={[Typography.body, { color: Palette.textMuted, marginTop: 2 }]}>
          Configure default payment modes, transaction types, discounts, and purchase order rules.
        </Text>
      </View>

      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>TRANSACTION DEFAULTS</Text>

        <View style={styles.row}>
          <View style={[styles.col, { marginRight: Spacing.md }]}>
            <Text style={[styles.label, { color: Palette.text }]}>Default Sales Type</Text>
            <View style={styles.pillGroup}>
              {(['Credit', 'Cash'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.pillChoice,
                    {
                      backgroundColor: form.defaultSalesType === type ? Palette.primary : Palette.background,
                      borderColor: Palette.border,
                    },
                  ]}
                  onPress={() => setForm({ ...form, defaultSalesType: type })}
                >
                  <Text style={[Typography.captionMedium, { color: form.defaultSalesType === type ? '#FFF' : Palette.text }]}>
                    {type} Sale
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.col}>
            <Text style={[styles.label, { color: Palette.text }]}>Default Payment Mode</Text>
            <View style={styles.pillGroup}>
              {(['UPI', 'Cash', 'Bank Transfer', 'Card'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.pillChoice,
                    {
                      backgroundColor: form.defaultPaymentMethod === mode ? Palette.primary : Palette.background,
                      borderColor: Palette.border,
                    },
                  ]}
                  onPress={() => setForm({ ...form, defaultPaymentMethod: mode })}
                >
                  <Text style={[Typography.captionMedium, { color: form.defaultPaymentMethod === mode ? '#FFF' : Palette.text }]}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>DISCOUNTS & ADDITIONAL CHARGES</Text>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Enable Line-Item Discounts</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Allow applying percentage or flat discounts on individual invoice items.
            </Text>
          </View>
          <Switch
            value={form.enableItemDiscount}
            onValueChange={(val) => setForm({ ...form, enableItemDiscount: val })}
            trackColor={{ false: Palette.border, true: Palette.primary }}
            thumbColor="#FFF"
          />
        </View>

        <View style={[styles.switchRow, { marginTop: Spacing.md }]}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Enable Bill-Level Overall Discount</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Allow entering a single discount on the total invoice value.
            </Text>
          </View>
          <Switch
            value={form.enableTransactionDiscount}
            onValueChange={(val) => setForm({ ...form, enableTransactionDiscount: val })}
            trackColor={{ false: Palette.border, true: Palette.primary }}
            thumbColor="#FFF"
          />
        </View>

        <View style={[styles.switchRow, { marginTop: Spacing.md }]}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Enable Shipping & Packaging Charges</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Include extra fields for freight, courier, or handling fees.
            </Text>
          </View>
          <Switch
            value={form.enableShippingCharges}
            onValueChange={(val) => setForm({ ...form, enableShippingCharges: val })}
            trackColor={{ false: Palette.border, true: Palette.primary }}
            thumbColor="#FFF"
          />
        </View>
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>PURCHASE ORDER DEFAULTS</Text>
        <Text style={[styles.label, { color: Palette.text }]}>Default Purchase Terms & Notes</Text>
        <TextInput
          style={[styles.input, { height: 60, backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
          value={form.defaultPurchaseNotes}
          onChangeText={(text) => setForm({ ...form, defaultPurchaseNotes: text })}
          multiline
          placeholder="Default terms for vendors on PO creation"
          placeholderTextColor={Palette.textMuted}
        />
      </GlassCard>

      <View style={styles.saveBar}>
        <PremiumButton
          label="Save Sales & Purchase Settings"
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
  input: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, ...Typography.body },
  pillGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pillChoice: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  saveBar: { marginTop: Spacing.sm, marginBottom: Spacing.xxl, alignItems: 'flex-start' },
});
