/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, G, Text as SvgText } from 'react-native-svg';
import { Theme } from '../../core/theme';

interface ChartData {
  month: string;
  total: number;
}

export const DashboardChart = ({ data }: { data: ChartData[] }) => {
  const screenWidth = Dimensions.get('window').width - 64; // Adjusted for padding
  const chartHeight = 150;
  const barWidth = 40;
  const gap = (screenWidth - data.length * barWidth) / (data.length + 1);

  const maxVal = Math.max(...data.map((d) => d.total), 1);

  return (
    <View style={styles.container}>
      <Svg width={screenWidth} height={chartHeight}>
        <G>
          {data.map((item, index) => {
            const barHeight = (item.total / maxVal) * (chartHeight - 40);
            const x = gap + index * (barWidth + gap);
            const y = chartHeight - barHeight - 20;

            return (
              <G key={index}>
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={Theme.Palette.primary}
                  rx={4}
                />
                <SvgText
                  x={x + barWidth / 2}
                  y={chartHeight - 5}
                  fontSize="10"
                  fill={Theme.Palette.textMuted}
                  textAnchor="middle"
                >
                  {item.month.split('-')[1]}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Theme.Spacing.md,
  },
});




