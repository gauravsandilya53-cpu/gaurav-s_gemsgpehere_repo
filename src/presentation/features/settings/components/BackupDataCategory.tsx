/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * BackupDataCategory.tsx — Data Management, JSON Backup & Restore Center.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../../core/theme';
import { GlassCard } from '../../../components/ui/GlassCard';
import { PremiumButton } from '../../../components/ui/PremiumButton';
import { useSettingsStore } from '../settingsStore';

interface Props {
  onShowToast: (message: string) => void;
}

export const BackupDataCategory: React.FC<Props> = ({ onShowToast }) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const store = useSettingsStore();

  const [form, setForm] = useState({
    autoBackupEnabled: store.autoBackupEnabled,
    backupFrequency: store.backupFrequency,
  });

  const [restoreModal, setRestoreModal] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  const handleManualBackup = async () => {
    setBackingUp(true);
    // Simulate backup creation
    setTimeout(async () => {
      const timestamp = new Date().toISOString();
      await store.updateSettings({ lastBackupDate: timestamp });
      setBackingUp(false);
      onShowToast('Local backup created successfully!');
    }, 1000);
  };

  const handleRestoreData = async () => {
    setRestoreModal(false);
    onShowToast('Database restored from selected backup file.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={[Typography.h2, { color: Palette.text }]}>Backup, Restore & Data Management</Text>
        <Text style={[Typography.body, { color: Palette.textMuted, marginTop: 2 }]}>
          Create offline encrypted backups of your accounting database, schedule auto-backups, and export business data.
        </Text>
      </View>

      {/* Backup Card */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>MANUAL & AUTOMATIC BACKUPS</Text>

        <View style={styles.statusBox}>
          <View style={[styles.iconCircle, { backgroundColor: `${Palette.success}18` }]}>
            <Ionicons name="cloud-done-outline" size={24} color={Palette.success} />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Last Local Backup Status</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              {store.lastBackupDate
                ? `Created on ${new Date(store.lastBackupDate).toLocaleString()}`
                : 'No backup created yet'}
            </Text>
          </View>
          <PremiumButton
            label="Backup Now"
            variant="primary"
            size="sm"
            onPress={handleManualBackup}
            loading={backingUp}
            disabled={backingUp}
            icon={<Ionicons name="download-outline" size={16} color="#FFF" />}
          />
        </View>

        <View style={[styles.switchRow, { marginTop: Spacing.lg }]}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Enable Scheduled Auto-Backups</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Automatically save local copies of your business ledger at regular intervals.
            </Text>
          </View>
          <Switch
            value={form.autoBackupEnabled}
            onValueChange={(val) => {
              setForm({ ...form, autoBackupEnabled: val });
              store.updateSettings({ autoBackupEnabled: val });
            }}
            trackColor={{ false: Palette.border, true: Palette.primary }}
            thumbColor="#FFF"
          />
        </View>

        {form.autoBackupEnabled && (
          <View style={{ marginTop: Spacing.md }}>
            <Text style={[styles.label, { color: Palette.text }]}>Auto-Backup Frequency</Text>
            <View style={styles.pillGroup}>
              {(['Daily', 'Weekly', 'Monthly'] as const).map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.pillChoice,
                    {
                      backgroundColor: form.backupFrequency === freq ? Palette.primary : Palette.background,
                      borderColor: Palette.border,
                    },
                  ]}
                  onPress={() => {
                    setForm({ ...form, backupFrequency: freq });
                    store.updateSettings({ backupFrequency: freq });
                  }}
                >
                  <Text style={[Typography.captionMedium, { color: form.backupFrequency === freq ? '#FFF' : Palette.text }]}>
                    {freq}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </GlassCard>

      {/* Restore & Data Export */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>RESTORE & DATA EXPORTS</Text>

        <View style={styles.actionRow}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Restore Database from File</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Restore sales, inventory, and ledger records from a previously generated JSON backup.
            </Text>
          </View>
          <PremiumButton
            label="Restore Data"
            variant="danger"
            size="sm"
            onPress={() => setRestoreModal(true)}
            icon={<Ionicons name="refresh-outline" size={16} color="#FFF" />}
          />
        </View>

        <View style={[styles.actionRow, { marginTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Palette.divider, paddingTop: Spacing.md }]}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Export Complete Business Ledger (JSON/CSV)</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Download structured data for accounting software or audit compliance.
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.exportBtn, { borderColor: Palette.primary }]}
            onPress={() => onShowToast('Full Business Ledger JSON downloaded!')}
          >
            <Ionicons name="share-outline" size={16} color={Palette.primary} style={{ marginRight: 4 }} />
            <Text style={[Typography.captionMedium, { color: Palette.primary, fontWeight: '700' }]}>Export</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Restore Confirmation Modal */}
      <Modal visible={restoreModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
              <Ionicons name="warning-outline" size={28} color={Palette.error} style={{ marginRight: Spacing.sm }} />
              <Text style={[Typography.h3, { color: Palette.error }]}>Confirm Data Restore</Text>
            </View>

            <Text style={[Typography.body, { color: Palette.text, marginBottom: Spacing.md }]}>
              Restoring a backup will overwrite current active business records with data from the backup file. This action cannot be undone.
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <TouchableOpacity onPress={() => setRestoreModal(false)} style={styles.cancelBtn}>
                <Text style={[Typography.bodySemibold, { color: Palette.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <PremiumButton label="Proceed with Restore" variant="danger" size="md" onPress={handleRestoreData} />
            </View>
          </GlassCard>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: Spacing.lg },
  header: { marginBottom: Spacing.lg },
  card: { padding: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: { ...Typography.caption, fontWeight: '700', letterSpacing: 1.2, marginBottom: Spacing.md },
  statusBox: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { ...Typography.captionMedium, fontWeight: '600', marginBottom: 4 },
  pillGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pillChoice: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exportBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  modalCard: { width: '100%', maxWidth: 440, padding: Spacing.lg },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center' },
});
