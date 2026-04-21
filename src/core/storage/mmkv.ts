/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * StorageService optimized for Expo Go.
 * Uses AsyncStorage to replace native MMKV for standard Expo Go support.
 * Note: For production CLI builds, use MMKV for 10x performance.
 */
export const StorageService = {
  set: (key: string, value: any) => {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    AsyncStorage.setItem(key, stringValue);
  },

  getString: async (key: string): Promise<string | null> => {
    return await AsyncStorage.getItem(key);
  },

  getNumber: async (key: string): Promise<number | null> => {
    const val = await AsyncStorage.getItem(key);
    return val ? Number(val) : null;
  },

  getBoolean: async (key: string): Promise<boolean | null> => {
    const val = await AsyncStorage.getItem(key);
    return val ? val === 'true' : null;
  },

  delete: (key: string) => {
    AsyncStorage.removeItem(key);
  },
};
