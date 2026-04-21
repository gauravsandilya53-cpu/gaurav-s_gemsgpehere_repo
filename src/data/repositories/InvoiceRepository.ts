/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import { DatabaseService } from '../../core/storage/sqlite';
import { Invoice, InvoiceItem } from '../../domain/entities/billing';

export const InvoiceRepository = {
  save: async (invoice: Invoice): Promise<void> => {
    try {
      // Use a transaction for atomicity
      DatabaseService.execute('BEGIN TRANSACTION');

      DatabaseService.execute(
        `INSERT INTO invoices (id, number, customer_id, sub_total, total_tax, discount, total_amount, currency, status, synced) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoice.id,
          invoice.number,
          invoice.customerId,
          invoice.subTotal,
          invoice.totalTax,
          invoice.discount,
          invoice.totalAmount,
          invoice.currency,
          invoice.status,
          invoice.synced ? 1 : 0,
        ]
      );

      for (const item of invoice.items) {
        DatabaseService.execute(
          `INSERT INTO invoice_items (invoice_id, product_id, name, quantity, price, tax_rate, tax_amount, total) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            invoice.id,
            item.productId,
            item.name,
            item.quantity,
            item.price,
            item.taxRate,
            item.taxAmount,
            item.total,
          ]
        );
      }

      DatabaseService.execute('COMMIT');
    } catch (error) {
      DatabaseService.execute('ROLLBACK');
      throw error;
    }
  },

  getAll: (): Invoice[] => {
    const invoices = DatabaseService.getAll<any>('SELECT * FROM invoices ORDER BY created_at DESC');
    
    return invoices.map((inv) => {
      const items = DatabaseService.getAll<any>('SELECT * FROM invoice_items WHERE invoice_id = ?', [inv.id]);
      return {
        ...inv,
        synced: inv.synced === 1,
        items: items.map((item) => ({
          productId: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          taxRate: item.tax_rate,
          taxAmount: item.tax_amount,
          total: item.total,
        })),
      } as Invoice;
    });
  },

  getPendingSync: (): Invoice[] => {
    return InvoiceRepository.getAll().filter((inv) => !inv.synced);
  },

  markAsSynced: (id: string) => {
    DatabaseService.execute('UPDATE invoices SET synced = 1 WHERE id = ?', [id]);
  },
};




