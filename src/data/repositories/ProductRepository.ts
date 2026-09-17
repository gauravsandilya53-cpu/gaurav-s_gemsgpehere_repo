/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import { DatabaseService } from '../../core/storage/sqlite';
import { Product, StockStatus } from '../../domain/entities/inventory';

export const ProductRepository = {
  save: async (product: Product): Promise<void> => {
    await DatabaseService.execute(
      `INSERT OR REPLACE INTO products (id, name, sku, barcode, price, cost_price, stock_quantity, low_stock_threshold, unit, category_id, warehouse_id, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.id,
        product.name,
        product.sku,
        product.barcode || null,
        product.price,
        product.costPrice,
        product.stockQuantity,
        product.lowStockThreshold,
        product.unit || 'PCS',
        product.categoryId,
        product.warehouseId,
        product.isActive ? 1 : 0,
      ]
    );
  },

  getAll: async (): Promise<Product[]> => {
    const rows = await DatabaseService.getAll<any>('SELECT * FROM products WHERE is_active = 1');
    return rows.map((row) => ({
      id: row.id,
      warehouseId: row.warehouse_id,
      name: row.name,
      sku: row.sku,
      barcode: row.barcode,
      price: row.price,
      costPrice: row.cost_price,
      stockQuantity: row.stock_quantity,
      lowStockThreshold: row.low_stock_threshold,
      unit: row.unit,
      categoryId: row.category_id,
      isActive: row.is_active === 1,
    }));
  },

  // Alias for compatibility
  getAllProducts: async (): Promise<Product[]> => {
    return ProductRepository.getAll();
  },

  getLowStockItems: async (): Promise<Product[]> => {
    const all = await ProductRepository.getAll();
    return all.filter(
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

  updateStock: async (id: string, newQuantity: number) => {
    await DatabaseService.execute('UPDATE products SET stock_quantity = ? WHERE id = ?', [
      newQuantity,
      id,
    ]);
  },

  delete: async (id: string): Promise<void> => {
    await DatabaseService.execute('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
  },
};




