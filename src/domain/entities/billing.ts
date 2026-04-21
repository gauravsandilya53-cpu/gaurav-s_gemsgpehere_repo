/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */

export interface Product {
  id: number;
  tenantId: string;
  name: string;
  sku: string;
  barcode?: string;
  sellingPrice: number;
  buyingPrice: number;
  mrp: number;
  stockQuantity: number;
  lowStockAlertLevel: number;
  category: string;
  imageUrl?: string;
  active: boolean;
  unit?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  tenantId: string;
  orderItems: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  discount: number;
  status: string;
  createdAt: string;
}
