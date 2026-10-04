/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * GeneralPreferencesCategory.tsx — Theme, Language, Currency & Regional Formatting.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../../core/theme';
import { GlassCard } from '../../../components/ui/GlassCard';
import { PremiumButton } from '../../../components/ui/PremiumButton';
import { useSettingsStore } from '../settingsStore';
import { useAuthStore } from '../../auth/store';

interface Props {
  onShowToast: (message: string) => void;
}

export const GeneralPreferencesCategory: React.FC<Props> = ({ onShowToast }) => {
  const { theme, isDark, setMode } = useTheme();
  const { Palette } = theme;
  const store = useSettingsStore();
  const { setCurrency: setAuthCurrency } = useAuthStore();
  const { i18n } = useTranslation();

  const [form, setForm] = useState({
    language: store.language,
    currency: store.currency,
    dateFormat: store.dateFormat,
    numberFormatting: store.numberFormatting,
    decimalPlaces: store.decimalPlaces,
    unsavedChangesWarning: store.unsavedChangesWarning,
  });

  const handleSave = async () => {
    await store.updateSettings(form);
    setAuthCurrency(form.currency);
    onShowToast('General preferences updated successfully!');
  };

  const handleLanguageChange = (lang: string) => {
    setForm({ ...form, language: lang });
    i18n.changeLanguage(lang);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={[Typography.h2, { color: Palette.text }]}>General Preferences</Text>
        <Text style={[Typography.body, { color: Palette.textMuted, marginTop: 2 }]}>
          Manage theme mode, currency, language, date & number formatting, and system behavior.
        </Text>
      </View>

      {/* Theme Card */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>APPEARANCE & THEME</Text>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.h4, { color: Palette.text }]}>Dark Mode Interface</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
              Switch between Dark and Light color palettes. Persists across application restarts.
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={(val) => setMode(val ? 'dark' : 'light')}
            trackColor={{ false: Palette.border, true: Palette.primary }}
            thumbColor="#FFF"
          />
        </View>
      </GlassCard>

      {/* Localization Card */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>LOCALIZATION & CURRENCY</Text>

        <Text style={[styles.label, { color: Palette.text }]}>Default Base Currency</Text>
        <View style={styles.pillGroup}>
          {[
            { code: 'INR', label: 'INR (₹ Rupee)' },
            { code: 'USD', label: 'USD ($ Dollar)' },
            { code: 'EUR', label: 'EUR (€ Euro)' },
            { code: 'AED', label: 'AED (د.إ Dirham)' },
          ].map((c) => (
            <TouchableOpacity
              key={c.code}
              style={[
                styles.pillChoice,
                {
                  backgroundColor: form.currency === c.code ? Palette.primary : Palette.background,
                  borderColor: Palette.border,
                },
              ]}
              onPress={() => setForm({ ...form, currency: c.code })}
            >
              <Text style={[Typography.captionMedium, { color: form.currency === c.code ? '#FFF' : Palette.text }]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: Spacing.lg }}>
          <Text style={[styles.label, { color: Palette.text }]}>Application Language</Text>
          <View style={styles.pillGroup}>
            {[
              { code: 'en', label: 'English' },
              { code: 'ar', label: 'العربية (Arabic)' },
              { code: 'hi', label: 'हिंदी (Hindi)' },
            ].map((l) => (
              <TouchableOpacity
                key={l.code}
                style={[
                  styles.pillChoice,
                  {
                    backgroundColor: form.language === l.code ? Palette.primary : Palette.background,
                    borderColor: Palette.border,
                  },
                ]}
                onPress={() => handleLanguageChange(l.code)}
              >
                <Text style={[Typography.captionMedium, { color: form.language === l.code ? '#FFF' : Palette.text }]}>
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </GlassCard>

      {/* Regional Formats */}
      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, { color: Palette.primary }]}>REGIONAL FORMATTING</Text>

        <View style={styles.row}>
          <View style={[styles.col, { marginRight: Spacing.md }]}>
            <Text style={[styles.label, { color: Palette.text }]}>Number Format System</Text>
            <View style={styles.pillGroup}>
              {(['Indian', 'International'] as const).map((fmt) => (
                <TouchableOpacity
                  key={fmt}
                  style={[
                    styles.pillChoice,
                    {
                      backgroundColor: form.numberFormatting === fmt ? Palette.primary : Palette.background,
                      borderColor: Palette.border,
                    },
                  ]}
                  onPress={() => setForm({ ...form, numberFormatting: fmt })}
                >
                  <Text style={[Typography.captionMedium, { color: form.numberFormatting === fmt ? '#FFF' : Palette.text }]}>
                    {fmt === 'Indian' ? 'Indian (1,00,000)' : 'International (100,000)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.col}>
            <Text style={[styles.label, { color: Palette.text }]}>Date Format</Text>
            <View style={styles.pillGroup}>
              {(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] as const).map((df) => (
                <TouchableOpacity
                  key={df}
                  style={[
                    styles.pillChoice,
                    {
                      backgroundColor: form.dateFormat === df ? Palette.primary : Palette.background,
                      borderColor: Palette.border,
                    },
                  ]}
                  onPress={() => setForm({ ...form, dateFormat: df })}
                >
                  <Text style={[Typography.captionMedium, { color: form.dateFormat === df ? '#FFF' : Palette.text }]}>
                    {df}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.switchRow, { marginTop: Spacing.lg }]}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Unsaved Changes Warning</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Prompt for confirmation before leaving forms with unsaved input.
            </Text>
          </View>
          <Switch
            value={form.unsavedChangesWarning}
            onValueChange={(val) => setForm({ ...form, unsavedChangesWarning: val })}
            trackColor={{ false: Palette.border, true: Palette.primary }}
            thumbColor="#FFF"
          />
        </View>
      </GlassCard>

      <View style={styles.saveBar}>
        <PremiumButton
          label="Save General Preferences"
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
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  col: { flex: 1 },
  label: { ...Typography.captionMedium, fontWeight: '600', marginBottom: 4 },
  pillGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pillChoice: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1 },
  saveBar: { marginTop: Spacing.sm, marginBottom: Spacing.xxl, alignItems: 'flex-start' },
});
