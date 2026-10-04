/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * GstSettingsCategory.tsx — Indian GST & Tax Configuration Center.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../../core/theme';
import { GlassCard } from '../../../components/ui/GlassCard';
import { PremiumButton } from '../../../components/ui/PremiumButton';
import { useSettingsStore } from '../settingsStore';

interface Props {
  onShowToast: (message: string) => void;
}

export const GstSettingsCategory: React.FC<Props> = ({ onShowToast }) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const store = useSettingsStore();

  const [form, setForm] = useState({
    gstEnabled: store.gstEnabled,
    defaultTaxRate: store.defaultTaxRate,
    taxType: store.taxType,
    hsnRequired: store.hsnRequired,
    reverseChargeEnabled: store.reverseChargeEnabled,
    compositionScheme: store.compositionScheme,
    placeOfSupplyDefault: store.placeOfSupplyDefault,
    additionalTaxFields: store.additionalTaxFields,
  });

  const handleSave = async () => {
    await store.updateSettings(form);
    onShowToast('GST & Tax preferences updated!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={[Typography.h2, { color: Palette.text }]}>GST & Tax Settings</Text>
        <Text style={[Typography.body, { color: Palette.textMuted, marginTop: 2 }]}>
          Configure Indian GST calculations, tax rates, intra-state vs inter-state rules, and HSN compliance.
        </Text>
      </View>

      {/* Main GST Activation Card */}
      <GlassCard style={styles.card}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.h4, { color: Palette.text }]}>Enable GST Billing</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
              Automatically calculate CGST, SGST, and IGST on invoices and bills according to place of supply.
            </Text>
          </View>
          <Switch
            value={form.gstEnabled}
            onValueChange={(val) => setForm({ ...form, gstEnabled: val })}
            trackColor={{ false: Palette.border, true: Palette.primary }}
            thumbColor="#FFF"
          />
        </View>

        {form.gstEnabled && (
          <View style={[styles.infoBanner, { backgroundColor: `${Palette.primary}12`, borderColor: `${Palette.primary}30` }]}>
            <Ionicons name="information-circle" size={20} color={Palette.primary} style={{ marginRight: Spacing.sm }} />
            <Text style={[Typography.caption, { color: Palette.text, flex: 1 }]}>
              Intra-state sales split tax equally into CGST + SGST ({form.defaultTaxRate / 2}% + {form.defaultTaxRate / 2}%). Inter-state sales apply IGST ({form.defaultTaxRate}%).
            </Text>
          </View>
        )}
      </GlassCard>

      {form.gstEnabled && (
        <>
          {/* Tax Rates & Calculation Rules */}
          <GlassCard style={styles.card}>
            <Text style={[styles.sectionTitle, { color: Palette.primary }]}>DEFAULT TAX RATES & PRICING</Text>

            <Text style={[styles.label, { color: Palette.text }]}>Default Tax Rate (%)</Text>
            <View style={styles.rateGroup}>
              {[0, 5, 12, 18, 28].map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[
                    styles.rateChip,
                    {
                      backgroundColor: form.defaultTaxRate === rate ? Palette.primary : Palette.background,
                      borderColor: Palette.border,
                    },
                  ]}
                  onPress={() => setForm({ ...form, defaultTaxRate: rate })}
                >
                  <Text
                    style={[
                      Typography.bodySemibold,
                      { color: form.defaultTaxRate === rate ? '#FFF' : Palette.text },
                    ]}
                  >
                    {rate}% GST
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ marginTop: Spacing.lg }}>
              <Text style={[styles.label, { color: Palette.text }]}>Tax Calculation Type</Text>
              <View style={styles.rateGroup}>
                {(['Exclusive', 'Inclusive'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.rateChip,
                      {
                        backgroundColor: form.taxType === type ? Palette.primary : Palette.background,
                        borderColor: Palette.border,
                        flex: 1,
                      },
                    ]}
                    onPress={() => setForm({ ...form, taxType: type })}
                  >
                    <Text
                      style={[
                        Typography.bodySemibold,
                        { color: form.taxType === type ? '#FFF' : Palette.text, textAlign: 'center' },
                      ]}
                    >
                      Tax {type} (Prices {type === 'Exclusive' ? 'exclude GST' : 'include GST'})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </GlassCard>

          {/* Compliance & Rules */}
          <GlassCard style={styles.card}>
            <Text style={[styles.sectionTitle, { color: Palette.primary }]}>COMPLIANCE & HSN PREFERENCES</Text>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Require HSN / SAC Code</Text>
                <Text style={[Typography.caption, { color: Palette.textMuted }]}>
                  Enforce HSN/SAC code selection when adding items to invoices.
                </Text>
              </View>
              <Switch
                value={form.hsnRequired}
                onValueChange={(val) => setForm({ ...form, hsnRequired: val })}
                trackColor={{ false: Palette.border, true: Palette.primary }}
                thumbColor="#FFF"
              />
            </View>

            <View style={[styles.switchRow, { marginTop: Spacing.md }]}>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Composition Scheme Business</Text>
                <Text style={[Typography.caption, { color: Palette.textMuted }]}>
                  Check if registered under GST Composition Scheme (lower tax, no input tax credit).
                </Text>
              </View>
              <Switch
                value={form.compositionScheme}
                onValueChange={(val) => setForm({ ...form, compositionScheme: val })}
                trackColor={{ false: Palette.border, true: Palette.primary }}
                thumbColor="#FFF"
              />
            </View>

            <View style={[styles.switchRow, { marginTop: Spacing.md }]}>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Reverse Charge Mechanism (RCM)</Text>
                <Text style={[Typography.caption, { color: Palette.textMuted }]}>
                  Enable Reverse Charge option on invoices where buyer pays tax directly to Government.
                </Text>
              </View>
              <Switch
                value={form.reverseChargeEnabled}
                onValueChange={(val) => setForm({ ...form, reverseChargeEnabled: val })}
                trackColor={{ false: Palette.border, true: Palette.primary }}
                thumbColor="#FFF"
              />
            </View>

            <View style={{ marginTop: Spacing.lg }}>
              <Text style={[styles.label, { color: Palette.text }]}>Default Place of Supply</Text>
              <TextInput
                style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
                value={form.placeOfSupplyDefault}
                onChangeText={(text) => setForm({ ...form, placeOfSupplyDefault: text })}
                placeholder="State (State Code) e.g. Karnataka (29)"
                placeholderTextColor={Palette.textMuted}
              />
            </View>
          </GlassCard>
        </>
      )}

      <View style={styles.saveBar}>
        <PremiumButton
          label="Save GST & Tax Settings"
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
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoBanner: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginTop: Spacing.md },
  label: { ...Typography.captionMedium, fontWeight: '600', marginBottom: 6 },
  rateGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  rateChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.md, borderWidth: 1 },
  input: { height: 44, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, ...Typography.body },
  saveBar: { marginTop: Spacing.sm, marginBottom: Spacing.xxl, alignItems: 'flex-start' },
});
