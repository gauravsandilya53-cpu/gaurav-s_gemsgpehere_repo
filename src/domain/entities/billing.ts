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

export interface TaxRule {
  id: string;
  name: string;
  rate: number;
}

export interface InvoiceItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  customerName?: string;
  billingAddress?: string;
  customerGST?: string;
  dueDate?: string;
  items: InvoiceItem[];
  subTotal: number;
  totalTax: number;
  discount: number;
  totalAmount: number;
  currency: string;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
  synced: boolean;
  userId?: string;
  paidAmount?: number;
  paymentMethod?: string;
  orderItems?: any[];
}
