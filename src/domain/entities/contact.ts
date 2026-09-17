/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */

export type ContactType = 'CUSTOMER' | 'SUPPLIER';

export interface Contact {
  id: string;
  tenantId: string;
  type: ContactType;
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address: string;
  gstin?: string; // Align with Supplier schema
  openingBalance?: number;
  currentBalance: number;
  currency?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}
