/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */

import { LinkingOptions } from '@react-navigation/native';

/**
 * Configure Deep Linking for GemSphere Books.
 * This allows search engines to index app content and deep-link directly 
 * to Invoices, Products, or Reports.
 */
export const linking: LinkingOptions<any> = {
  prefixes: ['gemsphere://', 'https://gemsphere.in'],
  config: {
    screens: {
      Main: {
        screens: {
          Dashboard: 'dashboard',
          Orders: 'orders',
          Inventory: 'inventory',
          Ledger: 'ledger',
          Reports: 'reports',
        },
      },
      Auth: {
        screens: {
          Login: 'login',
        },
      },
    },
  },
};
