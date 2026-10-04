/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * Main Navigation Structure with Auth Navigation & Onboarding Guard.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuthStore } from '../features/auth/store';
import { Dimensions } from 'react-native';

// Auth Screens
import { LoginScreen } from '../features/auth/LoginScreen';
import { CreateAccountScreen } from '../features/auth/CreateAccountScreen';
import { ForgotPasswordScreen } from '../features/auth/ForgotPasswordScreen';
import { ContactVerificationScreen } from '../features/auth/ContactVerificationScreen';
import { AdaptiveOnboardingScreen } from '../features/auth/AdaptiveOnboardingScreen';
import { BusinessSelectionScreen } from '../features/auth/BusinessSelectionScreen';

// Main Application Screens
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

const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();
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

const MainDrawer = () => {
  const isDesktop = Dimensions.get('window').width >= 768;
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerContent={(props) => <SidebarContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: isDesktop ? 'permanent' : 'front',
        drawerStyle: isDesktop ? { width: 260, borderRightWidth: 0 } : { width: '80%' },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Orders" component={BillingNavigator} />
      <Drawer.Screen name="Customers" component={ContactListScreen} />
      <Drawer.Screen name="Inventory" component={InventoryNavigator} />
      <Drawer.Screen name="Reports" component={ReportDashboardScreen} />
      <Drawer.Screen name="AIInsights" component={AIInsightsScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
};

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="CreateAccount" component={CreateAccountScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <AuthStack.Screen name="ContactVerification" component={ContactVerificationScreen} />
    <AuthStack.Screen name="AdaptiveOnboarding" component={AdaptiveOnboardingScreen} />
    <AuthStack.Screen name="BusinessSelection" component={BusinessSelectionScreen} />
  </AuthStack.Navigator>
);

export const AppNavigator = () => {
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore();

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : !hasCompletedOnboarding ? (
          <>
            <RootStack.Screen name="AdaptiveOnboarding" component={AdaptiveOnboardingScreen} />
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          </>
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainDrawer} />
            <RootStack.Screen name="BusinessSelection" component={BusinessSelectionScreen} />
            <RootStack.Screen name="AdaptiveOnboarding" component={AdaptiveOnboardingScreen} />
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
