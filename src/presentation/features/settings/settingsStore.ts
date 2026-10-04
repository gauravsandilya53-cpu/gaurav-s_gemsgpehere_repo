/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * settingsStore.ts — Persistent Zustand store for all GemSphere Books configuration settings.
 */
import { create } from 'zustand';
import { StorageService } from '../../../core/storage/mmkv';

export interface UserMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Accountant' | 'Sales' | 'Viewer';
  status: 'Active' | 'Suspended';
  addedDate: string;
}

export interface SettingsState {
  // Business Profile
  businessName: string;
  legalBusinessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  state: string;
  pinCode: string;
  country: string;
  businessType: string;
  gstRegistrationStatus: 'Registered' | 'Unregistered' | 'Composition';
  gstin: string;
  registrationNumber: string;
  financialYearStart: 'Apr-Mar' | 'Jan-Dec';
  businessWebsite: string;
  logoUri: string | null;

  // GST & Tax
  gstEnabled: boolean;
  defaultTaxRate: number; // e.g., 18
  taxType: 'Inclusive' | 'Exclusive';
  hsnRequired: boolean;
  reverseChargeEnabled: boolean;
  compositionScheme: boolean;
  placeOfSupplyDefault: string;
  additionalTaxFields: boolean;

  // Invoice & Document Preferences
  invoicePrefix: string;
  startingInvoiceNumber: number;
  defaultPaymentTerms: 'Due on Receipt' | 'Net 15' | 'Net 30' | 'Net 60';
  defaultDueDays: number;
  defaultNotes: string;
  defaultTerms: string;
  showLogoOnInvoice: boolean;
  showCustomerAddress: boolean;
  showGstinHsn: boolean;
  showItemDescription: boolean;
  showDiscountBreakdown: boolean;
  showBankDetails: boolean;
  showSignatureLine: boolean;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  pageSize: 'A4' | 'Letter' | '3inch Thermal';
  invoiceTemplate: 'Modern' | 'Classic' | 'Minimal' | 'Elegant';

  // Sales & Purchase
  defaultSalesType: 'Cash' | 'Credit';
  defaultPaymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card';
  enableItemDiscount: boolean;
  enableTransactionDiscount: boolean;
  enableShippingCharges: boolean;
  defaultPurchaseNotes: string;

  // Inventory & Items
  stockTrackingEnabled: boolean;
  defaultUOM: string; // 'Pcs', 'Box', 'Kg', 'Mtr', 'Ltr'
  quantityPrecision: number; // 0, 1, 2, 3
  lowStockThreshold: number;
  autoGenerateSKU: boolean;

  // Customers & Suppliers
  customerCreditDays: number;
  supplierPaymentDays: number;
  requireCustomerGstin: boolean;
  defaultCommunicationChannel: 'WhatsApp' | 'Email' | 'SMS';

  // Users & Roles
  users: UserMember[];
  rolePermissions: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean }>;

  // Security & Privacy
  autoLockTimeout: 'Immediate' | '1 min' | '5 min' | '15 min' | 'Never';
  requireAuthOnExport: boolean;

  // Backup & Data
  autoBackupEnabled: boolean;
  backupFrequency: 'Daily' | 'Weekly' | 'Monthly';
  lastBackupDate: string | null;

  // Notifications
  notifyPaymentDue: boolean;
  notifyOverdueInvoices: boolean;
  notifyLowStock: boolean;
  reminderDaysBeforeDue: number;
  enableInAppAlerts: boolean;
  enableEmailAlerts: boolean;

  // General Preferences
  language: string;
  currency: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  numberFormatting: 'Indian' | 'International';
  decimalPlaces: number;
  unsavedChangesWarning: boolean;

  // Integrations
  razorpayConnected: boolean;
  razorpayKeyId: string;
  whatsappConnected: boolean;
  whatsappApiKey: string;
  googleDriveBackupConnected: boolean;

  // Accounting Preferences
  defaultCashAccount: string;
  defaultBankAccount: string;
  openingBalanceDate: string;

  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<SettingsState>) => Promise<void>;
  addUser: (user: Omit<UserMember, 'id' | 'addedDate'>) => void;
  updateUserRole: (id: string, role: UserMember['role']) => void;
  removeUser: (id: string) => void;
  resetToDefaults: () => Promise<void>;
}

const STORAGE_KEY = 'gemsphere_app_settings_v2';

const DEFAULT_SETTINGS: Omit<
  SettingsState,
  | 'loadSettings'
  | 'updateSettings'
  | 'addUser'
  | 'updateUserRole'
  | 'removeUser'
  | 'resetToDefaults'
