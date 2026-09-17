/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * Web-compatible in-memory database stub for GemSphere Books using AlaSQL.
 * Provides a near-complete SQL engine in the browser (supports JOINs, GROUP BY, etc)
 * with the exact same API as expo-sqlite.
 */
import alasql from 'alasql';

// ---------------------------------------------------------------------------
// DatabaseService – AlaSQL based Web DB
// ---------------------------------------------------------------------------

let initialized = false;

export class DatabaseService {
  public static async init(): Promise<void> {
    if (initialized) return;
    initialized = true;
    console.log('[WebDB] AlaSQL database initialised (web mode).');
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
         alasql('CREATE localStorage DATABASE IF NOT EXISTS GemDB');
         alasql('ATTACH localStorage DATABASE GemDB AS GemDB');
         alasql('USE GemDB');
      }
    } catch(e) {}
    
    // Create tables in AlaSQL DB
    alasql(`
      CREATE TABLE IF NOT EXISTS products (
        \`id\` STRING PRIMARY KEY,
        \`name\` STRING,
        \`sku\` STRING,
        \`barcode\` STRING,
        \`price\` NUMBER,
        \`cost_price\` NUMBER,
        \`stock_quantity\` NUMBER,
        \`low_stock_threshold\` NUMBER,
        \`unit\` STRING,
        \`category_id\` STRING,
        \`warehouse_id\` STRING,
        \`is_active\` NUMBER DEFAULT 1
      );
      CREATE TABLE IF NOT EXISTS orders (
        \`id\` STRING PRIMARY KEY,
        \`tenant_id\` STRING,
        \`total_amount\` NUMBER,
        \`paid_amount\` NUMBER,
        \`discount\` NUMBER,
        \`status\` STRING,
        \`created_at\` STRING
      );
      CREATE TABLE IF NOT EXISTS order_items (
        \`id\` INT AUTOINCREMENT PRIMARY KEY,
        \`order_id\` STRING,
        \`product_id\` STRING,
        \`quantity\` NUMBER,
        \`price\` NUMBER,
        \`subtotal\` NUMBER
      );
      CREATE TABLE IF NOT EXISTS invoices (
        \`id\` STRING PRIMARY KEY,
        \`number\` STRING,
        \`customer_id\` STRING,
        \`sub_total\` NUMBER,
        \`total_tax\` NUMBER,
        \`discount\` NUMBER,
        \`total_amount\` NUMBER,
        \`currency\` STRING,
        \`status\` STRING,
        \`synced\` NUMBER DEFAULT 0,
        \`created_at\` STRING,
        \`payment_method\` STRING,
        \`paid_amount\` NUMBER
      );
      CREATE TABLE IF NOT EXISTS invoice_items (
        \`id\` INT AUTOINCREMENT PRIMARY KEY,
        \`invoice_id\` STRING,
        \`product_id\` STRING,
        \`name\` STRING,
        \`quantity\` NUMBER,
        \`price\` NUMBER,
        \`tax_rate\` NUMBER,
        \`tax_amount\` NUMBER,
        \`item_total\` NUMBER
      );
      CREATE TABLE IF NOT EXISTS contacts (
        \`id\` STRING PRIMARY KEY,
        \`type\` STRING,
        \`name\` STRING,
        \`email\` STRING,
        \`phone\` STRING,
        \`address\` STRING,
        \`tax_id\` STRING,
        \`opening_balance\` NUMBER,
        \`current_balance\` NUMBER,
        \`currency\` STRING
      );
      CREATE TABLE IF NOT EXISTS ledger (
        \`id\` STRING PRIMARY KEY,
        \`type\` STRING,
        \`category\` STRING,
        \`amount\` NUMBER,
        \`currency\` STRING,
        \`balance_after\` NUMBER,
        \`description\` STRING,
        \`invoice_id\` STRING,
        \`contact_id\` STRING,
        \`created_at\` STRING
      );
    `);
  }

  /**
   * Rewrite SQL to escape AlaSQL reserved keywords used as column names.
   * - `total` → `item_total` (TOTAL is reserved in AlaSQL)
   */
  private static rewriteQuery(query: string): string {
    // Replace `total` column references (not inside words like sub_total, total_tax, total_amount)
    // Handles: column list, SET clauses, SELECT *, WHERE, etc.
    return query
      .replace(/\btax_amount,\s*total\b/gi, 'tax_amount, item_total')
      .replace(/,\s*total\)/gi, ', item_total)')
      .replace(/\btotal\s*=/gi, 'item_total =')
      .replace(/item\.total\b/g, 'item_total')
      .replace(/\bitem_total_total\b/g, 'item_total'); // guard against double-replace
  }

  public static async execute(query: string, params: any[] = []): Promise<void> {
    if (!initialized) await this.init();
    
    // AlaSQL ignores PRAGMA and some transactions, strip or adapt them
    let q = query.replace(/PRAGMA[^;]+;/g, '');
    q = q.replace(/BEGIN TRANSACTION/i, '');
    q = q.replace(/COMMIT/i, '');
    q = q.replace(/ROLLBACK/i, '');
    let match = q.match(/INSERT OR REPLACE INTO\s+(\w+)/i);
    if (match) {
      let tableName = match[1];
      try {
        if (params && params.length > 0) {
          alasql(`DELETE FROM ${tableName} WHERE id = ?`, [params[0]]);
        }
      } catch(e) {}
      q = q.replace(/INSERT OR REPLACE INTO/i, 'INSERT INTO');
    }

    q = DatabaseService.rewriteQuery(q);
    if (!q.trim()) return;
    
    try {
      alasql(q, params);
    } catch (e: any) {
      console.warn('[WebDB] Execute Error:', e, '\nQuery:', q);
      if (typeof window !== 'undefined') window.alert('[WebDB Error] ' + e.message);
    }
  }

  public static async getAll<T>(query: string, params: any[] = []): Promise<T[]> {
    if (!initialized) await this.init();
    
    let q = query.replace(/PRAGMA[^;]+;/g, '');
    // SQLite's strftime('%Y-%m', date) is tough in pure sql. AlaSQL supports JS functions!
    // We replace strftime('%Y-%m', created_at) with SUBSTRING(created_at, 1, 7)
    q = q.replace(/strftime\('%Y-%m',\s*(\w+)\)/ig, 'SUBSTRING($1, 1, 7)');
    q = DatabaseService.rewriteQuery(q);
    
    if (!q.trim()) return [];

    try {
      return alasql(q, params) as T[];
    } catch (e) {
      console.warn('[WebDB] GetAll Error:', e, '\nQuery:', q);
      return [];
    }
  }

  public static async getFirst<T>(query: string, params: any[] = []): Promise<T | null> {
    const rows = await this.getAll<T>(query, params);
    return rows.length > 0 ? rows[0] : null;
  }
}
