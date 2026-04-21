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
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../../../core/theme';
import { Product } from '../../../domain/entities/inventory';
import { ProductRepository } from '../../../data/repositories/ProductRepository';

const ProductItem = React.memo(({ item }: { item: Product }) => {
  const status = ProductRepository.getStockStatus(item);
  return (
    <View style={styles.productCard}>
      <View style={styles.topRow}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={[styles.badge, { backgroundColor: status.color }]}>
          <Text style={styles.badgeText}>{status.status.replace('_', ' ')}</Text>
        </View>
      </View>
      
      <View style={styles.detailsRow}>
        <Text style={styles.skuText}>SKU: {item.sku}</Text>
        <Text style={styles.stockText}>
          Stock: <Text style={{ fontWeight: 'bold' }}>{item.stockQuantity} {item.unit}</Text>
        </Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
      </View>
    </View>
  );
});

export const ProductListScreen = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const allProducts = ProductRepository.getAll();
    setProducts(allProducts);
  };

  const filteredProducts = products.filter(
    (p) => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const renderProduct = useCallback(({ item }: { item: Product }) => (
    <ProductItem item={item} />
  ), []);

  const keyExtractor = useCallback((item: Product) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search items or SKU..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={keyExtractor}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found. Add your first item!</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => {}}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: Theme.Palette.border,
  },
  title: {
    ...Theme.Typography.h2,
    marginBottom: Theme.Spacing.md,
  },
  searchBar: {
    backgroundColor: Theme.Palette.background,
    padding: Theme.Spacing.sm,
    borderRadius: Theme.Spacing.sm,
    borderWidth: 1,
    borderColor: Theme.Palette.border,
    ...Theme.Typography.body,
  },
  listContent: {
    padding: Theme.Spacing.md,
  },
  productCard: {
    backgroundColor: Theme.Palette.surface,
    padding: Theme.Spacing.md,
    borderRadius: Theme.Spacing.sm,
    marginBottom: Theme.Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.Spacing.xs,
  },
  productName: {
    ...Theme.Typography.body,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    paddingHorizontal: Theme.Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.Spacing.xs,
  },
  skuText: {
    ...Theme.Typography.caption,
  },
  stockText: {
    ...Theme.Typography.caption,
  },
  priceRow: {
    marginTop: Theme.Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Theme.Palette.border,
    paddingTop: Theme.Spacing.xs,
  },
  priceText: {
    ...Theme.Typography.body,
    color: Theme.Palette.primary,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: Theme.Spacing.lg,
    bottom: Theme.Spacing.lg,
    backgroundColor: Theme.Palette.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: Theme.Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Theme.Typography.body,
    color: Theme.Palette.textMuted,
  },
});




