/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * ReportExportService — Export utilities for Reports & Analytics (PDF & CSV).
 */
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { Platform } from 'react-native';
import { AnalyticsService } from '../../data/services/AnalyticsService';

export const ReportExportService = {
  /**
   * Export PDF Report
   */
  exportPDF: async (reportData: any) => {
    const fmt = AnalyticsService.formatIndianCurrency;
    const { kpis, salesSummary, paymentStatus, expenseBreakdown, topCustomers, topProducts, startDate, endDate } = reportData;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            * { box-sizing: border-box; }
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1E293B; margin: 0; padding: 32px; font-size: 13px; background: #FFF; }
            .header { border-bottom: 3px solid #4F63FF; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
            .title { font-size: 24px; font-weight: 800; color: #4F63FF; margin: 0; }
            .subtitle { font-size: 13px; color: #64748B; margin-top: 4px; }
            .meta { text-align: right; font-size: 12px; color: #475569; }
            .kpi-row { display: flex; gap: 12px; margin-bottom: 24px; }
            .kpi-card { flex: 1; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; }
            .kpi-label { font-size: 10px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px; }
            .kpi-val { font-size: 18px; font-weight: 800; color: #0F172A; }
            .section-title { font-size: 15px; font-weight: 700; color: #0F172A; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin: 20px 0 12px 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #F1F5F9; color: #475569; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid #CBD5E1; }
            td { padding: 8px 10px; border-bottom: 1px solid #E2E8F0; font-size: 12px; }
            .text-right { text-align: right; }
            .footer { margin-top: 40px; text-align: center; color: #94A3B8; font-size: 11px; border-top: 1px solid #E2E8F0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">GemSphere Books</h1>
              <div class="subtitle">Financial Performance & Analytics Report</div>
            </div>
            <div class="meta">
              <strong>Period:</strong> ${startDate} to ${endDate}<br/>
              <strong>Generated:</strong> ${new Date().toLocaleDateString('en-IN')}
            </div>
          </div>

          <!-- KPI Summary -->
          <div class="kpi-row">
            <div class="kpi-card">
              <div class="kpi-label">Total Revenue</div>
              <div class="kpi-val" style="color:#4F63FF;">${fmt(kpis.totalRevenue)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Total Expenses</div>
              <div class="kpi-val" style="color:#F59E0B;">${fmt(kpis.totalExpenses)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Net Profit</div>
              <div class="kpi-val" style="color:#10B981;">${fmt(kpis.netProfit)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Total Invoices</div>
              <div class="kpi-val">${kpis.totalInvoices}</div>
            </div>
          </div>

          <!-- Sales Summary -->
          <div class="section-title">Sales Summary</div>
          <table>
            <thead>
              <tr><th>Metric</th><th class="text-right">Amount</th></tr>
            </thead>
            <tbody>
              <tr><td>Total Sales</td><td class="text-right"><strong>${fmt(salesSummary.totalSales)}</strong></td></tr>
              <tr><td>Paid Amount</td><td class="text-right" style="color:#10B981;">${fmt(salesSummary.paid)}</td></tr>
              <tr><td>Pending Dues</td><td class="text-right" style="color:#F59E0B;">${fmt(salesSummary.pending)}</td></tr>
              <tr><td>Overdue Amount</td><td class="text-right" style="color:#EF4444;">${fmt(salesSummary.overdue)}</td></tr>
            </tbody>
          </table>

          <!-- Payment Status -->
          <div class="section-title">Payment Status Breakdown</div>
          <table>
            <thead>
              <tr><th>Status</th><th>Invoice Count</th><th class="text-right">Total Value</th></tr>
            </thead>
            <tbody>
              <tr><td>Paid</td><td>${paymentStatus.paid.count}</td><td class="text-right">${fmt(paymentStatus.paid.amount)}</td></tr>
              <tr><td>Unpaid / Pending</td><td>${paymentStatus.unpaid.count}</td><td class="text-right">${fmt(paymentStatus.unpaid.amount)}</td></tr>
              <tr><td>Partially Paid</td><td>${paymentStatus.partiallyPaid.count}</td><td class="text-right">${fmt(paymentStatus.partiallyPaid.amount)}</td></tr>
              <tr><td>Overdue</td><td>${paymentStatus.overdue.count}</td><td class="text-right">${fmt(paymentStatus.overdue.amount)}</td></tr>
            </tbody>
          </table>

          <!-- Expense Breakdown -->
          ${expenseBreakdown && expenseBreakdown.length > 0 ? `
          <div class="section-title">Expense Breakdown</div>
          <table>
            <thead>
              <tr><th>Category</th><th>Share</th><th class="text-right">Amount</th></tr>
            </thead>
            <tbody>
              ${expenseBreakdown.map((e: any) => `
                <tr>
                  <td>${e.category}</td>
                  <td>${e.percentage}%</td>
                  <td class="text-right">${fmt(e.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>` : ''}

          <!-- Top Customers -->
          ${topCustomers && topCustomers.length > 0 ? `
          <div class="section-title">Top Customers</div>
          <table>
            <thead>
              <tr><th>Customer Name</th><th>Invoices</th><th class="text-right">Total Revenue</th></tr>
            </thead>
            <tbody>
              ${topCustomers.map((c: any) => `
                <tr>
                  <td>${c.customerName}</td>
                  <td>${c.invoiceCount}</td>
                  <td class="text-right">${fmt(c.totalSales)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>` : ''}

          <!-- Top Products -->
          ${topProducts && topProducts.length > 0 ? `
          <div class="section-title">Top Products</div>
          <table>
            <thead>
              <tr><th>Product Name</th><th>Quantity Sold</th><th class="text-right">Revenue</th></tr>
            </thead>
            <tbody>
              ${topProducts.map((p: any) => `
                <tr>
                  <td>${p.productName}</td>
                  <td>${p.quantitySold}</td>
                  <td class="text-right">${fmt(p.revenue)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>` : ''}

          <div class="footer">
            Generated by GemSphere Books Accounting System · ${new Date().toLocaleString('en-IN')}
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = uri;
        link.download = `GemSphere_Report_${startDate}_to_${endDate}.pdf`;
        link.click();
      } else {
        await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } catch (err) {
      console.error('Failed to export PDF report:', err);
      alert('Unable to generate PDF report on this device.');
    }
  },

  /**
   * Export CSV / Excel Report
   */
  exportCSV: async (reportData: any) => {
    const { kpis, salesSummary, paymentStatus, expenseBreakdown, topCustomers, topProducts, startDate, endDate } = reportData;

    let csvContent = `GemSphere Books - Financial Performance Report\n`;
    csvContent += `Period,${startDate} to ${endDate}\n`;
    csvContent += `Generated,${new Date().toLocaleDateString('en-IN')}\n\n`;

    // KPIs
    csvContent += `--- KPI SUMMARY ---\n`;
    csvContent += `Metric,Value\n`;
    csvContent += `Total Revenue,${kpis.totalRevenue}\n`;
    csvContent += `Total Expenses,${kpis.totalExpenses}\n`;
    csvContent += `Net Profit,${kpis.netProfit}\n`;
    csvContent += `Profit Margin %,${kpis.profitMargin}%\n`;
    csvContent += `Total Invoices,${kpis.totalInvoices}\n\n`;

    // Sales Summary
    csvContent += `--- SALES SUMMARY ---\n`;
    csvContent += `Status,Amount\n`;
    csvContent += `Total Sales,${salesSummary.totalSales}\n`;
    csvContent += `Paid Amount,${salesSummary.paid}\n`;
    csvContent += `Pending Dues,${salesSummary.pending}\n`;
    csvContent += `Overdue Amount,${salesSummary.overdue}\n\n`;

    // Payment Status
    csvContent += `--- PAYMENT STATUS BREAKDOWN ---\n`;
    csvContent += `Status,Count,Total Amount\n`;
    csvContent += `Paid,${paymentStatus.paid.count},${paymentStatus.paid.amount}\n`;
    csvContent += `Unpaid,${paymentStatus.unpaid.count},${paymentStatus.unpaid.amount}\n`;
    csvContent += `Partially Paid,${paymentStatus.partiallyPaid.count},${paymentStatus.partiallyPaid.amount}\n`;
    csvContent += `Overdue,${paymentStatus.overdue.count},${paymentStatus.overdue.amount}\n\n`;

    // Expense Breakdown
    if (expenseBreakdown && expenseBreakdown.length > 0) {
      csvContent += `--- EXPENSE BREAKDOWN ---\n`;
      csvContent += `Category,Amount,Percentage\n`;
      expenseBreakdown.forEach((e: any) => {
        csvContent += `"${e.category}",${e.amount},${e.percentage}%\n`;
      });
      csvContent += `\n`;
    }

    // Top Customers
    if (topCustomers && topCustomers.length > 0) {
      csvContent += `--- TOP CUSTOMERS ---\n`;
      csvContent += `Customer Name,Invoices,Total Revenue\n`;
      topCustomers.forEach((c: any) => {
        csvContent += `"${c.customerName}",${c.invoiceCount},${c.totalSales}\n`;
      });
      csvContent += `\n`;
    }

    // Top Products
    if (topProducts && topProducts.length > 0) {
      csvContent += `--- TOP PRODUCTS ---\n`;
      csvContent += `Product Name,Quantity Sold,Revenue\n`;
      topProducts.forEach((p: any) => {
        csvContent += `"${p.productName}",${p.quantitySold},${p.revenue}\n`;
      });
    }

    try {
      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `GemSphere_Report_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Native mobile share as file
        const printResult = await Print.printToFileAsync({
          html: `<pre>${csvContent}</pre>`,
        });
        await shareAsync(printResult.uri, { UTI: 'public.comma-separated-values-text', mimeType: 'text/csv' });
      }
    } catch (err) {
      console.error('Failed to export CSV report:', err);
      alert('Unable to export CSV report.');
    }
  }
};
