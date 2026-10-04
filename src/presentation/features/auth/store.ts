import * as SecureStore from 'expo-secure-store';
import { StorageService } from '../../../core/storage/mmkv';
import { create } from 'zustand';
import { AuthService, UserAccount, BusinessProfile } from '../../../domain/services/AuthService';
import { CountryItem, DEFAULT_COUNTRY } from '../../../core/constants/countries';
import { useSettingsStore } from '../settings/settingsStore';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  tenantId: string;
  businessName?: string;
  businessAddress?: string;
  gstin?: string;
  hasCompletedOnboarding: boolean;
  businesses: BusinessProfile[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  hasCompletedOnboarding: boolean;
  biometricsEnabled: boolean;
  rememberMe: boolean;
  savedIdentifier: string;
  currency: string;
  selectedCountry: CountryItem;
  
  // Actions
  login: (token: string, account: UserAccount) => Promise<void>;
  logout: () => Promise<void>;
  updateUserAccount: (account: UserAccount) => void;
  selectBusiness: (businessId: string) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  setCurrency: (currency: string) => void;
  setCountry: (country: CountryItem) => void;
  setRememberMe: (remember: boolean, identifier: string) => void;
  restoreSession: () => Promise<void>;
  resetOnboarding: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: true,
  user: {
    id: 'user_default',
    email: 'owner@gemsphere.io',
    name: 'Gaurav Sandilya',
    phone: '+919876543210',
    tenantId: 'default-tenant',
    businessName: 'My GemSphere Shop',
    hasCompletedOnboarding: false,
    businesses: [],
  },
  hasCompletedOnboarding: false,
  biometricsEnabled: false,
  rememberMe: false,
  savedIdentifier: '',
  currency: 'INR',
  selectedCountry: DEFAULT_COUNTRY,

  login: async (token, account) => {
    await SecureStore.setItemAsync('auth_token', token);
    StorageService.set('user_token', token);
    
    const activeBiz = account.businesses.find((b) => b.id === account.currentBusinessId) || account.businesses[0];

    const authUser: AuthUser = {
      id: account.id,
      email: account.email,
      name: account.name,
      phone: account.phone,
      tenantId: activeBiz?.id || 'default-tenant',
      businessName: activeBiz?.name || 'My Business',
      businessAddress: activeBiz?.address,
      gstin: activeBiz?.gstin,
      hasCompletedOnboarding: account.hasCompletedOnboarding,
      businesses: account.businesses,
    };

    if (activeBiz?.id) {
      StorageService.set('tenant_id', activeBiz.id);
    }

    set({
      isAuthenticated: true,
      user: authUser,
      hasCompletedOnboarding: account.hasCompletedOnboarding,
    });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    StorageService.delete('user_token');
    StorageService.delete('tenant_id');
    set({ isAuthenticated: false, user: null, hasCompletedOnboarding: false });
  },

  updateUserAccount: (account: UserAccount) => {
    const activeBiz = account.businesses.find((b) => b.id === account.currentBusinessId) || account.businesses[0];
    const authUser: AuthUser = {
      id: account.id,
      email: account.email,
      name: account.name,
      phone: account.phone,
      tenantId: activeBiz?.id || 'default-tenant',
      businessName: activeBiz?.name || 'My Business',
      businessAddress: activeBiz?.address,
      gstin: activeBiz?.gstin,
      hasCompletedOnboarding: account.hasCompletedOnboarding,
      businesses: account.businesses,
    };

    if (activeBiz?.id) {
      StorageService.set('tenant_id', activeBiz.id);
    }

    set({
      user: authUser,
      hasCompletedOnboarding: account.hasCompletedOnboarding,
    });
  },

  selectBusiness: (businessId: string) => {
    const user = get().user;
    if (!user) return;
    const biz = user.businesses.find((b) => b.id === businessId);
    if (!biz) return;

    StorageService.set('tenant_id', biz.id);
    set({
      user: {
        ...user,
        tenantId: biz.id,
        businessName: biz.name,
        businessAddress: biz.address,
        gstin: biz.gstin,
      },
    });
  },

  setBiometricsEnabled: (enabled: boolean) => {
    StorageService.set('biometrics_enabled', enabled);
    set({ biometricsEnabled: enabled });
  },

  setCurrency: (currency: string) => {
    StorageService.set('currency', currency);
    set({ currency });
  },

  setCountry: (country: CountryItem) => {
    StorageService.set('selected_country_code', country.code);
    StorageService.set('currency', country.currency);
    set({ selectedCountry: country, currency: country.currency });

    // Sync settings store
    useSettingsStore.getState().updateSettings({
      country: country.name,
      currency: country.currency,
      defaultTaxRate: country.defaultTaxRate,
      dateFormat: country.dateFormat,
      numberFormatting: country.numberFormatting,
    });
  },

  setRememberMe: (remember: boolean, identifier: string) => {
    AuthService.saveRememberMe(identifier, remember);
    set({ rememberMe: remember, savedIdentifier: remember ? identifier : '' });
  },

  restoreSession: async () => {
    const saved = await AuthService.getSavedRememberMe();
    set({ rememberMe: saved.remember, savedIdentifier: saved.identifier });
  },

  resetOnboarding: () => {
    set({ hasCompletedOnboarding: false });
  },
}));





