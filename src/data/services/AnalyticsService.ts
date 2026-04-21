/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import { DatabaseService } from '../../core/storage/sqlite';

export interface KPICardData {
  label: string;
  value: number;
  currency: string;
  changePercent: number; // vs last month
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export const AnalyticsService = {
  getMonthlyKPIs: async (currency: string = 'USD'): Promise<KPICardData[]> => {
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const lastMonthEnd = new Date(thisMonthStart);
    lastMonthEnd.setMilliseconds(-1);

    // Helper to get total for a period
    const getTotal = (type: 'INCOME' | 'EXPENSE', start: Date, end: Date) => {
      const row = DatabaseService.getAll<any>(
        `SELECT SUM(amount) as total FROM ledger 
         WHERE type = ? AND currency = ? AND created_at BETWEEN ? AND ?`,
        [type, currency, start.toISOString(), end.toISOString()]
      );
      return row[0]?.total || 0;
    };

    const thisMonthIncome = getTotal('INCOME', thisMonthStart, new Date());
    const lastMonthIncome = getTotal('INCOME', lastMonthStart, lastMonthEnd);

    const thisMonthExpense = getTotal('EXPENSE', thisMonthStart, new Date());
    const lastMonthExpense = getTotal('EXPENSE', lastMonthStart, lastMonthEnd);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const incomeChange = calculateChange(thisMonthIncome, lastMonthIncome);
    const expenseChange = calculateChange(thisMonthExpense, lastMonthExpense);

    return [
      {
        label: 'Total Revenue',
        value: thisMonthIncome,
        currency,
        changePercent: incomeChange,
        trend: incomeChange >= 0 ? 'UP' : 'DOWN',
      },
      {
        label: 'Total Expenses',
        value: thisMonthExpense,
        currency,
        changePercent: expenseChange,
        trend: expenseChange >= 0 ? 'UP' : 'DOWN',
      },
      {
        label: 'Net Profit',
        value: thisMonthIncome - thisMonthExpense,
        currency,
        changePercent: incomeChange - expenseChange, // simplified
        trend: (thisMonthIncome - thisMonthExpense) >= (lastMonthIncome - lastMonthExpense) ? 'UP' : 'DOWN',
      },
    ];
  },

  getRevenueTrends: async (currency: string = 'USD') => {
    // Returns last 6 months revenue for chart
    const query = `
      SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as total
      FROM ledger
      WHERE type = 'INCOME' AND currency = ?
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `;
    return DatabaseService.getAll<any>(query, [currency]);
  },
};




