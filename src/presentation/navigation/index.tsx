/**
 * Â© GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../features/auth/store';

// Screens
import { LoginScreen } from '../features/auth/LoginScreen';
import { DashboardScreen } from '../features/dashboard/DashboardScreen';
import { InvoiceCreatorScreen } from '../features/billing/InvoiceCreatorScreen';
import { ProductListScreen } from '../features/inventory/ProductListScreen';
import { LedgerScreen } from '../features/accounting/LedgerScreen';
import { ReportDashboardScreen } from '../features/reports/ReportDashboardScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Orders" component={InvoiceCreatorScreen} />
    <Tab.Screen name="Inventory" component={ProductListScreen} />
    <Tab.Screen name="Ledger" component={LedgerScreen} />
    <Tab.Screen name="Reports" component={ReportDashboardScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};




