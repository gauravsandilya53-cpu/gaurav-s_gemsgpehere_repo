import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../auth/store';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { AnalyticsService, KPICardData } from '../../../data/services/AnalyticsService';
import { InvoiceRepository } from '../../../data/repositories/InvoiceRepository';
import { TaxCalculator } from '../../../core/utils/tax-calculator';

// Components
import { GlassCard } from '../../components/ui/GlassCard';
import { StatCard } from '../../components/ui/StatCard';
import { DashboardChart } from '../../components/DashboardChart';
import { InvoiceStatusBadge } from '../../components/ui/Badge';
import { TopHeader } from '../../components/ui/TopHeader';

export const DashboardScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const { user, currency } = useAuthStore();
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const isDesktop = windowWidth >= 1024;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isMobile = windowWidth < 768;

  const [refreshing, setRefreshing] = useState(false);
  const [kpiToday, setKpiToday] = useState<KPICardData | null>(null);
  const [kpiWeek, setKpiWeek] = useState<KPICardData | null>(null);
  const [dues, setDues] = useState(0);
  const [customersCount, setCustomersCount] = useState(0);
  const [healthScore, setHealthScore] = useState(0);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const loadDashboardData = async () => {
    try {
      const today = await AnalyticsService.getTodaysSales(currency);
      const week = await AnalyticsService.getWeeklyRevenue(currency);
      const pendingDues = await AnalyticsService.getOutstandingDues(currency);
      const health = await AnalyticsService.getBusinessHealthScore(currency);
      const invoices = await InvoiceRepository.getAll();
      const trends = await AnalyticsService.getRevenueTrends(currency, 6);

      setKpiToday(today);
      setKpiWeek(week);
      setDues(pendingDues);
      setHealthScore(health);
      setRecentInvoices(invoices.slice(0, 5));
      setChartData(trends.reverse());
      // Mock total customers for now
      setCustomersCount(invoices.length > 0 ? 12 : 0);
    } catch (e) {
      console.error('Failed to load dashboard', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [currency])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const renderQuickAction = (icon: keyof typeof Ionicons.glyphMap, label: string, color: string, onPress: () => void) => (
    <TouchableOpacity style={[styles.actionButton, { borderColor: Palette.border, backgroundColor: Palette.surface }]} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[Typography.bodyMedium, { color: Palette.text, marginLeft: Spacing.sm }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: Palette.background }]}>
      <TopHeader onToggleSidebar={() => navigation.toggleDrawer()} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[Typography.h2, { color: Palette.text }]}>Overview</Text>
            <Text style={[Typography.body, { color: Palette.textMuted, marginTop: 4 }]}>Welcome back, here's what's happening today.</Text>
          </View>
          
          {/* Action Toolbar */}
          <View style={[styles.actionToolbar, isMobile && { marginTop: Spacing.md }]}>
            {renderQuickAction('add', 'New Invoice', Palette.primary, () => navigation.navigate('Orders', { screen: 'InvoiceCreator' }))}
            {renderQuickAction('cube', 'Add Product', Palette.success, () => navigation.navigate('Inventory'))}
            {!isMobile && renderQuickAction('wallet', 'Record Expense', Palette.warning, () => {})}
            {!isMobile && renderQuickAction('person-add', 'Add Customer', Palette.secondary, () => navigation.navigate('Customers'))}
          </View>
        </View>

        {/* Row 1: KPI Cards */}
        <View style={[styles.row, { flexWrap: 'wrap' }]}>
          <View style={[styles.col, isMobile ? { width: '100%' } : { flex: 1 }]}>
            <StatCard
              label={kpiToday?.label || "Today's Sales"}
              value={kpiToday ? TaxCalculator.formatCurrency(kpiToday.value, currency) : '-'}
              changePercent={kpiToday?.changePercent || 0}
              trend={kpiToday?.trend || 'STABLE'}
              accentColor={Palette.primary}
              icon={<Ionicons name="cart" size={16} color={Palette.primary} />}
            />
          </View>
          <View style={[styles.col, isMobile ? { width: '100%' } : { flex: 1 }]}>
            <StatCard
              label={kpiWeek?.label || "Weekly Revenue"}
              value={kpiWeek ? TaxCalculator.formatCurrency(kpiWeek.value, currency) : '-'}
              changePercent={kpiWeek?.changePercent || 0}
              trend={kpiWeek?.trend || 'STABLE'}
              accentColor={Palette.success}
              icon={<Ionicons name="trending-up" size={16} color={Palette.success} />}
            />
          </View>
          <View style={[styles.col, isMobile ? { width: '100%' } : { flex: 1 }]}>
             <StatCard
              label="Pending Payments"
              value={TaxCalculator.formatCurrency(dues, currency)}
              subLabel="Needs collection"
              accentColor={Palette.error}
              icon={<Ionicons name="time" size={16} color={Palette.error} />}
            />
          </View>
          <View style={[styles.col, isMobile ? { width: '100%' } : { flex: 1 }]}>
             <StatCard
              label="Total Customers"
              value={customersCount.toString()}
              subLabel="Active clients"
              accentColor={Palette.secondary}
              icon={<Ionicons name="people" size={16} color={Palette.secondary} />}
            />
          </View>
        </View>

        {/* Row 2: Analytics & Health */}
        <View style={[styles.row, isMobile && { flexDirection: 'column' }]}>
          <View style={[styles.col, isMobile ? { width: '100%' } : { flex: 7 }]}>
            <GlassCard padding={Spacing.lg}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md }}>
                <Text style={[Typography.h4, { color: Palette.text }]}>Revenue Analytics</Text>
                <TouchableOpacity><Text style={{ color: Palette.primary }}>View Report</Text></TouchableOpacity>
              </View>
              <DashboardChart data={chartData} />
            </GlassCard>
          </View>
          <View style={[styles.col, isMobile ? { width: '100%' } : { flex: 3 }]}>
             <GlassCard padding={Spacing.lg} style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
                  <Ionicons name="sparkles" size={20} color={Palette.primary} style={{ marginRight: Spacing.sm }} />
                  <Text style={[Typography.h4, { color: Palette.text }]}>AI Business Health</Text>
                </View>
                <View style={{ alignItems: 'center', marginVertical: Spacing.xl }}>
                  {/* Pseudo Circular Progress */}
                  <View style={[styles.healthCircle, { borderColor: healthScore > 70 ? Palette.success : Palette.warning }]}>
                    <Text style={[Typography.display, { color: Palette.text }]}>{healthScore}</Text>
                    <Text style={[Typography.caption, { color: Palette.textMuted }]}>Out of 100</Text>
                  </View>
                </View>
                <Text style={[Typography.body, { color: Palette.textMuted, textAlign: 'center' }]}>
                  {healthScore > 80 ? "Excellent cash flow and growing revenue." :
                   healthScore > 50 ? "Steady performance. Collect dues to improve." :
                   "Attention needed. Review expenses."}
                </Text>
             </GlassCard>
          </View>
        </View>

        {/* Row 3: Invoices & Products */}
        <View style={[styles.row, isMobile && { flexDirection: 'column' }]}>
          <View style={[styles.col, isMobile ? { width: '100%' } : { flex: 6 }]}>
            <GlassCard padding={0}>
              <View style={{ padding: Spacing.lg, flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Palette.border }}>
                <Text style={[Typography.h4, { color: Palette.text }]}>Recent Invoices</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Orders')}><Text style={{ color: Palette.primary }}>See All</Text></TouchableOpacity>
              </View>
              {recentInvoices.map((inv, index) => (
                <TouchableOpacity 
                  key={inv.id}
                  style={[styles.invoiceRow, index < recentInvoices.length - 1 && { borderBottomWidth: 1, borderBottomColor: Palette.divider }]}
                >
                  <View style={styles.invoiceAvatar}>
                    <Text style={{ color: Palette.primary, fontWeight: 'bold' }}>{inv.customerName?.charAt(0) || 'W'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.bodySemibold, { color: Palette.text }]} numberOfLines={1}>{inv.customerName}</Text>
                    <Text style={[Typography.caption, { color: Palette.textMuted }]}>{inv.number}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[Typography.bodySemibold, { color: Palette.text }]}>{TaxCalculator.formatCurrency(inv.totalAmount, currency)}</Text>
                    <InvoiceStatusBadge status={inv.status} />
                  </View>
                </TouchableOpacity>
              ))}
              {recentInvoices.length === 0 && (
                <View style={{ padding: Spacing.xl, alignItems: 'center' }}><Text style={{ color: Palette.textMuted }}>No recent invoices</Text></View>
              )}
            </GlassCard>
          </View>
          <View style={[styles.col, isMobile ? { width: '100%' } : { flex: 4 }]}>
             <GlassCard padding={Spacing.lg}>
                <Text style={[Typography.h4, { color: Palette.text, marginBottom: Spacing.md }]}>Top Selling Products</Text>
                <View style={{ paddingVertical: Spacing.xl, alignItems: 'center', opacity: 0.5 }}>
                  <Ionicons name="cube-outline" size={48} color={Palette.textMuted} />
                  <Text style={[Typography.body, { color: Palette.textMuted, marginTop: Spacing.sm }]}>No data available yet</Text>
                </View>
             </GlassCard>
          </View>
        </View>

        {/* Row 4: Expenses & Inventory */}
        <View style={[styles.row, isMobile && { flexDirection: 'column' }]}>
           <View style={[styles.col, isMobile ? { width: '100%' } : { flex: 1 }]}>
             <GlassCard padding={Spacing.lg}>
                <Text style={[Typography.h4, { color: Palette.text, marginBottom: Spacing.md }]}>Expense Overview</Text>
                <View style={{ height: 150, alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.backgroundAlt, borderRadius: Radius.md }}>
                   <Text style={{ color: Palette.textMuted }}>Chart Placeholder</Text>
                </View>
             </GlassCard>
           </View>
           <View style={[styles.col, isMobile ? { width: '100%' } : { flex: 1 }]}>
             <GlassCard padding={Spacing.lg}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md }}>
                  <Text style={[Typography.h4, { color: Palette.text }]}>Low Stock Alerts</Text>
                  <View style={{ backgroundColor: Palette.errorBg, paddingHorizontal: 8, borderRadius: 12 }}>
                    <Text style={{ color: Palette.error, fontSize: 12, fontWeight: 'bold' }}>2 Items</Text>
                  </View>
                </View>
                {/* Mock Low stock */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Palette.border }}>
                   <Text style={[Typography.body, { color: Palette.text }]}>Premium Widget</Text>
                   <Text style={[Typography.bodySemibold, { color: Palette.error }]}>4 left</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm }}>
                   <Text style={[Typography.body, { color: Palette.text }]}>Basic License</Text>
                   <Text style={[Typography.bodySemibold, { color: Palette.error }]}>1 left</Text>
                </View>
             </GlassCard>
           </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: Spacing.xl,
  },
  actionToolbar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
    paddingRight: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  actionIcon: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -Spacing.sm,
    marginBottom: Spacing.lg,
  },
  col: {
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  healthCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  invoiceAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(79, 99, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
