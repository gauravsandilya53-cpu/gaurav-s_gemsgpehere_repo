/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
export interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  categoryId?: string;
  warehouseId: string;
  unit: string; // e.g., PCS, KG, BOX
  isActive: boolean;
}

export interface StockStatus {
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  color: string;
}




