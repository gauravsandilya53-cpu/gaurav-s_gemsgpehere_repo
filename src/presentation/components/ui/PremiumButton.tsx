/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * PremiumButton — Multi-variant button with haptic feedback & press animation.
 */
import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Radius, Shadows, Typography } from '../../../core/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface PremiumButtonProps {
  onPress: () => void;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  onPress,
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, []);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: Palette.primary,
          text: '#FFFFFF',
          border: 'transparent',
          shadow: Shadows.primary,
        };
      case 'secondary':
        return {
          bg: Palette.secondary,
          text: '#FFFFFF',
          border: 'transparent',
          shadow: {},
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: Palette.primary,
          border: Palette.primary,
          shadow: {},
        };
      case 'ghost':
        return {
          bg: `${Palette.primary}15`,
          text: Palette.primary,
          border: 'transparent',
          shadow: {},
        };
      case 'danger':
        return {
          bg: Palette.error,
          text: '#FFFFFF',
          border: 'transparent',
          shadow: Shadows.error,
        };
      case 'success':
        return {
          bg: Palette.success,
          text: '#FFFFFF',
          border: 'transparent',
          shadow: Shadows.success,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { height: 36, px: 12, fontSize: 13, radius: Radius.md, iconSize: 14 };
      case 'md':
        return { height: 48, px: 20, fontSize: 15, radius: Radius.lg, iconSize: 18 };
      case 'lg':
        return { height: 56, px: 28, fontSize: 16, radius: Radius.xl, iconSize: 20 };
    }
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();
  const isDisabled = disabled || loading;

  return (
    <AnimatedTouchable
      style={[
        animStyle,
        {
          backgroundColor: isDisabled ? Palette.border : variantStyle.bg,
          borderWidth: variantStyle.border !== 'transparent' ? 1.5 : 0,
          borderColor: variantStyle.border,
          borderRadius: sizeStyle.radius,
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.px,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          gap: 8,
          ...(!isDisabled && variantStyle.shadow),
        },
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyle.text} />
      ) : (
        <>
          {icon && <View style={{ width: sizeStyle.iconSize }}>{icon}</View>}
          <Text
            style={[
              {
                ...Typography.bodyMedium,
                fontSize: sizeStyle.fontSize,
                fontWeight: '600',
                color: isDisabled ? Palette.textDisabled : variantStyle.text,
                letterSpacing: 0.2,
              },
              textStyle,
            ]}
          >
            {label}
          </Text>
          {iconRight && <View style={{ width: sizeStyle.iconSize }}>{iconRight}</View>}
        </>
      )}
    </AnimatedTouchable>
  );
};
