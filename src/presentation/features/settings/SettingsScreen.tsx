/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * SettingsScreen.tsx — Responsive Business Settings & Configuration Center.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { useSettingsStore } from './settingsStore';
import { SettingsNavSidebar } from './components/SettingsNavSidebar';
import { SettingsMobileNav } from './components/SettingsMobileNav';

// Category components
import { BusinessProfileCategory } from './components/BusinessProfileCategory';
import { GstSettingsCategory } from './components/GstSettingsCategory';
import { InvoicePreferencesCategory } from './components/InvoicePreferencesCategory';
import { SalesPurchaseCategory } from './components/SalesPurchaseCategory';
import { InventoryPreferencesCategory } from './components/InventoryPreferencesCategory';
import { CustomersSuppliersCategory } from './components/CustomersSuppliersCategory';
import { UsersRolesCategory } from './components/UsersRolesCategory';
import { SecurityPrivacyCategory } from './components/SecurityPrivacyCategory';
import { BackupDataCategory } from './components/BackupDataCategory';
import { NotificationsCategory } from './components/NotificationsCategory';
import { GeneralPreferencesCategory } from './components/GeneralPreferencesCategory';
import { IntegrationsCategory } from './components/IntegrationsCategory';
import { AccountingPreferencesCategory } from './components/AccountingPreferencesCategory';
import { AboutSubscriptionCategory } from './components/AboutSubscriptionCategory';

export const SettingsScreen = ({ navigation }: any) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { theme } = useTheme();
  const { Palette } = theme;
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  const [activeCategory, setActiveCategory] = useState('business-profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Animated opacity for toast
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    // Animate in
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Clear any existing timer
    if (toastTimer.current) clearTimeout(toastTimer.current);

    // Animate out after 2.8s
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToastMessage(null));
    }, 2800);
  };

  // Reset scroll when category changes
  const [categoryKey, setCategoryKey] = useState(0);
  const handleSelectCategory = (id: string) => {
    setActiveCategory(id);
    setCategoryKey((k) => k + 1);
  };

  const renderActiveCategoryContent = () => {
    switch (activeCategory) {
      case 'business-profile':
        return <BusinessProfileCategory onShowToast={showToast} />;
      case 'gst-tax':
        return <GstSettingsCategory onShowToast={showToast} />;
      case 'accounting':
        return <AccountingPreferencesCategory onShowToast={showToast} />;
      case 'invoice-prefs':
        return <InvoicePreferencesCategory onShowToast={showToast} />;
      case 'sales-purchase':
        return <SalesPurchaseCategory onShowToast={showToast} />;
      case 'inventory-prefs':
        return <InventoryPreferencesCategory onShowToast={showToast} />;
      case 'crm-prefs':
        return <CustomersSuppliersCategory onShowToast={showToast} />;
      case 'users-roles':
        return <UsersRolesCategory onShowToast={showToast} />;
      case 'security-privacy':
        return <SecurityPrivacyCategory onShowToast={showToast} />;
      case 'backup-data':
        return <BackupDataCategory onShowToast={showToast} />;
      case 'integrations':
        return <IntegrationsCategory onShowToast={showToast} />;
      case 'notifications':
        return <NotificationsCategory onShowToast={showToast} />;
      case 'general':
        return <GeneralPreferencesCategory onShowToast={showToast} />;
      case 'about-sub':
        return <AboutSubscriptionCategory onShowToast={showToast} />;
      default:
        return <BusinessProfileCategory onShowToast={showToast} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Palette.background }]}>
      <GradientHeader
        title="Business Configuration Center"
        subtitle="Manage your business profile, taxes, billing, team and preferences"
        leftAction={null}
      />

      {/* Responsive Layout Container */}
      {isDesktop ? (
        <View style={styles.desktopLayout}>
          {/* Fixed sidebar — not scrollable with content */}
          <SettingsNavSidebar
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          {/* Content area scrolls independently */}
          <ScrollView
            key={categoryKey}
            style={styles.contentScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {renderActiveCategoryContent()}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.mobileLayout}>
          <SettingsMobileNav
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
          />
          <ScrollView
            key={categoryKey}
            style={styles.contentScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {renderActiveCategoryContent()}
          </ScrollView>
        </View>
      )}

      {/* Floating Toast — rendered last so it appears above all content */}
      {toastMessage !== null && (
        <Animated.View
          style={[
            styles.toastBanner,
            { backgroundColor: Palette.primary, opacity: toastOpacity },
          ]}
          pointerEvents="none"
        >
          <Ionicons name="checkmark-circle" size={18} color="#FFF" style={{ marginRight: Spacing.xs }} />
          <Text style={[Typography.bodySemibold, { color: '#FFF', flex: 1 }]}>{toastMessage}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toastBanner: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    left: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  mobileLayout: {
    flex: 1,
    flexDirection: 'column',
  },
  contentScroll: {
    flex: 1,
  },
});
