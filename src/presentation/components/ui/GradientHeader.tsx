/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * GradientHeader — Reusable premium header with gradient text or background.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Gradients, Radius } from '../../../core/theme';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: 'back' | 'menu' | null;
  onLeftPress?: () => void;
  rightAction?: React.ReactNode;
  variant?: 'solid' | 'transparent';
  gradientVariant?: keyof typeof Gradients;
}

export const GradientHeader: React.FC<GradientHeaderProps> = ({
  title,
  subtitle,
  leftAction = 'back',
  onLeftPress,
  rightAction,
  variant = 'solid',
  gradientVariant = 'primary',
}) => {
  const { theme, isDark } = useTheme();
  const { Palette, Gradients: ThemeGradients } = theme;

  const gradientColors = isDark && variant === 'solid' 
    ? ThemeGradients.hero 
    : ThemeGradients[gradientVariant];

  const content = (
    <View style={styles.content}>
      <View style={styles.leftAction}>
        {leftAction && onLeftPress && (
          <TouchableOpacity
            onPress={onLeftPress}
            style={[
              styles.actionButton,
              variant === 'transparent' && { backgroundColor: Palette.surface },
            ]}
          >
            <Ionicons
              name={leftAction === 'back' ? 'chevron-back' : 'menu'}
              size={24}
              color={variant === 'solid' ? '#FFFFFF' : Palette.text}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.titleContainer}>
        <Text
          style={[
            Typography.h3,
            { color: variant === 'solid' ? '#FFFFFF' : Palette.text },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              Typography.caption,
              { color: variant === 'solid' ? 'rgba(255,255,255,0.7)' : Palette.textMuted, marginTop: 2 },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightAction}>
        {rightAction}
      </View>
    </View>
  );

  if (variant === 'transparent') {
    return (
      <SafeAreaView style={{ backgroundColor: Palette.background }}>
        <View style={{ paddingTop: Platform.OS === 'android' ? 16 : 0 }}>
          {content}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ paddingBottom: Spacing.sm }}
    >
      <SafeAreaView>
        <View style={{ paddingTop: Platform.OS === 'android' ? 16 : 0 }}>
          {content}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    height: 60,
  },
  leftAction: {
    width: 40,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  rightAction: {
    width: 40,
    alignItems: 'flex-end',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
