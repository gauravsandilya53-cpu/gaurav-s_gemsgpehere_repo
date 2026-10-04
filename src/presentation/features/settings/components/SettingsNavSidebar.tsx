/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * SettingsNavSidebar.tsx — Desktop left-column navigation panel for Settings Categories with search filtering.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../../core/theme';
import { SearchBar } from '../../../components/ui/SearchBar';

export interface CategoryItem {
  id: string;
  group: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
}

export const SETTINGS_CATEGORIES: CategoryItem[] = [
  // Group 1: Business
  { id: 'business-profile', group: 'BUSINESS', title: 'Business Profile', subtitle: 'Name, address, logo, legal details', icon: 'business-outline' },
  { id: 'gst-tax', group: 'BUSINESS', title: 'GST & Tax Settings', subtitle: 'GSTIN, CGST/SGST/IGST, HSN rules', icon: 'receipt-outline' },
  { id: 'accounting', group: 'BUSINESS', title: 'Accounting & Balances', subtitle: 'Financial year, accounts, opening balances', icon: 'calculator-outline' },

  // Group 2: Transactions
  { id: 'invoice-prefs', group: 'TRANSACTIONS', title: 'Invoice & Documents', subtitle: 'Prefix, terms, templates, PDF rules', icon: 'document-text-outline' },
  { id: 'sales-purchase', group: 'TRANSACTIONS', title: 'Sales & Purchases', subtitle: 'Payment methods, discounts, shipping', icon: 'cart-outline' },
  { id: 'inventory-prefs', group: 'TRANSACTIONS', title: 'Inventory & Items', subtitle: 'Stock tracking, UOM, low stock alerts', icon: 'cube-outline' },
  { id: 'crm-prefs', group: 'TRANSACTIONS', title: 'Customers & Suppliers', subtitle: 'Credit periods, mandatory fields', icon: 'people-outline' },

  // Group 3: Team & Security
  { id: 'users-roles', group: 'TEAM & SECURITY', title: 'Users & Permissions', subtitle: 'Team members, RBAC controls', icon: 'shield-checkmark-outline' },
  { id: 'security-privacy', group: 'TEAM & SECURITY', title: 'Security & Privacy', subtitle: 'Biometrics, lock timeout, passwords', icon: 'lock-closed-outline' },

  // Group 4: Data & Integrations
  { id: 'backup-data', group: 'DATA & INTEGRATIONS', title: 'Backup & Data', subtitle: 'Export JSON, auto-backup, restore', icon: 'cloud-download-outline' },
  { id: 'integrations', group: 'DATA & INTEGRATIONS', title: 'Integrations', subtitle: 'Razorpay, WhatsApp, Drive, Tally', icon: 'extension-puzzle-outline' },

  // Group 5: Preferences
  { id: 'notifications', group: 'PREFERENCES', title: 'Notifications', subtitle: 'Payment & overdue invoice alerts', icon: 'notifications-outline' },
  { id: 'general', group: 'PREFERENCES', title: 'General Preferences', subtitle: 'Theme mode, currency, language, formats', icon: 'options-outline' },

  // Group 6: About & Account
  { id: 'about-sub', group: 'ABOUT & ACCOUNT', title: 'About & Subscription', subtitle: 'Version, plan status, help, sign out', icon: 'information-circle-outline' },
];

interface SettingsNavSidebarProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SettingsNavSidebar: React.FC<SettingsNavSidebarProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  const { theme } = useTheme();
  const { Palette } = theme;

  const filteredCategories = SETTINGS_CATEGORIES.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group categories
  const groups = Array.from(new Set(filteredCategories.map((c) => c.group)));

  return (
    <View style={[styles.container, { backgroundColor: Palette.surface, borderRightColor: Palette.border }]}>
      <View style={styles.headerBox}>
        <View style={styles.titleRow}>
          <Ionicons name="settings" size={22} color={Palette.primary} style={{ marginRight: Spacing.sm }} />
          <Text style={[Typography.h3, { color: Palette.text }]}>Settings Center</Text>
        </View>
        <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2, marginBottom: Spacing.md }]}>
          Manage your business configuration
        </Text>

        <View style={{ marginBottom: Spacing.xs }}>
          <SearchBar
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Search settings..."
          />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {filteredCategories.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={32} color={Palette.textMuted} />
            <Text style={[Typography.bodyMedium, { color: Palette.textMuted, marginTop: Spacing.sm }]}>
              No settings match "{searchQuery}"
            </Text>
          </View>
        ) : (
          groups.map((groupName) => {
            const items = filteredCategories.filter((c) => c.group === groupName);
            return (
              <View key={groupName} style={styles.groupBlock}>
                <Text style={[styles.groupHeading, { color: Palette.textMuted }]}>{groupName}</Text>
                {items.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.navItem,
                        isActive && { backgroundColor: `${Palette.primary}18`, borderColor: Palette.primary },
                      ]}
                      onPress={() => onSelectCategory(cat.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.iconContainer,
                          {
                            backgroundColor: isActive ? Palette.primary : `${Palette.primary}12`,
                          },
                        ]}
                      >
                        <Ionicons
                          name={cat.icon}
                          size={18}
                          color={isActive ? '#FFFFFF' : Palette.primary}
                        />
                      </View>
                      <View style={styles.textContainer}>
                        <Text
                          style={[
                            Typography.bodySemibold,
                            { color: isActive ? Palette.primary : Palette.text },
                          ]}
                          numberOfLines={1}
                        >
                          {cat.title}
                        </Text>
                        <Text
                          style={[
                            Typography.caption,
                            { color: Palette.textMuted, marginTop: 1 },
                          ]}
                          numberOfLines={1}
                        >
                          {cat.subtitle}
                        </Text>
                      </View>
                      {isActive && (
                        <View style={[styles.activeIndicator, { backgroundColor: Palette.primary }]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    flex: 1,
    borderRightWidth: 1,
    flexDirection: 'column',
  },
  headerBox: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scroll: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  groupBlock: {
    marginBottom: Spacing.md,
  },
  groupHeading: {
    ...Typography.label,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  activeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    position: 'absolute',
    right: 4,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
});
