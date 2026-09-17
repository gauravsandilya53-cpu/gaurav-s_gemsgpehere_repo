/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * Badge — Status indicator chip for invoices, stock, etc.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Radius, Typography } from '../../../core/theme';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  dot = false,
}) => {
  const { theme } = useTheme();
  const { Palette } = theme;

  const variantConfig: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
    success: { bg: Palette.successBg, text: Palette.success, dot: Palette.success },
    warning: { bg: Palette.warningBg, text: Palette.warning, dot: Palette.warning },
    error:   { bg: Palette.errorBg,   text: Palette.error,   dot: Palette.error   },
    info:    { bg: Palette.infoBg,    text: Palette.info,    dot: Palette.info    },
    primary: { bg: `${Palette.primary}18`, text: Palette.primary, dot: Palette.primary },
    neutral: { bg: Palette.borderLight, text: Palette.textMuted, dot: Palette.textMuted },
  };

  const config = variantConfig[variant];
  const isSmall = size === 'sm';

  return (
    <View
      style={{
        backgroundColor: config.bg,
        paddingHorizontal: isSmall ? 8 : 10,
        paddingVertical: isSmall ? 2 : 4,
        borderRadius: Radius.full,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 4,
      }}
    >
      {dot && (
        <View
          style={{
            width: isSmall ? 5 : 6,
            height: isSmall ? 5 : 6,
            borderRadius: Radius.full,
            backgroundColor: config.dot,
          }}
        />
      )}
      <Text
        style={{
          ...Typography.label,
          fontSize: isSmall ? 9 : 10,
          color: config.text,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
    </View>
  );
};

// Convenience exports for common invoice statuses
export const InvoiceStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const variantMap: Record<string, BadgeVariant> = {
    PAID: 'success',
    UNPAID: 'error',
    PENDING: 'warning',
    DRAFT: 'neutral',
    OVERDUE: 'error',
    PARTIAL: 'info',
  };
  return <Badge label={status} variant={variantMap[status] ?? 'neutral'} dot size="sm" />;
};

export const StockStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const variantMap: Record<string, BadgeVariant> = {
    IN_STOCK: 'success',
    LOW_STOCK: 'warning',
    OUT_OF_STOCK: 'error',
  };
  return (
    <Badge
      label={status.replace('_', ' ')}
      variant={variantMap[status] ?? 'neutral'}
      dot
      size="sm"
    />
  );
};
