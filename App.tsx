/**
 * Â© GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './src/presentation/navigation';
import './src/core/i18n/config';
import { DatabaseService } from './src/core/storage/sqlite';
import { SyncService } from './src/core/services/SyncService';
import { SyncStatusIndicator } from './src/presentation/components/SyncStatusIndicator';

const queryClient = new QueryClient();

export default function App() {
  const [isReady, setIsReady] = React.useState(false);

  useEffect(() => {
    // Initialize Core Services
    DatabaseService.init().then(() => {
      console.log('Database Ready');
      SyncService.init();
      setIsReady(true);
    });
  }, []);

  if (!isReady) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar barStyle="dark-content" />
        <SyncStatusIndicator />
        <AppNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}




