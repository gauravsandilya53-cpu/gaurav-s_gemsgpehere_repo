/**
 * © GemSphere Technologies Private Limited. All rights reserved.
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
        console.log('Device is online, triggering background sync...');
        // Fire-and-forget — don't block UI
        SyncService.syncAll().catch((e) =>
          console.warn('Background sync failed silently:', e)
        );
      }
    });
  },

  syncAll: async () => {
    await SyncService.syncInvoices();
  },

  syncInvoices: async () => {
    let pendingInvoices: Awaited<ReturnType<typeof InvoiceRepository.getAll>> = [];

    try {
      pendingInvoices = await InvoiceRepository.getPendingSync();
    } catch (e) {
      console.warn('Could not fetch pending sync invoices:', e);
      return;
    }

    for (const invoice of pendingInvoices) {
      try {
        const orderRequest = {
          userId: invoice.userId,
          paymentMode: invoice.paymentMethod || 'CASH',
          paidAmount: invoice.paidAmount || 0,
          discount: invoice.discount || 0,
          status: invoice.status,
          items: invoice.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        };

        await ApiClient.post('/api/orders', orderRequest);
        await InvoiceRepository.markAsSynced(invoice.id);
        console.log(`Invoice ${invoice.id} synced successfully`);
      } catch (error) {
        // Log but don't rethrow — allow other invoices to keep syncing
        console.warn(`Failed to sync invoice ${invoice.id}:`, error);
      }
    }
  },
};