> = {
  // Business Profile
  businessName: 'GemSphere Enterprises',
  legalBusinessName: 'GemSphere Technologies Pvt Ltd',
  businessEmail: 'contact@gemsphere.io',
  businessPhone: '+91 98765 43210',
  businessAddress: 'Plot 42, Tech Park Avenue, HSR Layout, Sector 1',
  state: 'Karnataka',
  pinCode: '560102',
  country: 'India',
  businessType: 'Private Limited Company',
  gstRegistrationStatus: 'Registered',
  gstin: '29AAACG1234F1Z5',
  registrationNumber: 'CIN-U72200KA2025PTC123456',
  financialYearStart: 'Apr-Mar',
  businessWebsite: 'https://gemsphere.io',
  logoUri: null,

  // GST & Tax
  gstEnabled: true,
  defaultTaxRate: 18,
  taxType: 'Exclusive',
  hsnRequired: true,
  reverseChargeEnabled: false,
  compositionScheme: false,
  placeOfSupplyDefault: 'Karnataka (29)',
  additionalTaxFields: false,

  // Invoice & Document Preferences
  invoicePrefix: 'INV-',
  startingInvoiceNumber: 1001,
  defaultPaymentTerms: 'Net 15',
  defaultDueDays: 15,
  defaultNotes: 'Thank you for your business! Please remit payment within the due period.',
  defaultTerms: '1. Goods once sold will not be taken back.\n2. Interest @ 18% p.a. will be charged on delayed payments.\n3. Subject to local jurisdiction.',
  showLogoOnInvoice: true,
  showCustomerAddress: true,
  showGstinHsn: true,
  showItemDescription: true,
  showDiscountBreakdown: true,
  showBankDetails: true,
  showSignatureLine: true,
  bankName: 'HDFC Bank',
  accountNumber: '50200012345678',
  ifscCode: 'HDFC0000123',
  upiId: 'gemsphere@hdfcbank',
  pageSize: 'A4',
  invoiceTemplate: 'Modern',

  // Sales & Purchase
  defaultSalesType: 'Credit',
  defaultPaymentMethod: 'UPI',
  enableItemDiscount: true,
  enableTransactionDiscount: true,
  enableShippingCharges: true,
  defaultPurchaseNotes: 'Subject to quality inspection upon delivery.',

  // Inventory & Items
  stockTrackingEnabled: true,
  defaultUOM: 'Pcs',
  quantityPrecision: 2,
  lowStockThreshold: 10,
  autoGenerateSKU: true,

  // Customers & Suppliers
  customerCreditDays: 30,
  supplierPaymentDays: 45,
  requireCustomerGstin: false,
  defaultCommunicationChannel: 'WhatsApp',

  // Users & Roles
  users: [
    {
      id: 'usr_1',
      name: 'Gaurav Sandilya',
      email: 'gaurav@gemsphere.io',
      role: 'Admin',
      status: 'Active',
      addedDate: '2025-01-15',
    },
    {
      id: 'usr_2',
      name: 'Anita Sharma',
      email: 'anita@gemsphere.io',
      role: 'Accountant',
      status: 'Active',
      addedDate: '2025-02-01',
    },
    {
      id: 'usr_3',
      name: 'Rohan Verma',
      email: 'rohan@gemsphere.io',
      role: 'Sales',
      status: 'Active',
      addedDate: '2025-03-10',
    },
  ],
  rolePermissions: {
    Admin: { view: true, create: true, edit: true, delete: true, export: true },
    Accountant: { view: true, create: true, edit: true, delete: false, export: true },
    Sales: { view: true, create: true, edit: false, delete: false, export: false },
    Viewer: { view: true, create: false, edit: false, delete: false, export: false },
  },

  // Security & Privacy
  autoLockTimeout: '5 min',
  requireAuthOnExport: true,

  // Backup & Data
  autoBackupEnabled: true,
  backupFrequency: 'Weekly',
  lastBackupDate: '2026-09-20T18:30:00Z',

  // Notifications
  notifyPaymentDue: true,
  notifyOverdueInvoices: true,
  notifyLowStock: true,
  reminderDaysBeforeDue: 3,
  enableInAppAlerts: true,
  enableEmailAlerts: true,

  // General Preferences
  language: 'en',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  numberFormatting: 'Indian',
  decimalPlaces: 2,
  unsavedChangesWarning: true,

  // Integrations
  razorpayConnected: true,
  razorpayKeyId: 'rzp_live_9876543210ABC',
  whatsappConnected: true,
  whatsappApiKey: 'wa_api_live_x987213',
  googleDriveBackupConnected: false,

  // Accounting Preferences
  defaultCashAccount: 'Petty Cash',
  defaultBankAccount: 'HDFC Current Account',
  openingBalanceDate: '2025-04-01',
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,

  loadSettings: async () => {
    try {
      const stored = await StorageService.getString(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (e) {
      console.warn('Failed to load settings from storage:', e);
    }
  },

  updateSettings: async (partial) => {
    set((state) => {
      const nextState = { ...state, ...partial };
      // Persist all serializable settings fields to storage
      const serializable: Record<string, any> = {};
      Object.keys(DEFAULT_SETTINGS).forEach((key) => {
        serializable[key] = (nextState as any)[key];
      });
      StorageService.set(STORAGE_KEY, serializable);
      // Return the full merged nextState so Zustand reactive state is updated
      return nextState;
    });
  },

  addUser: (user) => {
    const newUser: UserMember = {
      ...user,
      id: `usr_${Date.now()}`,
      addedDate: new Date().toISOString().split('T')[0],
    };
    const updatedUsers = [...get().users, newUser];
    get().updateSettings({ users: updatedUsers });
  },

  updateUserRole: (id, role) => {
    const updatedUsers = get().users.map((u) => (u.id === id ? { ...u, role } : u));
    get().updateSettings({ users: updatedUsers });
  },

  removeUser: (id) => {
    const updatedUsers = get().users.filter((u) => u.id !== id);
    get().updateSettings({ users: updatedUsers });
  },

  resetToDefaults: async () => {
    StorageService.delete(STORAGE_KEY);
    set({ ...DEFAULT_SETTINGS });
  },
}));
