/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * StatCard — Animated KPI card with trend indicator and value counter.
 */
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Radius, Shadows, Typography, Spacing } from '../../../core/theme';

interface StatCardProps {
  label: string;
  value: string;
  subLabel?: string;
  changePercent?: number;
  trend?: 'UP' | 'DOWN' | 'STABLE';
  accentColor?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
  compact?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subLabel,
  changePercent,
  trend,
  accentColor,
  icon,
  style,
  compact = false,
}) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 18, stiffness: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const accent = accentColor ?? Palette.primary;
  const trendColor =
    trend === 'UP' ? Palette.success :
    trend === 'DOWN' ? Palette.error :
    Palette.textMuted;
  const trendIcon = trend === 'UP' ? '↑' : trend === 'DOWN' ? '↓' : '→';

  return (
    <Animated.View
      style={[
        {
          backgroundColor: Palette.card,
          borderRadius: Radius.xl,
          padding: compact ? Spacing.lg : Spacing.xxl,
          borderWidth: 1,
          borderColor: Palette.cardBorder,
          ...Shadows.sm,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
    >
      {/* Top row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm }}>
        <Text
          style={{
            ...Typography.label,
            color: Palette.textMuted,
            fontSize: 10,
            flex: 1,
          }}
        >
          {label}
        </Text>
        {icon && (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: Radius.md,
              backgroundColor: `${accent}18`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </View>
        )}
      </View>

      {/* Value */}
      <Text
        style={{
          ...Typography.h3,
          color: Palette.text,
          fontSize: compact ? 18 : 22,
          fontWeight: '700',
          marginBottom: 4,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>

      {/* Trend & SubLabel */}
      {(changePercent !== undefined || subLabel) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
          {changePercent !== undefined && trend && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: `${trendColor}18`,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: Radius.full,
                gap: 2,
              }}
            >
              <Text style={{ color: trendColor, fontSize: 10, fontWeight: '700' }}>
                {trendIcon} {Math.abs(changePercent).toFixed(1)}%
              </Text>
            </View>
          )}
          {subLabel && (
            <Text style={{ ...Typography.caption, color: Palette.textMuted, flex: 1 }} numberOfLines={1}>
              {subLabel}
            </Text>
          )}
        </View>
      )}

      {/* Accent bar at bottom */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: Radius.xl,
          right: Radius.xl,
          height: 2.5,
          backgroundColor: `${accent}25`,
          borderRadius: Radius.full,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: '60%',
            height: '100%',
            backgroundColor: accent,
            borderRadius: Radius.full,
          }}
        />
      </View>
    </Animated.View>
  );
};
