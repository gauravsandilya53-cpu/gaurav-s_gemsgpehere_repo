/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * AnalyticsService — Core service for dashboard metrics and AI insights.
 */
import { DatabaseService } from '../../core/storage/sqlite';

export interface KPICardData {
  label: string;
  value: number;
  currency: string;
  changePercent: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export const AnalyticsService = {
  // Helper to get relative dates
  getDateOffset: (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  getTotalSales: async (startDate: Date, endDate: Date, currency: string = 'USD'): Promise<number> => {
    const row = await DatabaseService.getAll<any>(
      `SELECT SUM(total_amount) as total FROM invoices 
       WHERE currency = ? AND status != 'DRAFT' AND created_at BETWEEN ? AND ?`,
      [currency, startDate.toISOString(), endDate.toISOString()]
    );
    return row[0]?.total || 0;
  },

  getTodaysSales: async (currency: string = 'USD'): Promise<KPICardData> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todaySales = await AnalyticsService.getTotalSales(today, tomorrow, currency);
    const yesterdaySales = await AnalyticsService.getTotalSales(yesterday, today, currency);

    const change = yesterdaySales === 0 ? (todaySales > 0 ? 100 : 0) : ((todaySales - yesterdaySales) / yesterdaySales) * 100;

    return {
      label: "Today's Sales",
      value: todaySales,
      currency,
      changePercent: change,
      trend: change >= 0 ? 'UP' : 'DOWN',
    };
  },

  getWeeklyRevenue: async (currency: string = 'USD'): Promise<KPICardData> => {
    const today = new Date();
    const lastWeekStart = AnalyticsService.getDateOffset(7);
    const twoWeeksAgoStart = AnalyticsService.getDateOffset(14);

    const thisWeekSales = await AnalyticsService.getTotalSales(lastWeekStart, today, currency);
    const lastWeekSales = await AnalyticsService.getTotalSales(twoWeeksAgoStart, lastWeekStart, currency);

    const change = lastWeekSales === 0 ? (thisWeekSales > 0 ? 100 : 0) : ((thisWeekSales - lastWeekSales) / lastWeekSales) * 100;

    return {
      label: '7-Day Revenue',
      value: thisWeekSales,
      currency,
      changePercent: change,
      trend: change >= 0 ? 'UP' : 'DOWN',
    };
  },

  getMonthlyKPIs: async (currency: string = 'USD'): Promise<KPICardData[]> => {
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const lastMonthEnd = new Date(thisMonthStart);
    lastMonthEnd.setMilliseconds(-1);

    const getTotal = async (type: 'INCOME' | 'EXPENSE', start: Date, end: Date) => {
      const row = await DatabaseService.getAll<any>(
        `SELECT SUM(amount) as total FROM ledger 
         WHERE type = ? AND currency = ? AND created_at BETWEEN ? AND ?`,
        [type, currency, start.toISOString(), end.toISOString()]
      );
      return row[0]?.total || 0;
    };

    const thisMonthIncome = await getTotal('INCOME', thisMonthStart, new Date());
    const lastMonthIncome = await getTotal('INCOME', lastMonthStart, lastMonthEnd);

    const thisMonthExpense = await getTotal('EXPENSE', thisMonthStart, new Date());
    const lastMonthExpense = await getTotal('EXPENSE', lastMonthStart, lastMonthEnd);

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
        changePercent: incomeChange - expenseChange,
        trend: (thisMonthIncome - thisMonthExpense) >= (lastMonthIncome - lastMonthExpense) ? 'UP' : 'DOWN',
      },
    ];
  },

  getOutstandingDues: async (currency: string = 'USD'): Promise<number> => {
    const row = await DatabaseService.getAll<any>(
      `SELECT SUM(total_amount - paid_amount) as total FROM invoices 
       WHERE currency = ? AND status IN ('PENDING', 'UNPAID', 'OVERDUE')`,
      [currency]
    );
    return row[0]?.total || 0;
  },

  getRevenueTrends: async (currency: string = 'USD', limit: number = 6) => {
    // Returns last N months revenue for chart
    const query = `
      SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as total
      FROM ledger
      WHERE type = 'INCOME' AND currency = ?
      GROUP BY month
      ORDER BY month DESC
      LIMIT ?
    `;
    return DatabaseService.getAll<any>(query, [currency, limit]);
  },

  getDailyTrend: async (days: 7 | 30, currency: string = 'USD') => {
    const startDate = AnalyticsService.getDateOffset(days);
    const query = `
      SELECT strftime('%Y-%m-%d', created_at) as day, SUM(total_amount) as total
      FROM invoices
      WHERE currency = ? AND status != 'DRAFT' AND created_at >= ?
      GROUP BY day
      ORDER BY day ASC
    `;
    return DatabaseService.getAll<any>(query, [currency, startDate.toISOString()]);
  },

  getTopProducts: async (limit: number = 5) => {
    const query = `
      SELECT p.name, SUM(i.quantity) as qty_sold, SUM(i.total) as revenue
      FROM invoice_items i
      JOIN products p ON i.product_id = p.id
      JOIN invoices inv ON i.invoice_id = inv.id
      WHERE inv.status != 'DRAFT'
      GROUP BY p.id
      ORDER BY revenue DESC
      LIMIT ?
    `;
    return DatabaseService.getAll<any>(query, [limit]);
  },

  getBusinessHealthScore: async (currency: string = 'USD'): Promise<number> => {
    // Simple heuristic algorithm for business health
    const today = new Date();
    const lastMonth = AnalyticsService.getDateOffset(30);
    const twoMonthsAgo = AnalyticsService.getDateOffset(60);

    const recentIncome = await AnalyticsService.getTotalSales(lastMonth, today, currency);
    const oldIncome = await AnalyticsService.getTotalSales(twoMonthsAgo, lastMonth, currency);
    const dues = await AnalyticsService.getOutstandingDues(currency);

    let score = 70; // Base score
    
    // Revenue growth
    if (recentIncome > oldIncome) score += 15;
    else if (recentIncome < oldIncome && oldIncome > 0) score -= 15;

    // Debt ratio
    if (recentIncome > 0) {
      const debtRatio = dues / recentIncome;
      if (debtRatio < 0.1) score += 15;
      else if (debtRatio > 0.5) score -= 20;
    }

    return Math.min(Math.max(Math.round(score), 0), 100);
  },

  // ─── Enhanced Reports & Analytics Engine ───────────────────────────

  formatIndianCurrency: (amount: number = 0): string => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount || 0);
    } catch {
      return `₹ ${(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    }
  },

  getDateRange: (filter: 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'CUSTOM', customStart?: Date, customEnd?: Date) => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (filter === 'TODAY') {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (filter === 'THIS_WEEK') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else if (filter === 'THIS_MONTH') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else if (filter === 'LAST_MONTH') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (filter === 'THIS_YEAR') {
      startDate = new Date(now.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else if (filter === 'CUSTOM' && customStart && customEnd) {
      startDate = new Date(customStart);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
  },

  getComprehensiveReportData: async (
    filter: 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'CUSTOM' = 'THIS_MONTH',
    customStart?: Date,
    customEnd?: Date
  ) => {
    const { startDate, endDate } = AnalyticsService.getDateRange(filter, customStart, customEnd);
    const startStr = startDate.toISOString();
    const endStr = endDate.toISOString();

    // 1. Invoices for the period
    const invoices = await DatabaseService.getAll<any>(
      `SELECT i.*, c.name as customer_name 
       FROM invoices i 
       LEFT JOIN contacts c ON i.customer_id = c.id
       WHERE i.status != 'DRAFT' AND i.created_at BETWEEN ? AND ?`,
      [startStr, endStr]
    );

    // Calculate invoice metrics
    let totalRevenue = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let overdueAmount = 0;

    let paidCount = 0;
    let unpaidCount = 0;
    let partiallyPaidCount = 0;
    let overdueCount = 0;

    invoices.forEach((inv) => {
      const invTotal = inv.total_amount || 0;
      const invPaid = inv.paid_amount || 0;
      totalRevenue += invTotal;

      const status = (inv.status || 'UNPAID').toUpperCase();

      if (status === 'PAID') {
        paidAmount += invTotal;
        paidCount++;
      } else if (status === 'OVERDUE') {
        overdueAmount += Math.max(0, invTotal - invPaid);
        pendingAmount += Math.max(0, invTotal - invPaid);
        if (invPaid > 0) paidAmount += invPaid;
        overdueCount++;
      } else if (status === 'PARTIALLY_PAID') {
        paidAmount += invPaid;
        pendingAmount += Math.max(0, invTotal - invPaid);
        partiallyPaidCount++;
      } else {
        // UNPAID or PENDING
        pendingAmount += Math.max(0, invTotal - invPaid);
        if (invPaid > 0) paidAmount += invPaid;
        unpaidCount++;
      }
    });

    // 2. Expenses for the period from ledger
    const ledgerExpenses = await DatabaseService.getAll<any>(
      `SELECT category, SUM(amount) as total 
       FROM ledger 
       WHERE type = 'EXPENSE' AND created_at BETWEEN ? AND ?
       GROUP BY category`,
      [startStr, endStr]
    );

    const totalExpenses = ledgerExpenses.reduce((sum, item) => sum + (item.total || 0), 0);
    const expenseBreakdown = ledgerExpenses
      .map((item) => ({
        category: item.category || 'General Expense',
        amount: item.total || 0,
        percentage: totalExpenses > 0 ? parseFloat(((item.total / totalExpenses) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 3. Previous period revenue comparison
    const periodDurationMs = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodDurationMs);
    const prevEndDate = new Date(startDate.getTime() - 1);

    const prevInvoicesRow = await DatabaseService.getAll<any>(
      `SELECT SUM(total_amount) as total FROM invoices 
       WHERE status != 'DRAFT' AND created_at BETWEEN ? AND ?`,
      [prevStartDate.toISOString(), prevEndDate.toISOString()]
    );
    const prevRevenue = prevInvoicesRow[0]?.total || 0;
    const revenueChangePercent = prevRevenue === 0
      ? (totalRevenue > 0 ? 100 : 0)
      : parseFloat((((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1));

    // 4. Net Profit & Margin
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? parseFloat(((netProfit / totalRevenue) * 100).toFixed(1)) : 0;

    // 5. Trend Chart Points
    // If TODAY or THIS_WEEK: group by Day (%Y-%m-%d)
    // Else: group by Month (%Y-%m) or Day depending on span
    const daySpan = Math.ceil(periodDurationMs / (1000 * 60 * 60 * 24));
    const isDaily = daySpan <= 31;
    const dateFormat = isDaily ? '%Y-%m-%d' : '%Y-%m';

    const invoiceTrends = await DatabaseService.getAll<any>(
      `SELECT strftime('${dateFormat}', created_at) as period, SUM(total_amount) as revenue
       FROM invoices
       WHERE status != 'DRAFT' AND created_at BETWEEN ? AND ?
       GROUP BY period
       ORDER BY period ASC`,
      [startStr, endStr]
    );

    const expenseTrends = await DatabaseService.getAll<any>(
      `SELECT strftime('${dateFormat}', created_at) as period, SUM(amount) as expense
       FROM ledger
       WHERE type = 'EXPENSE' AND created_at BETWEEN ? AND ?
       GROUP BY period
       ORDER BY period ASC`,
      [startStr, endStr]
    );

    // Merge trend points
    const trendMap: { [key: string]: { label: string; revenue: number; expense: number; netProfit: number } } = {};

    invoiceTrends.forEach((row) => {
      if (!trendMap[row.period]) {
        trendMap[row.period] = { label: row.period, revenue: 0, expense: 0, netProfit: 0 };
      }
      trendMap[row.period].revenue = row.revenue || 0;
    });

    expenseTrends.forEach((row) => {
      if (!trendMap[row.period]) {
        trendMap[row.period] = { label: row.period, revenue: 0, expense: 0, netProfit: 0 };
      }
      trendMap[row.period].expense = row.expense || 0;
    });

    const trendPoints = Object.keys(trendMap)
      .sort()
      .map((key) => {
        const item = trendMap[key];
        item.netProfit = item.revenue - item.expense;
        return item;
      });

    // 6. Top Customers for period
    const topCustomers = await DatabaseService.getAll<any>(
      `SELECT COALESCE(c.name, i.customer_id, 'Walk-in Customer') as customerName,
              COUNT(i.id) as invoiceCount,
              SUM(i.total_amount) as totalSales
       FROM invoices i
       LEFT JOIN contacts c ON i.customer_id = c.id
       WHERE i.status != 'DRAFT' AND i.created_at BETWEEN ? AND ?
       GROUP BY customerName
       ORDER BY totalSales DESC
       LIMIT 5`,
      [startStr, endStr]
    );

    // 7. Top Products for period
    const topProducts = await DatabaseService.getAll<any>(
      `SELECT item.name as productName,
              SUM(item.quantity) as quantitySold,
              SUM(item.total) as revenue
       FROM invoice_items item
       JOIN invoices inv ON item.invoice_id = inv.id
       WHERE inv.status != 'DRAFT' AND inv.created_at BETWEEN ? AND ?
       GROUP BY item.name
       ORDER BY revenue DESC
       LIMIT 5`,
      [startStr, endStr]
    );

    return {
      filterType: filter,
      startDate: startDate.toLocaleDateString('en-IN'),
      endDate: endDate.toLocaleDateString('en-IN'),
      kpis: {
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        totalInvoices: invoices.length,
        paidInvoicesCount: paidCount,
        pendingInvoicesCount: unpaidCount + partiallyPaidCount,
        overdueInvoicesCount: overdueCount,
        revenueChangePercent,
        trend: revenueChangePercent >= 0 ? ('UP' as const) : ('DOWN' as const),
      },
      trendPoints,
      salesSummary: {
        totalSales: totalRevenue,
        paid: paidAmount,
        pending: pendingAmount,
        overdue: overdueAmount,
      },
      paymentStatus: {
        paid: { count: paidCount, amount: paidAmount },
        unpaid: { count: unpaidCount, amount: pendingAmount - overdueAmount },
        partiallyPaid: { count: partiallyPaidCount, amount: pendingAmount },
        overdue: { count: overdueCount, amount: overdueAmount },
      },
      expenseBreakdown,
      topCustomers,
      topProducts,
    };
  }
};

