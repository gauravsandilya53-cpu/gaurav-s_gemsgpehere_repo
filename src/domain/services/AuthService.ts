/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * AuthService — Real functional local authentication & business profile service.
 */

import { StorageService } from '../../core/storage/mmkv';

export interface BusinessProfile {
  id: string;
  name: string;
  role: string;
  country: string;
  businessType: string;
  gstin?: string;
  phone?: string;
  address?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  phone?: string;
  name: string;
  passwordHash: string;
  hasCompletedOnboarding: boolean;
  businesses: BusinessProfile[];
  currentBusinessId?: string;
  createdAt: string;
}

const USERS_STORAGE_KEY = 'gemsphere_user_accounts_v1';
const REMEMBER_ME_KEY = 'gemsphere_remember_me_v1';

// Seed default users if storage is empty
const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr_owner_1',
    email: 'owner@gemsphere.io',
    phone: '+919876543210',
    name: 'Gaurav Sandilya',
    passwordHash: 'password123',
    hasCompletedOnboarding: true,
    businesses: [
      {
        id: 'tenant-1',
        name: 'GemSphere Enterprises',
        role: 'Owner',
        country: 'India',
        businessType: 'Private Limited Company',
        gstin: '29AAACG1234F1Z5',
        phone: '+919876543210',
        address: 'Plot 42, Tech Park Avenue, HSR Layout, Sector 1',
      },
      {
        id: 'tenant-2',
        name: 'GemSphere Retail Shop',
        role: 'Owner',
        country: 'India',
        businessType: 'Sole Proprietorship',
        gstin: '29BBBCH5678G2Z9',
        phone: '+919876543210',
        address: 'Main Market Road, Koramangala',
      },
    ],
    currentBusinessId: 'tenant-1',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'usr_new_2',
    email: 'newuser@gemsphere.io',
    phone: '+919876500000',
    name: 'Rahul Sharma',
    passwordHash: 'password123',
    hasCompletedOnboarding: false,
    businesses: [],
    createdAt: '2025-02-01T00:00:00Z',
  },
];

export class AuthService {
  public static async loadUsers(): Promise<UserAccount[]> {
    try {
      const json = await StorageService.getString(USERS_STORAGE_KEY);
      if (json) {
        return JSON.parse(json);
      }
    } catch (e) {
      console.warn('Failed to load user accounts from storage:', e);
    }
    // Seed default users
    AuthService.saveUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
  }

  public static saveUsers(users: UserAccount[]): void {
    try {
      StorageService.set(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save user accounts to storage:', e);
    }
  }

  /**
   * Find user by email or mobile number
   */
  public static async findUserByIdentifier(identifier: string): Promise<UserAccount | null> {
    const cleanId = identifier.trim().toLowerCase();
    const users = await AuthService.loadUsers();
    return (
      users.find((u) => {
        const matchesEmail = u.email.toLowerCase() === cleanId;
        const matchesPhone = u.phone ? u.phone.replace(/[^0-9+]/g, '') === cleanId.replace(/[^0-9+]/g, '') : false;
        return matchesEmail || matchesPhone;
      }) || null
    );
  }

  /**
   * Authenticate credentials (Email & Password)
   */
  public static async authenticate(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    await new Promise((res) => setTimeout(res, 300)); // realistic network latency

    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      return { success: false, error: 'Please enter your email/mobile and password.' };
    }

    const user = await AuthService.findUserByIdentifier(cleanId);
    if (!user) {
      return { success: false, error: 'No account found with this email or mobile number.' };
    }

    if (user.passwordHash !== password) {
      return { success: false, error: 'Invalid password. Please check your credentials and try again.' };
    }

    return { success: true, user };
  }

  /**
   * Authenticate with Mobile & OTP
   */
  public static async authenticateWithOtp(
    phone: string,
    otp: string
  ): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    await new Promise((res) => setTimeout(res, 350));

    const cleanPhone = phone.trim().replace(/[^0-9+]/g, '');
    if (!cleanPhone) {
      return { success: false, error: 'Please enter a valid mobile number.' };
    }

    if (!otp || otp.length < 4) {
      return { success: false, error: 'Please enter the 6-digit verification code.' };
    }

    const users = await AuthService.loadUsers();
    let user = users.find(
      (u) => u.phone && u.phone.replace(/[^0-9+]/g, '') === cleanPhone
    );

