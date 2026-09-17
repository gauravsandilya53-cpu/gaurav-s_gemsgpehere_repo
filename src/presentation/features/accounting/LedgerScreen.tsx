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
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { LedgerEntry, ProfitLossSummary } from '../../../domain/entities/accounting';
import { LedgerRepository } from '../../../data/repositories/LedgerRepository';
import { TaxCalculator } from '../../../core/utils/tax-calculator';
import { Ionicons } from '@expo/vector-icons';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { GlassCard } from '../../components/ui/GlassCard';

export const LedgerScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<ProfitLossSummary | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allEntries = await LedgerRepository.getAll();
    const plSummary = await LedgerRepository.getProfitLoss('USD');
    setEntries(allEntries);
    setSummary(plSummary);
  };

  const renderEntry = ({ item }: { item: LedgerEntry }) => (
    <GlassCard padding={Spacing.md} style={{ marginBottom: Spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.iconContainer, { backgroundColor: item.type === 'INCOME' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
            <Ionicons name={item.type === 'INCOME' ? 'arrow-down' : 'arrow-up'} size={20} color={item.type === 'INCOME' ? Palette.success : Palette.error} />
          </View>
          <View style={{ marginLeft: Spacing.md, flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]}>{item.category}</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            {item.description ? <Text style={[Typography.caption, { color: Palette.text, marginTop: 2 }]} numberOfLines={1}>{item.description}</Text> : null}
          </View>
        </View>
        <Text
          style={[
            Typography.bodySemibold,
            { color: item.type === 'INCOME' ? Palette.success : Palette.error },
          ]}
        >
          {item.type === 'INCOME' ? '+' : '-'}{TaxCalculator.formatCurrency(item.amount, item.currency)}
        </Text>
      </View>
    </GlassCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: Palette.background }]}>
      <GradientHeader 
        title="Accounting Ledger"
        subtitle="Track income and expenses"
        onLeftPress={() => navigation?.goBack?.()} 
      />

      {summary && (
        <View style={{ padding: Spacing.lg }}>
          <GlassCard padding={Spacing.lg} style={{ marginBottom: Spacing.md, alignItems: 'center' }}>
            <Text style={[Typography.caption, { color: Palette.textMuted, textTransform: 'uppercase' }]}>Net Profit</Text>
            <Text style={[Typography.h2, { color: summary.netProfit >= 0 ? Palette.success : Palette.error, marginTop: Spacing.xs }]}>
              {TaxCalculator.formatCurrency(summary.netProfit, summary.currency)}
            </Text>
          </GlassCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <GlassCard padding={Spacing.md} style={{ flex: 0.48, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
                <Ionicons name="arrow-down-circle" size={16} color={Palette.success} style={{ marginRight: 4 }} />
                <Text style={[Typography.caption, { color: Palette.success, fontWeight: 'bold' }]}>Income</Text>
              </View>
              <Text style={[Typography.h4, { color: Palette.success }]}>
                {TaxCalculator.formatCurrency(summary.totalIncome, summary.currency)}
              </Text>
            </GlassCard>
            <GlassCard padding={Spacing.md} style={{ flex: 0.48, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs }}>
                <Ionicons name="arrow-up-circle" size={16} color={Palette.error} style={{ marginRight: 4 }} />
                <Text style={[Typography.caption, { color: Palette.error, fontWeight: 'bold' }]}>Expenses</Text>
              </View>
              <Text style={[Typography.h4, { color: Palette.error }]}>
                {TaxCalculator.formatCurrency(summary.totalExpenses, summary.currency)}
              </Text>
            </GlassCard>
          </View>
        </View>
      )}

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl }}
        ListHeaderComponent={
          <Text style={[Typography.h4, { color: Palette.text, marginBottom: Spacing.md }]}>
            Transactions
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
