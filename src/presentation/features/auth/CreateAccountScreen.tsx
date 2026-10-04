/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * CreateAccountScreen — Compact & responsive registration screen for GemSphere Books.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { AuthService } from '../../../domain/services/AuthService';
import { useAuthStore } from './store';
import { COUNTRIES } from '../../../core/constants/countries';

export const CreateAccountScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const { Palette, Gradients } = theme;

  const selectedCountry = useAuthStore((state) => state.selectedCountry);
  const setCountry = useAuthStore((state) => state.setCountry);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);

  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const isDesktop = windowWidth >= 768;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const handleRegister = async () => {
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const result = await AuthService.register({
      name,
      email,
      phone,
      password,
    });
    setIsLoading(false);

    if (!result.success || !result.user) {
      setErrorMsg(result.error || 'Failed to create account. Please try again.');
      return;
    }

    // Direct to Contact Verification
    navigation.navigate('ContactVerification', {
      user: result.user,
      targetIdentifier: email,
    });
  };

  return (
    <LinearGradient
      colors={isDark ? Gradients.hero : Gradients.primary}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header / Logo */}
            <View style={styles.headerSection}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="cube" size={32} color="#FFF" />
              </View>
              <Text style={styles.brandTitle}>GemSphere Books</Text>
              <Text style={styles.brandSubtitle}>Create your GemSphere account</Text>
            </View>

            {/* Form Card */}
            <GlassCard padding={Spacing.lg} style={[styles.formCard, { maxWidth: isDesktop ? 540 : 440 }] as any} noBorder={isDark}>
              
              {/* Mode Switcher Tabs (Log In vs Sign Up) */}
              <View style={[styles.authTabContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
                <TouchableOpacity
                  style={styles.authTab}
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.8}
                >
                  <Text style={[Typography.bodySemibold, { color: Palette.textMuted }]}>Log In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.authTab, { backgroundColor: Palette.primary }]}
                  activeOpacity={0.8}
                >
                  <Text style={[Typography.bodySemibold, { color: '#FFF' }]}>Sign Up</Text>
                </TouchableOpacity>
              </View>
              {errorMsg ? (
                <View style={[styles.errorBanner, { backgroundColor: `${Palette.error}20`, borderColor: Palette.error }]}>
                  <Ionicons name="alert-circle-outline" size={18} color={Palette.error} style={{ marginRight: 6 }} />
                  <Text style={[Typography.captionMedium, { color: Palette.error, flex: 1 }]}>
                    {errorMsg}
                  </Text>
                </View>
              ) : null}

              {/* Step 1: Select Country (Primary Configuration) */}
              <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>
                1. Select Country (Region & Currency)
              </Text>
              <TouchableOpacity
                style={[
                  styles.countrySelectorBtn,
                  {
                    borderColor: Palette.primary,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(79, 70, 229, 0.05)',
                  },
                ]}
                onPress={() => setIsCountryPickerOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 24, marginRight: Spacing.sm }}>{selectedCountry.flag}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.bodySemibold, { color: Palette.text }]}>
                    {selectedCountry.name}
                  </Text>
                  <Text style={[Typography.caption, { color: Palette.textMuted }]}>
                    {selectedCountry.currency} ({selectedCountry.symbol}) • {selectedCountry.taxName} ({selectedCountry.defaultTaxRate}%)
                  </Text>
                </View>
                <View style={[styles.countryBadge, { backgroundColor: `${Palette.primary}20` }]}>
                  <Text style={[Typography.captionMedium, { color: Palette.primary, marginRight: 2 }]}>
                    Change
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={Palette.primary} />
                </View>
              </TouchableOpacity>

              {/* Grid Row 1: Name & Phone on Desktop */}
              <View style={[isDesktop ? styles.rowGroup : styles.columnGroup, { marginTop: Spacing.sm }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 2 }]}>
                    Full Name *
                  </Text>
                  <View style={[styles.inputGroup, { borderBottomColor: Palette.border }]}>
                    <Ionicons name="person-outline" size={18} color={Palette.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: Palette.text }]}
                      placeholder="e.g. Gaurav Kumar"
                      placeholderTextColor={Palette.textMuted}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <View style={{ flex: 1, marginLeft: isDesktop ? Spacing.md : 0, marginTop: isDesktop ? 0 : Spacing.sm }}>
                  <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 2 }]}>
                    Mobile Number (Optional)
                  </Text>
                  <View style={[styles.inputGroup, { borderBottomColor: Palette.border }]}>
                    <Ionicons name="call-outline" size={18} color={Palette.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: Palette.text }]}
                      placeholder={selectedCountry.phonePlaceholder}
                      placeholderTextColor={Palette.textMuted}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>

              {/* Email Address */}
              <View style={{ marginTop: Spacing.sm }}>
                <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 2 }]}>
                  Email Address *
                </Text>
                <View style={[styles.inputGroup, { borderBottomColor: Palette.border }]}>
                  <Ionicons name="mail-outline" size={18} color={Palette.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: Palette.text }]}
                    placeholder="name@business.com"
                    placeholderTextColor={Palette.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Grid Row 2: Password & Confirm Password on Desktop */}
              <View style={[isDesktop ? styles.rowGroup : styles.columnGroup, { marginTop: Spacing.sm }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 2 }]}>
                    Password *
                  </Text>
                  <View style={[styles.inputGroup, { borderBottomColor: Palette.border }]}>
                    <Ionicons name="lock-closed-outline" size={18} color={Palette.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: Palette.text }]}
                      placeholder="Min 6 chars"
                      placeholderTextColor={Palette.textMuted}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Palette.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ flex: 1, marginLeft: isDesktop ? Spacing.md : 0, marginTop: isDesktop ? 0 : Spacing.sm }}>
                  <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 2 }]}>
                    Confirm Password *
                  </Text>
                  <View style={[styles.inputGroup, { borderBottomColor: Palette.border }]}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={Palette.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: Palette.text }]}
                      placeholder="Re-enter password"
                      placeholderTextColor={Palette.textMuted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Palette.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Create Account Submit */}
              <View style={{ marginTop: Spacing.lg }}>
                <PremiumButton
                  label="Create Account"
                  onPress={handleRegister}
                  size="lg"
                  fullWidth
                  loading={isLoading}
                />
              </View>

              {/* Log In Footer Callout */}
              <TouchableOpacity
                style={[
                  styles.loginCalloutBox,
                  {
                    borderColor: `${Palette.primary}40`,
                    backgroundColor: isDark ? 'rgba(79, 70, 229, 0.15)' : 'rgba(79, 70, 229, 0.06)',
                  },
                ]}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.bodySemibold, { color: Palette.text }]}>
                    Already have an account?
                  </Text>
                  <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
                    Sign in with your existing credentials
                  </Text>
                </View>
                <View style={[styles.loginBadge, { backgroundColor: Palette.primary }]}>
                  <Text style={[Typography.captionMedium, { color: '#FFF', marginRight: 4 }]}>
                    Log In
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFF" />
                </View>
              </TouchableOpacity>
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Country Picker Modal */}
      <Modal
        visible={isCountryPickerOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCountryPickerOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsCountryPickerOpen(false)}
        >
          <View style={[styles.modalContentWrapper, { maxWidth: isDesktop ? 500 : 420 }]}>
            <GlassCard padding={Spacing.lg} style={styles.modalCard} noBorder={isDark}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.h3, { color: Palette.text }]}>Select Country</Text>
                  <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
                    Select your operating country to configure tax, currency & formats
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsCountryPickerOpen(false)}
                  style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]}
                >
                  <Ionicons name="close" size={20} color={Palette.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 380, marginTop: Spacing.md }} showsVerticalScrollIndicator={false}>
                {COUNTRIES.map((c) => {
                  const isSelected = selectedCountry.code === c.code;
                  return (
                    <TouchableOpacity
                      key={c.code}
                      style={[
                        styles.modalOptionCard,
                        {
                          borderColor: isSelected ? Palette.primary : Palette.border,
                          backgroundColor: isSelected ? `${Palette.primary}18` : (isDark ? 'rgba(255,255,255,0.03)' : '#FFF'),
                        },
                      ]}
                      onPress={() => {
                        setCountry(c);
                        setIsCountryPickerOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 26, marginRight: Spacing.md }}>{c.flag}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[Typography.bodySemibold, { color: Palette.text }]}>{c.name}</Text>
                        <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
                          {c.currency} ({c.symbol}) • {c.taxName} ({c.defaultTaxRate}%) • {c.phonePrefix}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={22} color={Palette.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </GlassCard>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  brandTitle: {
    ...Typography.h3,
    color: '#FFF',
  },
  brandSubtitle: {
    ...Typography.bodyMedium,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  formCard: {
    width: '100%',
  },
  countrySelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  rowGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  columnGroup: {
    flexDirection: 'column',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  inputIcon: {
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    height: 40,
    ...Typography.body,
  },
  eyeIcon: {
    padding: 4,
  },
  authTabContainer: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: 4,
    marginBottom: Spacing.md,
  },
  authTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  loginCalloutBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    marginTop: Spacing.lg,
  },
  loginBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  footerLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  /* Country Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContentWrapper: {
    width: '100%',
  },
  modalCard: {
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    marginBottom: Spacing.xs,
  },
});