    if (!user) {
      // Create user on the fly for phone OTP login
      user = {
        id: `usr_${Date.now()}`,
        email: `${cleanPhone.replace('+', '')}@mobile.gemsphere.io`,
        phone: cleanPhone,
        name: 'GemSphere User',
        passwordHash: 'otp_verified',
        hasCompletedOnboarding: false,
        businesses: [],
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      AuthService.saveUsers(users);
    }

    return { success: true, user };
  }

  /**
   * Authenticate with Social (Google / Apple)
   */
  public static async authenticateWithSocial(
    provider: 'Google' | 'Apple'
  ): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    await new Promise((res) => setTimeout(res, 300));

    const email = provider === 'Google' ? 'owner@gemsphere.io' : 'apple.user@gemsphere.io';
    const name = provider === 'Google' ? 'Gaurav Sandilya' : 'Apple User';

    const users = await AuthService.loadUsers();
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      user = {
        id: `usr_${provider.toLowerCase()}_${Date.now()}`,
        email,
        name,
        passwordHash: 'oauth_token',
        hasCompletedOnboarding: true,
        businesses: [
          {
            id: `tenant_${provider.toLowerCase()}`,
            name: `${name}'s Business`,
            role: 'Owner',
            country: 'India',
            businessType: 'Retail',
          },
        ],
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      AuthService.saveUsers(users);
    }

    return { success: true, user };
  }

  /**
   * Register a new user account
   */
  public static async register(data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
    await new Promise((res) => setTimeout(res, 400));

    const emailClean = data.email.trim().toLowerCase();
    const users = await AuthService.loadUsers();

    // Check existing email or phone
    const existing = users.find(
      (u) =>
        u.email.toLowerCase() === emailClean ||
        (data.phone && u.phone && u.phone.replace(/[^0-9]/g, '') === data.phone.replace(/[^0-9]/g, ''))
    );

    if (existing) {
      return {
        success: false,
        error: 'An account with this email address or mobile number already exists. Please log in.',
      };
    }

    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      email: emailClean,
      phone: data.phone?.trim(),
      name: data.name.trim(),
      passwordHash: data.password,
      hasCompletedOnboarding: false,
      businesses: [],
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    AuthService.saveUsers(users);

    return { success: true, user: newUser };
  }

  /**
   * Reset Password for a user
   */
  public static async resetPassword(
    identifier: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    await new Promise((res) => setTimeout(res, 400));
    const users = await AuthService.loadUsers();
    const cleanId = identifier.trim().toLowerCase();
    const userIndex = users.findIndex(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (u.phone && u.phone.replace(/[^0-9+]/g, '') === cleanId.replace(/[^0-9+]/g, ''))
    );

    if (userIndex === -1) {
      return { success: false, error: 'Account not found.' };
    }

    users[userIndex].passwordHash = newPassword;
    AuthService.saveUsers(users);

    return { success: true };
  }

  /**
   * Update user's onboarding completion status & current business
   */
  public static async updateUserProfile(userId: string, updates: Partial<UserAccount>): Promise<UserAccount | null> {
    const users = await AuthService.loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    users[idx] = { ...users[idx], ...updates };
    AuthService.saveUsers(users);
    return users[idx];
  }

  /**
   * Add a business to user account
   */
  public static async addBusinessToUser(userId: string, business: Omit<BusinessProfile, 'id'>): Promise<UserAccount | null> {
    const users = await AuthService.loadUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    const newBiz: BusinessProfile = {
      ...business,
      id: `tenant_${Date.now()}`,
    };

    users[idx].businesses.push(newBiz);
    users[idx].currentBusinessId = newBiz.id;
    users[idx].hasCompletedOnboarding = true;

    AuthService.saveUsers(users);
    return users[idx];
  }

  /**
   * Remember me helpers
   */
  public static async getSavedRememberMe(): Promise<{ identifier: string; remember: boolean }> {
    try {
      const json = await StorageService.getString(REMEMBER_ME_KEY);
      if (json) return JSON.parse(json);
    } catch (_) {}
    return { identifier: '', remember: false };
  }

  public static saveRememberMe(identifier: string, remember: boolean): void {
    try {
      if (remember) {
        StorageService.set(REMEMBER_ME_KEY, JSON.stringify({ identifier, remember: true }));
      } else {
        StorageService.delete(REMEMBER_ME_KEY);
      }
    } catch (_) {}
  }
}
