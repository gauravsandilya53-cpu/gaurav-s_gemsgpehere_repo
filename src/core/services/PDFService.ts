/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Order } from '../../domain/entities/billing';

/**
 * PDFService optimized for Expo Go.
 * Uses expo-print and expo-sharing for cross-platform document handling.
 */
export const PDFService = {
  generateInvoiceHTML: (order: Order, businessProfile: any) => {
    const itemsHtml = order.orderItems.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">Product #${item.productId}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.subtotal}</td>
      </tr>
    `).join('');

    return `
      <html>
        <body style="font-family: Helvetica, Arial, sans-serif; color: #333; padding: 40px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
            <div>
              <h1 style="color: #2563EB; margin: 0;">${businessProfile.name}</h1>
              <p>${businessProfile.address}<br>${businessProfile.phone}</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0;">INVOICE</h2>
              <p>#${order.id}<br>${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
            <thead>
              <tr style="background-color: #F3F4F6;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="display: flex; justify-content: flex-end;">
            <div style="width: 250px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Total Amount:</span>
                <span style="font-weight: bold; font-size: 1.2em;">₹${order.totalAmount}</span>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 60px; border-top: 1px solid #eee; padding-top: 20px; font-size: 0.8em; color: #666;">
            <p>© GemSphere Technologies Private Limited. This is a computer generated invoice.</p>
          </div>
        </body>
      </html>
    `;
  },

  generateAndShare: async (order: Order, businessProfile: any) => {
    try {
      const html = PDFService.generateInvoiceHTML(order, businessProfile);
      
      // Generate PDF file
      const { uri } = await Print.printToFileAsync({ html });
      
      // Share PDF file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Invoice #${order.id}`,
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (error) {
      console.error('Failed to generate or share PDF via Expo', error);
    }
  },
};
