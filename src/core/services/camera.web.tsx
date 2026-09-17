/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * Web stub for expo-camera.
 * expo-camera uses native camera APIs that are not available via Expo's
 * Metro web bundler. On web, the barcode scanner shows a disabled placeholder.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Stub hook — always returns [no permission granted, request fn that no-ops]
export function useCameraPermissions(): [{ granted: boolean } | null, () => Promise<void>] {
  return [{ granted: false }, async () => {}];
}

// Stub CameraView component — renders a placeholder message
export const CameraView = ({ style }: { style?: any; facing?: string; onBarcodeScanned?: any }) => {
  return (
    <View style={[styles.placeholder, style]}>
      <Text style={styles.text}>📷 Camera not available on web</Text>
      <Text style={styles.subtext}>Barcode scanning requires the mobile app</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtext: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
