import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { useAuthStore } from '../../features/auth/store';

const { width } = Dimensions.get('window');

interface TopHeaderProps {
  onToggleSidebar?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onToggleSidebar }) => {
  const { theme, isDark, setMode } = useTheme();
  const { Palette } = theme;
  const { user } = useAuthStore();
  const isMobile = width < 768;

  const toggleTheme = () => setMode(isDark ? 'light' : 'dark');

  return (
    <View style={[styles.container as any, { backgroundColor: Palette.surface, borderBottomColor: Palette.border }]}>
      {/* Left: Logo / Hamburger */}
      <View style={styles.leftSection}>
        {isMobile && onToggleSidebar && (
          <TouchableOpacity onPress={onToggleSidebar} style={styles.iconButton}>
            <Ionicons name="menu" size={24} color={Palette.text} />
          </TouchableOpacity>
        )}
        <View style={styles.logoContainer}>
          <View style={[styles.logoIcon, { backgroundColor: Palette.primary }]}>
            <Text style={styles.logoText}>G</Text>
          </View>
          {(!isMobile || !onToggleSidebar) && (
            <Text style={[Typography.h3, { color: Palette.text, marginLeft: Spacing.sm }]}>GemSphere</Text>
          )}
        </View>
      </View>

      {/* Center: Search */}
      {!isMobile && (
        <View style={styles.centerSection}>
          <View style={[styles.searchBar, { backgroundColor: Palette.backgroundAlt }]}>
            <Ionicons name="search" size={18} color={Palette.textMuted} />
            <TextInput
              placeholder="Search invoices, products, customers..."
              placeholderTextColor={Palette.textMuted}
              style={[styles.searchInput, { color: Palette.text }]}
            />
            <View style={[styles.shortcutBadge, { backgroundColor: Palette.border }]}>
              <Text style={[Typography.caption, { color: Palette.textMuted }]}>⌘K</Text>
            </View>
          </View>
        </View>
      )}

      {/* Right: Actions */}
      <View style={styles.rightSection}>
        {isMobile && (
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={20} color={Palette.textSecondary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
          <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={Palette.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={20} color={Palette.textSecondary} />
          <View style={styles.badge} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.wizardButton, { backgroundColor: Palette.primary }]}
          onPress={() => {
            useAuthStore.getState().resetOnboarding();
          }}
        >
          <Ionicons name="sparkles" size={16} color="#FFF" style={{ marginRight: 4 }} />
          <Text style={[Typography.captionMedium, { color: '#FFF', fontWeight: 'bold' }]}>
            Setup Wizard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.profileButton, { borderColor: Palette.border }]}>
          <View style={[styles.avatar, { backgroundColor: Palette.primary }]}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          {!isMobile && (
            <Text style={[Typography.bodyMedium, { color: Palette.text, marginLeft: Spacing.sm }]}>
              {user?.name || 'User'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    zIndex: 10,
    ...Platform.select({
      web: { position: 'sticky' as any, top: 0 },
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 480,
    height: 40,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 14,
    outlineStyle: 'none',
  } as any,
  shortcutBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginLeft: Spacing.sm,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    gap: Spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFF',
  },
  wizardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    marginLeft: Spacing.xs,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
    paddingRight: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginLeft: Spacing.sm,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
