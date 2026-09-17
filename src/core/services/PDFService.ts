/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * PDFService — Premium HTML-to-PDF generator for invoices.
 *
 * Upgraded to match GEMSPHERE_RETAIL PosPage.tsx invoice standards:
 *  - Customer name, address, GST number rendered in Bill-To section
 *  - CGST + SGST breakdown rows
 *  - Taxable Amount, Round Off, Balance Due rows
 *  - Per-item SKU / discount shown
 *  - Thermal receipt format (compact 80mm)
 *  - A4 full invoice format
 */
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { Invoice } from '../../domain/entities/billing';
import { TaxCalculator, InvoiceTotals } from '../utils/tax-calculator';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BusinessProfile {
  name: string;
  address: string;
  phone: string;
  gstin?: string;
  logoUri?: string;
  themeColor?: string;
  email?: string;
}

export interface InvoiceRenderOptions {
  format?: 'A4' | 'THERMAL'; // default: 'A4'
  isTaxInclusive?: boolean;
  isRoundOffEnabled?: boolean;
}

// ─── PDFService ───────────────────────────────────────────────────────────────

export const PDFService = {
  /**
   * Compute totals for an invoice object (rich breakdown).
   * Internally delegates to TaxCalculator for consistency with the live calculator.
   */
  _computeTotals: (invoice: Invoice, opts: InvoiceRenderOptions): InvoiceTotals => {
    return TaxCalculator.calculateInvoiceTotals(
      invoice.items,
      invoice.discount ?? 0,
      opts.isTaxInclusive ?? false,
      opts.isRoundOffEnabled ?? false
    );
  },

  // ─── A4 Invoice HTML ──────────────────────────────────────────────────────

  generateInvoiceHTML: (
    invoice: Invoice,
    profile: BusinessProfile,
    opts: InvoiceRenderOptions = {}
  ): string => {
    const themeColor = profile.themeColor || '#4F63FF';
    const fmt = (n: number) => TaxCalculator.formatCurrency(n, invoice.currency || 'INR');

    const totals = PDFService._computeTotals(invoice, opts);
    const balanceDue = Math.max(0, totals.totalAmount - (invoice.paidAmount ?? 0));
    const change = Math.max(0, (invoice.paidAmount ?? 0) - totals.totalAmount);

    // Per-item rows
    const itemsHtml = invoice.items.map((item, index) => {
      const gross = item.price * item.quantity;
      const discountAmt = (item as any).discountValue
        ? ((item as any).discountType === 'PERCENT'
          ? gross * ((item as any).discountValue / 100)
          : (item as any).discountValue)
        : 0;
      const net = gross - discountAmt;

      return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0;">${index + 1}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0;">
            <div style="font-weight: 700; color: #0F172A;">${item.name}</div>
            ${(item as any).sku ? `<div style="font-size:11px;color:#64748B;">SKU: ${(item as any).sku}</div>` : ''}
            ${(item as any).variantName ? `<div style="font-size:11px;color:#818CF8;">${(item as any).variantName}</div>` : ''}
          </td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; text-align: right;">${item.quantity}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; text-align: right;">${fmt(item.price)}</td>
          ${discountAmt > 0
            ? `<td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; text-align: right; color:#10B981;">-${fmt(discountAmt)}</td>`
            : `<td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; text-align: right; color:#64748B;">—</td>`}
          <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; text-align: right;">${item.taxRate}%</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #E2E8F0; text-align: right; font-weight: 700;">${fmt(net + item.taxAmount)}</td>
        </tr>
      `;
    }).join('');

    const statusColor = invoice.status === 'PAID' ? '#10B981' : invoice.status === 'DRAFT' ? '#64748B' : '#F59E0B';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            * { box-sizing: border-box; }
            body { font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif; color: #334155; line-height: 1.6; padding: 40px; margin: 0; background: #fff; font-size: 14px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; border-bottom: 4px solid ${themeColor}; padding-bottom: 20px; }
            .brand { font-size: 28px; font-weight: 800; color: ${themeColor}; margin: 0 0 4px 0; }
            .brand-sub { font-size: 12px; color: #64748B; margin: 0; line-height: 1.5; }
            .doc-title { font-size: 36px; font-weight: 900; color: #0F172A; text-transform: uppercase; margin: 0 0 8px 0; text-align: right; letter-spacing: 3px; }
            .doc-meta { text-align: right; color: #64748B; font-size: 13px; line-height: 1.8; }
            .info-grid { display: flex; justify-content: space-between; margin-bottom: 36px; gap: 20px; }
            .info-box { background: #F8FAFC; padding: 18px 20px; border-radius: 10px; flex: 1; border: 1px solid #E2E8F0; }
            .info-label { font-size: 10px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 6px; }
            .info-val { font-size: 15px; color: #0F172A; font-weight: 700; margin: 0 0 4px 0; }
            .info-sub { font-size: 12px; color: #64748B; margin: 2px 0; }
            .status-badge { display: inline-block; padding: 5px 14px; background: ${statusColor}; color: white; border-radius: 20px; font-size: 12px; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
            thead tr { background: ${themeColor}; color: white; }
            th { padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
            th:nth-child(n+3) { text-align: right; }
            tbody tr:nth-child(even) { background: #F8FAFC; }
            .totals-wrap { display: flex; justify-content: flex-end; }
            .totals { width: 340px; background: #F8FAFC; padding: 20px; border-radius: 12px; border: 1px solid #E2E8F0; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; color: #475569; }
            .total-row.section-header { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94A3B8; font-weight: 700; padding-top: 12px; }
            .total-row.grand { font-size: 18px; font-weight: 900; color: ${themeColor}; border-top: 2px solid #E2E8F0; margin-top: 10px; padding-top: 12px; }
            .total-row.balance { font-size: 14px; font-weight: 700; background: ${balanceDue > 0 ? '#FEF2F2' : '#F0FDF4'}; color: ${balanceDue > 0 ? '#DC2626' : '#16A34A'}; padding: 8px 10px; border-radius: 6px; margin-top: 8px; }
            .footer { margin-top: 48px; text-align: center; color: #64748B; font-size: 11px; border-top: 1px solid #E2E8F0; padding-top: 20px; }
            .gstin-tag { display: inline-block; background: rgba(79,99,255,0.08); color: ${themeColor}; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(79,99,255,0.2); margin-top: 4px; }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="header">
            <div>
              <h1 class="brand">${profile.name}</h1>
              <p class="brand-sub">${profile.address}</p>
              <p class="brand-sub">Phone: ${profile.phone}${profile.email ? ` | ${profile.email}` : ''}</p>
              ${profile.gstin ? `<span class="gstin-tag">GSTIN: ${profile.gstin}</span>` : ''}
            </div>
            <div>
              <h1 class="doc-title">${invoice.status === 'DRAFT' ? 'DRAFT' : 'INVOICE'}</h1>
              <div class="doc-meta">
                <strong># ${invoice.number}</strong><br/>
                Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}<br/>
                ${invoice.dueDate ? `Due: ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}<br/>` : ''}
                <div style="margin-top:6px;"><span class="status-badge">${invoice.status}</span></div>
              </div>
            </div>
          </div>

          <!-- Bill To / Payment Info -->
          <div class="info-grid">
            <div class="info-box">
              <div class="info-label">Bill To</div>
              <p class="info-val">${(invoice as any).customerName || invoice.customerId}</p>
              ${(invoice as any).billingAddress ? `<p class="info-sub">${(invoice as any).billingAddress}</p>` : ''}
              ${(invoice as any).customerGST ? `<p class="info-sub"><span class="gstin-tag">GST: ${(invoice as any).customerGST}</span></p>` : ''}
            </div>
            <div class="info-box">
              <div class="info-label">Payment Details</div>
              <p class="info-val">${invoice.paymentMethod || 'N/A'}</p>
              ${invoice.paidAmount != null && invoice.paidAmount > 0 ? `<p class="info-sub">Paid: ${fmt(invoice.paidAmount)}</p>` : ''}
              ${balanceDue > 0 ? `<p class="info-sub" style="color:#DC2626;font-weight:700;">Balance Due: ${fmt(balanceDue)}</p>` : ''}
              ${change > 0 ? `<p class="info-sub" style="color:#16A34A;font-weight:700;">Change: ${fmt(change)}</p>` : ''}
            </div>
          </div>

          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Discount</th>
                <th>Tax</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <!-- Totals -->
          <div class="totals-wrap">
            <div class="totals">
              <div class="total-row">
                <span>Subtotal</span>
                <span>${fmt(totals.subTotal)}</span>
              </div>
              ${totals.discountAmount > 0 ? `
              <div class="total-row">
                <span>Discount</span>
                <span style="color:#10B981;">-${fmt(totals.discountAmount)}</span>
              </div>` : ''}
              <div class="total-row">
                <span>Taxable Amount</span>
                <span>${fmt(totals.taxableAmount)}</span>
              </div>
              <div class="total-row section-header">
                <span>Tax Breakdown</span>
                <span></span>
              </div>
              <div class="total-row">
                <span style="padding-left:10px;">CGST</span>
                <span>${fmt(totals.cgst)}</span>
              </div>
              <div class="total-row">
                <span style="padding-left:10px;">SGST</span>
                <span>${fmt(totals.sgst)}</span>
              </div>
              ${totals.roundOff !== 0 ? `
              <div class="total-row">
                <span>Round Off</span>
                <span style="color:${totals.roundOff >= 0 ? '#10B981' : '#F59E0B'};">${totals.roundOff >= 0 ? '+' : ''}${fmt(totals.roundOff)}</span>
              </div>` : ''}
              <div class="total-row grand">
                <span>Grand Total</span>
                <span>${fmt(totals.totalAmount)}</span>
              </div>
              <div class="total-row balance">
                <span>${balanceDue > 0 ? 'Balance Due' : 'PAID IN FULL'}</span>
                <span>${balanceDue > 0 ? fmt(balanceDue) : '✓'}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="font-weight: 700; margin-bottom: 4px;">Thank you for your business!</p>
            <p style="margin: 0;">This is a computer-generated document. No signature required.</p>
            <p style="margin: 4px 0 0 0; color: #94A3B8;">Generated by ${profile.name} · ${new Date().toLocaleString('en-IN')}</p>
          </div>
        </body>
      </html>
    `;
  },

  // ─── Thermal Receipt HTML (80mm compact) ──────────────────────────────────

  generateThermalHTML: (
    invoice: Invoice,
    profile: BusinessProfile,
    opts: InvoiceRenderOptions = {}
  ): string => {
    const fmt = (n: number) => TaxCalculator.formatCurrency(n, invoice.currency || 'INR');
    const totals = PDFService._computeTotals(invoice, opts);
    const balanceDue = Math.max(0, totals.totalAmount - (invoice.paidAmount ?? 0));
    const change = Math.max(0, (invoice.paidAmount ?? 0) - totals.totalAmount);

    const itemsHtml = invoice.items.map((item) => {
      const lineTotal = item.price * item.quantity + item.taxAmount;
      return `
        <div class="item-row">
          <div class="item-name">${item.name}</div>
          <div class="item-detail">${item.quantity} x ${fmt(item.price)}</div>
          <div class="item-total">${fmt(lineTotal)}</div>
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            * { box-sizing: border-box; }
            body { font-family: 'Courier New', Courier, monospace; color: #000; margin: 0; padding: 12px; width: 100%; font-size: 12px; background: #fff; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .store-name { font-size: 18px; font-weight: 900; text-align: center; margin-bottom: 2px; }
            .divider { border: none; border-top: 1px dashed #000; margin: 8px 0; }
            .divider-solid { border: none; border-top: 1px solid #000; margin: 8px 0; }
            .info-line { display: flex; justify-content: space-between; margin: 2px 0; font-size: 11px; }
            .item-row { margin: 4px 0; }
            .item-name { font-weight: bold; font-size: 12px; }
            .item-detail { color: #444; font-size: 11px; padding-left: 8px; }
            .item-total { text-align: right; font-weight: bold; font-size: 12px; }
            .total-row { display: flex; justify-content: space-between; margin: 3px 0; font-size: 12px; }
            .total-row.grand { font-size: 16px; font-weight: 900; border-top: 2px solid #000; padding-top: 6px; margin-top: 6px; }
            .footer { text-align: center; font-size: 10px; margin-top: 12px; color: #444; }
          </style>
        </head>
        <body>
          <div class="store-name">${profile.name}</div>
          <div class="center" style="font-size:10px;">${profile.address}</div>
          <div class="center" style="font-size:10px;">Ph: ${profile.phone}</div>
          ${profile.gstin ? `<div class="center" style="font-size:10px;">GSTIN: ${profile.gstin}</div>` : ''}

          <hr class="divider-solid" />

          <div class="info-line"><span>Invoice#</span><span class="bold">${invoice.number}</span></div>
          <div class="info-line"><span>Date</span><span>${new Date(invoice.createdAt).toLocaleDateString('en-IN')}</span></div>
          <div class="info-line"><span>Customer</span><span class="bold">${(invoice as any).customerName || invoice.customerId}</span></div>
          <div class="info-line"><span>Payment</span><span>${invoice.paymentMethod || 'N/A'}</span></div>

          <hr class="divider" />
          <div class="bold" style="font-size:10px;text-transform:uppercase;margin-bottom:4px;">Items</div>

          ${itemsHtml}

          <hr class="divider" />

          <div class="total-row"><span>Subtotal</span><span>${fmt(totals.subTotal)}</span></div>
          ${totals.discountAmount > 0 ? `<div class="total-row"><span>Discount</span><span>-${fmt(totals.discountAmount)}</span></div>` : ''}
          <div class="total-row"><span>Taxable Amt</span><span>${fmt(totals.taxableAmount)}</span></div>
          <div class="total-row"><span>CGST</span><span>${fmt(totals.cgst)}</span></div>
          <div class="total-row"><span>SGST</span><span>${fmt(totals.sgst)}</span></div>
          ${totals.roundOff !== 0 ? `<div class="total-row"><span>Round Off</span><span>${totals.roundOff >= 0 ? '+' : ''}${fmt(totals.roundOff)}</span></div>` : ''}

          <div class="total-row grand">
            <span>TOTAL</span>
            <span>${fmt(totals.totalAmount)}</span>
          </div>

          ${invoice.paidAmount != null && invoice.paidAmount > 0 ? `
          <div class="total-row"><span>Paid</span><span>${fmt(invoice.paidAmount)}</span></div>
          ` : ''}
          ${balanceDue > 0
            ? `<div class="total-row bold" style="color:#000;"><span>Balance Due</span><span>${fmt(balanceDue)}</span></div>`
            : change > 0
              ? `<div class="total-row"><span>Change</span><span>${fmt(change)}</span></div>`
              : `<div class="total-row bold"><span>PAID IN FULL</span><span>✓</span></div>`}

          <hr class="divider" />

          <div class="footer">
            <p style="margin:2px 0;font-weight:bold;">Thank you for your business!</p>
            <p style="margin:2px 0;">Powered by ${profile.name}</p>
            <p style="margin:2px 0;">${new Date().toLocaleTimeString('en-IN')}</p>
          </div>
        </body>
      </html>
    `;
  },

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * Generate PDF and open the native share sheet.
   * @param format 'A4' (default) or 'THERMAL'
   */
  generateAndShare: async (
    invoice: Invoice,
    profile: BusinessProfile,
    opts: InvoiceRenderOptions = {}
  ) => {
    try {
      const html = opts.format === 'THERMAL'
        ? PDFService.generateThermalHTML(invoice, profile, opts)
        : PDFService.generateInvoiceHTML(invoice, profile, opts);

      const { uri } = await Print.printToFileAsync({ html });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      throw error;
    }
  },
};
