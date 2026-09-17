/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * EmptyState — Premium empty state with icon, title, body & optional CTA.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { PremiumButton } from './PremiumButton';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'folder-open-outline',
  title,
  body,
  actionLabel,
  onAction,
}) => {
  const { theme } = useTheme();
  const { Palette } = theme;

  return (
    <View style={styles.container}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: Radius.xxl,
          backgroundColor: `${Palette.primary}12`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: Spacing.xxl,
        }}
      >
        <Ionicons name={icon} size={40} color={Palette.primary} style={{ opacity: 0.6 }} />
      </View>

      <Text style={{ ...Typography.h4, color: Palette.text, textAlign: 'center', marginBottom: Spacing.sm }}>
        {title}
      </Text>

      {body && (
        <Text
          style={{
            ...Typography.body,
            color: Palette.textMuted,
            textAlign: 'center',
            lineHeight: 22,
            maxWidth: 280,
            marginBottom: Spacing.xxl,
          }}
        >
          {body}
        </Text>
      )}

      {actionLabel && onAction && (
        <PremiumButton label={actionLabel} onPress={onAction} size="md" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
});
