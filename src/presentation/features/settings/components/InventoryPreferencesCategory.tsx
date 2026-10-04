/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * InventoryPreferencesCategory.tsx — Inventory & Stock Management Preferences.
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

export const InventoryPreferencesCategory: React.FC<Props> = ({ onShowToast }) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const store = useSettingsStore();

  const [form, setForm] = useState({
    stockTrackingEnabled: store.stockTrackingEnabled,
    defaultUOM: store.defaultUOM,
    quantityPrecision: store.quantityPrecision,
    lowStockThreshold: store.lowStockThreshold,
    autoGenerateSKU: store.autoGenerateSKU,
  });

  const handleSave = async () => {
    await store.updateSettings(form);
    onShowToast('Inventory preferences updated successfully!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={[Typography.h2, { color: Palette.text }]}>Inventory & Item Preferences</Text>
        <Text style={[Typography.body, { color: Palette.textMuted, marginTop: 2 }]}>
          Manage stock tracking, default units of measurement, quantity precision, and low-stock alerts.
        </Text>
      </View>

      <GlassCard style={styles.card}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.h4, { color: Palette.text }]}>Enable Stock Tracking</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
              Automatically deduct stock on sales invoice creation and add stock on purchase entries.
            </Text>
          </View>
          <Switch
            value={form.stockTrackingEnabled}
            onValueChange={(val) => setForm({ ...form, stockTrackingEnabled: val })}
            trackColor={{ false: Palette.border, true: Palette.primary }}
            thumbColor="#FFF"
          />
        </View>
      </GlassCard>

      {form.stockTrackingEnabled && (
        <GlassCard style={styles.card}>
          <Text style={[styles.sectionTitle, { color: Palette.primary }]}>UNITS & PRECISION</Text>

          <View style={styles.row}>
            <View style={[styles.col, { marginRight: Spacing.md }]}>
              <Text style={[styles.label, { color: Palette.text }]}>Default Unit of Measurement (UOM)</Text>
              <View style={styles.pillGroup}>
                {['Pcs', 'Box', 'Kg', 'Mtr', 'Ltr', 'Set'].map((uom) => (
                  <TouchableOpacity
                    key={uom}
                    style={[
                      styles.pillChoice,
                      {
                        backgroundColor: form.defaultUOM === uom ? Palette.primary : Palette.background,
                        borderColor: Palette.border,
                      },
                    ]}
                    onPress={() => setForm({ ...form, defaultUOM: uom })}
                  >
                    <Text style={[Typography.captionMedium, { color: form.defaultUOM === uom ? '#FFF' : Palette.text }]}>
                      {uom}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.col}>
              <Text style={[styles.label, { color: Palette.text }]}>Quantity Decimal Places</Text>
              <View style={styles.pillGroup}>
                {[0, 1, 2, 3].map((dec) => (
                  <TouchableOpacity
                    key={dec}
                    style={[
                      styles.pillChoice,
                      {
                        backgroundColor: form.quantityPrecision === dec ? Palette.primary : Palette.background,
                        borderColor: Palette.border,
                      },
                    ]}
                    onPress={() => setForm({ ...form, quantityPrecision: dec })}
                  >
                    <Text style={[Typography.captionMedium, { color: form.quantityPrecision === dec ? '#FFF' : Palette.text }]}>
                      {dec} Decimals (e.g. { (1.234).toFixed(dec) })
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={[styles.row, { marginTop: Spacing.lg }]}>
            <View style={[styles.col, { marginRight: Spacing.md }]}>
              <Text style={[styles.label, { color: Palette.text }]}>Low Stock Alert Threshold</Text>
              <TextInput
                style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
                value={String(form.lowStockThreshold)}
                onChangeText={(text) => setForm({ ...form, lowStockThreshold: Number(text) || 5 })}
                keyboardType="numeric"
                placeholder="10"
                placeholderTextColor={Palette.textMuted}
              />
              <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 4 }]}>
                Items with stock below this number trigger warning badges.
              </Text>
            </View>

            <View style={styles.col}>
              <Text style={[styles.label, { color: Palette.text }]}>SKU / Barcode Auto-Generation</Text>
              <View style={styles.switchRow}>
                <Text style={[Typography.bodyMedium, { color: Palette.text }]}>Auto SKU</Text>
                <Switch
                  value={form.autoGenerateSKU}
                  onValueChange={(val) => setForm({ ...form, autoGenerateSKU: val })}
                  trackColor={{ false: Palette.border, true: Palette.primary }}
                  thumbColor="#FFF"
                />
              </View>
            </View>
          </View>
        </GlassCard>
      )}

      <View style={styles.saveBar}>
        <PremiumButton
          label="Save Inventory Settings"
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
