/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * SettingsScreen — Premium settings with profile card and grouped rows.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../auth/store';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { GlassCard } from '../../components/ui/GlassCard';
import { PremiumButton } from '../../components/ui/PremiumButton';

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value?: string;
  isLast?: boolean;
  right?: React.ReactNode;
  onPress?: () => void;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  iconColor,
  label,
  value,
  isLast,
  right,
  onPress,
}) => {
  const { theme } = useTheme();
  const { Palette } = theme;

  return (
    <TouchableOpacity
      style={[
        styles.settingRow,
        !isLast && { borderBottomWidth: 1, borderBottomColor: Palette.divider },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: `${iconColor}18` }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={{ flex: 1, marginHorizontal: Spacing.md }}>
        <Text style={[Typography.bodySemibold, { color: Palette.text }]}>{label}</Text>
        {value ? (
          <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 1 }]}>
            {value}
          </Text>
        ) : null}
      </View>
      {right ?? (
        onPress ? (
          <Ionicons name="chevron-forward" size={16} color={Palette.textMuted} />
        ) : null
      )}
    </TouchableOpacity>
  );
};

export const SettingsScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const { theme, isDark, setMode } = useTheme();
  const { Palette } = theme;
  const { biometricsEnabled, setBiometricsEnabled, logout, user, currency, setCurrency } =
    useAuthStore();

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLng);
  };

  const initials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'US';

  return (
    <View style={[styles.container, { backgroundColor: Palette.background }]}>
      <GradientHeader title="Settings" subtitle="Manage your preferences" leftAction={null} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <GlassCard padding={Spacing.lg} style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: `${Palette.primary}20` }]}>
            <Text style={[Typography.h3, { color: Palette.primary }]}>{initials}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={[Typography.h4, { color: Palette.text }]}>
              {user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
              {user?.email || '—'}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: `${Palette.primary}15` }]}>
              <Text style={[Typography.caption, { color: Palette.primary, fontWeight: '700' }]}>
                Admin
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Preferences */}
        <Text style={[styles.groupLabel, { color: Palette.textMuted }]}>PREFERENCES</Text>
        <GlassCard padding={0} style={{ overflow: 'hidden' }}>
          <SettingRow
            icon="language-outline"
            iconColor="#6366F1"
            label="Language"
            value={i18n.language === 'en' ? 'English' : 'العربية'}
            right={
              <TouchableOpacity
                style={[styles.chipBtn, { borderColor: Palette.primary }]}
                onPress={toggleLanguage}
              >
                <Text style={[Typography.caption, { color: Palette.primary, fontWeight: '700' }]}>
                  Switch
                </Text>
              </TouchableOpacity>
            }
          />
          <SettingRow
            icon="cash-outline"
            iconColor="#10B981"
            label="Default Currency"
            value={currency}
            right={
              <TouchableOpacity
                style={[styles.chipBtn, { borderColor: Palette.primary }]}
                onPress={() => setCurrency(currency === 'USD' ? 'INR' : 'USD')}
              >
                <Text style={[Typography.caption, { color: Palette.primary, fontWeight: '700' }]}>
                  {currency === 'USD' ? '→ INR' : '→ USD'}
                </Text>
              </TouchableOpacity>
            }
          />
          <SettingRow
            icon={isDark ? 'moon' : 'sunny-outline'}
            iconColor="#F59E0B"
            label="Dark Mode"
            isLast
            right={
              <Switch
                value={isDark}
                onValueChange={(val) => setMode(val ? 'dark' : 'light')}
                trackColor={{ false: Palette.border, true: Palette.primary }}
                thumbColor="#FFF"
              />
            }
          />
        </GlassCard>

        {/* Security */}
        <Text style={[styles.groupLabel, { color: Palette.textMuted }]}>SECURITY</Text>
        <GlassCard padding={0} style={{ overflow: 'hidden' }}>
          <SettingRow
            icon="finger-print-outline"
            iconColor="#EC4899"
            label="Biometric Login"
            value={biometricsEnabled ? 'Enabled' : 'Disabled'}
            isLast
            right={
              <Switch
                value={biometricsEnabled}
                onValueChange={setBiometricsEnabled}
                trackColor={{ false: Palette.border, true: Palette.primary }}
                thumbColor="#FFF"
              />
            }
          />
        </GlassCard>

        {/* About */}
        <Text style={[styles.groupLabel, { color: Palette.textMuted }]}>ABOUT</Text>
        <GlassCard padding={0} style={{ overflow: 'hidden', marginBottom: Spacing.xl }}>
          <SettingRow
            icon="information-circle-outline"
            iconColor="#3B82F6"
            label="Version"
            value="1.0.0 (Build 1)"
            isLast
          />
        </GlassCard>

        {/* Logout */}
        <PremiumButton
          label="Sign Out"
          variant="danger"
          onPress={logout}
          fullWidth
          size="lg"
          icon={<Ionicons name="log-out-outline" size={20} color="#FFF" />}
          style={{ marginBottom: 120 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: Spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginTop: Spacing.xs,
  },
  groupLabel: {
    ...Typography.caption,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    marginTop: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 60,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipBtn: {
    borderWidth: 1.5,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
