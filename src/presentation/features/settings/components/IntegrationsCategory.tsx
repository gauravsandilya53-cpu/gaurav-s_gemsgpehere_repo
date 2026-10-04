/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * IntegrationsCategory.tsx — Integrations & Connected Services Hub.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../../core/theme';
import { GlassCard } from '../../../components/ui/GlassCard';
import { PremiumButton } from '../../../components/ui/PremiumButton';
import { useSettingsStore } from '../settingsStore';

interface Props {
  onShowToast: (message: string) => void;
}

export const IntegrationsCategory: React.FC<Props> = ({ onShowToast }) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const store = useSettingsStore();

  const [razorpayModal, setRazorpayModal] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState(store.razorpayKeyId);

  const [waModal, setWaModal] = useState(false);
  const [waKey, setWaKey] = useState(store.whatsappApiKey);

  const handleSaveRazorpay = async () => {
    await store.updateSettings({ razorpayKeyId: razorpayKey, razorpayConnected: true });
    setRazorpayModal(false);
    onShowToast('Razorpay Payment Gateway connected!');
  };

  const handleSaveWhatsApp = async () => {
    await store.updateSettings({ whatsappApiKey: waKey, whatsappConnected: true });
    setWaModal(false);
    onShowToast('WhatsApp Business API connected!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={[Typography.h2, { color: Palette.text }]}>Integrations & Connected Services</Text>
        <Text style={[Typography.body, { color: Palette.textMuted, marginTop: 2 }]}>
          Connect payment gateways, messaging services, cloud storage, and external accounting tools.
        </Text>
      </View>

      {/* Payment Gateways */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>PAYMENT GATEWAYS</Text>

        <View style={styles.integrationRow}>
          <View style={[styles.iconBox, { backgroundColor: '#3B82F618' }]}>
            <Ionicons name="card-outline" size={24} color="#3B82F6" />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[Typography.h4, { color: Palette.text }]}>Razorpay Payment Gateway</Text>
              <View style={[styles.statusBadge, { backgroundColor: store.razorpayConnected ? `${Palette.success}18` : `${Palette.warning}18` }]}>
                <Text style={[Typography.caption, { color: store.razorpayConnected ? Palette.success : Palette.warning, fontWeight: '700' }]}>
                  {store.razorpayConnected ? 'Connected' : 'Configuration Required'}
                </Text>
              </View>
            </View>
            <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
              Accept UPI, credit cards, and net banking links on invoices directly via Razorpay.
            </Text>
          </View>

          <PremiumButton
            label={store.razorpayConnected ? 'Configure' : 'Connect'}
            variant="secondary"
            size="sm"
            onPress={() => setRazorpayModal(true)}
          />
        </View>
      </GlassCard>

      {/* Messaging Services */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>MESSAGING & COMMUNICATION</Text>

        <View style={styles.integrationRow}>
          <View style={[styles.iconBox, { backgroundColor: '#10B98118' }]}>
            <Ionicons name="logo-whatsapp" size={24} color="#10B981" />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[Typography.h4, { color: Palette.text }]}>WhatsApp Business API</Text>
              <View style={[styles.statusBadge, { backgroundColor: store.whatsappConnected ? `${Palette.success}18` : `${Palette.warning}18` }]}>
                <Text style={[Typography.caption, { color: store.whatsappConnected ? Palette.success : Palette.warning, fontWeight: '700' }]}>
                  {store.whatsappConnected ? 'Connected' : 'Configuration Required'}
                </Text>
              </View>
            </View>
            <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
              Send instant invoice PDFs and payment reminders to customers via official WhatsApp API.
            </Text>
          </View>

          <PremiumButton
            label={store.whatsappConnected ? 'Configure' : 'Connect'}
            variant="secondary"
            size="sm"
            onPress={() => setWaModal(true)}
          />
        </View>
      </GlassCard>

      {/* External Accounting Sync */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>CLOUD BACKUP & ACCOUNTING SYNC</Text>

        <View style={styles.integrationRow}>
          <View style={[styles.iconBox, { backgroundColor: '#F59E0B18' }]}>
            <Ionicons name="logo-google" size={24} color="#F59E0B" />
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[Typography.h4, { color: Palette.text }]}>Google Drive Cloud Backup</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${Palette.textMuted}18` }]}>
                <Text style={[Typography.caption, { color: Palette.textMuted, fontWeight: '700' }]}>Not Connected</Text>
              </View>
            </View>
            <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
              Sync database backups directly to your Google Drive folder.
            </Text>
          </View>

          <PremiumButton
            label="Connect"
            variant="secondary"
            size="sm"
            onPress={() => onShowToast('Google Auth setup initialized.')}
          />
        </View>
      </GlassCard>

      {/* Config Modals */}
      <Modal visible={razorpayModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={[Typography.h3, { color: Palette.text, marginBottom: Spacing.md }]}>Razorpay Settings</Text>

            <Text style={[styles.label, { color: Palette.text }]}>Razorpay Key ID</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={razorpayKey}
              onChangeText={setRazorpayKey}
              placeholder="rzp_live_xxxxxxxxxx"
              placeholderTextColor={Palette.textMuted}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: Spacing.lg, gap: 8 }}>
              <TouchableOpacity onPress={() => setRazorpayModal(false)} style={styles.cancelBtn}>
                <Text style={[Typography.bodySemibold, { color: Palette.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <PremiumButton label="Save Key" variant="primary" size="md" onPress={handleSaveRazorpay} />
            </View>
          </GlassCard>
        </View>
      </Modal>

      <Modal visible={waModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            <Text style={[Typography.h3, { color: Palette.text, marginBottom: Spacing.md }]}>WhatsApp Business API</Text>

            <Text style={[styles.label, { color: Palette.text }]}>API Secret Key</Text>
            <TextInput
              style={[styles.input, { backgroundColor: Palette.background, borderColor: Palette.border, color: Palette.text }]}
              value={waKey}
              onChangeText={setWaKey}
              placeholder="wa_api_live_xxxxxx"
              placeholderTextColor={Palette.textMuted}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: Spacing.lg, gap: 8 }}>
              <TouchableOpacity onPress={() => setWaModal(false)} style={styles.cancelBtn}>
                <Text style={[Typography.bodySemibold, { color: Palette.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <PremiumButton label="Save API Key" variant="primary" size="md" onPress={handleSaveWhatsApp} />
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
  integrationRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, marginLeft: Spacing.sm },
  label: { ...Typography.captionMedium, fontWeight: '600', marginBottom: 4 },
  input: { height: 44, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, ...Typography.body },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  modalCard: { width: '100%', maxWidth: 440, padding: Spacing.lg },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, justifyContent: 'center' },
});
