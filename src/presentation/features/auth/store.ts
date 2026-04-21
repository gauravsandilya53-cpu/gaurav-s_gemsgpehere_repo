import * as SecureStore from 'expo-secure-store';
import { StorageService } from '../../../core/storage/mmkv';

interface AuthUser {
  id: number;
  email: string;
  name: string;
  tenantId: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  biometricsEnabled: boolean;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  setBiometricsEnabled: (enabled: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!StorageService.getString('user_token'),
  user: null,
  biometricsEnabled: StorageService.getBoolean('biometrics_enabled') || false,

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
}));




