const alasql = require('alasql');
alasql('CREATE TABLE products (id STRING PRIMARY KEY, name STRING, sku STRING, barcode STRING, price NUMBER, cost_price NUMBER, stock_quantity NUMBER, low_stock_threshold NUMBER, unit STRING, category_id STRING, warehouse_id STRING, is_active NUMBER DEFAULT 1)'); 
let q = `INSERT OR REPLACE INTO products (id, name, sku, barcode, price, cost_price, stock_quantity, low_stock_threshold, unit, category_id, warehouse_id, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`; 
let params = ['123', 'Test', 'SKU', null, 10, 5, 100, 10, 'PCS', 'def', 'main', 1]; 
let match = q.match(/INSERT OR REPLACE INTO\s+(\w+)/i); 
if (match) { 
  let tableName = match[1]; 
  alasql('DELETE FROM '+tableName+' WHERE id = ?', [params[0]]); 
  q = q.replace(/INSERT OR REPLACE INTO/i, 'INSERT INTO'); 
  alasql(q, params); 
  console.log('success!', alasql('SELECT * FROM products WHERE is_active = 1')); 
} 
