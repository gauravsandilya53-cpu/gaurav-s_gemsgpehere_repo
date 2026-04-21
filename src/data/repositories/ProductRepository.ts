/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import { Product, StockStatus } from '../../domain/entities/billing';

export const ProductRepository = {
  save: async (product: Product): Promise<void> => {
    DatabaseService.execute(
      `INSERT OR REPLACE INTO products (id, name, sku, barcode, price, cost_price, stock_quantity, low_stock_threshold, unit, category_id, warehouse_id, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.id,
        product.name,
        product.sku,
        product.barcode || null,
        product.sellingPrice,
        product.buyingPrice,
        product.stockQuantity,
        product.lowStockAlertLevel,
        product.unit || 'PCS',
        product.category,
        product.tenantId,
        product.active ? 1 : 0,
      ]
    );
  },

  getAll: (): Product[] => {
    const rows = DatabaseService.getAll<any>('SELECT * FROM products WHERE is_active = 1');
    return rows.map((row) => ({
      id: row.id,
      tenantId: row.warehouse_id,
      name: row.name,
      sku: row.sku,
      barcode: row.barcode,
      sellingPrice: row.price,
      buyingPrice: row.cost_price,
      stockQuantity: row.stock_quantity,
      lowStockAlertLevel: row.low_stock_threshold,
      unit: row.unit,
      category: row.category_id,
      active: row.is_active === 1,
    }));
  },

  getLowStockItems: (): Product[] => {
    return ProductRepository.getAll().filter(
      (p) => p.stockQuantity <= p.lowStockThreshold
    );
  },

  getStockStatus: (product: Product): StockStatus => {
    if (product.stockQuantity <= 0) {
      return { status: 'OUT_OF_STOCK', color: '#EF4444' };
    }
    if (product.stockQuantity <= product.lowStockThreshold) {
      return { status: 'LOW_STOCK', color: '#F59E0B' };
    }
    return { status: 'IN_STOCK', color: '#10B981' };
  },

  updateStock: (id: string, newQuantity: number) => {
    DatabaseService.execute('UPDATE products SET stock_quantity = ? WHERE id = ?', [
      newQuantity,
      id,
    ]);
  },
};




