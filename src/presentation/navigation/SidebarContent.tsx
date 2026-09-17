import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../core/theme';

export const SidebarContent = (props: DrawerContentComponentProps) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const { state, navigation } = props;

  const currentRouteName = state.routeNames[state.index];

  const menuItems = [
    { name: 'Dashboard', icon: 'grid', route: 'Dashboard' },
    { name: 'Invoices', icon: 'document-text', route: 'Orders' }, // Maps to BillingNavigator -> InvoiceList
    { name: 'Customers', icon: 'people', route: 'Customers' },
    { name: 'Products', icon: 'cube', route: 'Inventory' },
    { name: 'Inventory', icon: 'layers', route: 'Inventory' },
    { name: 'Reports', icon: 'bar-chart', route: 'Reports' },
    { name: 'AI Insights', icon: 'sparkles', route: 'AIInsights' },
    { name: 'Settings', icon: 'settings', route: 'Settings' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: Palette.surface, borderRightColor: Palette.border }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[Typography.label, { color: Palette.textMuted, marginLeft: Spacing.md, marginBottom: Spacing.sm }]}>
            MAIN MENU
          </Text>
          {menuItems.map((item) => {
            const isActive = currentRouteName === item.route;
            return (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.menuItem,
                  isActive && { backgroundColor: `${Palette.primary}15` },
                ]}
                onPress={() => navigation.navigate(item.route)}
              >
                <Ionicons
                  name={(isActive ? item.icon : `${item.icon}-outline`) as any}
                  size={20}
                  color={isActive ? Palette.primary : Palette.textSecondary}
                  style={styles.icon}
                />
                <Text
                  style={[
                    Typography.bodyMedium,
                    { color: isActive ? Palette.primary : Palette.textSecondary },
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Upgrade Banner at Bottom */}
      <View style={[styles.upgradeBanner, { backgroundColor: `${Palette.accent}15`, borderColor: `${Palette.accent}30` }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
          <Ionicons name="star" size={16} color={Palette.accent} />
          <Text style={[Typography.bodySemibold, { color: Palette.accent, marginLeft: Spacing.xs }]}>Premium Plan</Text>
        </View>
        <Text style={[Typography.caption, { color: Palette.textSecondary }]}>Your plan renews in 14 days.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRightWidth: 1,
    paddingTop: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: 2,
  },
  icon: {
    marginRight: Spacing.md,
    width: 24,
    textAlign: 'center',
  },
  upgradeBanner: {
    margin: Spacing.lg,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
});
