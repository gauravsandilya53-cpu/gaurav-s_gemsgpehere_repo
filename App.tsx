/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import React, { useEffect } from 'react';
import { StatusBar, Alert, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './src/presentation/navigation';
import './src/core/i18n/config';
import { ThemeProvider } from './src/core/theme/ThemeContext';
import { DatabaseService } from './src/core/storage/sqlite';
import { DatabaseSeeder } from './src/core/storage/seeder';
import { SyncService } from './src/core/services/SyncService';
import { SyncStatusIndicatorUI } from './src/presentation/components/SyncStatusIndicatorUI';

const queryClient = new QueryClient();

export default function App() {
  const [isReady, setIsReady] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // 1. Initialize the SQLite database and run all migrations
        await DatabaseService.init();
        console.log('Database Ready');
        
        // 1.5 ONE-TIME CLEANUP (Requested by user)
        await DatabaseService.execute('DELETE FROM contacts WHERE id IN ("cust-001", "cust-002", "cust-003", "cust-004", "supp-001")');
        await DatabaseService.execute('DELETE FROM products WHERE id IN ("prod-001", "prod-002", "prod-003", "prod-004", "prod-005")');
        console.log('Cleared all dummy customers, suppliers, and products from DB');

        // 2. Seed demo data on first launch (no-op if already seeded)
        await DatabaseSeeder.seedIfEmpty();
        console.log('Seeder Done');

        // 3. Start the background network-aware sync listener
        SyncService.init();

        setIsReady(true);
      } catch (error: any) {
        console.error('App bootstrap failed:', error);
        setErrorMsg(error?.message || String(error));
        Alert.alert(
          'Startup Error',
          'Failed to initialize the database. Please restart the app.',
        );
      }
    };
    bootstrap();
  }, []);

  if (errorMsg) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold' }}>Startup Crash:</Text>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!isReady) return null;

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar barStyle="dark-content" />
          <SyncStatusIndicatorUI />
          <AppNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
