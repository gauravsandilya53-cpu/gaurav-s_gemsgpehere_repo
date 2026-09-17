/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * GlassCard — Premium glassmorphism card component.
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Radius, Shadows } from '../../../core/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  elevation?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  noBorder?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  padding = 16,
  elevation = 'sm',
  noBorder = false,
}) => {
  const { theme, isDark } = useTheme();
  const { Palette } = theme;

  return (
    <View
      style={[
        styles.card,
        elevation !== 'none' && Shadows[elevation],
        {
          backgroundColor: Palette.card,
          borderColor: noBorder ? 'transparent' : Palette.cardBorder,
          borderWidth: noBorder ? 0 : 1,
          padding,
          borderRadius: Radius.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
