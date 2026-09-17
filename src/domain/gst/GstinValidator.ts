/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * Intellectual Property of GemSphere Technologies.
 */

export interface GstinValidationResult {
  isValid: boolean;
  stateCode?: string;
  stateName?: string;
  pan?: string;
  entityType?: string;
  error?: string;
}

export const INDIAN_STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli and Daman & Diu',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh (Old)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh (New)',
  '38': 'Ladakh',
  '97': 'Other Territory',
  '99': 'Center Jurisdiction'
};

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export class GstinValidator {
  /**
   * Validate GSTIN format and checksum.
   */
  public static validate(gstin: string): GstinValidationResult {
    if (!gstin) {
      return { isValid: false, error: 'GSTIN cannot be empty' };
    }

    const cleanGstin = gstin.trim().toUpperCase();

    if (cleanGstin.length !== 15) {
      return { isValid: false, error: 'GSTIN must be exactly 15 characters long' };
    }

    if (!GSTIN_REGEX.test(cleanGstin)) {
      return { isValid: false, error: 'Invalid GSTIN format structure' };
    }

    const stateCode = cleanGstin.substring(0, 2);
    const stateName = INDIAN_STATE_CODES[stateCode];

    if (!stateName) {
      return { isValid: false, error: `Invalid state code: ${stateCode}` };
    }

    const pan = cleanGstin.substring(2, 12);
    const entityTypeChar = cleanGstin.charAt(5);
    const entityTypeMap: Record<string, string> = {
      C: 'Company',
      P: 'Person / Proprietorship',
      H: 'HUF',
      F: 'Firm / Partnership',
      A: 'AOP',
      T: 'Trust',
      B: 'BOI',
      L: 'Local Authority',
      J: 'Artificial Juridical Person',
      G: 'Government'
    };

    const isChecksumValid = this.verifyChecksum(cleanGstin);
    if (!isChecksumValid) {
      return { isValid: false, error: 'GSTIN checksum verification failed' };
    }

    return {
      isValid: true,
      stateCode,
      stateName,
      pan,
      entityType: entityTypeMap[entityTypeChar] || 'Other'
    };
  }

  /**
   * Luhn Mod 36 Checksum Verification for Indian GSTIN.
   */
  private static verifyChecksum(gstin: string): boolean {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let factor = 1;
    let sum = 0;
    const mod = chars.length;

    for (let i = 0; i < gstin.length; i++) {
      const codePoint = chars.indexOf(gstin[i]);
      if (codePoint === -1) return false;

      let digit = codePoint * factor;
      factor = factor === 2 ? 1 : 2;
      digit = Math.floor(digit / mod) + (digit % mod);
      sum += digit;
    }

    return sum % mod === 0;
  }

  /**
   * Extracts State Code from GSTIN.
   */
  public static getStateCode(gstin?: string): string | null {
    if (!gstin || gstin.length < 2) return null;
    const code = gstin.trim().substring(0, 2);
    return INDIAN_STATE_CODES[code] ? code : null;
  }
}
