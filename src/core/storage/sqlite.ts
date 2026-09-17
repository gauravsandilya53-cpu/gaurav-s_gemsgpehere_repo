/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */

import * as SQLite from 'expo-sqlite';

/**
 * DatabaseService optimized for Expo Go.
 * Uses expo-sqlite for cross-platform local database management.
 */
export class DatabaseService {
  private static db: SQLite.SQLiteDatabase | null = null;

  public static async init(): Promise<void> {
    if (this.db) return;
    
    this.db = await SQLite.openDatabaseAsync('gemsphere_books.db');
    
    // Initialize Schema
    await this.db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT,
        sku TEXT UNIQUE,
        barcode TEXT,
        price REAL,
        cost_price REAL,
        stock_quantity REAL,
        low_stock_threshold REAL,
        unit TEXT,
        category_id TEXT,
        warehouse_id TEXT,
        is_active INTEGER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        tenant_id TEXT,
        total_amount REAL,
        paid_amount REAL,
        discount REAL,
        status TEXT,
        created_at TEXT
      );
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT,
        product_id TEXT,
        quantity REAL,
        price REAL,
        subtotal REAL,
        FOREIGN KEY(order_id) REFERENCES orders(id)
      );
      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        number TEXT,
        customer_id TEXT,
        sub_total REAL,
        total_tax REAL,
        discount REAL,
        total_amount REAL,
        currency TEXT,
        status TEXT,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        payment_method TEXT,
        paid_amount REAL
      );
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_id TEXT,
        product_id TEXT,
        name TEXT,
        quantity REAL,
        price REAL,
        tax_rate REAL,
        tax_amount REAL,
        total REAL,
        FOREIGN KEY(invoice_id) REFERENCES invoices(id)
      );
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        type TEXT, -- CUSTOMER or SUPPLIER
        name TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        tax_id TEXT,
        opening_balance REAL,
        current_balance REAL,
        currency TEXT
      );
      CREATE TABLE IF NOT EXISTS ledger (
        id TEXT PRIMARY KEY,
        type TEXT,
        category TEXT,
        amount REAL,
        currency TEXT,
        balance_after REAL,
        description TEXT,
        invoice_id TEXT,
        contact_id TEXT,
        created_at TEXT
      );
    `);
    
    await this.migrate();
  }

  private static async migrate(): Promise<void> {
    if (!this.db) return;
    const result = await this.db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    const currentVersion = result?.user_version || 0;

    // Run migrations sequentially for existing databases.
    // Fresh installs already have the full schema, so we just bump the version.
    if (currentVersion < 1) {
      await this.db.execAsync('PRAGMA user_version = 1');
    }
    if (currentVersion < 2) {
      // Add payment fields to invoices (only needed for DBs created before v2)
      try {
        await this.db.execAsync('ALTER TABLE invoices ADD COLUMN payment_method TEXT;');
      } catch (_) {}
      try {
        await this.db.execAsync('ALTER TABLE invoices ADD COLUMN paid_amount REAL;');
      } catch (_) {}
      await this.db.execAsync('PRAGMA user_version = 2');
    }
    if (currentVersion < 3) {
      // Add category and currency columns to ledger (only needed for DBs created before v3)
      try {
        await this.db.execAsync('ALTER TABLE ledger ADD COLUMN category TEXT;');
      } catch (_) {}
      try {
        await this.db.execAsync('ALTER TABLE ledger ADD COLUMN currency TEXT;');
      } catch (_) {}
      await this.db.execAsync('PRAGMA user_version = 3');
    }
    if (currentVersion < 4) {
      // Migration v4: GST Engine breakdown columns, Sync Queue table, User Roles table
      try {
        await this.db.execAsync(`
          ALTER TABLE invoices ADD COLUMN tax_type TEXT DEFAULT 'INTRA_STATE';
          ALTER TABLE invoices ADD COLUMN cgst_total REAL DEFAULT 0;
          ALTER TABLE invoices ADD COLUMN sgst_total REAL DEFAULT 0;
          ALTER TABLE invoices ADD COLUMN igst_total REAL DEFAULT 0;
          ALTER TABLE invoices ADD COLUMN place_of_supply TEXT;
          ALTER TABLE invoices ADD COLUMN customer_gstin TEXT;
          ALTER TABLE invoices ADD COLUMN seller_gstin TEXT;
        `);
      } catch (_) {}

      try {
        await this.db.execAsync(`
          ALTER TABLE invoice_items ADD COLUMN hsn_code TEXT;
          ALTER TABLE invoice_items ADD COLUMN cgst_rate REAL DEFAULT 0;
          ALTER TABLE invoice_items ADD COLUMN cgst_amount REAL DEFAULT 0;
          ALTER TABLE invoice_items ADD COLUMN sgst_rate REAL DEFAULT 0;
          ALTER TABLE invoice_items ADD COLUMN sgst_amount REAL DEFAULT 0;
          ALTER TABLE invoice_items ADD COLUMN igst_rate REAL DEFAULT 0;
          ALTER TABLE invoice_items ADD COLUMN igst_amount REAL DEFAULT 0;
        `);
      } catch (_) {}

      try {
        await this.db.execAsync(`
          ALTER TABLE products ADD COLUMN hsn_code TEXT;
          ALTER TABLE products ADD COLUMN gst_rate REAL DEFAULT 0;
        `);
      } catch (_) {}

      try {
        await this.db.execAsync(`
          CREATE TABLE IF NOT EXISTS sync_queue (
            id TEXT PRIMARY KEY,
            client_mutation_id TEXT UNIQUE,
            entity_type TEXT,
            entity_id TEXT,
            action TEXT, -- CREATE, UPDATE, DELETE
            payload TEXT,
            status TEXT DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, SYNCED, FAILED
            attempts INTEGER DEFAULT 0,
            error_message TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            synced_at TEXT
          );

          CREATE TABLE IF NOT EXISTS user_roles (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            role TEXT DEFAULT 'OWNER', -- OWNER, ACCOUNTANT_READ_ONLY, STAFF_BILLING
            permissions TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch (_) {}

      await this.db.execAsync('PRAGMA user_version = 4');
    }
  }

  public static async execute(query: string, params: any[] = []): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.runAsync(query, ...params);
  }

  public static async getAll<T>(query: string, params: any[] = []): Promise<T[]> {
    if (!this.db) await this.init();
    return await this.db!.getAllAsync<T>(query, ...params);
  }

  public static async getFirst<T>(query: string, params: any[] = []): Promise<T | null> {
    if (!this.db) await this.init();
    return await this.db!.getFirstAsync<T>(query, ...params);
  }
}
