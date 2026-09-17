/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * SearchBar — Animated premium search input with clear button.
 */
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Animated,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Radius, Spacing, Typography } from '../../../core/theme';

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  rightAction?: React.ReactNode;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search…',
  onFocus,
  onBlur,
  onClear,
  rightAction,
  ...rest
}) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setFocused(true);
    Animated.spring(borderAnim, { toValue: 1, damping: 18, stiffness: 200, useNativeDriver: false }).start();
    onFocus?.();
  }, []);

  const handleBlur = useCallback(() => {
    setFocused(false);
    Animated.spring(borderAnim, { toValue: 0, damping: 18, stiffness: 200, useNativeDriver: false }).start();
    onBlur?.();
  }, []);

  const handleClear = useCallback(() => {
    onChangeText('');
    onClear?.();
  }, [onChangeText]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Palette.border, Palette.primary],
  });

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Palette.card,
        borderRadius: Radius.xl,
        borderWidth: 1.5,
        borderColor,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: Spacing.md,
      }}
    >
      <Ionicons
        name="search-outline"
        size={18}
        color={focused ? Palette.primary : Palette.textMuted}
      />
      <TextInput
        style={{
          flex: 1,
          ...Typography.bodyMedium,
          color: Palette.text,
          padding: 0,
          margin: 0,
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Palette.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close-circle" size={16} color={Palette.textMuted} />
        </TouchableOpacity>
      )}
      {rightAction && <View style={{ marginLeft: Spacing.xs }}>{rightAction}</View>}
    </Animated.View>
  );
};
