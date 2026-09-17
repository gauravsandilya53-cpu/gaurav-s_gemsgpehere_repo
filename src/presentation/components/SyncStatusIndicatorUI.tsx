/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * SyncStatusIndicator — Premium animated sync status pill.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { useTheme } from '../../core/theme/ThemeContext';
import { Typography, Radius, Shadows } from '../../core/theme';
// import { InvoiceRepository } from '../../data/repositories/InvoiceRepository';

export const SyncStatusIndicatorUI = () => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1);
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    
    // Polling for pending count (in real app, use Zustand store events)
    const interval = setInterval(async () => {
      try {
        // Temporarily mock pending count until Phase 12 (Offline Sync Store) is built
        // const pending = await InvoiceRepository.getPendingSync();
        const pending: any[] = [];
        setPendingCount(pending.length);
        if (pending.length > 0 && isOnline) {
          setIsSyncing(true);
          rotation.value = withRepeat(
            withTiming(360, { duration: 1000 }),
            -1, // infinite
            false
          );
        } else {
          setIsSyncing(false);
          rotation.value = 0;
        }
      } catch (e) {}
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isOnline]);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotation.value}deg` }],
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  if (!isOnline) {
    return (
      <Animated.View style={[styles.container, { backgroundColor: Palette.error }, animatedContainerStyle]}>
        <Ionicons name="cloud-offline" size={14} color="#FFF" />
        <Text style={styles.text}>Offline ({pendingCount} pending)</Text>
      </Animated.View>
    );
  }

  if (isSyncing) {
    return (
      <Animated.View style={[styles.container, { backgroundColor: Palette.warning }, animatedContainerStyle]}>
        <Animated.View style={animatedIconStyle}>
          <Ionicons name="sync" size={14} color="#FFF" />
        </Animated.View>
        <Text style={styles.text}>Syncing {pendingCount} items...</Text>
      </Animated.View>
    );
  }

  // Only show synced state briefly if we want to, otherwise return null or a subtle green dot
  if (pendingCount === 0) {
    return null; // Keep UI clean when everything is synced
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50, // SafeArea roughly
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    zIndex: 999,
    gap: 6,
    ...Shadows.md,
  },
  text: {
    ...Typography.captionMedium,
    color: '#FFF',
  },
});

// Force cache invalidation
