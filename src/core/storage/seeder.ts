/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */

import { DatabaseService } from './sqlite';

export const DatabaseSeeder = {
  seedIfEmpty: async (): Promise<void> => {
    try {
      // Check if products table is empty
      const productsCount = await DatabaseService.getFirst<{ count: number }>(
        'SELECT COUNT(*) as count FROM products'
      );

      if (productsCount && productsCount.count > 0) {
        console.log('Database already seeded. Skipping seeder.');
        return;
      }

      console.log('Seeding initial data into SQLite database...');

      // Seed Products
      const products: any[] = [];

      for (const prod of products) {
        await DatabaseService.execute(
          `INSERT INTO products (id, name, sku, barcode, price, cost_price, stock_quantity, low_stock_threshold, unit, category_id, warehouse_id, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          prod
        );
      }

      // Seed Contacts (Customers & Suppliers)
      const contacts = [
        ['cust-001', 'CUSTOMER', 'Acme Corporation', 'billing@acme.com', '+1 555 0192', '100 Enterprise Way, Suite 4', '27AAACA12341Z5', 0, 0, 'default'],
        ['cust-002', 'CUSTOMER', 'GlobalTech Solutions', 'accounts@globaltech.com', '+1 555 0148', '500 Tech Blvd', '27BBBCB56782Z6', 0, 0, 'default'],
        ['cust-003', 'CUSTOMER', 'Apex Retailers', 'finance@apex.com', '+1 555 0173', '75 Commerce Street', '27CCCC391013Z7', 0, 0, 'default'],
      ];

      for (const contact of contacts) {
        await DatabaseService.execute(
          `INSERT INTO contacts (id, type, name, email, phone, address, tax_id, opening_balance, current_balance, currency)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          contact
        );
      }

      // Construct dates relative to June 4, 2026
      const today = new Date('2026-06-04T12:00:00.000Z');
      
      const getDateOffset = (daysAgo: number) => {
        const d = new Date(today);
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString();
      };

      // Months offsets
      const getMonthOffset = (monthsAgo: number) => {
        const d = new Date(today);
        d.setMonth(d.getMonth() - monthsAgo);
        return d.toISOString();
      };

      // Seed Invoices
      const invoices = [
        ['inv-001', 'INV-2026-001', 'cust-001', 320.00, 18.00, 0.00, 338.00, 'USD', 'PAID', 1, getDateOffset(0)], // Today
        ['inv-002', 'INV-2026-002', 'cust-002', 1450.00, 87.00, 0.00, 1537.00, 'USD', 'PAID', 1, getDateOffset(1)], // Yesterday (This Week)
        ['inv-003', 'INV-2026-003', 'cust-003', 890.00, 53.40, 0.00, 943.40, 'USD', 'PENDING', 0, getDateOffset(3)], // 3 days ago (This Week)
        ['inv-004', 'INV-2026-004', 'cust-001', 2100.00, 126.00, 50.00, 2176.00, 'USD', 'PAID', 1, getDateOffset(6)], // 6 days ago (This Week)
        ['inv-005', 'INV-2026-005', 'cust-003', 1200.00, 72.00, 0.00, 1272.00, 'USD', 'PAID', 1, getDateOffset(12)], // 12 days ago (This Month)
        ['inv-006', 'INV-2026-006', 'cust-002', 3400.00, 204.00, 100.00, 3504.00, 'USD', 'PENDING', 0, getDateOffset(18)], // 18 days ago (This Month)
        // Past months revenue
        ['inv-007', 'INV-2026-007', 'cust-001', 4500.00, 270.00, 0.00, 4770.00, 'USD', 'PAID', 1, getMonthOffset(1)], // May 2026
        ['inv-008', 'INV-2026-008', 'cust-002', 6200.00, 372.00, 0.00, 6572.00, 'USD', 'PAID', 1, getMonthOffset(2)], // Apr 2026
        ['inv-009', 'INV-2026-009', 'cust-003', 5100.00, 306.00, 0.00, 5406.00, 'USD', 'PAID', 1, getMonthOffset(3)], // Mar 2026
        ['inv-010', 'INV-2026-010', 'cust-001', 3800.00, 228.00, 0.00, 4028.00, 'USD', 'PAID', 1, getMonthOffset(4)], // Feb 2026
        ['inv-011', 'INV-2026-011', 'cust-002', 4200.00, 252.00, 0.00, 4452.00, 'USD', 'PAID', 1, getMonthOffset(5)], // Jan 2026
      ];

      for (const inv of invoices) {
        await DatabaseService.execute(
          `INSERT INTO invoices (id, number, customer_id, sub_total, total_tax, discount, total_amount, currency, status, synced, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          inv
        );
      }

      // Seed Invoice Items
      const invoiceItems = [
        [1, 'inv-001', 'prod-001', 'Premium Mechanical Keyboard', 2, 129.99, 18, 46.80, 306.78],
        [2, 'inv-001', 'prod-002', 'Wireless Ergonomic Mouse', 1, 79.99, 18, 14.40, 94.39],
        [3, 'inv-002', 'prod-003', 'UltraWide 34" Monitor', 3, 449.99, 18, 243.00, 1592.97],
        [4, 'inv-003', 'prod-005', 'Noise Cancelling Headphones', 4, 199.99, 18, 144.00, 943.96],
      ];

      for (const item of invoiceItems) {
        await DatabaseService.execute(
          `INSERT INTO invoice_items (id, invoice_id, product_id, name, quantity, price, tax_rate, tax_amount, total)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          item
        );
      }

      // Seed Ledger (Incomes from invoices + expenses to make profit/expense stats real)
      const ledgerEntries = [
        // Income entries (Sales) matching invoices
        ['led-001', 'INCOME', 'Sales', 338.00, 'USD', 'Invoice INV-2026-001 payment', 'inv-001', 'cust-001', getDateOffset(0)],
        ['led-002', 'INCOME', 'Sales', 1537.00, 'USD', 'Invoice INV-2026-002 payment', 'inv-002', 'cust-002', getDateOffset(1)],
        ['led-003', 'INCOME', 'Sales', 943.40, 'USD', 'Invoice INV-2026-003 accrual', 'inv-003', 'cust-003', getDateOffset(3)],
        ['led-004', 'INCOME', 'Sales', 2176.00, 'USD', 'Invoice INV-2026-004 payment', 'inv-004', 'cust-001', getDateOffset(6)],
        ['led-005', 'INCOME', 'Sales', 1272.00, 'USD', 'Invoice INV-2026-005 payment', 'inv-005', 'cust-003', getDateOffset(12)],
        ['led-006', 'INCOME', 'Sales', 3504.00, 'USD', 'Invoice INV-2026-006 accrual', 'inv-006', 'cust-002', getDateOffset(18)],
        ['led-007', 'INCOME', 'Sales', 4770.00, 'USD', 'Invoice INV-2026-007 payment', 'inv-007', 'cust-001', getMonthOffset(1)],
        ['led-008', 'INCOME', 'Sales', 6572.00, 'USD', 'Invoice INV-2026-008 payment', 'inv-008', 'cust-002', getMonthOffset(2)],
        ['led-009', 'INCOME', 'Sales', 5406.00, 'USD', 'Invoice INV-2026-009 payment', 'inv-009', 'cust-003', getMonthOffset(3)],
        ['led-010', 'INCOME', 'Sales', 4028.00, 'USD', 'Invoice INV-2026-010 payment', 'inv-010', 'cust-001', getMonthOffset(4)],
        ['led-011', 'INCOME', 'Sales', 4452.00, 'USD', 'Invoice INV-2026-011 payment', 'inv-011', 'cust-002', getMonthOffset(5)],

        // Expense entries (Rent, Software, Marketing, Utilities)
        ['led-exp-001', 'EXPENSE', 'Rent', 1200.00, 'USD', 'Office Rent for June', null, null, getDateOffset(2)],
        ['led-exp-002', 'EXPENSE', 'Hosting', 350.00, 'USD', 'AWS Cloud Server Bill', null, null, getDateOffset(3)],
        ['led-exp-003', 'EXPENSE', 'Marketing', 500.00, 'USD', 'Google Search Ads campaigns', null, null, getDateOffset(4)],
        ['led-exp-004', 'EXPENSE', 'Utilities', 85.00, 'USD', 'Office Internet Connection', null, null, getDateOffset(5)],
        
        ['led-exp-005', 'EXPENSE', 'Rent', 1200.00, 'USD', 'Office Rent for May', null, null, getMonthOffset(1)],
        ['led-exp-006', 'EXPENSE', 'Hosting', 320.00, 'USD', 'AWS Hosting for May', null, null, getMonthOffset(1)],
        ['led-exp-007', 'EXPENSE', 'Marketing', 600.00, 'USD', 'Social Media Ads Campaigns', null, null, getMonthOffset(1)],
        
        ['led-exp-008', 'EXPENSE', 'Rent', 1200.00, 'USD', 'Office Rent for April', null, null, getMonthOffset(2)],
        ['led-exp-009', 'EXPENSE', 'Hosting', 310.00, 'USD', 'AWS Hosting for April', null, null, getMonthOffset(2)],
        ['led-exp-010', 'EXPENSE', 'Utilities', 110.00, 'USD', 'Office Utilities and Snacks', null, null, getMonthOffset(2)],
      ];

      for (const entry of ledgerEntries) {
        await DatabaseService.execute(
          `INSERT INTO ledger (id, type, category, amount, currency, description, invoice_id, contact_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          entry
        );
      }

      console.log('Database successfully seeded with mock business data.');
    } catch (error) {
      console.error('Failed to seed database:', error);
    }
  },
};
