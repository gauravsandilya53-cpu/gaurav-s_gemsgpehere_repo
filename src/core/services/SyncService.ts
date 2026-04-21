/**
 * Â© GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */

import NetInfo from '@react-native-community/netinfo';
import { InvoiceRepository } from '../../data/repositories/InvoiceRepository';
import ApiClient from '../api/client';

export const SyncService = {
  init: () => {
    NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        console.log('Device is online, triggering sync...');
        SyncService.syncAll();
      }
    });
  },

  syncAll: async () => {
    await SyncService.syncInvoices();
    // Add other entities here (e.g., Ledger, Products)
  },

  syncInvoices: async () => {
    const pendingInvoices = InvoiceRepository.getPendingSync();
    
    for (const invoice of pendingInvoices) {
      try {
        // Map local Invoice to backend OrderRequest
        const orderRequest = {
          userId: invoice.userId,
          paymentMode: 'CASH', // Default
          paidAmount: invoice.paidAmount,
          discount: invoice.discount,
          status: 'PENDING',
          items: invoice.orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        };

        await ApiClient.post('/api/orders', orderRequest);
        InvoiceRepository.markAsSynced(invoice.id);
        console.log(`Order ${invoice.id} synced successfully`);
      } catch (error) {
        console.error(`Failed to sync order ${invoice.id}`, error);
      }
    }
  },
};

