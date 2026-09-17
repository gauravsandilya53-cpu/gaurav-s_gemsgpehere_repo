/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * ReportDashboardScreen — Reports & Analytics Accounting Dashboard with full Dark Mode support.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../../core/theme';
import { useTheme } from '../../../core/theme/ThemeContext';
import { AnalyticsService } from '../../../data/services/AnalyticsService';
import { InteractiveReportChart } from '../../components/InteractiveReportChart';
import { ReportExportService } from '../../../core/services/ReportExportService';

type FilterType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'CUSTOM';

export const ReportDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { Palette } = theme;

  const [filter, setFilter] = useState<FilterType>('THIS_MONTH');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any>(null);

  const screenWidth = Dimensions.get('window').width;
  const isDesktop = screenWidth >= 1024;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  useEffect(() => {
    loadReport();
  }, [filter]);

  const loadReport = async () => {
    setLoading(true);
    setError(false);
    try {
      let cStart: Date | undefined;
      let cEnd: Date | undefined;

      if (filter === 'CUSTOM') {
        if (customStart) cStart = new Date(customStart);
        if (customEnd) cEnd = new Date(customEnd);
      }

      const data = await AnalyticsService.getComprehensiveReportData(filter, cStart, cEnd);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load report data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = () => {
    navigation.navigate('Orders');
  };

  const handleExportPDF = () => {
    if (reportData) {
      ReportExportService.exportPDF(reportData);
    }
  };

  const handleExportCSV = () => {
    if (reportData) {
      ReportExportService.exportCSV(reportData);
    }
  };

  const renderFilterChips = () => {
    const filters: { id: FilterType; label: string }[] = [
      { id: 'TODAY', label: 'Today' },
      { id: 'THIS_WEEK', label: 'This Week' },
      { id: 'THIS_MONTH', label: 'This Month' },
      { id: 'LAST_MONTH', label: 'Last Month' },
      { id: 'THIS_YEAR', label: 'This Year' },
      { id: 'CUSTOM', label: 'Custom Range' },
    ];

    return (
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filters.map((f) => {
            const isActive = filter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterChip,
                  { backgroundColor: isActive ? Palette.primary : Palette.surface, borderColor: isActive ? Palette.primary : Palette.border },
                ]}
                onPress={() => setFilter(f.id)}
              >
                <Text style={[styles.filterChipText, { color: isActive ? '#FFFFFF' : Palette.textSecondary }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filter === 'CUSTOM' && (
          <View style={styles.customDateRow}>
            <TextInput
              style={[styles.dateInput, { backgroundColor: Palette.surface, color: Palette.text, borderColor: Palette.border }]}
              placeholder="YYYY-MM-DD (Start)"
              placeholderTextColor={Palette.textMuted}
              value={customStart}
              onChangeText={setCustomStart}
            />
            <Text style={{ color: Palette.textMuted, alignSelf: 'center' }}>to</Text>
            <TextInput
              style={[styles.dateInput, { backgroundColor: Palette.surface, color: Palette.text, borderColor: Palette.border }]}
              placeholder="YYYY-MM-DD (End)"
              placeholderTextColor={Palette.textMuted}
              value={customEnd}
              onChangeText={setCustomEnd}
            />
            <TouchableOpacity style={[styles.applyBtn, { backgroundColor: Palette.primary }]} onPress={loadReport}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Palette.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Palette.error} />
          <Text style={[styles.errorTitle, { color: Palette.text }]}>Unable to load report data.</Text>
          <Text style={[styles.errorSubtitle, { color: Palette.textMuted }]}>
            An unexpected error occurred while processing analytics queries.
          </Text>
          <TouchableOpacity style={[styles.retryBtn, { backgroundColor: Palette.primary }]} onPress={loadReport}>
            <Ionicons name="refresh-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const kpis = reportData?.kpis;
  const fmt = AnalyticsService.formatIndianCurrency;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Palette.background }]}>
      {/* Header Bar */}
      <View style={[styles.header, { backgroundColor: Palette.surface, borderBottomColor: Palette.border }]}>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.title, { color: Palette.text }]}>Reports & Analytics</Text>
          <Text style={[styles.subtitle, { color: Palette.textMuted }]}>Track your business performance and financial activity.</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.iconActionBtn, { backgroundColor: Palette.background, borderColor: Palette.border }]} onPress={loadReport}>
            <Ionicons name="refresh-outline" size={18} color={Palette.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.exportBtn, { backgroundColor: Palette.primary }]} onPress={handleExportPDF}>
            <Ionicons name="document-text-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.exportBtnText}>Export PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.exportBtn, { backgroundColor: Palette.success }]} onPress={handleExportCSV}>
            <Ionicons name="download-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.exportBtnText}>Export CSV</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Filter Bar */}
        {renderFilterChips()}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.primary} />
            <Text style={[styles.loadingText, { color: Palette.textMuted }]}>Calculating financial analytics...</Text>
          </View>
        ) : (
          <>
            {/* 4 Primary KPI Cards in ONE Row (Desktop) / 2x2 (Tablet) / 1 (Mobile) */}
            <View
              style={[
                styles.kpiRow,
                isDesktop ? styles.kpiRowDesktop : isTablet ? styles.kpiRowTablet : styles.kpiRowMobile,
              ]}
            >
              {/* Card 1: Total Revenue */}
              <View style={[styles.kpiCard, { backgroundColor: Palette.surface, borderColor: Palette.border }]}>
                <View style={styles.kpiCardHeader}>
                  <Text style={[styles.kpiLabel, { color: Palette.textMuted }]}>TOTAL REVENUE</Text>
                  <View style={[styles.kpiIconBg, { backgroundColor: `${Palette.primary}15` }]}>
                    <Ionicons name="wallet-outline" size={18} color={Palette.primary} />
                  </View>
                </View>
                <Text style={[styles.kpiValue, { color: Palette.text }]}>{fmt(kpis?.totalRevenue)}</Text>
                <View style={styles.trendRow}>
                  <Ionicons
                    name={kpis?.trend === 'UP' ? 'arrow-up' : 'arrow-down'}
                    size={12}
                    color={kpis?.trend === 'UP' ? Palette.success : Palette.error}
                  />
                  <Text style={[styles.trendText, { color: kpis?.trend === 'UP' ? Palette.success : Palette.error }]}>
                    {Math.abs(kpis?.revenueChangePercent || 0)}%
                  </Text>
                  <Text style={[styles.trendPeriod, { color: Palette.textMuted }]}> vs prev period</Text>
                </View>
              </View>

              {/* Card 2: Total Expenses */}
              <View style={[styles.kpiCard, { backgroundColor: Palette.surface, borderColor: Palette.border }]}>
                <View style={styles.kpiCardHeader}>
                  <Text style={[styles.kpiLabel, { color: Palette.textMuted }]}>TOTAL EXPENSES</Text>
                  <View style={[styles.kpiIconBg, { backgroundColor: `${Palette.warning}15` }]}>
                    <Ionicons name="card-outline" size={18} color={Palette.warning} />
                  </View>
                </View>
                <Text style={[styles.kpiValue, { color: Palette.text }]}>{fmt(kpis?.totalExpenses)}</Text>
                <Text style={[styles.kpiSubinfo, { color: Palette.textMuted }]}>Recorded ledger expenditures</Text>
              </View>

              {/* Card 3: Net Profit */}
              <View style={[styles.kpiCard, { backgroundColor: Palette.surface, borderColor: Palette.border }]}>
                <View style={styles.kpiCardHeader}>
                  <Text style={[styles.kpiLabel, { color: Palette.textMuted }]}>NET PROFIT</Text>
                  <View style={[styles.kpiIconBg, { backgroundColor: `${Palette.success}15` }]}>
                    <Ionicons name="trending-up-outline" size={18} color={Palette.success} />
                  </View>
                </View>
                <Text style={[styles.kpiValue, { color: (kpis?.netProfit || 0) >= 0 ? Palette.success : Palette.error }]}>
                  {fmt(kpis?.netProfit)}
                </Text>
                <Text style={[styles.kpiSubinfo, { color: Palette.textMuted }]}>Profit Margin: {kpis?.profitMargin || 0}%</Text>
              </View>

              {/* Card 4: Total Invoices */}
              <View style={[styles.kpiCard, { backgroundColor: Palette.surface, borderColor: Palette.border }]}>
                <View style={styles.kpiCardHeader}>
                  <Text style={[styles.kpiLabel, { color: Palette.textMuted }]}>TOTAL INVOICES</Text>
                  <View style={[styles.kpiIconBg, { backgroundColor: `${Palette.secondary}15` }]}>
                    <Ionicons name="document-text-outline" size={18} color={Palette.secondary} />
                  </View>
                </View>
                <Text style={[styles.kpiValue, { color: Palette.text }]}>{kpis?.totalInvoices || 0}</Text>
                <Text style={[styles.kpiSubinfo, { color: Palette.textMuted }]}>
                  {kpis?.paidInvoicesCount || 0} Paid • {kpis?.pendingInvoicesCount || 0} Pending • {kpis?.overdueInvoicesCount || 0} Overdue
                </Text>
              </View>
            </View>

            {/* Interactive Trend Chart */}
            <InteractiveReportChart
              data={reportData?.trendPoints || []}
              onCreateInvoice={handleCreateInvoice}
            />

            {/* Two-Column Grid: Sales Summary & Payment Status */}
            <View style={isDesktop ? styles.twoColRow : styles.oneColRow}>
              {/* Sales Summary Card */}
              <View style={[styles.cardBlock, { backgroundColor: Palette.surface, borderColor: Palette.border }, isDesktop && { flex: 1 }]}>
                <View style={styles.cardBlockHeader}>
                  <Ionicons name="pie-chart-outline" size={18} color={Palette.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.cardBlockTitle, { color: Palette.text }]}>Sales Summary</Text>
                </View>

                <View style={styles.summaryGrid}>
                  <View style={[styles.summaryItem, { backgroundColor: Palette.background, borderColor: Palette.border }]}>
                    <Text style={[styles.summaryLabel, { color: Palette.textMuted }]}>Total Sales</Text>
                    <Text style={[styles.summaryVal, { color: Palette.text }]}>{fmt(reportData?.salesSummary?.totalSales)}</Text>
                  </View>
                  <View style={[styles.summaryItem, { backgroundColor: Palette.background, borderColor: Palette.border }]}>
                    <Text style={[styles.summaryLabel, { color: Palette.success }]}>Paid</Text>
                    <Text style={[styles.summaryVal, { color: Palette.success }]}>{fmt(reportData?.salesSummary?.paid)}</Text>
                  </View>
                  <View style={[styles.summaryItem, { backgroundColor: Palette.background, borderColor: Palette.border }]}>
                    <Text style={[styles.summaryLabel, { color: Palette.warning }]}>Pending</Text>
                    <Text style={[styles.summaryVal, { color: Palette.warning }]}>{fmt(reportData?.salesSummary?.pending)}</Text>
                  </View>
                  <View style={[styles.summaryItem, { backgroundColor: Palette.background, borderColor: Palette.border }]}>
                    <Text style={[styles.summaryLabel, { color: Palette.error }]}>Overdue</Text>
                    <Text style={[styles.summaryVal, { color: Palette.error }]}>{fmt(reportData?.salesSummary?.overdue)}</Text>
                  </View>
                </View>
              </View>

              {/* Payment Status Visualization */}
              <View style={[styles.cardBlock, { backgroundColor: Palette.surface, borderColor: Palette.border }, isDesktop && { flex: 1 }]}>
                <View style={styles.cardBlockHeader}>
                  <Ionicons name="checkmark-done-circle-outline" size={18} color={Palette.success} style={{ marginRight: 8 }} />
                  <Text style={[styles.cardBlockTitle, { color: Palette.text }]}>Payment Status</Text>
                </View>

                <View style={styles.paymentStatusList}>
                  {/* Paid */}
                  <View style={styles.statusRow}>
                    <View style={styles.statusInfo}>
                      <Text style={[styles.statusName, { color: Palette.textSecondary }]}>Paid ({reportData?.paymentStatus?.paid?.count || 0})</Text>
                      <Text style={[styles.statusAmt, { color: Palette.text }]}>{fmt(reportData?.paymentStatus?.paid?.amount)}</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: Palette.border }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            backgroundColor: Palette.success,
                            width: `${
                              (reportData?.salesSummary?.totalSales || 0) > 0
                                ? Math.min(
                                    100,
                                    ((reportData?.paymentStatus?.paid?.amount || 0) /
                                      reportData.salesSummary.totalSales) *
                                      100
                                  )
                                : 0
                            }%`,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Unpaid */}
                  <View style={styles.statusRow}>
                    <View style={styles.statusInfo}>
                      <Text style={[styles.statusName, { color: Palette.textSecondary }]}>Unpaid ({reportData?.paymentStatus?.unpaid?.count || 0})</Text>
                      <Text style={[styles.statusAmt, { color: Palette.text }]}>{fmt(reportData?.paymentStatus?.unpaid?.amount)}</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: Palette.border }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            backgroundColor: Palette.textMuted,
                            width: `${
                              (reportData?.salesSummary?.totalSales || 0) > 0
                                ? Math.min(
                                    100,
                                    ((reportData?.paymentStatus?.unpaid?.amount || 0) /
                                      reportData.salesSummary.totalSales) *
                                      100
                                  )
                                : 0
                            }%`,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Partially Paid */}
                  <View style={styles.statusRow}>
                    <View style={styles.statusInfo}>
                      <Text style={[styles.statusName, { color: Palette.textSecondary }]}>
                        Partially Paid ({reportData?.paymentStatus?.partiallyPaid?.count || 0})
                      </Text>
                      <Text style={[styles.statusAmt, { color: Palette.text }]}>{fmt(reportData?.paymentStatus?.partiallyPaid?.amount)}</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: Palette.border }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            backgroundColor: Palette.warning,
                            width: `${
                              (reportData?.salesSummary?.totalSales || 0) > 0
                                ? Math.min(
                                    100,
                                    ((reportData?.paymentStatus?.partiallyPaid?.amount || 0) /
                                      reportData.salesSummary.totalSales) *
                                      100
                                  )
                                : 0
                            }%`,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Overdue */}
                  <View style={styles.statusRow}>
                    <View style={styles.statusInfo}>
                      <Text style={[styles.statusName, { color: Palette.textSecondary }]}>Overdue ({reportData?.paymentStatus?.overdue?.count || 0})</Text>
                      <Text style={[styles.statusAmt, { color: Palette.text }]}>{fmt(reportData?.paymentStatus?.overdue?.amount)}</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: Palette.border }]}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            backgroundColor: Palette.error,
                            width: `${
                              (reportData?.salesSummary?.totalSales || 0) > 0
                                ? Math.min(
                                    100,
                                    ((reportData?.paymentStatus?.overdue?.amount || 0) /
                                      reportData.salesSummary.totalSales) *
                                      100
                                  )
                                : 0
                            }%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Expense Breakdown Card */}
            <View style={[styles.cardBlock, { backgroundColor: Palette.surface, borderColor: Palette.border }]}>
              <View style={styles.cardBlockHeader}>
                <Ionicons name="list-outline" size={18} color={Palette.warning} style={{ marginRight: 8 }} />
                <Text style={[styles.cardBlockTitle, { color: Palette.text }]}>Expense Breakdown</Text>
              </View>

              {reportData?.expenseBreakdown && reportData.expenseBreakdown.length > 0 ? (
                <View style={{ gap: 12 }}>
                  {reportData.expenseBreakdown.map((exp: any, index: number) => (
                    <View key={index} style={styles.expenseRow}>
                      <View style={styles.expenseHeader}>
                        <Text style={[styles.expenseCat, { color: Palette.textSecondary }]}>{exp.category}</Text>
                        <Text style={[styles.expenseVal, { color: Palette.text }]}>
                          {fmt(exp.amount)} ({exp.percentage}%)
                        </Text>
                      </View>
                      <View style={[styles.progressBarBg, { backgroundColor: Palette.border }]}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { backgroundColor: Palette.warning, width: `${exp.percentage}%` },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyInlineBlock}>
                  <Text style={[styles.emptyInlineText, { color: Palette.textMuted }]}>No expense records found for this period.</Text>
                </View>
              )}
            </View>

            {/* Two-Column Grid: Top Customers & Top Products */}
            <View style={isDesktop ? styles.twoColRow : styles.oneColRow}>
              {/* Top Customers Table */}
              <View style={[styles.cardBlock, { backgroundColor: Palette.surface, borderColor: Palette.border }, isDesktop && { flex: 1 }]}>
                <View style={styles.cardBlockHeader}>
                  <Ionicons name="people-outline" size={18} color={Palette.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.cardBlockTitle, { color: Palette.text }]}>Top Customers</Text>
                </View>

                {reportData?.topCustomers && reportData.topCustomers.length > 0 ? (
                  <View style={[styles.table, { borderColor: Palette.border }]}>
                    <View style={[styles.tableHeaderRow, { backgroundColor: Palette.background, borderBottomColor: Palette.border }]}>
                      <Text style={[styles.th, { color: Palette.textMuted, flex: 2 }]}>Customer</Text>
                      <Text style={[styles.th, { color: Palette.textMuted, flex: 1, textAlign: 'center' }]}>Invoices</Text>
                      <Text style={[styles.th, { color: Palette.textMuted, flex: 1.5, textAlign: 'right' }]}>Total Sales</Text>
                    </View>
                    {reportData.topCustomers.map((c: any, idx: number) => (
                      <View key={idx} style={[styles.tableDataRow, { borderBottomColor: Palette.border }]}>
                        <Text style={[styles.td, { color: Palette.text, flex: 2, fontWeight: '600' }]} numberOfLines={1}>
                          {c.customerName}
                        </Text>
                        <Text style={[styles.td, { color: Palette.textSecondary, flex: 1, textAlign: 'center' }]}>{c.invoiceCount}</Text>
                        <Text style={[styles.td, { color: Palette.text, flex: 1.5, textAlign: 'right', fontWeight: '700' }]}>
                          {fmt(c.totalSales)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyInlineBlock}>
                    <Text style={[styles.emptyInlineText, { color: Palette.textMuted }]}>No customer transactions recorded.</Text>
                  </View>
                )}
              </View>

              {/* Top Products Table */}
              <View style={[styles.cardBlock, { backgroundColor: Palette.surface, borderColor: Palette.border }, isDesktop && { flex: 1 }]}>
                <View style={styles.cardBlockHeader}>
                  <Ionicons name="cube-outline" size={18} color={Palette.secondary} style={{ marginRight: 8 }} />
                  <Text style={[styles.cardBlockTitle, { color: Palette.text }]}>Top Products</Text>
                </View>

                {reportData?.topProducts && reportData.topProducts.length > 0 ? (
                  <View style={[styles.table, { borderColor: Palette.border }]}>
                    <View style={[styles.tableHeaderRow, { backgroundColor: Palette.background, borderBottomColor: Palette.border }]}>
                      <Text style={[styles.th, { color: Palette.textMuted, flex: 2 }]}>Product</Text>
                      <Text style={[styles.th, { color: Palette.textMuted, flex: 1, textAlign: 'center' }]}>Qty Sold</Text>
                      <Text style={[styles.th, { color: Palette.textMuted, flex: 1.5, textAlign: 'right' }]}>Revenue</Text>
                    </View>
                    {reportData.topProducts.map((p: any, idx: number) => (
                      <View key={idx} style={[styles.tableDataRow, { borderBottomColor: Palette.border }]}>
                        <Text style={[styles.td, { color: Palette.text, flex: 2, fontWeight: '600' }]} numberOfLines={1}>
                          {p.productName}
                        </Text>
                        <Text style={[styles.td, { color: Palette.textSecondary, flex: 1, textAlign: 'center' }]}>{p.quantitySold}</Text>
                        <Text style={[styles.td, { color: Palette.text, flex: 1.5, textAlign: 'right', fontWeight: '700' }]}>
                          {fmt(p.revenue)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyInlineBlock}>
                    <Text style={[styles.emptyInlineText, { color: Palette.textMuted }]}>No product sales recorded.</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexWrap: 'wrap',
    gap: 12,
  },
  headerTitleWrap: {
    flex: 1,
    minWidth: 220,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  customDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
  },
  applyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  errorSubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  kpiRow: {
    gap: 12,
    marginBottom: 20,
  },
  kpiRowDesktop: {
    flexDirection: 'row',
  },
  kpiRowTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  kpiRowMobile: {
    flexDirection: 'column',
  },
  kpiCard: {
    flex: 1,
    minWidth: 200,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  kpiCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  kpiIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 2,
  },
  trendPeriod: {
    fontSize: 11,
  },
  kpiSubinfo: {
    fontSize: 11,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 16,
  },
  oneColRow: {
    flexDirection: 'column',
  },
  cardBlock: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardBlockTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryItem: {
    width: '48%',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  paymentStatusList: {
    gap: 12,
  },
  statusRow: {
    gap: 4,
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusName: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusAmt: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  expenseRow: {
    gap: 4,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expenseCat: {
    fontSize: 13,
    fontWeight: '600',
  },
  expenseVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyInlineBlock: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyInlineText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  table: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableDataRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  td: {
    fontSize: 12,
  },
});
