/**
 * Â© GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../auth/store';
import { Theme } from '../../core/theme';

export const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const { biometricsEnabled, setBiometricsEnabled, logout, user } = useAuthStore();

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLng);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Text style={styles.infoText}>Email: {user?.email}</Text>
          <Text style={styles.infoText}>Role: Admin</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Language: {i18n.language === 'en' ? 'English' : 'Arabic'}</Text>
            <TouchableOpacity onPress={toggleLanguage}>
              <Text style={styles.actionText}>Switch</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Biometric Login</Text>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: '#767577', true: Theme.Palette.primary }}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.Palette.background,
  },
  header: {
    padding: Theme.Spacing.lg,
    backgroundColor: Theme.Palette.surface,
  },
  title: {
    ...Theme.Typography.h2,
  },
  content: {
    flex: 1,
    padding: Theme.Spacing.md,
  },
  section: {
    backgroundColor: Theme.Palette.surface,
    padding: Theme.Spacing.md,
    borderRadius: Theme.Spacing.sm,
    marginBottom: Theme.Spacing.md,
  },
  sectionTitle: {
    ...Theme.Typography.caption,
    fontWeight: 'bold',
    marginBottom: Theme.Spacing.sm,
    color: Theme.Palette.primary,
  },
  infoText: {
    ...Theme.Typography.body,
    marginBottom: Theme.Spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.Palette.border,
  },
  settingLabel: {
    ...Theme.Typography.body,
  },
  actionText: {
    color: Theme.Palette.primary,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: Theme.Palette.error,
    padding: Theme.Spacing.md,
    borderRadius: Theme.Spacing.sm,
    alignItems: 'center',
    marginTop: Theme.Spacing.xl,
  },
  logoutButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

