/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * AboutSubscriptionCategory.tsx — Application Information, Subscription & Sign Out.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../../core/theme';
import { GlassCard } from '../../../components/ui/GlassCard';
import { PremiumButton } from '../../../components/ui/PremiumButton';
import { useAuthStore } from '../../auth/store';

interface Props {
  onShowToast: (message: string) => void;
}

export const AboutSubscriptionCategory: React.FC<Props> = ({ onShowToast }) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const { user, logout } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of GemSphere Books?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={[Typography.h2, { color: Palette.text }]}>About & Subscription</Text>
        <Text style={[Typography.body, { color: Palette.textMuted, marginTop: 2 }]}>
          View plan status, system version details, support channels, and legal policies.
        </Text>
      </View>

      {/* Subscription Card */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>ACTIVE SUBSCRIPTION PLAN</Text>

        <View style={[styles.planCard, { backgroundColor: `${Palette.primary}12`, borderColor: `${Palette.primary}30` }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.planBadge, { backgroundColor: Palette.primary }]}>
              <Ionicons name="star" size={16} color="#FFF" />
            </View>
            <View style={{ marginLeft: Spacing.md, flex: 1 }}>
              <Text style={[Typography.h3, { color: Palette.text }]}>Premium Business Plan</Text>
              <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
                Includes unlimited invoices, multi-user RBAC, offline SQLite sync & GST filing ready.
              </Text>
            </View>
          </View>

          <View style={[styles.planMeta, { borderTopColor: Palette.border }]}>
            <View>
              <Text style={[Typography.caption, { color: Palette.textMuted }]}>Subscription Status</Text>
              <Text style={[Typography.bodySemibold, { color: Palette.success }]}>Active • Auto-Renews</Text>
            </View>
            <View>
              <Text style={[Typography.caption, { color: Palette.textMuted }]}>Next Renewal Date</Text>
              <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Oct 15, 2026</Text>
            </View>
            <TouchableOpacity
              style={[styles.manageBtn, { borderColor: Palette.primary }]}
              onPress={() => onShowToast('Subscription portal opened.')}
            >
              <Text style={[Typography.captionMedium, { color: Palette.primary, fontWeight: '700' }]}>Manage Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </GlassCard>

      {/* App Information */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>SYSTEM INFORMATION</Text>

        <View style={styles.infoRow}>
          <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Application Version</Text>
          <Text style={[Typography.bodyMedium, { color: Palette.textMuted }]}>v2.4.0 (Build 2026.09)</Text>
        </View>
        <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: Palette.divider }]}>
          <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Logged in Account</Text>
          <Text style={[Typography.bodyMedium, { color: Palette.textMuted }]}>{user?.email || 'Admin'}</Text>
        </View>
        <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: Palette.divider }]}>
          <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Tenant Identifier</Text>
          <Text style={[Typography.mono as any, { color: Palette.textMuted }]}>{user?.tenantId || 'tenant_default'}</Text>
        </View>
        <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: Palette.divider }]}>
          <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Copyright</Text>
          <Text style={[Typography.caption, { color: Palette.textMuted }]}>© 2026 GemSphere Technologies Pvt Ltd.</Text>
        </View>
      </GlassCard>

      {/* Support & Legal */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>HELP & LEGAL</Text>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => onShowToast('Opening Help Center & Knowledge Base...')}
        >
          <Ionicons name="help-buoy-outline" size={20} color={Palette.primary} style={{ marginRight: Spacing.md }} />
          <Text style={[Typography.bodySemibold, { color: Palette.text, flex: 1 }]}>Help Center & Documentation</Text>
          <Ionicons name="chevron-forward" size={16} color={Palette.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.linkRow, { borderTopWidth: 1, borderTopColor: Palette.divider }]}
          onPress={() => onShowToast('Opening Privacy Policy...')}
        >
          <Ionicons name="shield-outline" size={20} color={Palette.primary} style={{ marginRight: Spacing.md }} />
          <Text style={[Typography.bodySemibold, { color: Palette.text, flex: 1 }]}>Privacy Policy & Terms of Service</Text>
          <Ionicons name="chevron-forward" size={16} color={Palette.textMuted} />
        </TouchableOpacity>
      </GlassCard>

      {/* Distinct Sign Out Action */}
      <View style={styles.signOutBox}>
        <PremiumButton
          label="Sign Out of Account"
          variant="danger"
          onPress={handleSignOut}
          fullWidth
          size="lg"
          icon={<Ionicons name="log-out-outline" size={20} color="#FFF" />}
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
  planCard: { padding: Spacing.lg, borderRadius: Radius.md, borderWidth: 1 },
  planBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  planMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1 },
  manageBtn: { borderWidth: 1.5, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 6 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md },
  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md },
  signOutBox: { marginTop: Spacing.md, marginBottom: Spacing.xxl },
});
