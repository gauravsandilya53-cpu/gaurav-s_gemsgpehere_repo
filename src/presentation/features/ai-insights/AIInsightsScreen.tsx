/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * AIInsightsScreen — AI-powered business intelligence & insights screen with full Dark Mode support.
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../core/theme/ThemeContext';
import { AnalyticsService } from '../../../data/services/AnalyticsService';
import { useAuthStore } from '../auth/store';

export const AIInsightsScreen = () => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const { currency } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [healthScore, setHealthScore] = useState(75);
  const [insights, setInsights] = useState<any[]>([]);
  const [kpiSummary, setKpiSummary] = useState<any>(null);

  const screenWidth = Dimensions.get('window').width;
  const isDesktop = screenWidth >= 1024;

  useEffect(() => {
    loadInsights();
  }, [currency]);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const score = await AnalyticsService.getBusinessHealthScore(currency);
      const monthlyData = await AnalyticsService.getComprehensiveReportData('THIS_MONTH');
      setHealthScore(score);
      setKpiSummary(monthlyData.kpis);

      // Generate dynamic smart insights based on real business data
      const generatedInsights: any[] = [];

      if (monthlyData.kpis.netProfit >= 0) {
        generatedInsights.push({
          id: '1',
          type: 'POSITIVE',
          icon: 'trending-up-outline',
          title: 'Strong Net Profitability',
          description: `Your net profit margin is currently ${monthlyData.kpis.profitMargin}%. Reinvesting capital into top-performing inventory could boost next month's sales by 12-15%.`,
          actionText: 'View Financial Report',
          category: 'PROFITABILITY',
        });
      } else {
        generatedInsights.push({
          id: '1',
          type: 'WARNING',
          icon: 'alert-circle-outline',
          title: 'Negative Cash Margin Detected',
          description: `Operating expenses currently exceed monthly revenue. Review recurring ledger expenditures to align cash outflows with collections.`,
          actionText: 'Review Expenses',
          category: 'CASH FLOW',
        });
      }

      if (monthlyData.salesSummary.overdue > 0) {
        generatedInsights.push({
          id: '2',
          type: 'WARNING',
          icon: 'time-outline',
          title: `Overdue Receivables (${AnalyticsService.formatIndianCurrency(monthlyData.salesSummary.overdue)})`,
          description: `You have ${monthlyData.paymentStatus.overdue.count} overdue invoice(s). Sending automated payment reminders can accelerate working capital turnaround by 40%.`,
          actionText: 'Send Reminders',
          category: 'RECEIVABLES',
        });
      } else {
        generatedInsights.push({
          id: '2',
          type: 'POSITIVE',
          icon: 'checkmark-circle-outline',
          title: 'Healthy Payment Collections',
          description: `Zero overdue invoices detected for this period. Customer payment reliability remains in the top 90th percentile.`,
          actionText: 'View Collections',
          category: 'RECEIVABLES',
        });
      }

      if (monthlyData.topProducts && monthlyData.topProducts.length > 0) {
        const topProd = monthlyData.topProducts[0];
        generatedInsights.push({
          id: '3',
          type: 'INFO',
          icon: 'sparkles-outline',
          title: `Top Revenue Driver: ${topProd.productName}`,
          description: `"${topProd.productName}" generated ${AnalyticsService.formatIndianCurrency(topProd.revenue)} with ${topProd.quantitySold} units sold. Consider bundling this item to cross-sell secondary products.`,
          actionText: 'Optimize Pricing',
          category: 'INVENTORY AI',
        });
      } else {
        generatedInsights.push({
          id: '3',
          type: 'INFO',
          icon: 'bulb-outline',
          title: 'Smart Product Optimization',
          description: 'Add more products and record billing transactions to enable AI inventory velocity predictions and demand forecasting.',
          actionText: 'Add Product',
          category: 'INVENTORY AI',
        });
      }

      setInsights(generatedInsights);
    } catch (err) {
      console.error('Failed to load AI Insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return Palette.success;
    if (score >= 50) return Palette.warning;
    return Palette.error;
  };

  const getBadgeStyle = (type: string) => {
    if (type === 'POSITIVE') return { bg: `${Palette.success}15`, color: Palette.success };
    if (type === 'WARNING') return { bg: `${Palette.warning}15`, color: Palette.warning };
    return { bg: `${Palette.primary}15`, color: Palette.primary };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Palette.background }]}>
      {/* Header Bar */}
      <View style={[styles.header, { backgroundColor: Palette.surface, borderBottomColor: Palette.border }]}>
        <View style={styles.headerTitleWrap}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="sparkles" size={22} color={Palette.primary} />
            <Text style={[styles.title, { color: Palette.text }]}>AI Insights & Intelligence</Text>
          </View>
          <Text style={[styles.subtitle, { color: Palette.textMuted }]}>
            Real-time financial health, anomaly detection, and automated recommendations.
          </Text>
        </View>

        <TouchableOpacity style={[styles.refreshBtn, { backgroundColor: Palette.background, borderColor: Palette.border }]} onPress={loadInsights}>
          <Ionicons name="refresh-outline" size={18} color={Palette.textSecondary} />
          <Text style={[styles.refreshBtnText, { color: Palette.textSecondary }]}>Refresh AI</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.primary} />
            <Text style={[styles.loadingText, { color: Palette.textMuted }]}>Analyzing business patterns with AI...</Text>
          </View>
        ) : (
          <>
            {/* Top Score & Health Hero Banner */}
            <View style={[styles.heroCard, { backgroundColor: Palette.surface, borderColor: Palette.border }]}>
              <View style={styles.heroLeft}>
                <View style={[styles.scoreBadge, { borderColor: getScoreColor(healthScore) }]}>
                  <Text style={[styles.scoreValue, { color: getScoreColor(healthScore) }]}>{healthScore}</Text>
                  <Text style={[styles.scoreLabel, { color: Palette.textMuted }]}>/ 100</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.heroTitle, { color: Palette.text }]}>Business Health Index</Text>
                  <Text style={[styles.heroSubtitle, { color: Palette.textMuted }]}>
                    {healthScore >= 80
                      ? 'Your business financial health is excellent. Cash flow and profit margins are optimized.'
                      : healthScore >= 50
                      ? 'Good performance with minor areas for working capital optimization.'
                      : 'Attention needed on overhead expenses and outstanding debt collections.'}
                  </Text>
                </View>
              </View>

              <View style={[styles.heroDivider, { backgroundColor: Palette.border }]} />

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatItem}>
                  <Text style={[styles.heroStatLabel, { color: Palette.textMuted }]}>REVENUE</Text>
                  <Text style={[styles.heroStatVal, { color: Palette.text }]}>
                    {AnalyticsService.formatIndianCurrency(kpiSummary?.totalRevenue)}
                  </Text>
                </View>
                <View style={styles.heroStatItem}>
                  <Text style={[styles.heroStatLabel, { color: Palette.textMuted }]}>NET PROFIT</Text>
                  <Text style={[styles.heroStatVal, { color: (kpiSummary?.netProfit || 0) >= 0 ? Palette.success : Palette.error }]}>
                    {AnalyticsService.formatIndianCurrency(kpiSummary?.netProfit)}
                  </Text>
                </View>
                <View style={styles.heroStatItem}>
                  <Text style={[styles.heroStatLabel, { color: Palette.textMuted }]}>PROFIT MARGIN</Text>
                  <Text style={[styles.heroStatVal, { color: Palette.primary }]}>
                    {kpiSummary?.profitMargin || 0}%
                  </Text>
                </View>
              </View>
            </View>

            {/* AI Insights Section Title */}
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={20} color={Palette.primary} />
              <Text style={[styles.sectionTitle, { color: Palette.text }]}>Smart Recommendations</Text>
            </View>

            {/* List of AI Insights Cards */}
            <View style={{ gap: 14 }}>
              {insights.map((item) => {
                const badge = getBadgeStyle(item.type);
                return (
                  <View key={item.id} style={[styles.insightCard, { backgroundColor: Palette.surface, borderColor: Palette.border }]}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconContainer, { backgroundColor: badge.bg }]}>
                        <Ionicons name={item.icon as any} size={20} color={badge.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={[styles.categoryTag, { color: badge.color }]}>{item.category}</Text>
                        </View>
                        <Text style={[styles.insightTitle, { color: Palette.text }]}>{item.title}</Text>
                      </View>
                    </View>

                    <Text style={[styles.insightDesc, { color: Palette.textSecondary }]}>
                      {item.description}
                    </Text>

                    <View style={[styles.cardFooter, { borderTopColor: Palette.border }]}>
                      <TouchableOpacity style={styles.actionBtn}>
                        <Text style={[styles.actionBtnText, { color: Palette.primary }]}>{item.actionText}</Text>
                        <Ionicons name="arrow-forward-outline" size={14} color={Palette.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
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
    minWidth: 240,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  heroCard: {
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scoreBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 10,
    marginTop: -2,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  heroDivider: {
    height: 1,
    marginVertical: 16,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroStatVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  insightCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  insightDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    borderTopWidth: 1,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
