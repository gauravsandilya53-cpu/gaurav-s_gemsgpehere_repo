/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * AdaptiveOnboardingEngine — Dynamic complexity calculation and screen sequencing engine.
 */

import { CountryItem, DEFAULT_COUNTRY } from '../../core/constants/countries';

export interface OnboardingFormState {
  // Screen 3: Country
  country: CountryItem;

  // Screen 4: Business Type
  businessType: string;
  customCategory?: string;

  // Screen 5: Operational Scale
  locationCount: '1' | '2-5' | '6-20' | '>20';
  userCount: '1' | '2-5' | '6-20' | '>20';
  offeringType: 'products' | 'services' | 'both';

  // Screen 6 & 7: Account & Verification
  fullName: string;
  email: string;
  phone: string;
  isVerified: boolean;

  // Screen 8: Create Business
  businessName: string;
  tradingName?: string;
  registrationStatus: 'yes' | 'no' | 'not_sure';

  // Screen 9A: Registration (if yes)
  legalBusinessName?: string;
  registrationType?: string;
  taxRegistrationNumber?: string;
  companyRegistrationNumber?: string;

  // Screen 10: Location
  address: string;
  city: string;
  state: string;
  postalCode: string;
  businessPhone?: string;
  businessWebsite?: string;

  // Screen 11 & 12: Tax Setup
  chargesTax: 'yes' | 'no' | 'not_sure';
  taxRegistrationId?: string;
  taxAuthority?: string;
  defaultTaxRate?: number;
  taxPricingMode?: 'Inclusive' | 'Exclusive';

  // Screen 13 & 14: Products/Services & Inventory
  inventoryMode: 'basic' | 'multi_location' | 'advanced' | 'none';

  // Screen 15: Locations / Stores (if locationCount !== '1')
  additionalLocations: Array<{ name: string; address?: string; manager?: string }>;

  // Screen 16: Warehouses (if complex / multi_location or advanced inventory)
  useWarehouses: 'no' | 'one' | 'multiple';
  warehouses: Array<{ name: string; location?: string; manager?: string }>;

  // Screen 17 & 18: First Product & Add More
  firstProduct?: {
    name: string;
    sellingPrice: number;
    purchasePrice?: number;
    sku?: string;
    unit?: string;
    openingStock?: number;
    taxRate?: number;
  };

  // Screen 19: Customers
  hasCreditCustomers: 'yes' | 'no' | 'not_sure';
  firstCustomer?: {
    name: string;
    phone?: string;
    email?: string;
    openingBalance?: number;
  };

  // Screen 20: Suppliers
  hasSuppliers: 'yes' | 'no';
  firstSupplier?: {
    name: string;
    phone?: string;
    email?: string;
  };

  // Screen 21: Expenses
  trackExpenses: 'yes' | 'no';

  // Screen 22: Payment Methods
  selectedPaymentMethods: string[];

  // Screen 23 & 24: Invoice Customization & Logo
  invoicePrefix: string;
  logoUri?: string | null;

  // Screen 25: Team
  hasTeam: 'just_me' | 'team';
  teamMembers: Array<{ name: string; email: string; role: string }>;

  // Screen 26: Cloud Sync
  enableCloudBackup: boolean;

  // Screen 27: Optional Connections
  connectedTools: string[];
}

export const INITIAL_ONBOARDING_STATE: OnboardingFormState = {
  country: DEFAULT_COUNTRY,
  businessType: 'Retail',
  customCategory: '',
  locationCount: '1',
  userCount: '1',
  offeringType: 'products',
  fullName: 'Gaurav Sandilya',
  email: 'gaurav@gemsphere.io',
  phone: '+919876543210',
  isVerified: true,
  businessName: '',
  tradingName: '',
  registrationStatus: 'no',
  legalBusinessName: '',
  registrationType: '',
  taxRegistrationNumber: '',
  companyRegistrationNumber: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  businessPhone: '',
  businessWebsite: '',
  chargesTax: 'no',
  taxRegistrationId: '',
  taxAuthority: '',
  defaultTaxRate: DEFAULT_COUNTRY.defaultTaxRate,
  taxPricingMode: 'Exclusive',
  inventoryMode: 'basic',
  additionalLocations: [],
  useWarehouses: 'no',
  warehouses: [],
  firstProduct: {
    name: '',
    sellingPrice: 0,
    openingStock: 0,
    unit: 'Pcs',
  },
  hasCreditCustomers: 'no',
  hasSuppliers: 'no',
  trackExpenses: 'yes',
  selectedPaymentMethods: DEFAULT_COUNTRY.paymentMethods.map((pm) => pm.id),
  invoicePrefix: 'INV-',
  logoUri: null,
  hasTeam: 'just_me',
  teamMembers: [],
  enableCloudBackup: true,
  connectedTools: [],
};

export class AdaptiveOnboardingEngine {
  /**
   * Calculates active screen IDs for the streamlined, country-aware onboarding sequence:
   * Screen 1: Welcome
   * Screen 3: Country / Business Location
   * Screen 4: Business Type
   * Screen 5: What do you sell? (Products / Services / Both)
   * Screen 6: Create Account
   * Screen 7: Contact Verification (OTP)
   * Screen 8: Business Name + Tax Registration Status
   * Screen 9: Business Address
   * Screen 24: Business Logo (Preserved Screen 24)
   * Screen 25: Team Setup (Preserved Screen 25)
   * Screen 28: Setup Summary
   * Screen 29: Creating Business Progress
   * Screen 30: Business Ready
   */
  public static getActiveScreenSequence(state: OnboardingFormState): number[] {
    const screens: number[] = [];

    // Screen 1: Welcome
    screens.push(1);

    // Screen 3: Country / Business Location
    screens.push(3);

    // Screen 6: Create Account
    screens.push(6);

    // Screen 7: Contact Verification
    screens.push(7);

    // Screen 8: Business Name & Tax Registration
    screens.push(8);

    // Screen 9: Business Address
    screens.push(9);

    // Screen 24: Business Logo (Preserved Screen 24)
    screens.push(24);

    // Screen 25: Team Setup (Preserved Screen 25)
    if (state.hasTeam === 'team' || state.userCount !== '1') {
      screens.push(25);
    }

    // Screen 28: Setup Summary
    screens.push(28);

    // Screen 29: Creating Business Progress
    screens.push(29);

    // Screen 30: Business Ready
    screens.push(30);

    return screens;
  }

  /**
   * Calculates overall setup completion percentage for dashboard progress indicator.
   */
  public static calculateSetupCompletion(state: OnboardingFormState): number {
    let completed = 0;
    let total = 5;

    if (state.businessName) completed++;
    if (state.country) completed++;
    if (state.address) completed++;
    if (state.businessType) completed++;
    if (state.offeringType) completed++;

    return Math.min(100, Math.round((completed / total) * 100));
  }
}
