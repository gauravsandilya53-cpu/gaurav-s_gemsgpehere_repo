/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import { InvoiceItem, TaxRule } from '../../domain/entities/billing';

export const TaxCalculator = {
  calculateItemTotal: (
    price: number,
    quantity: number,
    taxRate: number,
    discountPercent: number = 0
  ) => {
    const subTotal = price * quantity;
    const discountAmount = subTotal * (discountPercent / 100);
    const amountAfterDiscount = subTotal - discountAmount;
    const taxAmount = amountAfterDiscount * (taxRate / 100);
    const total = amountAfterDiscount + taxAmount;

    return {
      subTotal,
      discountAmount,
      taxAmount,
      total,
    };
  },

  calculateInvoiceTotals: (items: InvoiceItem[], discountPercent: number = 0) => {
    const subTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalTax = items.reduce((acc, item) => acc + item.taxAmount, 0);
    const discountAmount = subTotal * (discountPercent / 100);
    const totalAmount = (subTotal - discountAmount) + totalTax;

    return {
      subTotal,
      totalTax,
      discountAmount,
      totalAmount,
    };
  },

  formatCurrency: (amount: number, currency: string, locale: string = 'en-US') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },
};




