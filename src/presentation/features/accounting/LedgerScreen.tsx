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
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Theme } from '../../../core/theme';
import { LedgerEntry, ProfitLossSummary } from '../../../domain/entities/accounting';
import { LedgerRepository } from '../../../data/repositories/LedgerRepository';
import { TaxCalculator } from '../../../core/utils/tax-calculator';

export const LedgerScreen = () => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<ProfitLossSummary | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allEntries = LedgerRepository.getAll();
    const plSummary = LedgerRepository.getProfitLoss('USD');
    setEntries(allEntries);
    setSummary(plSummary);
  };

  const renderEntry = ({ item }: { item: LedgerEntry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryInfo}>
        <Text style={styles.categoryText}>{item.category}</Text>
        <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.descriptionText}>{item.description}</Text>
      </View>
      <Text
        style={[
          styles.amountText,
          { color: item.type === 'INCOME' ? Theme.Palette.success : Theme.Palette.error },
        ]}
      >
        {item.type === 'INCOME' ? '+' : '-'}{TaxCalculator.formatCurrency(item.amount, item.currency)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Accounting Ledger</Text>
      </View>

      {summary && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Net Profit</Text>
            <Text style={[styles.summaryValue, { color: summary.netProfit >= 0 ? Theme.Palette.success : Theme.Palette.error }]}>
              {TaxCalculator.formatCurrency(summary.netProfit, summary.currency)}
            </Text>
          </View>
          <View style={styles.row}>
            <View style={[styles.miniCard, { backgroundColor: '#DCFCE7' }]}>
              <Text style={styles.miniLabel}>Income</Text>
              <Text style={[styles.miniValue, { color: Theme.Palette.success }]}>
                {TaxCalculator.formatCurrency(summary.totalIncome, summary.currency)}
              </Text>
            </View>
            <View style={[styles.miniCard, { backgroundColor: '#FEE2E2' }]}>
              <Text style={styles.miniLabel}>Expenses</Text>
              <Text style={[styles.miniValue, { color: Theme.Palette.error }]}>
                {TaxCalculator.formatCurrency(summary.totalExpenses, summary.currency)}
              </Text>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Transactions</Text>}
      />
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
  summaryContainer: {
    padding: Theme.Spacing.md,
  },
  summaryCard: {
    backgroundColor: Theme.Palette.surface,
    padding: Theme.Spacing.lg,
    borderRadius: Theme.Spacing.sm,
    alignItems: 'center',
    marginBottom: Theme.Spacing.md,
    elevation: 2,
  },
  summaryLabel: {
    ...Theme.Typography.caption,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: Theme.Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniCard: {
    flex: 0.48,
    padding: Theme.Spacing.md,
    borderRadius: Theme.Spacing.sm,
  },
  miniLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Theme.Palette.textMuted,
  },
  miniValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: Theme.Spacing.md,
  },
  sectionTitle: {
    ...Theme.Typography.h2,
    fontSize: 18,
    marginBottom: Theme.Spacing.md,
  },
  entryCard: {
    backgroundColor: Theme.Palette.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.Spacing.md,
    borderRadius: Theme.Spacing.sm,
    marginBottom: Theme.Spacing.sm,
  },
  entryInfo: {
    flex: 1,
  },
  categoryText: {
    ...Theme.Typography.body,
    fontWeight: 'bold',
  },
  dateText: {
    ...Theme.Typography.caption,
    marginBottom: 2,
  },
  descriptionText: {
    ...Theme.Typography.caption,
    color: Theme.Palette.text,
  },
  amountText: {
    ...Theme.Typography.body,
    fontWeight: 'bold',
  },
});




