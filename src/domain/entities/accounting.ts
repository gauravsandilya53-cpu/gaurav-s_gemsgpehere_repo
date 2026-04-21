/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface LedgerEntry {
  id: string;
  type: TransactionType;
  category: string; // e.g., Sales, Inventory, Rent, Utilities
  amount: number;
  currency: string;
  description: string;
  invoiceId?: string; // Optional link to an invoice
  contactId?: string; // Optional link to a customer or supplier
  createdAt: string;
}

export interface ProfitLossSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  currency: string;
}




