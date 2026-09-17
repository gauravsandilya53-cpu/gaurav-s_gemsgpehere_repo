/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * InteractiveReportChart — Interactive multi-series financial trend chart with full Dark Mode support.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Svg, { Path, Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../core/theme/ThemeContext';
import { AnalyticsService } from '../../data/services/AnalyticsService';

export interface TrendPoint {
  label: string;
  revenue: number;
  expense: number;
  netProfit: number;
}

interface InteractiveReportChartProps {
  data: TrendPoint[];
  onCreateInvoice?: () => void;
}

export const InteractiveReportChart: React.FC<InteractiveReportChartProps> = ({
  data,
  onCreateInvoice,
}) => {
  const { theme } = useTheme();
  const { Palette } = theme;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;
  const chartWidth = Math.max(screenWidth - (isMobile ? 48 : 120), 300);
  const chartHeight = 220;
  const paddingBottom = 35;
  const paddingTop = 20;
  const paddingLeft = 45;
  const paddingRight = 20;

  const drawableWidth = chartWidth - paddingLeft - paddingRight;
  const drawableHeight = chartHeight - paddingTop - paddingBottom;

  const hasData = data && data.length > 0 && data.some((d) => d.revenue > 0 || d.expense > 0);

  if (!hasData) {
    return (
      <View style={[styles.card, { backgroundColor: Palette.surface, borderColor: Palette.border }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: Palette.text }]}>Revenue & Expense Trends</Text>
            <Text style={[styles.subtitle, { color: Palette.textMuted }]}>Financial performance for the selected period</Text>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconBg, { backgroundColor: `${Palette.primary}15` }]}>
            <Ionicons name="bar-chart-outline" size={32} color={Palette.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: Palette.text }]}>No transactions available for this period</Text>
          <Text style={[styles.emptySubtitle, { color: Palette.textMuted }]}>
            Create your first invoice to start generating reports and financial trends.
          </Text>
          {onCreateInvoice && (
            <TouchableOpacity style={[styles.createInvoiceBtn, { backgroundColor: Palette.primary }]} onPress={onCreateInvoice}>
              <Ionicons name="add-circle-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.createInvoiceBtnText}>Create Invoice</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Calculate scales
  const maxVal = Math.max(
    ...data.flatMap((d) => [d.revenue, d.expense, Math.abs(d.netProfit)]),
    100
  );

  const getY = (val: number) => {
    const clamped = Math.max(0, val);
    return paddingTop + drawableHeight - (clamped / maxVal) * drawableHeight;
  };

  const getX = (index: number) => {
    if (data.length === 1) return paddingLeft + drawableWidth / 2;
    return paddingLeft + (index / (data.length - 1)) * drawableWidth;
  };

  // Generate SVG Path for line charts
  const revenuePath = data.reduce((acc, point, index) => {
    const x = getX(index);
    const y = getY(point.revenue);
    return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const expensePath = data.reduce((acc, point, index) => {
    const x = getX(index);
    const y = getY(point.expense);
    return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const profitPath = data.reduce((acc, point, index) => {
    const x = getX(index);
    const y = getY(point.netProfit);
    return index === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const activePoint = selectedIndex !== null && data[selectedIndex] ? data[selectedIndex] : null;

  return (
    <View style={[styles.card, { backgroundColor: Palette.surface, borderColor: Palette.border }]}>
      {/* Chart Title & Subtitle */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: Palette.text }]}>Revenue & Expense Trends</Text>
          <Text style={[styles.subtitle, { color: Palette.textMuted }]}>Financial performance for the selected period</Text>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Palette.primary }]} />
            <Text style={[styles.legendText, { color: Palette.textSecondary }]}>Revenue</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Palette.warning }]} />
            <Text style={[styles.legendText, { color: Palette.textSecondary }]}>Expenses</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Palette.success }]} />
            <Text style={[styles.legendText, { color: Palette.textSecondary }]}>Net Profit</Text>
          </View>
        </View>
      </View>

      {/* SVG Container */}
      <View style={styles.svgContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Y-Axis Grid Guidelines & Labels */}
          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
            const val = maxVal * (1 - ratio);
            const y = paddingTop + ratio * drawableHeight;
            return (
              <G key={idx}>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke={Palette.border}
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <SvgText
                  x={paddingLeft - 8}
                  y={y + 4}
                  fontSize="9"
                  fill={Palette.textMuted}
                  textAnchor="end"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}
                </SvgText>
              </G>
            );
          })}

          {/* Revenue Line */}
          <Path d={revenuePath} fill="none" stroke={Palette.primary} strokeWidth="3" />

          {/* Expense Line */}
          <Path d={expensePath} fill="none" stroke={Palette.warning} strokeWidth="2.5" strokeDasharray="3 3" />

          {/* Net Profit Line */}
          <Path d={profitPath} fill="none" stroke={Palette.success} strokeWidth="2" />

          {/* Interactive Data Points */}
          {data.map((point, index) => {
            const x = getX(index);
            const revY = getY(point.revenue);
            const isSelected = selectedIndex === index;

            return (
              <G key={index}>
                {/* Touch / Click Target */}
                <Circle
                  cx={x}
                  cy={revY}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? Palette.primary : Palette.surface}
                  stroke={Palette.primary}
                  strokeWidth="2"
                />

                {/* X-Axis Date Label */}
                <SvgText
                  x={x}
                  y={chartHeight - 8}
                  fontSize="10"
                  fill={isSelected ? Palette.primary : Palette.textMuted}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  {point.label.length > 5 ? point.label.substring(5) : point.label}
                </SvgText>
              </G>
            );
          })}
        </Svg>

        {/* Touch Overlay Buttons across points */}
        <View style={[StyleSheet.absoluteFill, { left: paddingLeft, width: drawableWidth }]}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            {data.map((point, index) => (
              <Pressable
                key={index}
                style={{ flex: 1 }}
                onPress={() => setSelectedIndex(index)}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Hover / Touch Interactive Tooltip */}
      {activePoint ? (
        <View style={[styles.tooltipBox, { backgroundColor: Palette.background, borderColor: Palette.border }]}>
          <View style={styles.tooltipHeader}>
            <Ionicons name="calendar-outline" size={14} color={Palette.textMuted} />
            <Text style={[styles.tooltipDate, { color: Palette.text }]}>{activePoint.label}</Text>
          </View>
          <View style={styles.tooltipRow}>
            <View style={styles.tooltipCol}>
              <Text style={[styles.tooltipLabel, { color: Palette.primary }]}>Revenue</Text>
              <Text style={[styles.tooltipVal, { color: Palette.text }]}>{AnalyticsService.formatIndianCurrency(activePoint.revenue)}</Text>
            </View>
            <View style={styles.tooltipCol}>
              <Text style={[styles.tooltipLabel, { color: Palette.warning }]}>Expenses</Text>
              <Text style={[styles.tooltipVal, { color: Palette.text }]}>{AnalyticsService.formatIndianCurrency(activePoint.expense)}</Text>
            </View>
            <View style={styles.tooltipCol}>
              <Text style={[styles.tooltipLabel, { color: Palette.success }]}>Net Profit</Text>
              <Text style={[styles.tooltipVal, { color: Palette.text }]}>{AnalyticsService.formatIndianCurrency(activePoint.netProfit)}</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={[styles.hintText, { color: Palette.textMuted }]}>Tap or click data points to inspect financial details</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
  },
  svgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 6,
  },
  tooltipBox: {
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  tooltipDate: {
    fontSize: 12,
    fontWeight: '700',
  },
  tooltipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tooltipCol: {
    alignItems: 'flex-start',
  },
  tooltipLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tooltipVal: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  hintText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  emptyIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 16,
  },
  createInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createInvoiceBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
