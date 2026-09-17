/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * ProductListScreen — Premium Inventory list with categories and alerts.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../auth/store';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { ProductRepository } from '../../../data/repositories/ProductRepository';
import { Product } from '../../../domain/entities/inventory';
import { TaxCalculator } from '../../../core/utils/tax-calculator';

// UI Components
import { GradientHeader } from '../../components/ui/GradientHeader';
import { SearchBar } from '../../components/ui/SearchBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { StockStatusBadge } from '../../components/ui/Badge';
import { GlassCard } from '../../components/ui/GlassCard';

export const ProductListScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { Palette } = theme;
  const { currency } = useAuthStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST');

  const loadProducts = async () => {
    try {
      const all = await ProductRepository.getAll();
      setProducts(all);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    const status = ProductRepository.getStockStatus(p).status;
    if (filter === 'LOW_STOCK') return status === 'LOW_STOCK';
    if (filter === 'OUT_OF_STOCK') return status === 'OUT_OF_STOCK';
    return true;
  });

  const lowStockCount = products.filter(p => ProductRepository.getStockStatus(p).status === 'LOW_STOCK').length;
  const outOfStockCount = products.filter(p => ProductRepository.getStockStatus(p).status === 'OUT_OF_STOCK').length;

  const renderFilterChip = (label: string, value: typeof filter, badgeCount?: number, color?: string) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        filter === value && { backgroundColor: color || Palette.primary, borderColor: color || Palette.primary }
      ]}
      onPress={() => setFilter(value)}
    >
      <Text style={[
        Typography.captionMedium, 
        { color: filter === value ? '#FFF' : Palette.textMuted }
      ]}>
        {label} {badgeCount ? `(${badgeCount})` : ''}
      </Text>
    </TouchableOpacity>
  );

  const renderProductList = ({ item }: { item: Product }) => {
    const status = ProductRepository.getStockStatus(item);
    return (
      <GlassCard padding={Spacing.md} style={styles.productCardList}>
        <TouchableOpacity 
          style={styles.productContentList}
          onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
          <View style={[styles.avatarBox, { backgroundColor: `${Palette.primary}15` }]}>
            <Ionicons name="cube-outline" size={24} color={Palette.primary} />
          </View>
          <View style={{ flex: 1, marginHorizontal: Spacing.md }}>
            <Text style={[Typography.bodySemibold, { color: Palette.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
              SKU: {item.sku}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[Typography.bodySemibold, { color: Palette.primary, marginBottom: 4 }]}>
              {TaxCalculator.formatCurrency(item.price, currency)}
            </Text>
            <StockStatusBadge status={status.status} />
          </View>
        </TouchableOpacity>
      </GlassCard>
    );
  };

  const renderProductGrid = ({ item }: { item: Product }) => {
    const status = ProductRepository.getStockStatus(item);
    return (
      <GlassCard padding={Spacing.md} style={styles.productCardGrid}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ProductDetail', { product: item })}
        >
          <View style={[styles.avatarBoxGrid, { backgroundColor: `${Palette.primary}15`, marginBottom: Spacing.sm }]}>
            <Ionicons name="cube-outline" size={32} color={Palette.primary} />
          </View>
          <Text style={[Typography.bodySemibold, { color: Palette.text, marginBottom: 2 }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[Typography.caption, { color: Palette.textMuted, marginBottom: Spacing.sm }]} numberOfLines={1}>
            SKU: {item.sku}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[Typography.bodySemibold, { color: Palette.primary }]}>
              {TaxCalculator.formatCurrency(item.price, currency)}
            </Text>
            <StockStatusBadge status={status.status} />
          </View>
        </TouchableOpacity>
      </GlassCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Palette.background }]}>
      <GradientHeader 
        title="Inventory" 
        rightAction={
          <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
            <TouchableOpacity onPress={() => navigation.navigate('StockAlerts')} style={{ position: 'relative' }}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
              {(lowStockCount > 0 || outOfStockCount > 0) && (
                <View style={styles.alertBadge}>
                  <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>
                    {lowStockCount + outOfStockCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        }
      />
      
      <View style={styles.searchContainer}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search products..."
          rightAction={
            <TouchableOpacity onPress={() => setViewMode(viewMode === 'LIST' ? 'GRID' : 'LIST')}>
              <Ionicons name={viewMode === 'LIST' ? 'grid-outline' : 'list-outline'} size={24} color={Palette.primary} />
            </TouchableOpacity>
          }
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {renderFilterChip('All Items', 'ALL')}
          {renderFilterChip('Low Stock', 'LOW_STOCK', lowStockCount, Palette.warning)}
          {renderFilterChip('Out of Stock', 'OUT_OF_STOCK', outOfStockCount, Palette.error)}
        </ScrollView>
      </View>

      <FlatList
        key={viewMode}
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={viewMode === 'LIST' ? renderProductList : renderProductGrid}
        numColumns={viewMode === 'GRID' ? 2 : 1}
        columnWrapperStyle={viewMode === 'GRID' ? styles.gridRow : undefined}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="No products found"
            body="Start building your inventory."
            actionLabel="Add Product"
            onAction={() => navigation.navigate('ProductDetail')}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: Palette.primary, shadowColor: Palette.primary }]}
        onPress={() => navigation.navigate('ProductDetail')}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100, // Fab space + tab bar
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  productCardList: {
    marginBottom: Spacing.md,
  },
  productContentList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productCardGrid: {
    width: '48%',
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBoxGrid: {
    width: '100%',
    height: 100,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: Radius.full,
    paddingHorizontal: 4,
    minWidth: 16,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 100, // Above tab bar
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 999, // Fix for web clickability
  },
});
