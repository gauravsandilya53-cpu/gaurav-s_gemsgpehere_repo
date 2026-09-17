import { GstEngine } from '../GstEngine';
import { GstinValidator } from '../GstinValidator';
import { HsnManager } from '../HsnManager';

describe('GST Subsystem Tests', () => {
  describe('GstinValidator', () => {
    it('should validate a correct Delhi GSTIN', () => {
      // 07AAAAA0000A1Z5 - 07 is Delhi
      const validGstin = '07AAAAA0000A1Z5';
      const result = GstinValidator.validate(validGstin);
      expect(result.isValid).toBe(true);
      expect(result.stateCode).toBe('07');
      expect(result.stateName).toBe('Delhi');
    });

    it('should reject invalid length GSTIN', () => {
      const result = GstinValidator.validate('07AAAAA0000A1Z');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('15 characters');
    });

    it('should reject invalid state code', () => {
      const result = GstinValidator.validate('99AAAAA0000A1Z5');
      // 99 is Center Jurisdiction in map, let's test 00
      const invalidResult = GstinValidator.validate('00AAAAA0000A1Z5');
      expect(invalidResult.isValid).toBe(false);
    });

    it('should extract correct state code', () => {
      expect(GstinValidator.getStateCode('27AAAAA0000A1Z5')).toBe('27'); // Maharashtra
      expect(GstinValidator.getStateCode('29AAAAA0000A1Z5')).toBe('29'); // Karnataka
      expect(GstinValidator.getStateCode('INVALID')).toBeNull();
    });
  });

  describe('HsnManager', () => {
    it('should return default recommendations for empty query', () => {
      const items = HsnManager.search('');
      expect(items.length).toBeGreaterThan(0);
    });

    it('should find HSN by code or description', () => {
      const software = HsnManager.search('9983');
      expect(software.length).toBe(1);
      expect(software[0].description).toContain('Software');

      const phones = HsnManager.search('smartphone');
      expect(phones.length).toBeGreaterThan(0);
      expect(phones[0].code).toBe('8517');
    });
  });

  describe('GstEngine - Invoice Calculations', () => {
    it('should calculate Intra-state CGST + SGST for same state seller and buyer', () => {
      const result = GstEngine.calculateInvoice({
        sellerStateCode: '07', // Delhi
        buyerStateCode: '07', // Delhi
        items: [
          {
            productId: 'p1',
            name: 'Laptop Bag',
            hsnCode: '8471',
            quantity: 2,
            unitPrice: 1000,
            gstRate: 18
          }
        ]
      });

      expect(result.taxType).toBe('INTRA_STATE');
      expect(result.subTotal).toBe(2000);
      expect(result.taxableSubTotal).toBe(2000);
      expect(result.cgstTotal).toBe(180); // 9% of 2000
      expect(result.sgstTotal).toBe(180); // 9% of 2000
      expect(result.igstTotal).toBe(0);
      expect(result.totalTax).toBe(360);
      expect(result.finalTotal).toBe(2360);
    });

    it('should calculate Inter-state IGST for different seller and buyer state', () => {
      const result = GstEngine.calculateInvoice({
        sellerStateCode: '07', // Delhi
        buyerStateCode: '27', // Maharashtra
        items: [
          {
            productId: 'p1',
            name: 'Office Chair',
            quantity: 1,
            unitPrice: 5000,
            gstRate: 18
          }
        ]
      });

      expect(result.taxType).toBe('INTER_STATE');
      expect(result.subTotal).toBe(5000);
      expect(result.cgstTotal).toBe(0);
      expect(result.sgstTotal).toBe(0);
      expect(result.igstTotal).toBe(900); // 18% of 5000
      expect(result.totalTax).toBe(900);
      expect(result.finalTotal).toBe(5900);
    });

    it('should correctly handle line item discounts and overall invoice rounding', () => {
      const result = GstEngine.calculateInvoice({
        sellerStateCode: '29', // Karnataka
        buyerStateCode: '29', // Karnataka
        roundOff: true,
        items: [
          {
            productId: 'p1',
            name: 'T-Shirt',
            quantity: 3,
            unitPrice: 333.33,
            discountAmount: 50,
            gstRate: 5
          }
        ]
      });

      expect(result.taxType).toBe('INTRA_STATE');
      expect(result.subTotal).toBe(1000);
      expect(result.discountTotal).toBe(50);
      expect(result.taxableSubTotal).toBe(950);
      expect(result.totalTax).toBe(47.5); // 5% of 950 = 47.5 (23.75 CGST + 23.75 SGST)
      expect(result.grossTotal).toBe(997.5);
      expect(result.finalTotal).toBe(998); // Rounded half-up
      expect(result.roundOffAdjustment).toBe(0.5);
    });
  });
});
