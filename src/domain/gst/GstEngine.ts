/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * Intellectual Property of GemSphere Technologies.
 */

import { GstinValidator } from './GstinValidator';

export type TaxType = 'INTRA_STATE' | 'INTER_STATE' | 'EXEMPT';

export interface GstLineItemInput {
  productId: string;
  name: string;
  hsnCode?: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  gstRate: number; // Combined rate (e.g. 18 for 18%)
}

export interface GstLineItemResult {
  productId: string;
  name: string;
  hsnCode?: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalAmount: number;
}

export interface GstInvoiceCalculationInput {
  sellerGstin?: string;
  sellerStateCode: string;
  buyerGstin?: string;
  buyerStateCode: string;
  placeOfSupplyStateCode?: string;
  items: GstLineItemInput[];
  overallDiscount?: number;
  roundOff?: boolean;
}

export interface GstInvoiceCalculationResult {
  taxType: TaxType;
  subTotal: number;
  discountTotal: number;
  taxableSubTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  totalTax: number;
  grossTotal: number;
  roundOffAdjustment: number;
  finalTotal: number;
  items: GstLineItemResult[];
}

export class GstEngine {
  /**
   * Helper to round monetary amounts to 2 decimal places.
   */
  public static round2(val: number): number {
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }

  /**
   * Determine whether transaction is Intra-state (CGST+SGST) or Inter-state (IGST).
   */
  public static determineTaxType(
    sellerStateCode: string,
    buyerStateCode: string,
    placeOfSupplyStateCode?: string
  ): TaxType {
    const effectiveSupplyState = placeOfSupplyStateCode || buyerStateCode;

    if (!sellerStateCode || !effectiveSupplyState) {
      return 'INTRA_STATE'; // Default fallback
    }

    return sellerStateCode.trim() === effectiveSupplyState.trim() ? 'INTRA_STATE' : 'INTER_STATE';
  }

  /**
   * Calculate complete GST breakdown for an invoice.
   */
  public static calculateInvoice(input: GstInvoiceCalculationInput): GstInvoiceCalculationResult {
    const sellerState = input.sellerGstin
      ? GstinValidator.getStateCode(input.sellerGstin) || input.sellerStateCode
      : input.sellerStateCode;

    const buyerState = input.buyerGstin
      ? GstinValidator.getStateCode(input.buyerGstin) || input.buyerStateCode
      : input.buyerStateCode;

    const taxType = this.determineTaxType(sellerState, buyerState, input.placeOfSupplyStateCode);

    let subTotal = 0;
    let discountTotal = input.overallDiscount || 0;
    let taxableSubTotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    const calculatedItems: GstLineItemResult[] = input.items.map((item) => {
      const lineSubtotal = this.round2(item.quantity * item.unitPrice);
      const lineDiscount = this.round2(item.discountAmount || 0);
      const lineTaxable = Math.max(0, this.round2(lineSubtotal - lineDiscount));

      let cgstRate = 0;
      let sgstRate = 0;
      let igstRate = 0;
      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;

      if (item.gstRate > 0) {
        if (taxType === 'INTRA_STATE') {
          cgstRate = item.gstRate / 2;
          sgstRate = item.gstRate / 2;
          cgstAmount = this.round2((lineTaxable * cgstRate) / 100);
          sgstAmount = this.round2((lineTaxable * sgstRate) / 100);
        } else {
          igstRate = item.gstRate;
          igstAmount = this.round2((lineTaxable * igstRate) / 100);
        }
      }

      const itemTotalTax = cgstAmount + sgstAmount + igstAmount;
      const lineTotal = this.round2(lineTaxable + itemTotalTax);

      subTotal += lineSubtotal;
      discountTotal += lineDiscount;
      taxableSubTotal += lineTaxable;
      cgstTotal += cgstAmount;
      sgstTotal += sgstAmount;
      igstTotal += igstAmount;

      return {
        productId: item.productId,
        name: item.name,
        hsnCode: item.hsnCode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: lineDiscount,
        taxableAmount: lineTaxable,
        gstRate: item.gstRate,
        cgstRate,
        cgstAmount,
        sgstRate,
        sgstAmount,
        igstRate,
        igstAmount,
        totalAmount: lineTotal
      };
    });

    subTotal = this.round2(subTotal);
    discountTotal = this.round2(discountTotal);
    taxableSubTotal = this.round2(taxableSubTotal);
    cgstTotal = this.round2(cgstTotal);
    sgstTotal = this.round2(sgstTotal);
    igstTotal = this.round2(igstTotal);

    const totalTax = this.round2(cgstTotal + sgstTotal + igstTotal);
    const grossTotal = this.round2(taxableSubTotal + totalTax);

    let roundOffAdjustment = 0;
    let finalTotal = grossTotal;

    if (input.roundOff !== false) {
      finalTotal = Math.round(grossTotal);
      roundOffAdjustment = this.round2(finalTotal - grossTotal);
    }

    return {
      taxType,
      subTotal,
      discountTotal,
      taxableSubTotal,
      cgstTotal,
      sgstTotal,
      igstTotal,
      totalTax,
      grossTotal,
      roundOffAdjustment,
      finalTotal,
      items: calculatedItems
    };
  }
}
