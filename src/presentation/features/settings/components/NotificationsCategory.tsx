/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * NotificationsCategory.tsx — Notifications & Reminders Configuration.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../../core/theme';
import { GlassCard } from '../../../components/ui/GlassCard';
import { PremiumButton } from '../../../components/ui/PremiumButton';
import { useSettingsStore } from '../settingsStore';

interface Props {
  onShowToast: (message: string) => void;
}

export const NotificationsCategory: React.FC<Props> = ({ onShowToast }) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const store = useSettingsStore();

  const [form, setForm] = useState({
    notifyPaymentDue: store.notifyPaymentDue,
    notifyOverdueInvoices: store.notifyOverdueInvoices,
    notifyLowStock: store.notifyLowStock,
    reminderDaysBeforeDue: store.reminderDaysBeforeDue,
    enableInAppAlerts: store.enableInAppAlerts,
    enableEmailAlerts: store.enableEmailAlerts,
  });

  const handleSave = async () => {
    await store.updateSettings(form);
    onShowToast('Notification preferences saved!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={[Typography.h2, { color: Palette.text }]}>Notifications & Reminders</Text>
        <Text style={[Typography.body, { color: Palette.textMuted, marginTop: 2 }]}>
          Configure payment due reminders, overdue invoice alerts, low stock threshold notices, and channels.
        </Text>
      </View>

      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>BUSINESS ALERT TRIGGERS</Text>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Upcoming Payment Due Reminders</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Send alerts before invoices reach their due date.
            </Text>
          </View>
          <Switch
            value={form.notifyPaymentDue}
            onValueChange={(val) => setForm({ ...form, notifyPaymentDue: val })}
            trackColor={{ false: Palette.border, true: Palette.primary }}
            thumbColor="#FFF"
          />
        </View>

        {form.notifyPaymentDue && (
          <View style={{ marginTop: Spacing.md }}>
            <Text style={[styles.label, { color: Palette.text }]}>Trigger Timing (Days Before Due Date)</Text>
            <View style={styles.pillGroup}>
              {[1, 3, 7, 14].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.pillChoice,
                    {
                      backgroundColor: form.reminderDaysBeforeDue === days ? Palette.primary : Palette.background,
                      borderColor: Palette.border,
                    },
                  ]}
                  onPress={() => setForm({ ...form, reminderDaysBeforeDue: days })}
                >
                  <Text style={[Typography.captionMedium, { color: form.reminderDaysBeforeDue === days ? '#FFF' : Palette.text }]}>
                    {days} {days === 1 ? 'Day' : 'Days'} Before
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={[styles.switchRow, { marginTop: Spacing.lg }]}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Overdue Invoice Warnings</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Flag invoices that pass their due period without payment settlement.
            </Text>
          </View>
          <Switch
            value={form.notifyOverdueInvoices}
            onValueChange={(val) => setForm({ ...form, notifyOverdueInvoices: val })}
            trackColor={{ false: Palette.border, true: Palette.primary }}
            thumbColor="#FFF"
          />
        </View>

        <View style={[styles.switchRow, { marginTop: Spacing.lg }]}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Low Stock Inventory Warnings</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Alert when product stock drops below low-stock threshold.
            </Text>
          </View>
          <Switch
            value={form.notifyLowStock}
            onValueChange={(val) => setForm({ ...form, notifyLowStock: val })}
            trackColor={{ false: Palette.border, true: Palette.primary }}
            thumbColor="#FFF"
          />
        </View>
      </GlassCard>

      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>NOTIFICATION CHANNELS</Text>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>In-App Notification Banners</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Show pop-up toast & badge alerts inside the app interface.
            </Text>
          </View>
          <Switch
            value={form.enableInAppAlerts}
            onValueChange={(val) => setForm({ ...form, enableInAppAlerts: val })}
            trackColor={{ false: Palette.border, true: Palette.primary }}
            thumbColor="#FFF"
          />
        </View>

        <View style={[styles.switchRow, { marginTop: Spacing.md }]}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Email Summary Digest</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Receive daily/weekly summary digest of pending payments and sales.
            </Text>
          </View>
          <Switch
            value={form.enableEmailAlerts}
            onValueChange={(val) => setForm({ ...form, enableEmailAlerts: val })}
            trackColor={{ false: Palette.border, true: Palette.primary }}
            thumbColor="#FFF"
          />
        </View>
      </GlassCard>

      <View style={styles.saveBar}>
        <PremiumButton
          label="Save Notification Settings"
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
  label: { ...Typography.captionMedium, fontWeight: '600', marginBottom: 4 },
  pillGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pillChoice: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1 },
  saveBar: { marginTop: Spacing.sm, marginBottom: Spacing.xxl, alignItems: 'flex-start' },
});
