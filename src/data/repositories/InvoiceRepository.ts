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
      await DatabaseService.execute('BEGIN TRANSACTION');

      await DatabaseService.execute(
        `INSERT OR REPLACE INTO invoices (id, number, customer_id, sub_total, total_tax, discount, total_amount, currency, status, synced, created_at, payment_method, paid_amount) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          invoice.createdAt || new Date().toISOString(),
          invoice.paymentMethod || null,
          invoice.paidAmount || 0,
        ]
      );

      // Clean up existing items for this invoice (in case of draft update)
      await DatabaseService.execute('DELETE FROM invoice_items WHERE invoice_id = ?', [invoice.id]);

      for (const item of invoice.items) {
        await DatabaseService.execute(
          `INSERT INTO invoice_items (invoice_id, product_id, name, quantity, price, tax_rate, tax_amount, total) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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

      await DatabaseService.execute('COMMIT');
    } catch (error) {
      try {
        await DatabaseService.execute('ROLLBACK');
      } catch (rollbackError) {
        console.error('Rollback failed', rollbackError);
      }
      throw error;
    }
  },

  // Alias for compatibility
  saveInvoice: async (invoice: Invoice): Promise<void> => {
    return InvoiceRepository.save(invoice);
  },

  getAll: async (): Promise<Invoice[]> => {
    const invoices = await DatabaseService.getAll<any>(
      `SELECT invoices.*, contacts.name AS customer_name 
       FROM invoices 
       LEFT JOIN contacts ON invoices.customer_id = contacts.id 
       ORDER BY invoices.created_at DESC`
    );
    
    const result = [];
    for (const inv of invoices) {
      const items = await DatabaseService.getAll<any>('SELECT * FROM invoice_items WHERE invoice_id = ?', [inv.id]);
      result.push({
        id: inv.id,
        number: inv.number,
        customerId: inv.customer_id,
        customerName: inv.customer_name || 'Walk-in Customer',
        subTotal: inv.sub_total,
        totalTax: inv.total_tax,
        discount: inv.discount,
        totalAmount: inv.total_amount,
        currency: inv.currency,
        status: inv.status,
        synced: inv.synced === 1,
        createdAt: inv.created_at,
        paymentMethod: inv.payment_method,
        paidAmount: inv.paid_amount,
        items: items.map((item) => ({
          productId: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          taxRate: item.tax_rate,
          taxAmount: item.tax_amount,
          // `item_total` is used on web (AlaSQL renames `total` to avoid reserved keyword conflict)
          total: item.item_total ?? item.total,
        })),
      } as Invoice);
    }
    return result;
  },

  // Alias for compatibility
  getAllInvoices: async (): Promise<Invoice[]> => {
    return InvoiceRepository.getAll();
  },

  getPendingSync: async (): Promise<Invoice[]> => {
    const all = await InvoiceRepository.getAll();
    return all.filter((inv) => !inv.synced);
  },

  markAsSynced: async (id: string) => {
    await DatabaseService.execute('UPDATE invoices SET synced = 1 WHERE id = ?', [id]);
  },

  checkInvoiceNumberExists: async (number: string, excludeId?: string): Promise<boolean> => {
    let query = 'SELECT COUNT(*) as count FROM invoices WHERE number = ?';
    const params = [number];
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    const row = await DatabaseService.getFirst<{ count: number }>(query, params);
    return (row?.count || 0) > 0;
  },

  delete: async (id: string): Promise<void> => {
    try {
      await DatabaseService.execute('BEGIN TRANSACTION');
      // Delete associated items
      await DatabaseService.execute('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);
      // Delete the invoice itself
      await DatabaseService.execute('DELETE FROM invoices WHERE id = ?', [id]);
      // Also delete any ledger entries related to this invoice
      await DatabaseService.execute('DELETE FROM ledger WHERE invoice_id = ?', [id]);
      await DatabaseService.execute('COMMIT');
    } catch (error) {
      try {
        await DatabaseService.execute('ROLLBACK');
      } catch (e) {}
      throw error;
    }
  },
};




