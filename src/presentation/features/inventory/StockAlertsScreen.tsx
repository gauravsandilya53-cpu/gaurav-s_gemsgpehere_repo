/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * StockAlertsScreen — Shows only products that need attention.
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing } from '../../../core/theme';
import { ProductRepository } from '../../../data/repositories/ProductRepository';
import { Product } from '../../../domain/entities/inventory';

// UI Components
import { GradientHeader } from '../../components/ui/GradientHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { GlassCard } from '../../components/ui/GlassCard';
import { StockStatusBadge } from '../../components/ui/Badge';

export const StockAlertsScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const [alerts, setAlerts] = useState<Product[]>([]);

  const loadAlerts = async () => {
    const all = await ProductRepository.getAll();
    const problematic = all.filter(p => {
      const status = ProductRepository.getStockStatus(p).status;
      return status === 'LOW_STOCK' || status === 'OUT_OF_STOCK';
    });
    // Sort out of stock first
    problematic.sort((a, b) => a.stockQuantity - b.stockQuantity);
    setAlerts(problematic);
  };

  useFocusEffect(
    useCallback(() => {
      loadAlerts();
    }, [])
  );

  const renderItem = ({ item }: { item: Product }) => {
    const status = ProductRepository.getStockStatus(item);
    return (
      <GlassCard padding={Spacing.md} style={{ marginBottom: Spacing.md }}>
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
          <View style={{ flex: 1 }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>
              Current Stock: {item.stockQuantity} (Min: {item.lowStockThreshold})
            </Text>
          </View>
          <StockStatusBadge status={status.status} />
          <Ionicons name="chevron-forward" size={20} color={Palette.textMuted} style={{ marginLeft: Spacing.sm }} />
        </TouchableOpacity>
      </GlassCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Palette.background }]}>
      <GradientHeader title="Stock Alerts" onLeftPress={() => navigation.goBack()} gradientVariant="error" />
      
      <FlatList
        data={alerts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: Spacing.lg }}
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-circle-outline"
            title="All Good!"
            body="You have no low stock or out of stock items."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 }
});
