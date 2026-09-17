/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * ProductDetailScreen — Add or edit a product.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { showAlert, showDestructiveConfirm } from '../../../core/utils/alert';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { ProductRepository } from '../../../data/repositories/ProductRepository';
import { Product } from '../../../domain/entities/inventory';

// UI Components
import { GradientHeader } from '../../components/ui/GradientHeader';
import { GlassCard } from '../../components/ui/GlassCard';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { useAuthStore } from '../auth/store';

export const ProductDetailScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const { currency } = useAuthStore();
  
  const existingProduct = route?.params?.product as Product | undefined;

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setSku(existingProduct.sku);
      setPrice(existingProduct.price.toString());
      setCostPrice((existingProduct.costPrice || 0).toString());
      setStockQuantity(existingProduct.stockQuantity.toString());
      setLowStockThreshold(existingProduct.lowStockThreshold.toString());
      setBarcode(existingProduct.barcode || '');
    } else {
      setSku(`SKU-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  }, [existingProduct]);

  const handleSave = async () => {
    if (!name || !price || !stockQuantity) {
      showAlert('Validation Error', 'Please fill required fields (Name, Price, Stock).');
      return;
    }

    const productData: Product = {
      id: existingProduct ? existingProduct.id : `prod-${Date.now()}`,
      name,
      sku,
      barcode,
      price: parseFloat(price) || 0,
      costPrice: parseFloat(costPrice) || 0,
      unit: 'pcs',
      stockQuantity: parseInt(stockQuantity, 10) || 0,
      lowStockThreshold: parseInt(lowStockThreshold, 10) || 0,
      categoryId: 'default',
      warehouseId: 'main',
      isActive: true,
    };

    try {
      await ProductRepository.save(productData);
      navigation.goBack();
    } catch (error: any) {
      showAlert('Error', 'Failed to save product.');
    }
  };

  const handleDelete = () => {
    showDestructiveConfirm(
      'Delete Product',
      'Are you sure you want to delete this product?',
      'Delete',
      async () => {
        if (existingProduct) {
          await ProductRepository.delete(existingProduct.id);
          navigation.goBack();
        }
      }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Palette.background }]}>
      <GradientHeader 
        title={existingProduct ? 'Edit Product' : 'New Product'} 
        onLeftPress={() => navigation.goBack()}
        rightAction={
          existingProduct && (
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          )
        }
      />

      <ScrollView style={{ padding: Spacing.lg }}>
        <GlassCard padding={Spacing.lg} style={{ marginBottom: Spacing.lg }}>
          <Text style={[Typography.h4, { color: Palette.text, marginBottom: Spacing.md }]}>Basic Info</Text>
          
          <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>Product Name *</Text>
          <TextInput
            style={[styles.input, { borderColor: Palette.border, color: Palette.text }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Wireless Mouse"
            placeholderTextColor={Palette.textMuted}
          />

          <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4, marginTop: Spacing.md }]}>SKU</Text>
          <TextInput
            style={[styles.input, { borderColor: Palette.border, color: Palette.text, backgroundColor: Palette.borderLight }]}
            value={sku}
            onChangeText={setSku}
            editable={false} // Auto-generated for simplicity in this demo
          />
        </GlassCard>

        <GlassCard padding={Spacing.lg} style={{ marginBottom: Spacing.lg }}>
          <Text style={[Typography.h4, { color: Palette.text, marginBottom: Spacing.md }]}>Pricing & Stock</Text>
          
          <View style={{ flexDirection: 'row', gap: Spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>Selling Price ({currency}) *</Text>
              <TextInput
                style={[styles.input, { borderColor: Palette.border, color: Palette.text }]}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Palette.textMuted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>Cost Price</Text>
              <TextInput
                style={[styles.input, { borderColor: Palette.border, color: Palette.text }]}
                value={costPrice}
                onChangeText={setCostPrice}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Palette.textMuted}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>Current Stock *</Text>
              <TextInput
                style={[styles.input, { borderColor: Palette.border, color: Palette.text }]}
                value={stockQuantity}
                onChangeText={setStockQuantity}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={Palette.textMuted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>Low Stock Alert At</Text>
              <TextInput
                style={[styles.input, { borderColor: Palette.border, color: Palette.text }]}
                value={lowStockThreshold}
                onChangeText={setLowStockThreshold}
                keyboardType="number-pad"
                placeholder="10"
                placeholderTextColor={Palette.textMuted}
              />
            </View>
          </View>
        </GlassCard>

        <PremiumButton 
          label={existingProduct ? "Update Product" : "Save Product"} 
          onPress={handleSave} 
          fullWidth 
          size="lg"
          style={{ marginBottom: 40 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    ...Typography.bodyLarge,
  },
});
