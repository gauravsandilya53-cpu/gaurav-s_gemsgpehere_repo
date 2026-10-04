/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * AdaptiveOnboardingScreen — Simplified & Country-Aware Onboarding Flow for GemSphere Books.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { useAuthStore } from './store';
import { AuthService } from '../../../domain/services/AuthService';
import { useSettingsStore } from '../settings/settingsStore';
import { COUNTRIES, DEFAULT_COUNTRY } from '../../../core/constants/countries';
import {
  AdaptiveOnboardingEngine,
  OnboardingFormState,
  INITIAL_ONBOARDING_STATE,
} from '../../../domain/services/AdaptiveOnboardingEngine';

const BUSINESS_CATEGORIES = [
  { id: 'Retail', title: 'Retail / Shop', icon: 'storefront-outline' },
  { id: 'Wholesale', title: 'Wholesale', icon: 'cube-outline' },
  { id: 'Manufacturing', title: 'Manufacturing', icon: 'construct-outline' },
  { id: 'Restaurant / Café', title: 'Restaurant / Café', icon: 'restaurant-outline' },
  { id: 'Services', title: 'Services', icon: 'briefcase-outline' },
  { id: 'Distribution', title: 'Distribution', icon: 'git-network-outline' },
  { id: 'Beauty / Salon', title: 'Beauty / Salon', icon: 'cut-outline' },
  { id: 'Repair & Maintenance', title: 'Repair & Maintenance', icon: 'build-outline' },
  { id: 'E-commerce', title: 'E-commerce', icon: 'cart-outline' },
  { id: 'Other', title: 'Other Business Type', icon: 'apps-outline' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Puducherry', 'Chandigarh'
];

export const AdaptiveOnboardingScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const { Palette, Gradients } = theme;

  const user = useAuthStore((state) => state.user);
  const updateUserAccount = useAuthStore((state) => state.updateUserAccount);
  const setCurrency = useAuthStore((state) => state.setCurrency);
  const selectedCountryStore = useAuthStore((state) => state.selectedCountry);
  const setCountryStore = useAuthStore((state) => state.setCountry);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  const [formState, setFormState] = useState<OnboardingFormState>({
    ...INITIAL_ONBOARDING_STATE,
    country: selectedCountryStore || DEFAULT_COUNTRY,
    fullName: user?.name || 'Gaurav Sandilya',
    email: user?.email || 'gaurav@gemsphere.io',
    phone: user?.phone || '+919876543210',
    businessName: user?.name ? `${user.name}'s Business` : 'My GemSphere Shop',
  });

  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [countrySearch, setCountrySearch] = useState('');
  const [bizSearch, setBizSearch] = useState('');
  const [otpCode] = useState(['1', '2', '3', '4', '5', '6']);
  const [creationStep, setCreationStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);

  // Screen 25 Team state
  const [newTeamMemberName, setNewTeamMemberName] = useState('');
  const [newTeamMemberEmail, setNewTeamMemberEmail] = useState('');

  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const isDesktop = windowWidth >= 768;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // Compute active sequence dynamically
  const activeSequence = AdaptiveOnboardingEngine.getActiveScreenSequence(formState);
  const currentScreenId = activeSequence[currentScreenIndex] || 1;
  const totalActiveScreens = activeSequence.length;

  const updateState = (updates: Partial<OnboardingFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentScreenIndex < activeSequence.length - 1) {
      setCurrentScreenIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentScreenIndex > 0) {
      setCurrentScreenIndex((prev) => prev - 1);
    }
  };

  // Screen 29 Creation Progress Effect
  useEffect(() => {
    if (currentScreenId === 29) {
      const interval = setInterval(() => {
        setCreationStep((prev) => {
          if (prev >= 4) {
            clearInterval(interval);
            setTimeout(() => {
              handleNext(); // Move to Screen 30: Business Ready
            }, 600);
            return 4;
          }
          return prev + 1;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [currentScreenId]);

  // Handle final completion at Screen 30
  const handleFinalCompletion = async (target: 'dashboard' | 'bill') => {
    setIsLoading(true);

    try {
      // 1. Create Business Record
      const businessData = {
        name: formState.businessName.trim() || 'My Business',
        role: 'Owner',
        country: formState.country.name,
        businessType: formState.businessType,
        gstin: formState.taxRegistrationId || undefined,
        phone: formState.phone || undefined,
        address: formState.address || undefined,
      };

      if (user?.id) {
        const updatedAccount = await AuthService.addBusinessToUser(user.id, businessData);
        if (updatedAccount) {
          updateUserAccount({ ...updatedAccount, hasCompletedOnboarding: true });
        }
      }

      // 2. Persist Settings
      await updateSettings({
        businessName: formState.businessName.trim() || 'My Business',
        legalBusinessName: formState.legalBusinessName || formState.businessName,
        country: formState.country.name,
        currency: formState.country.currency,
        businessType: formState.businessType,
        gstin: formState.taxRegistrationId || '',
        gstRegistrationStatus: formState.registrationStatus === 'yes' ? 'Registered' : 'Unregistered',
        gstEnabled: formState.registrationStatus === 'yes' || formState.chargesTax === 'yes',
        defaultTaxRate: formState.defaultTaxRate || formState.country.defaultTaxRate,
        invoicePrefix: formState.invoicePrefix || 'INV-',
        stockTrackingEnabled: formState.offeringType !== 'services',
        businessAddress: formState.address || '',
        businessPhone: formState.phone || '',
      });

      setCurrency(formState.country.currency);
    } catch (e) {
      console.error('Onboarding save error:', e);
    } finally {
      setIsLoading(false);
      useAuthStore.setState({ hasCompletedOnboarding: true });
      setTimeout(() => {
        if (target === 'bill') {
          navigation.navigate('Main', { screen: 'Orders', params: { screen: 'InvoiceCreator' } } as any);
        } else {
          navigation.navigate('Main', { screen: 'Dashboard' } as any);
        }
      }, 100);
    }
  };

  const handleLogoUpload = () => {
    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (readerEvt) => {
            const dataUrl = readerEvt.target?.result as string;
            if (dataUrl) {
              updateState({ logoUri: dataUrl });
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      alert('Logo upload is available on web and desktop.');
    }
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredCategories = BUSINESS_CATEGORIES.filter((c) =>
    c.title.toLowerCase().includes(bizSearch.toLowerCase())
  );

  const filteredStates = INDIAN_STATES.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  );

  return (
    <LinearGradient colors={isDark ? Gradients.hero : Gradients.primary} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          alwaysBounceVertical={true}
        >
          {/* Header Section */}
          <View style={[styles.headerSection, { maxWidth: isDesktop ? 640 : 480 }]}>
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="sparkles-outline" size={28} color="#FFF" />
            </View>
            <Text style={styles.brandTitle}>GemSphere Setup</Text>

            {/* Dynamic Step Progress Tracker */}
            {currentScreenId !== 1 && currentScreenId !== 29 && currentScreenId !== 30 && (
              <View style={styles.progressContainer}>
                <Text style={styles.brandSubtitle}>
                  Step {currentScreenIndex + 1} of {totalActiveScreens}
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${((currentScreenIndex + 1) / totalActiveScreens) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Form Card */}
          <GlassCard
            padding={Spacing.lg}
            style={[styles.formCard, { maxWidth: isDesktop ? 640 : 480 }] as any}
            noBorder={isDark}
          >
            {/* ================= SCREEN 1 — WELCOME ================= */}
            {currentScreenId === 1 && (
              <View style={{ alignItems: 'center' }}>
                <View style={styles.welcomeBadge}>
                  <Ionicons name="flash-outline" size={18} color="#34D399" style={{ marginRight: 6 }} />
                  <Text style={styles.welcomeBadgeText}>GemSphere Books 2.0</Text>
                </View>

                <Text style={[Typography.h2, { color: Palette.text, textAlign: 'center', marginTop: 12 }]}>
                  Welcome to GemSphere Books
                </Text>
                <Text style={[Typography.h4, { color: Palette.primary, textAlign: 'center', marginTop: 4, marginBottom: 12 }]}>
                  Run your business. Simply.
                </Text>
                <Text style={[Typography.body, { color: Palette.textMuted, textAlign: 'center', marginBottom: Spacing.lg }]}>
                  Create bills, manage products, track payments, customers and expenses — all in one simple business app.
                </Text>

                <View style={styles.highlightGrid}>
                  {[
                    { title: formState.country.code === 'IN' ? 'GST / Tax-ready Invoicing' : `${formState.country.taxName}-ready Invoicing`, icon: 'receipt-outline' },
                    { title: 'Products & Inventory', icon: 'cube-outline' },
                    { title: 'Customers & Payments', icon: 'people-outline' },
                    { title: 'Business Reports', icon: 'bar-chart-outline' },
                  ].map((item, idx) => (
                    <View key={idx} style={[styles.highlightItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}>
                      <Ionicons name={item.icon as any} size={20} color={Palette.primary} />
                      <Text style={[Typography.bodyMedium, { color: Palette.text, marginLeft: 8, flex: 1 }]}>{item.title}</Text>
                    </View>
                  ))}
                </View>

                <View style={{ width: '100%', marginTop: Spacing.lg }}>
                  <PremiumButton label="Get Started →" onPress={handleNext} size="lg" fullWidth />
                  <TouchableOpacity
                    onPress={async () => {
                      await useAuthStore.getState().logout();
                      navigation.navigate('Auth', { screen: 'Login' });
                    }}
                    style={{ marginTop: Spacing.md, alignSelf: 'center', padding: Spacing.xs }}
                  >
                    <Text style={[Typography.bodySemibold, { color: Palette.primary }]}>I Already Have an Account</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ================= SCREEN 3 — COUNTRY / BUSINESS LOCATION ================= */}
            {currentScreenId === 3 && (
              <View>
                <Text style={[Typography.h3, { color: Palette.text, marginBottom: 4 }]}>
                  Where is your business located?
                </Text>
                <Text style={[Typography.caption, { color: Palette.textMuted, marginBottom: Spacing.md }]}>
                  GemSphere auto-configures currency, tax terminology, and formatting for your region.
                </Text>

                <View style={[styles.searchBox, { borderColor: Palette.border }]}>
                  <Ionicons name="search-outline" size={18} color={Palette.textMuted} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.searchInput, { color: Palette.text }]}
                    placeholder="Search country..."
                    placeholderTextColor={Palette.textMuted}
                    value={countrySearch}
                    onChangeText={setCountrySearch}
                  />
                </View>

                <View style={{ maxHeight: 280, marginBottom: Spacing.md }}>
                  <ScrollView nestedScrollEnabled>
                    {filteredCountries.map((c) => {
                      const selected = formState.country.code === c.code;
                      return (
                        <TouchableOpacity
                          key={c.code}
                          style={[
                            styles.countryCardOption,
                            { borderColor: selected ? Palette.primary : Palette.border },
                            selected && { backgroundColor: `${Palette.primary}15` },
                          ]}
                          onPress={() => {
                            updateState({ country: c, defaultTaxRate: c.defaultTaxRate, selectedPaymentMethods: c.paymentMethods.map((p) => p.id) });
                            setCountryStore(c);
                          }}
                        >
                          <Text style={{ fontSize: 28, marginRight: Spacing.md }}>{c.flag}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>{c.name}</Text>
                            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
                              {c.currency} ({c.symbol}) • {c.taxName} • {c.numberFormatting} format
                            </Text>
                          </View>
                          {selected && <Ionicons name="checkmark-circle" size={22} color={Palette.primary} />}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={styles.navRow}>
                  <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: Palette.border }]}>
                    <Ionicons name="arrow-back" size={18} color={Palette.text} />
                  </TouchableOpacity>
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <PremiumButton label="Continue →" onPress={handleNext} size="lg" fullWidth />
                  </View>
                </View>
              </View>
            )}





            {/* ================= SCREEN 6 — CREATE ACCOUNT ================= */}
            {currentScreenId === 6 && (
              <View>
                <Text style={[Typography.h3, { color: Palette.text, marginBottom: 2 }]}>Create your GemSphere account</Text>
                <Text style={[Typography.caption, { color: Palette.textMuted, marginBottom: Spacing.md }]}>
                  Enter basic account credentials to get started.
                </Text>

                <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>Full Name *</Text>
                <TextInput
                  style={[styles.inputField, { borderColor: Palette.border, color: Palette.text, marginBottom: Spacing.sm }]}
                  placeholder="e.g. Gaurav Sandilya"
                  placeholderTextColor={Palette.textMuted}
                  value={formState.fullName}
                  onChangeText={(val) => updateState({ fullName: val })}
                />

                <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>Email Address *</Text>
                <TextInput
                  style={[styles.inputField, { borderColor: Palette.border, color: Palette.text, marginBottom: Spacing.sm }]}
                  placeholder="name@company.com"
                  placeholderTextColor={Palette.textMuted}
                  value={formState.email}
                  onChangeText={(val) => updateState({ email: val })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>Mobile Number *</Text>
                <TextInput
                  style={[styles.inputField, { borderColor: Palette.border, color: Palette.text, marginBottom: Spacing.md }]}
                  placeholder={formState.country.phonePlaceholder}
                  placeholderTextColor={Palette.textMuted}
                  value={formState.phone}
                  onChangeText={(val) => updateState({ phone: val })}
                  keyboardType="phone-pad"
                />

                <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
                  <TouchableOpacity
                    style={[styles.socialBtn, { borderColor: Palette.border, flex: 1 }]}
                    onPress={() => alert('Connected with Google Account')}
                  >
                    <Ionicons name="logo-google" size={18} color="#EA4335" style={{ marginRight: 6 }} />
                    <Text style={[Typography.captionMedium, { color: Palette.text }]}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.socialBtn, { borderColor: Palette.border, flex: 1 }]}
                    onPress={() => alert('Connected with Apple ID')}
                  >
                    <Ionicons name="logo-apple" size={18} color={Palette.text} style={{ marginRight: 6 }} />
                    <Text style={[Typography.captionMedium, { color: Palette.text }]}>Apple</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.navRow}>
                  <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: Palette.border }]}>
                    <Ionicons name="arrow-back" size={18} color={Palette.text} />
                  </TouchableOpacity>
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <PremiumButton label="Continue →" onPress={handleNext} size="lg" fullWidth />
                  </View>
                </View>
              </View>
            )}

            {/* ================= SCREEN 7 — VERIFY CONTACT ================= */}
            {currentScreenId === 7 && (
              <View style={{ alignItems: 'center' }}>
                <Text style={[Typography.h3, { color: Palette.text, textAlign: 'center', marginBottom: 2 }]}>
                  Verify your mobile number
                </Text>
                <Text style={[Typography.caption, { color: Palette.textMuted, textAlign: 'center', marginBottom: Spacing.md }]}>
                  We've sent a 6-digit verification code to: {'\n'}
                  <Text style={{ fontWeight: 'bold', color: Palette.text }}>{formState.phone || '+91 98765 43210'}</Text>
                </Text>

                <View style={styles.otpRow}>
                  {otpCode.map((digit, idx) => (
                    <View
                      key={idx}
                      style={[styles.otpBox, { borderColor: Palette.primary, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}
                    >
                      <Text style={[Typography.h3, { color: Palette.text }]}>{digit}</Text>
                    </View>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', gap: Spacing.md, marginVertical: Spacing.md }}>
                  <TouchableOpacity onPress={() => alert('Verification code resent!')}>
                    <Text style={[Typography.captionMedium, { color: Palette.primary }]}>Resend Code</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleBack}>
                    <Text style={[Typography.captionMedium, { color: Palette.textMuted }]}>Change Number</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.navRow, { width: '100%' }]}>
                  <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: Palette.border }]}>
                    <Ionicons name="arrow-back" size={18} color={Palette.text} />
                  </TouchableOpacity>
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <PremiumButton label="Verify & Continue ✓" onPress={handleNext} size="lg" fullWidth />
                  </View>
                </View>
              </View>
            )}

            {/* ================= SCREEN 8 — BUSINESS NAME & TAX REGISTRATION ================= */}
            {currentScreenId === 8 && (() => {
              const isIndia = formState.country.code === 'IN';
              const isVat = formState.country.taxName === 'VAT';

              const taxQuestionTitle = isIndia
                ? 'Are you registered under GST?'
                : isVat
                ? 'Are you registered for VAT?'
                : `Do you collect ${formState.country.taxName}?`;

              const yesLabel = isIndia
                ? 'Yes, I have a GSTIN'
                : isVat
                ? `Yes, I have a ${formState.country.taxNumberLabel}`
                : `Yes, I collect ${formState.country.taxName}`;

              const noLabel = isIndia
                ? "No, I'm not GST registered"
                : isVat
                ? "No, I'm not VAT registered"
                : `No, not tax registered`;

              return (
                <View>
                  <Text style={[Typography.h3, { color: Palette.text, marginBottom: 2 }]}>Business details & tax status</Text>
                  <Text style={[Typography.caption, { color: Palette.textMuted, marginBottom: Spacing.md }]}>
                    Configure your business name and regional tax identification for {formState.country.name}.
                  </Text>

                  <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>Business / Shop Name *</Text>
                  <TextInput
                    style={[styles.inputField, { borderColor: Palette.border, color: Palette.text, marginBottom: Spacing.sm }]}
                    placeholder="e.g. Kumar General Store"
                    placeholderTextColor={Palette.textMuted}
                    value={formState.businessName}
                    onChangeText={(val) => updateState({ businessName: val })}
                  />

                  <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>Trading Name (Optional)</Text>
                  <TextInput
                    style={[styles.inputField, { borderColor: Palette.border, color: Palette.text, marginBottom: Spacing.md }]}
                    placeholder="Brand / Display name if different"
                    placeholderTextColor={Palette.textMuted}
                    value={formState.tradingName}
                    onChangeText={(val) => updateState({ tradingName: val })}
                  />

                  <Text style={[Typography.label, { color: Palette.text, marginBottom: 6 }]}>
                    {taxQuestionTitle}
                  </Text>
                  <View style={{ gap: Spacing.xs, marginBottom: Spacing.md }}>
                    {[
                      { id: 'yes', label: yesLabel },
                      { id: 'no', label: noLabel },
                      { id: 'not_sure', label: "I'm not sure" },
                    ].map((opt) => (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.radioOption,
                          { borderColor: formState.registrationStatus === opt.id ? Palette.primary : Palette.border },
                          formState.registrationStatus === opt.id && { backgroundColor: `${Palette.primary}15` },
                        ]}
                        onPress={() => updateState({ registrationStatus: opt.id as any, chargesTax: opt.id === 'yes' ? 'yes' : 'no' })}
                      >
                        <Ionicons
                          name={formState.registrationStatus === opt.id ? 'radio-button-on' : 'radio-button-off'}
                          size={18}
                          color={formState.registrationStatus === opt.id ? Palette.primary : Palette.textMuted}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={[Typography.bodyMedium, { color: Palette.text }]}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* If Yes, show tax registration ID field directly here */}
                  {formState.registrationStatus === 'yes' && (
                    <View style={{ marginBottom: Spacing.md }}>
                      <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>
                        {formState.country.taxNumberLabel} *
                      </Text>
                      <TextInput
                        style={[styles.inputField, { borderColor: Palette.primary, color: Palette.text }]}
                        placeholder={`Enter ${formState.country.taxName} Number`}
                        placeholderTextColor={Palette.textMuted}
                        value={formState.taxRegistrationId}
                        onChangeText={(val) => updateState({ taxRegistrationId: val.toUpperCase() })}
                        autoCapitalize="characters"
                      />
                    </View>
                  )}

                  <View style={styles.navRow}>
                    <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: Palette.border }]}>
                      <Ionicons name="arrow-back" size={18} color={Palette.text} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <PremiumButton label="Continue →" onPress={handleNext} size="lg" fullWidth />
                    </View>
                  </View>
                </View>
              );
            })()}

            {/* ================= SCREEN 9 — BUSINESS ADDRESS ================= */}
            {currentScreenId === 9 && (
              <View>
                <Text style={[Typography.h3, { color: Palette.text, marginBottom: 2 }]}>What's your business address?</Text>
                <Text style={[Typography.caption, { color: Palette.textMuted, marginBottom: Spacing.md }]}>
                  This address will appear on your customer invoices and receipts.
                </Text>

                <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>Street / Building Address</Text>
                <TextInput
                  style={[styles.inputField, { borderColor: Palette.border, color: Palette.text, marginBottom: Spacing.sm }]}
                  placeholder="Shop / Building, Street name"
                  placeholderTextColor={Palette.textMuted}
                  value={formState.address}
                  onChangeText={(val) => updateState({ address: val })}
                />

                <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>City</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: Palette.border, color: Palette.text }]}
                      placeholder="City"
                      placeholderTextColor={Palette.textMuted}
                      value={formState.city}
                      onChangeText={(val) => updateState({ city: val })}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>State / Region</Text>
                    <TouchableOpacity
                      onPress={() => setShowStateDropdown(!showStateDropdown)}
                      activeOpacity={0.8}
                    >
                      <TextInput
                        style={[styles.inputField, { borderColor: Palette.border, color: Palette.text }]}
                        placeholder="State"
                        placeholderTextColor={Palette.textMuted}
                        value={formState.state}
                        onChangeText={(val) => {
                          updateState({ state: val });
                          setStateSearch(val);
                          setShowStateDropdown(true);
                        }}
                      />
                    </TouchableOpacity>

                    {showStateDropdown && formState.country.code === 'IN' && (
                      <View style={[styles.dropdownBox, { borderColor: Palette.border, backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
                        <ScrollView nestedScrollEnabled style={{ maxHeight: 160 }}>
                          {filteredStates.map((st) => (
                            <TouchableOpacity
                              key={st}
                              style={styles.dropdownItem}
                              onPress={() => {
                                updateState({ state: st });
                                setShowStateDropdown(false);
                              }}
                            >
                              <Text style={[Typography.bodyMedium, { color: Palette.text }]}>{st}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>

                <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>PIN / Postal Code</Text>
                <TextInput
                  style={[styles.inputField, { borderColor: Palette.border, color: Palette.text, marginBottom: Spacing.md }]}
                  placeholder="PIN / Postal Code"
                  placeholderTextColor={Palette.textMuted}
                  value={formState.postalCode}
                  onChangeText={(val) => updateState({ postalCode: val })}
                />

                <View style={styles.navRow}>
                  <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: Palette.border }]}>
                    <Ionicons name="arrow-back" size={18} color={Palette.text} />
                  </TouchableOpacity>
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <PremiumButton label="Continue →" onPress={handleNext} size="lg" fullWidth />
                  </View>
                </View>
              </View>
            )}

            {/* ================= SCREEN 24 — BUSINESS LOGO ================= */}
            {currentScreenId === 24 && (
              <View style={{ alignItems: 'center' }}>
                <Text style={[Typography.h3, { color: Palette.text, textAlign: 'center', marginBottom: 2 }]}>
                  Add your business logo
                </Text>
                <Text style={[Typography.caption, { color: Palette.textMuted, textAlign: 'center', marginBottom: Spacing.md }]}>
                  Personalize your customer bills with your official logo.
                </Text>

                {formState.logoUri ? (
                  <View style={{ alignItems: 'center', marginBottom: Spacing.md }}>
                    <Image
                      source={{ uri: formState.logoUri }}
                      style={{ width: 100, height: 100, borderRadius: Radius.lg, marginBottom: 8 }}
                      resizeMode="cover"
                    />
                    <TouchableOpacity onPress={() => updateState({ logoUri: null })}>
                      <Text style={[Typography.captionMedium, { color: '#EF4444' }]}>Remove Logo</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={handleLogoUpload}
                    style={[styles.logoPlaceholder, { borderColor: Palette.border }]}
                  >
                    <Ionicons name="image-outline" size={44} color={Palette.textMuted} />
                    <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 4 }]}>Tap to Upload</Text>
                  </TouchableOpacity>
                )}

                <View style={{ flexDirection: 'row', gap: Spacing.sm, width: '100%', marginBottom: Spacing.md }}>
                  <TouchableOpacity
                    style={[styles.socialBtn, { borderColor: Palette.border, flex: 1 }]}
                    onPress={handleLogoUpload}
                  >
                    <Ionicons name="cloud-upload-outline" size={18} color={Palette.primary} style={{ marginRight: 6 }} />
                    <Text style={[Typography.captionMedium, { color: Palette.text }]}>Upload Logo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.socialBtn, { borderColor: Palette.border, flex: 1 }]}
                    onPress={handleLogoUpload}
                  >
                    <Ionicons name="camera-outline" size={18} color={Palette.text} style={{ marginRight: 6 }} />
                    <Text style={[Typography.captionMedium, { color: Palette.text }]}>Choose File</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.navRow, { width: '100%' }]}>
                  <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: Palette.border }]}>
                    <Ionicons name="arrow-back" size={18} color={Palette.text} />
                  </TouchableOpacity>
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <PremiumButton
                      label={formState.logoUri ? 'Continue →' : 'Skip Logo →'}
                      onPress={handleNext}
                      size="lg"
                      fullWidth
                    />
                  </View>
                </View>
              </View>
            )}

            {/* ================= SCREEN 25 — TEAM SETUP ================= */}
            {currentScreenId === 25 && (
              <View>
                <Text style={[Typography.h3, { color: Palette.text, marginBottom: 2 }]}>Who will use GemSphere Books?</Text>
                <Text style={[Typography.caption, { color: Palette.textMuted, marginBottom: Spacing.md }]}>
                  Invite team members or staff cashiers.
                </Text>

                <View style={{ gap: Spacing.xs, marginBottom: Spacing.md }}>
                  {[
                    { id: 'just_me', label: 'Just me' },
                    { id: 'team', label: 'I have a team / staff users' },
                  ].map((opt) => (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.radioOption,
                        { borderColor: formState.hasTeam === opt.id ? Palette.primary : Palette.border },
                        formState.hasTeam === opt.id && { backgroundColor: `${Palette.primary}15` },
                      ]}
                      onPress={() => updateState({ hasTeam: opt.id as any })}
                    >
                      <Text style={[Typography.bodyMedium, { color: Palette.text, flex: 1 }]}>{opt.label}</Text>
                      {formState.hasTeam === opt.id && <Ionicons name="checkmark-circle" size={18} color={Palette.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>

                {formState.hasTeam === 'team' && (
                  <View style={{ gap: Spacing.xs, marginBottom: Spacing.md }}>
                    <Text style={[Typography.label, { color: Palette.textMuted }]}>Invite Team Member</Text>
                    <TextInput
                      style={[styles.inputField, { borderColor: Palette.border, color: Palette.text }]}
                      placeholder="Staff Name"
                      placeholderTextColor={Palette.textMuted}
                      value={newTeamMemberName}
                      onChangeText={setNewTeamMemberName}
                    />
                    <TextInput
                      style={[styles.inputField, { borderColor: Palette.border, color: Palette.text }]}
                      placeholder="Staff Email"
                      placeholderTextColor={Palette.textMuted}
                      value={newTeamMemberEmail}
                      onChangeText={setNewTeamMemberEmail}
                      keyboardType="email-address"
                    />
                    <TouchableOpacity
                      style={[styles.backBtn, { backgroundColor: Palette.primary, borderColor: Palette.primary }]}
                      onPress={() => {
                        if (newTeamMemberName.trim()) {
                          updateState({
                            teamMembers: [
                              ...(formState.teamMembers || []),
                              { name: newTeamMemberName.trim(), email: newTeamMemberEmail.trim(), role: 'Cashier' },
                            ],
                          });
                          setNewTeamMemberName('');
                          setNewTeamMemberEmail('');
                          alert(`Added team invite for ${newTeamMemberName}`);
                        }
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Add Team Member</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.navRow}>
                  <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: Palette.border }]}>
                    <Ionicons name="arrow-back" size={18} color={Palette.text} />
                  </TouchableOpacity>
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <PremiumButton label="Continue →" onPress={handleNext} size="lg" fullWidth />
                  </View>
                </View>
              </View>
            )}

            {/* ================= SCREEN 28 — SETUP SUMMARY ================= */}
            {currentScreenId === 28 && (
              <View>
                <Text style={[Typography.h3, { color: Palette.text, marginBottom: 2 }]}>Your GemSphere Books setup</Text>
                <Text style={[Typography.caption, { color: Palette.textMuted, marginBottom: Spacing.md }]}>
                  Review your configured business workspace.
                </Text>

                <View style={[styles.summaryBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: Palette.border }]}>
                  <View style={styles.summaryRow}>
                    <Text style={[Typography.captionMedium, { color: Palette.textMuted }]}>Business Name:</Text>
                    <Text style={[Typography.bodySemibold, { color: Palette.text }]}>{formState.businessName || 'My Business'}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[Typography.captionMedium, { color: Palette.textMuted }]}>Location & Currency:</Text>
                    <Text style={[Typography.bodyMedium, { color: Palette.text }]}>
                      {formState.country.name} ({formState.country.currency})
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[Typography.captionMedium, { color: Palette.textMuted }]}>Business Type:</Text>
                    <Text style={[Typography.bodyMedium, { color: Palette.text }]}>{formState.businessType}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[Typography.captionMedium, { color: Palette.textMuted }]}>Offering:</Text>
                    <Text style={[Typography.bodyMedium, { color: Palette.text }]}>
                      {formState.offeringType}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={[Typography.captionMedium, { color: Palette.textMuted }]}>Tax Status:</Text>
                    <Text style={[Typography.bodyMedium, { color: Palette.text }]}>
                      {formState.registrationStatus === 'yes'
                        ? `${formState.country.taxName} Registered (${formState.taxRegistrationId || 'Active'})`
                        : 'Unregistered'}
                    </Text>
                  </View>
                  {formState.address ? (
                    <View style={styles.summaryRow}>
                      <Text style={[Typography.captionMedium, { color: Palette.textMuted }]}>Address:</Text>
                      <Text style={[Typography.bodyMedium, { color: Palette.text, flex: 1, textAlign: 'right' }]} numberOfLines={1}>
                        {formState.address}{formState.city ? `, ${formState.city}` : ''}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.navRow}>
                  <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { borderColor: Palette.border }]}>
                    <Text style={[Typography.bodyMedium, { color: Palette.text }]}>Edit</Text>
                  </TouchableOpacity>
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <PremiumButton label="Create My Business 🎉" onPress={handleNext} size="lg" fullWidth />
                  </View>
                </View>
              </View>
            )}

            {/* ================= SCREEN 29 — CREATING YOUR BUSINESS ================= */}
            {currentScreenId === 29 && (
              <View style={{ alignItems: 'center', paddingVertical: Spacing.xl }}>
                <ActivityIndicator size="large" color={Palette.primary} style={{ marginBottom: Spacing.md }} />
                <Text style={[Typography.h3, { color: Palette.text, textAlign: 'center', marginBottom: Spacing.lg }]}>
                  Setting up your business...
                </Text>

                <View style={{ width: '100%', gap: Spacing.sm }}>
                  {[
                    'Creating your business workspace',
                    'Preparing billing & currency engine',
                    'Configuring tax rules & invoice template',
                    'Setting up payment methods',
                    'Preparing business dashboard',
                  ].map((stepText, idx) => {
                    const done = creationStep > idx;
                    const active = creationStep === idx;
                    return (
                      <View key={idx} style={styles.progressStepRow}>
                        <Ionicons
                          name={done ? 'checkmark-circle' : active ? 'ellipse' : 'ellipse-outline'}
                          size={18}
                          color={done ? '#10B981' : active ? Palette.primary : Palette.textMuted}
                          style={{ marginRight: 8 }}
                        />
                        <Text
                          style={[
                            Typography.bodyMedium,
                            { color: done ? Palette.text : active ? Palette.primary : Palette.textMuted },
                          ]}
                        >
                          {stepText}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ================= SCREEN 30 — BUSINESS READY ================= */}
            {currentScreenId === 30 && (
              <View style={{ alignItems: 'center', paddingVertical: Spacing.sm }}>
                <View style={styles.successIconBox}>
                  <Ionicons name="checkmark-done" size={40} color="#10B981" />
                </View>

                <Text style={[Typography.h2, { color: Palette.text, textAlign: 'center', marginTop: 12 }]}>
                  Your business is ready 🎉
                </Text>
                <Text style={[Typography.body, { color: Palette.textMuted, textAlign: 'center', marginTop: 4, marginBottom: Spacing.lg }]}>
                  Welcome to GemSphere Books. Your workspace is configured and ready.
                </Text>

                <View style={[styles.summaryBox, { width: '100%', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: Palette.border, marginBottom: Spacing.lg }]}>
                  <Text style={[Typography.bodySemibold, { color: Palette.text }]}>{formState.businessName || 'My Business'}</Text>
                  <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
                    {formState.businessType} • {formState.country.name} ({formState.country.currency})
                  </Text>
                </View>

                <View style={{ width: '100%', gap: Spacing.sm }}>
                  <PremiumButton
                    label="Create Your First Invoice →"
                    onPress={() => handleFinalCompletion('bill')}
                    size="lg"
                    fullWidth
                    loading={isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => handleFinalCompletion('dashboard')}
                    style={[styles.outlineBtn, { borderColor: Palette.primary }]}
                  >
                    <Ionicons name="grid-outline" size={18} color={Palette.primary} style={{ marginRight: 6 }} />
                    <Text style={[Typography.bodySemibold, { color: Palette.primary }]}>Go to Dashboard</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
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
    width: '100%',
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
    ...Typography.captionMedium,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  progressTrack: {
    width: '100%',
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: Radius.full,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34D399',
  },
  formCard: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  welcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(52,211,153,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
  },
  welcomeBadgeText: {
    ...Typography.captionMedium,
    color: '#34D399',
    fontWeight: 'bold',
  },
  highlightGrid: {
    flexDirection: 'column',
    gap: Spacing.xs,
    width: '100%',
    marginBottom: Spacing.sm,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.md,
    width: '100%',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    height: 42,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
  },
  countryCardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  categoryList: {
    flexDirection: 'column',
    gap: Spacing.xs,
  },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  catCardGrid: {
    width: '48.5%',
    marginBottom: 0,
  },
  inputField: {
    height: 42,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    ...Typography.body,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  otpRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginVertical: Spacing.sm,
  },
  otpBox: {
    width: 44,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  backBtn: {
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  summaryBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  progressStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  successIconBox: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
  dropdownBox: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: Radius.md,
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    padding: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(150,150,150,0.2)',
  },
});
