/**
 * Â© GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuthStore } from '../features/auth/store';
import { Dimensions, View, Text } from 'react-native';

// Screens
import { LoginScreen } from '../features/auth/LoginScreen';
import { DashboardScreen } from '../features/dashboard/DashboardScreen';
import { InvoiceListScreen } from '../features/billing/InvoiceListScreen';
import { InvoiceCreatorScreen } from '../features/billing/InvoiceCreatorScreen';
import { ProductListScreen } from '../features/inventory/ProductListScreen';
import { ProductDetailScreen } from '../features/inventory/ProductDetailScreen';
import { StockAlertsScreen } from '../features/inventory/StockAlertsScreen';
import { LedgerScreen } from '../features/accounting/LedgerScreen';
import { ReportDashboardScreen } from '../features/reports/ReportDashboardScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { ContactListScreen } from '../features/crm/ContactListScreen';
import { AIInsightsScreen } from '../features/ai-insights/AIInsightsScreen';
import { SidebarContent } from './SidebarContent';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const BillingStack = createStackNavigator();
const InventoryStack = createStackNavigator();

const BillingNavigator = () => (
  <BillingStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="InvoiceCreator">
    <BillingStack.Screen name="InvoiceCreator" component={InvoiceCreatorScreen} />
    <BillingStack.Screen name="InvoiceList" component={InvoiceListScreen} />
  </BillingStack.Navigator>
);

const InventoryNavigator = () => (
  <InventoryStack.Navigator screenOptions={{ headerShown: false }}>
    <InventoryStack.Screen name="ProductList" component={ProductListScreen} />
    <InventoryStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <InventoryStack.Screen name="StockAlerts" component={StockAlertsScreen} />
  </InventoryStack.Navigator>
);

// Placeholders for missing screens

const MainDrawer = () => {
  const isDesktop = Dimensions.get('window').width >= 768;
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SidebarContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: isDesktop ? 'permanent' : 'front',
        drawerStyle: isDesktop ? { width: 260, borderRightWidth: 0 } : { width: '80%' },
      }}
    >
      <Drawer.Screen name="Orders" component={BillingNavigator} />
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Customers" component={ContactListScreen} />
      <Drawer.Screen name="Inventory" component={InventoryNavigator} />
      <Drawer.Screen name="Reports" component={ReportDashboardScreen} />
      <Drawer.Screen name="AIInsights" component={AIInsightsScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainDrawer} />
        ) : (
          <Stack.Screen name="Auth" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};




