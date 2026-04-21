/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '../../../core/theme';
import { InvoiceItem, Invoice } from '../../../domain/entities/billing';
import { TaxCalculator } from '../../../core/utils/tax-calculator';
import { InvoiceRepository } from '../../../data/repositories/InvoiceRepository';
import { PDFService } from '../../../core/services/PDFService';

export const InvoiceCreatorScreen = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discount, setDiscount] = useState(0);

  const totals = useMemo(() => {
    return TaxCalculator.calculateInvoiceTotals(items, discount);
  }, [items, discount]);

  const addItem = () => {
    // In a real app, this would open a product picker
    const newItem: InvoiceItem = {
      productId: Math.random().toString(),
      name: 'Sample Product',
      price: 100,
      quantity: 1,
      taxRate: 18,
      taxAmount: 18,
      total: 118,
    };
    setItems([...items, newItem]);
  };

  const handleSave = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    const invoice: Invoice = {
      id: Math.random().toString(),
      number: `INV-${Date.now()}`,
      customerId: 'CUST-001',
      items,
      subTotal: totals.subTotal,
      totalTax: totals.totalTax,
      discount: totals.discountAmount,
      totalAmount: totals.totalAmount,
      currency: 'USD',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await InvoiceRepository.save(invoice);
      Alert.alert('Success', 'Invoice saved locally', [
        {
          text: 'Share PDF',
          onPress: () => PDFService.generateAndShare(invoice, {
            name: 'My Business',
            address: '123 Tech Lane',
            taxId: 'TAX123',
          }),
        },
        { text: 'OK' },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save invoice');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Invoice</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemTotal}>
                {TaxCalculator.formatCurrency(item.total, 'USD')}
              </Text>
            </View>
          ))}
          <TouchableOpacity style={styles.addButton} onPress={addItem}>
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>Subtotal</Text>
            <Text>{TaxCalculator.formatCurrency(totals.subTotal, 'USD')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Tax</Text>
            <Text>{TaxCalculator.formatCurrency(totals.totalTax, 'USD')}</Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: 10 }]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {TaxCalculator.formatCurrency(totals.totalAmount, 'USD')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Invoice</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    padding: Theme.Spacing.md,
  },
  section: {
    backgroundColor: Theme.Palette.surface,
    padding: Theme.Spacing.md,
    borderRadius: Theme.Spacing.sm,
    marginBottom: Theme.Spacing.md,
  },
  sectionTitle: {
    ...Theme.Typography.caption,
    marginBottom: Theme.Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Theme.Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.Palette.border,
  },
  itemName: {
    ...Theme.Typography.body,
  },
  itemTotal: {
    ...Theme.Typography.body,
    fontWeight: 'bold',
  },
  addButton: {
    padding: Theme.Spacing.md,
    alignItems: 'center',
    marginTop: Theme.Spacing.sm,
  },
  addButtonText: {
    color: Theme.Palette.primary,
    fontWeight: 'bold',
  },
  summary: {
    backgroundColor: Theme.Palette.surface,
    padding: Theme.Spacing.md,
    borderRadius: Theme.Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.Spacing.xs,
  },
  totalLabel: {
    ...Theme.Typography.h2,
  },
  totalValue: {
    ...Theme.Typography.h2,
    color: Theme.Palette.primary,
  },
  footer: {
    padding: Theme.Spacing.lg,
    backgroundColor: Theme.Palette.surface,
  },
  saveButton: {
    backgroundColor: Theme.Palette.primary,
    padding: Theme.Spacing.md,
    borderRadius: Theme.Spacing.sm,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    ...Theme.Typography.body,
    fontWeight: 'bold',
  },
});




