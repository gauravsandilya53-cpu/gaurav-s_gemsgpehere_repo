/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * Cross-platform alert utility.
 * On web: uses window.confirm / window.alert since React Native's Alert doesn't render.
 * On native: uses React Native's Alert.alert as normal.
 */
import { Platform, Alert } from 'react-native';

const isWeb = Platform.OS === 'web';

/**
 * Show a simple informational alert.
 */
export const showAlert = (title: string, message?: string): void => {
  if (isWeb) {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
};

/**
 * Show a confirmation dialog. Returns a Promise<boolean> — true if confirmed.
 */
export const showConfirm = (title: string, message?: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (isWeb) {
      const confirmed = window.confirm(message ? `${title}\n\n${message}` : title);
      resolve(confirmed);
    } else {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
      ]);
    }
  });
};

/**
 * Show a destructive confirmation with custom confirm label.
 */
export const showDestructiveConfirm = (
  title: string,
  message: string,
  confirmLabel = 'Delete',
  onConfirm: () => void
): void => {
  if (isWeb) {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: confirmLabel, style: 'destructive', onPress: onConfirm },
    ]);
  }
};
