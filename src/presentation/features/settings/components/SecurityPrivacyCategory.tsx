/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * SecurityPrivacyCategory.tsx — Security, Biometrics & Session Management.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../../core/theme';
import { GlassCard } from '../../../components/ui/GlassCard';
import { PremiumButton } from '../../../components/ui/PremiumButton';
import { useSettingsStore } from '../settingsStore';
import { useAuthStore } from '../../auth/store';

interface Props {
  onShowToast: (message: string) => void;
}

export const SecurityPrivacyCategory: React.FC<Props> = ({ onShowToast }) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const store = useSettingsStore();
  const { biometricsEnabled, setBiometricsEnabled } = useAuthStore();

  const [form, setForm] = useState({
    autoLockTimeout: store.autoLockTimeout,
    requireAuthOnExport: store.requireAuthOnExport,
  });

  const [passwordModal, setPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  const handleSave = async () => {
    await store.updateSettings(form);
    onShowToast('Security preferences updated!');
  };

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.next) {
      Alert.alert('Validation Error', 'Please enter your current and new password.');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      Alert.alert('Password Mismatch', 'New password and confirmation do not match.');
      return;
    }
    setPasswordModal(false);
    setPasswords({ current: '', next: '', confirm: '' });
    onShowToast('Account password updated successfully!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={[Typography.h2, { color: Palette.text }]}>Security & Privacy</Text>
        <Text style={[Typography.body, { color: Palette.textMuted, marginTop: 2 }]}>
          Manage biometric authentication, automatic screen lock, password security, and data privacy.
        </Text>
      </View>

      {/* Biometrics */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>BIOMETRIC & DEVICE LOCK</Text>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.h4, { color: Palette.text }]}>Biometric Authentication</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
              Use Fingerprint, Face ID, or Device PIN to quickly unlock GemSphere Books.
            </Text>
          </View>
          <Switch
            value={biometricsEnabled}
            onValueChange={setBiometricsEnabled}
            trackColor={{ false: Palette.border, true: Palette.primary }}
            thumbColor="#FFF"
          />
        </View>

        <View style={{ marginTop: Spacing.lg }}>
          <Text style={[styles.label, { color: Palette.text }]}>Automatic Screen Lock Timeout</Text>
          <View style={styles.pillGroup}>
            {(['Immediate', '1 min', '5 min', '15 min', 'Never'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.pillChoice,
                  {
                    backgroundColor: form.autoLockTimeout === t ? Palette.primary : Palette.background,
                    borderColor: Palette.border,
                  },
                ]}
                onPress={() => setForm({ ...form, autoLockTimeout: t })}
              >
                <Text style={[Typography.captionMedium, { color: form.autoLockTimeout === t ? '#FFF' : Palette.text }]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </GlassCard>

      {/* Account Password & Sensitive Actions */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>ACCOUNT SECURITY</Text>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Change Account Password</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Update your account login password periodically.
            </Text>
          </View>
          <PremiumButton
            label="Change Password"
            variant="secondary"
            size="sm"
            onPress={() => setPasswordModal(true)}
            icon={<Ionicons name="key-outline" size={14} color={Palette.primary} />}
          />
        </View>

        <View style={[styles.switchRow, { marginTop: Spacing.md }]}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Require Confirmation for Data Exports</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Prompt for authentication before exporting sensitive financial ledgers.
            </Text>
          </View>
          <Switch
            value={form.requireAuthOnExport}
            onValueChange={(val) => setForm({ ...form, requireAuthOnExport: val })}
            trackColor={{ false: Palette.border, true: Palette.primary }}
            thumbColor="#FFF"
          />
        </View>
      </GlassCard>

      <View style={styles.saveBar}>
        <PremiumButton
          label="Save Security Preferences"
          variant="primary"
          onPress={handleSave}
          size="lg"
          icon={<Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />}
        />
      </View>

      {/* Change Password Modal */}
      <Modal visible={passwordModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={[Typography.h3, { color: Palette.text, marginBottom: Spacing.md }]}>Change Password</Text>

            <Text style={[styles.label, { color: Palette.text }]}>Current Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              secureTextEntry
              value={passwords.current}
              onChangeText={(text) => setPasswords({ ...passwords, current: text })}
              placeholder="••••••••"
              placeholderTextColor={Palette.textMuted}
            />

            <Text style={[styles.label, { color: Palette.text, marginTop: Spacing.sm }]}>New Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              secureTextEntry
              value={passwords.next}
              onChangeText={(text) => setPasswords({ ...passwords, next: text })}
              placeholder="At least 8 characters"
              placeholderTextColor={Palette.textMuted}
            />

            <Text style={[styles.label, { color: Palette.text, marginTop: Spacing.sm }]}>Confirm New Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              secureTextEntry
              value={passwords.confirm}
              onChangeText={(text) => setPasswords({ ...passwords, confirm: text })}
              placeholder="Re-enter new password"
              placeholderTextColor={Palette.textMuted}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: Spacing.lg, gap: 8 }}>
              <TouchableOpacity onPress={() => setPasswordModal(false)} style={styles.cancelBtn}>
                <Text style={[Typography.bodySemibold, { color: Palette.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <PremiumButton label="Update Password" variant="primary" size="md" onPress={handleChangePassword} />
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
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { ...Typography.captionMedium, fontWeight: '600', marginBottom: 4 },
  input: { height: 44, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, ...Typography.body },
  pillGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pillChoice: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1 },
  saveBar: { marginTop: Spacing.sm, marginBottom: Spacing.xxl, alignItems: 'flex-start' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  modalCard: { width: '100%', maxWidth: 420, padding: Spacing.lg },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center' },
});
