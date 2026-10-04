/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * SettingsMobileNav.tsx — Touch-friendly horizontal category pill selector for mobile view.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../../core/theme';
import { SETTINGS_CATEGORIES, CategoryItem } from './SettingsNavSidebar';

interface SettingsMobileNavProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export const SettingsMobileNav: React.FC<SettingsMobileNavProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  const { theme } = useTheme();
  const { Palette } = theme;

  return (
    <View style={[styles.container, { backgroundColor: Palette.surface, borderBottomColor: Palette.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SETTINGS_CATEGORIES.map((cat: CategoryItem) => {
          const isActive = activeCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? Palette.primary : `${Palette.primary}10`,
                  borderColor: isActive ? Palette.primary : Palette.border,
                },
              ]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={cat.icon}
                size={16}
                color={isActive ? '#FFFFFF' : Palette.primary}
                style={{ marginRight: Spacing.xs }}
              />
              <Text
                style={[
                  Typography.captionMedium,
                  { color: isActive ? '#FFFFFF' : Palette.text, fontWeight: isActive ? '700' : '500' },
                ]}
              >
                {cat.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: Spacing.xs + 2,
  },
});
