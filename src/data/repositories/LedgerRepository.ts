/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import { DatabaseService } from '../../core/storage/sqlite';
import { LedgerEntry, ProfitLossSummary } from '../../domain/entities/accounting';

export const LedgerRepository = {
  addEntry: async (entry: LedgerEntry): Promise<void> => {
    DatabaseService.execute(
      `INSERT INTO ledger (id, type, category, amount, currency, description, invoice_id, contact_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.type,
        entry.category,
        entry.amount,
        entry.currency,
        entry.description,
        entry.invoiceId || null,
        entry.contactId || null,
      ]
    );
  },

  getAll: (): LedgerEntry[] => {
    const rows = DatabaseService.getAll<any>('SELECT * FROM ledger ORDER BY created_at DESC');
    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      category: row.category,
      amount: row.amount,
      currency: row.currency,
      description: row.description,
      invoiceId: row.invoice_id,
      contactId: row.contact_id,
      createdAt: row.created_at,
    }));
  },

  getProfitLoss: (currency: string): ProfitLossSummary => {
    const rows = DatabaseService.getAll<any>(
      'SELECT type, SUM(amount) as total FROM ledger WHERE currency = ? GROUP BY type',
      [currency]
    );

    let totalIncome = 0;
    let totalExpenses = 0;

    rows.forEach((row) => {
      if (row.type === 'INCOME') totalIncome = row.total;
      if (row.type === 'EXPENSE') totalExpenses = row.total;
    });

    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      currency,
    };
  },
};




