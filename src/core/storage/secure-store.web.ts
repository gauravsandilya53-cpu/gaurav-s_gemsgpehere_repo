/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * Web stub for expo-secure-store — uses localStorage as a fallback.
 * expo-secure-store is not available in browsers, so this module provides
 * the same API backed by localStorage for the web platform only.
 */

export async function setItemAsync(key: string, value: string): Promise<void> {
  try {
    localStorage.setItem(`securestore_${key}`, value);
  } catch (e) {
    console.warn('[SecureStore Web] setItemAsync failed:', e);
  }
}

export async function getItemAsync(key: string): Promise<string | null> {
  try {
    return localStorage.getItem(`securestore_${key}`);
  } catch (e) {
    console.warn('[SecureStore Web] getItemAsync failed:', e);
    return null;
  }
}

export async function deleteItemAsync(key: string): Promise<void> {
  try {
    localStorage.removeItem(`securestore_${key}`);
  } catch (e) {
    console.warn('[SecureStore Web] deleteItemAsync failed:', e);
  }
}
