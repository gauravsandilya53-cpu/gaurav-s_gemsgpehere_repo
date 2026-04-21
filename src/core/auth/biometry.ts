/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */

import * as LocalAuthentication from 'expo-local-authentication';

/**
 * BiometryService optimized for Expo Go.
 * Uses expo-local-authentication for cross-platform biometric support.
 */
export class BiometryService {
  public static async isAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  }

  public static async authenticate(promptMessage: string): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Use Password',
      disableDeviceFallback: false,
    });
    return result.success;
  }
}
