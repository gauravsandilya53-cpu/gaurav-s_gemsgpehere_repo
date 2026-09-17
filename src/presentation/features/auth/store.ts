import * as SecureStore from 'expo-secure-store';
import { StorageService } from '../../../core/storage/mmkv';
import { create } from 'zustand';

interface AuthUser {
  id: number;
  email: string;
  name: string;
  tenantId: string;
  businessName?: string;
  businessAddress?: string;
  phone?: string;
  gstin?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  biometricsEnabled: boolean;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  setBiometricsEnabled: (enabled: boolean) => void;
  currency: string;
  setCurrency: (currency: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  biometricsEnabled: false,
  // StorageService.getString is async — default to 'USD' and let the
  // settings screen update it once the stored value is loaded.
  currency: 'USD',

  login: async (token, user) => {
    await SecureStore.setItemAsync('auth_token', token);
    StorageService.set('user_token', token);
    StorageService.set('tenant_id', user.tenantId);
    set({ isAuthenticated: true, user });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    StorageService.delete('user_token');
    StorageService.delete('tenant_id');
    set({ isAuthenticated: false, user: null });
  },

  setBiometricsEnabled: (enabled: boolean) => {
    StorageService.set('biometrics_enabled', enabled);
    set({ biometricsEnabled: enabled });
  },

  setCurrency: (currency: string) => {
    StorageService.set('currency', currency);
    set({ currency });
  },
}));




