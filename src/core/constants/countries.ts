/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * Central Country Catalog & Regional Configuration Settings.
 */

export interface PaymentMethodItem {
  id: string;
  label: string;
  icon: string;
  popular?: boolean;
}

export interface CountryItem {
  code: string;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
  phonePrefix: string;
  phonePlaceholder: string;
  taxName: string;
  taxNumberLabel: string;
  taxQuestionLabel: string;
  legalNameLabel: string;
  regNumberLabel: string;
  defaultTaxRate: number;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  numberFormatting: 'Indian' | 'International';
  paymentMethods: PaymentMethodItem[];
}

export const COUNTRIES: CountryItem[] = [
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    phonePrefix: '+91',
    phonePlaceholder: '+91 98765 43210',
    taxName: 'GST',
    taxNumberLabel: 'GSTIN / PAN',
    taxQuestionLabel: 'Do you charge GST?',
    legalNameLabel: 'Legal Business Name (as per GST/PAN)',
    regNumberLabel: 'CIN / Trade Licence / Registration No',
    defaultTaxRate: 18,
    dateFormat: 'DD/MM/YYYY',
    numberFormatting: 'Indian',
    paymentMethods: [
      { id: 'cash', label: 'Cash', icon: 'cash-outline', popular: true },
      { id: 'upi', label: 'UPI / PhonePe / GPay', icon: 'qr-code-outline', popular: true },
      { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline', popular: true },
      { id: 'bank_transfer', label: 'Bank Transfer (NEFT/IMPS)', icon: 'business-outline' },
      { id: 'cheque', label: 'Cheque', icon: 'document-text-outline' },
    ],
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    symbol: '$',
    phonePrefix: '+1',
    phonePlaceholder: '+1 (555) 019-2834',
    taxName: 'Sales Tax',
    taxNumberLabel: 'EIN / State Tax ID',
    taxQuestionLabel: 'Do you collect Sales Tax?',
    legalNameLabel: 'Legal Business Name (LLC / Inc)',
    regNumberLabel: 'Federal Employer Identification Number (EIN)',
    defaultTaxRate: 8.5,
    dateFormat: 'MM/DD/YYYY',
    numberFormatting: 'International',
    paymentMethods: [
      { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline', popular: true },
      { id: 'cash', label: 'Cash', icon: 'cash-outline', popular: true },
      { id: 'ach', label: 'ACH / Direct Deposit', icon: 'business-outline', popular: true },
      { id: 'digital_wallet', label: 'Apple Pay / Google Pay', icon: 'wallet-outline' },
      { id: 'check', label: 'Check', icon: 'document-text-outline' },
    ],
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED',
    symbol: 'AED',
    phonePrefix: '+971',
    phonePlaceholder: '+971 50 123 4567',
    taxName: 'VAT',
    taxNumberLabel: 'Tax Registration Number (TRN)',
    taxQuestionLabel: 'Do you charge VAT?',
    legalNameLabel: 'Legal Business Name (as on Trade Licence)',
    regNumberLabel: 'Trade Licence Number',
    defaultTaxRate: 5,
    dateFormat: 'DD/MM/YYYY',
    numberFormatting: 'International',
    paymentMethods: [
      { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline', popular: true },
      { id: 'cash', label: 'Cash', icon: 'cash-outline', popular: true },
      { id: 'bank_transfer', label: 'Bank Transfer (IBAN)', icon: 'business-outline', popular: true },
      { id: 'pdc', label: 'Post-dated Cheque', icon: 'document-text-outline' },
    ],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    symbol: '£',
    phonePrefix: '+44',
    phonePlaceholder: '+44 7911 123456',
    taxName: 'VAT',
    taxNumberLabel: 'VAT Registration Number / UTR',
    taxQuestionLabel: 'Do you charge VAT?',
    legalNameLabel: 'Company Name (Companies House)',
    regNumberLabel: 'Company Registration Number (CRN)',
    defaultTaxRate: 20,
    dateFormat: 'DD/MM/YYYY',
    numberFormatting: 'International',
    paymentMethods: [
      { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline', popular: true },
      { id: 'bacs', label: 'BACS / Bank Transfer', icon: 'business-outline', popular: true },
      { id: 'cash', label: 'Cash', icon: 'cash-outline' },
      { id: 'cheque', label: 'Cheque', icon: 'document-text-outline' },
    ],
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    symbol: '$',
    phonePrefix: '+1',
    phonePlaceholder: '+1 (416) 555-0143',
    taxName: 'GST/HST',
    taxNumberLabel: 'Business Number (BN / GST/HST No)',
    taxQuestionLabel: 'Do you collect GST/HST?',
    legalNameLabel: 'Legal Business Name',
    regNumberLabel: 'CRA Business Number',
    defaultTaxRate: 13,
    dateFormat: 'YYYY-MM-DD',
    numberFormatting: 'International',
    paymentMethods: [
      { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline', popular: true },
      { id: 'interac', label: 'Interac e-Transfer', icon: 'swap-horizontal-outline', popular: true },
      { id: 'cash', label: 'Cash', icon: 'cash-outline' },
      { id: 'cheque', label: 'Cheque', icon: 'document-text-outline' },
    ],
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    symbol: '$',
    phonePrefix: '+61',
    phonePlaceholder: '+61 412 345 678',
    taxName: 'GST',
    taxNumberLabel: 'Australian Business Number (ABN)',
    taxQuestionLabel: 'Do you charge GST?',
    legalNameLabel: 'Legal Entity Name',
    regNumberLabel: 'ABN / ACN',
    defaultTaxRate: 10,
    dateFormat: 'DD/MM/YYYY',
    numberFormatting: 'International',
    paymentMethods: [
      { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline', popular: true },
      { id: 'bank_transfer', label: 'OSKO / PayID / EFT', icon: 'business-outline', popular: true },
      { id: 'cash', label: 'Cash', icon: 'cash-outline' },
    ],
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    currency: 'SGD',
    symbol: '$',
    phonePrefix: '+65',
    phonePlaceholder: '+65 9123 4567',
    taxName: 'GST',
    taxNumberLabel: 'GST Registration Number / UEN',
    taxQuestionLabel: 'Do you charge GST?',
    legalNameLabel: 'Registered Business Name',
    regNumberLabel: 'Unique Entity Number (UEN)',
    defaultTaxRate: 9,
    dateFormat: 'DD/MM/YYYY',
    numberFormatting: 'International',
    paymentMethods: [
      { id: 'paynow', label: 'PayNow / FAST', icon: 'qr-code-outline', popular: true },
      { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline', popular: true },
      { id: 'cash', label: 'Cash', icon: 'cash-outline' },
    ],
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    currency: 'SAR',
    symbol: 'SR',
    phonePrefix: '+966',
    phonePlaceholder: '+966 50 123 4567',
    taxName: 'VAT',
    taxNumberLabel: 'VAT Account Number (ZATCA)',
    taxQuestionLabel: 'Do you charge VAT?',
    legalNameLabel: 'Commercial Name',
    regNumberLabel: 'Commercial Registration (CR)',
    defaultTaxRate: 15,
    dateFormat: 'DD/MM/YYYY',
    numberFormatting: 'International',
    paymentMethods: [
      { id: 'mada', label: 'Mada / Card', icon: 'card-outline', popular: true },
      { id: 'cash', label: 'Cash', icon: 'cash-outline', popular: true },
      { id: 'bank_transfer', label: 'Bank Transfer (SARIE)', icon: 'business-outline' },
    ],
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR',
    symbol: '€',
    phonePrefix: '+49',
    phonePlaceholder: '+49 151 23456789',
    taxName: 'MwSt / VAT',
    taxNumberLabel: 'Steuernummer / USt-IdNr',
    taxQuestionLabel: 'Do you charge VAT (MwSt)?',
    legalNameLabel: 'Unternehmensname',
    regNumberLabel: 'Handelsregisternummer (HRB)',
    defaultTaxRate: 19,
    dateFormat: 'DD/MM/YYYY',
    numberFormatting: 'International',
    paymentMethods: [
      { id: 'bank_transfer', label: 'SEPA Überweisung', icon: 'business-outline', popular: true },
      { id: 'card', label: 'Girocard / EC-Karte / Card', icon: 'card-outline', popular: true },
      { id: 'cash', label: 'Cash', icon: 'cash-outline' },
    ],
  },
];

export const DEFAULT_COUNTRY = COUNTRIES[0];

export const getCountryByCode = (code?: string): CountryItem => {
  if (!code) return DEFAULT_COUNTRY;
  return COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase()) || DEFAULT_COUNTRY;
};

export const getCountryByName = (name?: string): CountryItem => {
  if (!name) return DEFAULT_COUNTRY;
  return COUNTRIES.find((c) => c.name.toLowerCase() === name.toLowerCase()) || DEFAULT_COUNTRY;
};

