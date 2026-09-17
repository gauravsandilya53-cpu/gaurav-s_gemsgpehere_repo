/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 *
 * TaxCalculator — Unified tax engine matching GEMSPHERE_RETAIL PosPage standards.
 * Supports:
 *  - Tax-inclusive and tax-exclusive modes
 *  - CGST + SGST split (Indian GST)
 *  - Taxable amount (pre-tax base)
 *  - Round-off calculation
 *  - Per-item discount (PERCENT or FLAT)
 */
import { InvoiceItem } from '../../domain/entities/billing';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InvoiceTotals {
  subTotal: number;
  totalTax: number;
  cgst: number;
  sgst: number;
  discountAmount: number;
  taxableAmount: number; // pre-tax base (after discount, before tax)
  totalAmount: number;
  roundOff: number;
}

// ─── TaxCalculator ────────────────────────────────────────────────────────────

export const TaxCalculator = {
  /**
   * Calculate totals for a single line item.
   * Backward-compatible — discountPercent defaults to 0.
   */
  calculateItemTotal: (
    price: number,
    quantity: number,
    taxRate: number,
    discountPercent: number = 0,
    isTaxInclusive: boolean = false
  ) => {
    const gross = price * quantity;
    const discountAmount = gross * (discountPercent / 100);
    const netAfterDiscount = gross - discountAmount;
    const rate = taxRate / 100;

    let taxAmount: number;
    let total: number;

    if (isTaxInclusive) {
      // Tax is already baked into the price
      const base = netAfterDiscount / (1 + rate);
      taxAmount = netAfterDiscount - base;
      total = netAfterDiscount;
    } else {
      taxAmount = netAfterDiscount * rate;
      total = netAfterDiscount + taxAmount;
    }

    return {
      subTotal: gross,
      discountAmount,
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  },

  /**
   * Calculate full invoice totals, matching the PosPage.tsx calculateTotals() logic.
   *
   * @param items          - Invoice line items (must have price, quantity, taxRate, taxAmount)
   * @param discountAmount - Invoice-level flat discount (default 0)
   * @param isTaxInclusive - Whether prices include tax (default false = additive GST)
   * @param isRoundOffEnabled - Whether to round total to nearest integer (default false)
   */
  calculateInvoiceTotals: (
    items: InvoiceItem[],
    discountAmount: number = 0,
    isTaxInclusive: boolean = false,
    isRoundOffEnabled: boolean = false
  ): InvoiceTotals => {
    // 1. Raw subtotal (sum of price × qty for all items, before discount/tax)
    const subTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // 2. Apply invoice-level discount
    const clampedDiscount = Math.min(discountAmount, subTotal);
    const netAfterDiscount = Math.max(0, subTotal - clampedDiscount);

    // 3. Discount factor for proportional allocation to items
    const discountFactor = subTotal > 0 ? netAfterDiscount / subTotal : 1;

    // 4. Calculate tax based on inclusive/exclusive mode
    let totalTax: number;
    let taxableAmount: number; // pre-tax base

    if (isTaxInclusive) {
      // Tax is already embedded — extract it from the net amount
      totalTax = items.reduce((sum, item) => {
        const itemNet = item.price * item.quantity * discountFactor;
        const rate = (item.taxRate / 100);
        const base = itemNet / (1 + rate);
        return sum + (itemNet - base);
      }, 0);
      taxableAmount = netAfterDiscount - totalTax;
    } else {
      // Tax is additive on top of netAfterDiscount
      totalTax = items.reduce((sum, item) => {
        const itemNet = item.price * item.quantity * discountFactor;
        return sum + itemNet * (item.taxRate / 100);
      }, 0);
      taxableAmount = netAfterDiscount;
    }

    // 5. Raw total
    const rawTotal = isTaxInclusive
      ? netAfterDiscount
      : netAfterDiscount + totalTax;

    // 6. Round off
    const roundedTotal = isRoundOffEnabled
      ? Math.round(rawTotal)
      : parseFloat(rawTotal.toFixed(2));
    const roundOff = parseFloat((roundedTotal - rawTotal).toFixed(2));

    // 7. CGST / SGST split (equal halves of total tax — standard Indian GST)
    const cgst = parseFloat((totalTax / 2).toFixed(2));
    const sgst = parseFloat((totalTax / 2).toFixed(2));

    return {
      subTotal: parseFloat(subTotal.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      cgst,
      sgst,
      discountAmount: parseFloat(clampedDiscount.toFixed(2)),
      taxableAmount: parseFloat(taxableAmount.toFixed(2)),
      totalAmount: roundedTotal,
      roundOff,
    };
  },

  /**
   * Format a currency value using Intl.NumberFormat.
   * Falls back gracefully for unknown currency codes.
   */
  formatCurrency: (amount: number, currency: string, locale: string = 'en-IN') => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency || 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount ?? 0);
    } catch {
      return `${currency} ${(amount ?? 0).toFixed(2)}`;
    }
  },
};
