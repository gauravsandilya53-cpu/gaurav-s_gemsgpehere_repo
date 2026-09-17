/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * Web stub for expo-sharing.
 * expo-sharing uses native share sheets not available in browsers.
 * On web, we use the Web Share API if available, otherwise download the file.
 */

export async function isAvailableAsync(): Promise<boolean> {
  return true; // Always attempt sharing on web
}

export async function shareAsync(
  uri: string,
  options?: { mimeType?: string; dialogTitle?: string; UTI?: string }
): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({
        title: options?.dialogTitle || 'Share',
        url: uri,
      });
    } catch (e) {
      console.warn('[expo-sharing web] Share cancelled or failed:', e);
    }
  } else {
    // Fallback: trigger a download
    const a = document.createElement('a');
    a.href = uri;
    a.download = options?.dialogTitle || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
