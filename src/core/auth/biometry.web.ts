/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * Web stub for BiometryService.
 * expo-local-authentication is not supported in browsers.
 * This stub safely returns false for all biometric checks.
 */

export class BiometryService {
  public static async isAvailable(): Promise<boolean> {
    return false;
  }

  public static async authenticate(_promptMessage: string): Promise<boolean> {
    console.warn('[BiometryService Web] Biometric authentication is not supported on web.');
    return false;
  }
}
