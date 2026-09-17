/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * PremiumTabBar — Floating, animated custom tab bar.
 */
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../core/theme/ThemeContext';
import { Radius, Shadows } from '../../core/theme';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = Math.min(width - 32, 400);

export const PremiumTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();
  const { Palette } = theme;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View
        style={[
          styles.container,
          {
            backgroundColor: Palette.glass,
            borderColor: Palette.glassBorder,
            ...Shadows.lg,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName: keyof typeof Ionicons.glyphMap = 'apps-outline';
          if (route.name === 'Dashboard') iconName = 'grid-outline';
          if (route.name === 'Orders') iconName = 'receipt-outline';
          if (route.name === 'Inventory') iconName = 'cube-outline';
          if (route.name === 'Ledger') iconName = 'wallet-outline';
          if (route.name === 'More') iconName = 'ellipsis-horizontal-outline';

          return (
            <TabItem
              key={index}
              isFocused={isFocused}
              onPress={onPress}
              iconName={isFocused ? (iconName.replace('-outline', '') as keyof typeof Ionicons.glyphMap) : iconName}
              theme={theme}
            />
          );
        })}
      </View>
    </View>
  );
};

const TabItem = ({ isFocused, onPress, iconName, theme }: any) => {
  const { Palette } = theme;
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(isFocused ? 1.15 : 1, { damping: 15 }) }
      ],
      opacity: withSpring(isFocused ? 1 : 0.6)
    };
  });

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      style={styles.tabButton}
      activeOpacity={0.8}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={iconName}
          size={24}
          color={isFocused ? Palette.primary : Palette.textMuted}
        />
        {isFocused && (
          <Animated.View
            style={[
              styles.indicator,
              { backgroundColor: Palette.primary }
            ]}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    width: '100%',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    width: TAB_BAR_WIDTH,
    height: 64,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  indicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
  },
});
