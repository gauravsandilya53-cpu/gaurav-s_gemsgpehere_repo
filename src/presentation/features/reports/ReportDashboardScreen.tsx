/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Theme } from '../../../core/theme';
import { AnalyticsService, KPICardData } from '../../../data/services/AnalyticsService';
import { DashboardChart } from '../../components/DashboardChart';
import { TaxCalculator } from '../../../core/utils/tax-calculator';

export const ReportDashboardScreen = () => {
  const [kpis, setKpis] = useState<KPICardData[]>([]);
  const [trends, setTrends] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const kpiData = await AnalyticsService.getMonthlyKPIs('USD');
    const trendData = await AnalyticsService.getRevenueTrends('USD');
    setKpis(kpiData);
    setTrends(trendData.reverse()); // Show old to new
  };

  const renderKPICard = (card: KPICardData, index: number) => (
    <View key={index} style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{card.label}</Text>
      <Text style={styles.kpiValue}>
        {TaxCalculator.formatCurrency(card.value, card.currency)}
      </Text>
      <View style={styles.trendRow}>
        <Text style={[styles.trendText, { color: card.trend === 'UP' ? Theme.Palette.success : Theme.Palette.error }]}>
          {card.trend === 'UP' ? 'â–²' : 'â–¼'} {Math.abs(card.changePercent).toFixed(1)}%
        </Text>
        <Text style={styles.trendPeriod}> vs last month</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>This Month's Performance</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.kpiContainer}>
          {kpis.map(renderKPICard)}
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Revenue Trends (Last 6 Months)</Text>
          <DashboardChart data={trends} />
        </View>

        <TouchableOpacity style={styles.exportButton} onPress={() => {}}>
          <Text style={styles.exportButtonText}>Export Monthly Report (PDF)</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.Palette.background,
  },
  header: {
    padding: Theme.Spacing.lg,
    backgroundColor: Theme.Palette.surface,
  },
  title: {
    ...Theme.Typography.h2,
  },
  subtitle: {
    ...Theme.Typography.caption,
    color: Theme.Palette.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: Theme.Spacing.md,
  },
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Theme.Spacing.lg,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: Theme.Palette.surface,
    padding: Theme.Spacing.md,
    borderRadius: Theme.Spacing.sm,
    marginBottom: Theme.Spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  kpiLabel: {
    ...Theme.Typography.caption,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  kpiValue: {
    ...Theme.Typography.h2,
    fontSize: 18,
    marginVertical: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  trendPeriod: {
    fontSize: 10,
    color: Theme.Palette.textMuted,
  },
  chartSection: {
    backgroundColor: Theme.Palette.surface,
    padding: Theme.Spacing.md,
    borderRadius: Theme.Spacing.sm,
    marginBottom: Theme.Spacing.lg,
  },
  sectionTitle: {
    ...Theme.Typography.body,
    fontWeight: 'bold',
    marginBottom: Theme.Spacing.sm,
  },
  exportButton: {
    backgroundColor: Theme.Palette.secondary,
    padding: Theme.Spacing.md,
    borderRadius: Theme.Spacing.sm,
    alignItems: 'center',
    marginBottom: Theme.Spacing.xl,
  },
  exportButtonText: {
    color: '#FFF',
    ...Theme.Typography.body,
    fontWeight: 'bold',
  },
});




