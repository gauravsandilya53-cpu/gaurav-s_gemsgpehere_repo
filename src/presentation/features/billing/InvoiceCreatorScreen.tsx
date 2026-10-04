/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * InvoiceCreatorScreen — Mobile-first, beginner-friendly Zoho/Vyapar style workflow.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  Alert, TextInput, FlatList, KeyboardAvoidingView, Platform, ScrollView, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { InvoiceItem, Invoice } from '../../../domain/entities/billing';
import { Product } from '../../../domain/entities/inventory';
import { Contact } from '../../../domain/entities/contact';
import { TaxCalculator, InvoiceTotals } from '../../../core/utils/tax-calculator';
import { InvoiceRepository } from '../../../data/repositories/InvoiceRepository';
import { ProductRepository } from '../../../data/repositories/ProductRepository';
import { ContactRepository } from '../../../data/repositories/ContactRepository';
import { PDFService, BusinessProfile, InvoiceRenderOptions } from '../../../core/services/PDFService';
import * as Print from 'expo-print';
import { useAuthStore } from '../auth/store';
import { generateUUID } from '../../../core/utils/uuid';

// UI Components
import { PremiumButton } from '../../components/ui/PremiumButton';
import { SearchBar } from '../../components/ui/SearchBar';

// ─── DEBOUNCE HOOK ─────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const InvoiceCreatorScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const { user, currency } = useAuthStore();

  const draftInvoice: Invoice | undefined = route?.params?.draftInvoice || route?.params?.invoice;

  const [invoiceId] = useState<string>(draftInvoice?.id || `inv-${Date.now()}`);
  const [invoiceNumber, setInvoiceNumber] = useState<string>(draftInvoice?.number || 'Loading...');
  const [invoiceDate] = useState<string>(
    draftInvoice?.createdAt
      ? draftInvoice.createdAt.split('T')[0]
      : new Date().toISOString().split('T')[0]
  );

  // Data Caches
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCustomers, setAllCustomers] = useState<Contact[]>([]);

  // Invoice State
  const [customer, setCustomer] = useState<Contact | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>(draftInvoice?.items || []);
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);
  const [isRoundOffEnabled, setIsRoundOffEnabled] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string>(draftInvoice?.paymentMethod || 'CASH');
  const [amountPaid, setAmountPaid] = useState<string>(
    draftInvoice?.paidAmount ? String(draftInvoice.paidAmount) : ''
  );
  
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Search & Filter state inside modals
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Modals
  const [isCustomerModalVisible, setCustomerModalVisible] = useState(false);
  const [isProductModalVisible, setProductModalVisible] = useState(false);
  
  // Quick Add State (Customer)
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [prods, contacts] = await Promise.all([
        ProductRepository.getAllProducts(),
        ContactRepository.getAllContacts()
      ]);
      setAllProducts(prods);
      const customerContacts = contacts.filter(c => !c.type || c.type.toUpperCase() === 'CUSTOMER');
      setAllCustomers(customerContacts);

      // If draft invoice provided, match customer
      if (draftInvoice && !customer) {
        const found = customerContacts.find(c => c.id === draftInvoice.customerId);
        if (found) {
          setCustomer(found);
        } else if (draftInvoice.customerName) {
          setCustomer({
            id: draftInvoice.customerId || 'WALK-IN',
            tenantId: 'default',
            name: draftInvoice.customerName,
            phone: '',
            email: '',
            address: draftInvoice.billingAddress || '',
            type: 'CUSTOMER',
            status: 'ACTIVE',
            currentBalance: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Failed to load DB in InvoiceCreatorScreen:', error);
    }
  }, [draftInvoice, customer]);

  // ─── INITIALIZATION & FOCUS ───────────────────────────────────────────────
  useEffect(() => {
    loadData();
    if (!draftInvoice) {
      generateNextInvoiceNumber();
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const generateNextInvoiceNumber = async () => {
    try {
      const invoices = await InvoiceRepository.getAllInvoices();
      const prefix = `INV/${new Date().getFullYear()}/`;
      
      const matchingInvoices = invoices.filter(inv => inv.number && inv.number.startsWith(prefix));
      if (matchingInvoices.length === 0) {
        setInvoiceNumber(`${prefix}001`);
        return;
      }
      
      const highest = Math.max(...matchingInvoices.map(inv => {
        const numPart = inv.number.split('/').pop();
        return parseInt(numPart || '0', 10);
      }));
      
      const nextNum = (highest + 1).toString().padStart(3, '0');
      setInvoiceNumber(`${prefix}${nextNum}`);
    } catch (e) {
      setInvoiceNumber(`INV-${Date.now()}`);
    }
  };

  // ─── TOTALS & AUTO-SAVE ─────────────────────────────────────────────────
  const totals: InvoiceTotals = useMemo(() => {
    return TaxCalculator.calculateInvoiceTotals(items, 0, isTaxInclusive, isRoundOffEnabled);
  }, [items, isTaxInclusive, isRoundOffEnabled]);

  const balanceDue = useMemo(() => {
    const paid = parseFloat(amountPaid) || 0;
    return Math.max(0, totals.totalAmount - paid);
  }, [totals.totalAmount, amountPaid]);

  const invoiceObjectForSave = useMemo(() => ({
    id: invoiceId,
    number: invoiceNumber,
    customerId: customer?.id || 'WALK-IN',
    customerName: customer?.name || 'Walk-in Customer',
    billingAddress: customer?.address || '',
    customerGST: customer?.gstin || '',
    items,
    subTotal: totals.subTotal,
    totalTax: totals.totalTax,
    cgst: totals.cgst,
    sgst: totals.sgst,
    taxableAmount: totals.taxableAmount,
    roundOff: totals.roundOff,
    discount: totals.discountAmount,
    totalAmount: totals.totalAmount,
    currency: currency || 'INR',
    status: balanceDue <= 0 ? 'PAID' : 'DRAFT',
    createdAt: draftInvoice?.createdAt || new Date().toISOString(),
    synced: false,
    paymentMethod,
    paidAmount: parseFloat(amountPaid) || 0,
  }), [invoiceId, invoiceNumber, customer, items, totals, currency, balanceDue, paymentMethod, amountPaid, draftInvoice]);

  const debouncedInvoice = useDebounce(invoiceObjectForSave, 2000);

  useEffect(() => {
    // Only auto-save if we have items or a customer
    if (debouncedInvoice.items.length > 0 || customer) {
      saveDraftSilently();
    }
  }, [debouncedInvoice]);

  const saveDraftSilently = async () => {
    try {
      await InvoiceRepository.saveInvoice(invoiceObjectForSave as any);
      setLastSaved(new Date());
    } catch (e) {
      console.log('Auto-save failed', e);
    }
  };

  // ─── ACTIONS ────────────────────────────────────────────────────────────
  const _getBusinessProfile = (): BusinessProfile => ({
    name: user?.businessName || 'GemSphere Business',
    address: user?.businessAddress || '123 Main St',
    phone: user?.phone || '+1 234 567 8900',
    gstin: user?.gstin || undefined,
    themeColor: '#4F63FF',
  });

  const _getRenderOpts = (): InvoiceRenderOptions => ({
    format: 'A4',
    isTaxInclusive,
    isRoundOffEnabled,
  });

  const handleManualSave = async (andPrint: boolean, andShare: boolean) => {
    if (items.length === 0) {
      Alert.alert('Empty Invoice', 'Please add at least one item before saving.');
      return;
    }

    try {
      const finalPaidAmount = parseFloat(amountPaid) || (balanceDue <= 0 ? totals.totalAmount : 0);
      const finalInvoice = { 
        ...invoiceObjectForSave, 
        status: finalPaidAmount >= totals.totalAmount ? 'PAID' : 'PENDING',
        paidAmount: finalPaidAmount
      };
      
      await InvoiceRepository.saveInvoice(finalInvoice as any);
      setLastSaved(new Date());

      if (andPrint) {
        const html = PDFService.generateInvoiceHTML(finalInvoice as any, _getBusinessProfile(), _getRenderOpts());
        await Print.printAsync({ html });
      } else if (andShare) {
        await PDFService.generateAndShare(finalInvoice as any, _getBusinessProfile(), _getRenderOpts());
      } else {
        Alert.alert('Success', `Invoice ${invoiceNumber} saved successfully!`, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      Alert.alert('Error', `Failed to save invoice: ${error?.message || 'Unknown error'}`);
    }
  };

  // ─── ITEM QUANTITY CONTROL ──────────────────────────────────────────────
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setItems(prevItems => {
      return prevItems
        .map(item => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const newGross = item.price * newQty;
            const taxAmt = newGross * ((item.taxRate || 18) / 100);
            return {
              ...item,
              quantity: newQty,
              taxAmount: parseFloat(taxAmt.toFixed(2)),
              total: parseFloat((newGross + taxAmt).toFixed(2))
            };
          }
          return item;
        })
        .filter(Boolean) as InvoiceItem[];
    });
  };

  // ─── QUICK ADD CUSTOMER ─────────────────────────────────────────────────
  const handleOpenCustomerModal = async () => {
    try {
      const contacts = await ContactRepository.getAllContacts();
      const customerContacts = contacts.filter(c => !c.type || c.type.toUpperCase() === 'CUSTOMER');
      setAllCustomers(customerContacts);
    } catch (e) {
      console.error('Failed to load customers on modal open:', e);
    }
    setCustomerModalVisible(true);
  };

  const handleQuickAddCustomer = async () => {
    if (!newCustName.trim()) return;
    try {
      const newContact: Contact = {
        id: generateUUID(),
        tenantId: 'default',
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
        email: '',
        address: '',
        type: 'CUSTOMER',
        status: 'ACTIVE',
        openingBalance: 0,
        currentBalance: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await ContactRepository.save(newContact);
      const contacts = await ContactRepository.getAllContacts();
      const customerContacts = contacts.filter(c => !c.type || c.type.toUpperCase() === 'CUSTOMER');
      setAllCustomers(customerContacts);
      setCustomer(newContact);
      setNewCustName('');
      setNewCustPhone('');
      setCustomerModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', 'Failed to add customer');
    }
  };

  // Filtered lists for modals
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return allProducts;
    const query = productSearch.toLowerCase();
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.sku && p.sku.toLowerCase().includes(query))
    );
  }, [allProducts, productSearch]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return allCustomers;
    const query = customerSearch.toLowerCase();
    return allCustomers.filter(c => 
      c.name.toLowerCase().includes(query) || 
      (c.phone && c.phone.toLowerCase().includes(query))
    );
  }, [allCustomers, customerSearch]);

  // ─── STYLES ─────────────────────────────────────────────────────────────
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Palette.background },
    scrollContent: { padding: Spacing.md, paddingBottom: 120 },
    
    // Cards
    card: { backgroundColor: Palette.backgroundAlt, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Palette.border },
    cardTitle: { ...Typography.h4, color: Palette.text, marginBottom: Spacing.md },
    
    // Inputs & Buttons
    input: { borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: 16, color: Palette.text, backgroundColor: Palette.background },
    btnOutline: { borderWidth: 1, borderColor: Palette.primary, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', backgroundColor: `${Palette.primary}05` },
    
    // Summary
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
    
    // Footer
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Palette.background, padding: Spacing.md, borderTopWidth: 1, borderTopColor: Palette.border, flexDirection: 'row', gap: Spacing.sm, zIndex: 10 },
    
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: Palette.background, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: Spacing.lg, height: '80%' },
    listItem: { paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Palette.border },
    
    // Qty controls
    qtyBtn: { padding: 4, borderRadius: 4, backgroundColor: `${Palette.primary}15` }
  });

  // ─── RENDER ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Palette.border, backgroundColor: Palette.background }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: Spacing.xs, marginRight: Spacing.md }}>
          <Ionicons name="arrow-back" size={24} color={Palette.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.h3, { color: Palette.text }]}>
            {draftInvoice ? 'Edit Invoice' : 'Create Invoice'}
          </Text>
          <Text style={[Typography.caption, { color: Palette.textMuted }]}>{invoiceNumber} · {invoiceDate}</Text>
        </View>
        {lastSaved && (
          <Text style={[Typography.caption, { color: Palette.success }]}>Saved ✓</Text>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. CUSTOMER BLOCK */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill To</Text>
          {customer ? (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.bodySemibold, { color: Palette.text, fontSize: 18 }]}>{customer.name}</Text>
                {customer.phone ? <Text style={[Typography.body, { color: Palette.textMuted, marginTop: 4 }]}>{customer.phone}</Text> : null}
                {customer.gstin ? <Text style={[Typography.caption, { color: Palette.textMuted }]}>GSTIN: {customer.gstin}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => setCustomer(null)} style={{ padding: Spacing.xs }}>
                <Ionicons name="close-circle" size={24} color={Palette.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.btnOutline} onPress={handleOpenCustomerModal}>
              <Text style={[Typography.bodySemibold, { color: Palette.primary }]}>+ Select or Add Customer</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 2. ITEMS BLOCK */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
            <Text style={styles.cardTitle}>Items</Text>
            {items.length > 0 && <Text style={[Typography.bodySemibold, { color: Palette.text }]}>{items.length} items</Text>}
          </View>
          
          {items.map((item) => (
            <View key={item.productId} style={{ marginBottom: Spacing.md, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Palette.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={[Typography.bodySemibold, { color: Palette.text, flex: 1 }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[Typography.bodySemibold, { color: Palette.text }]}>
                  {TaxCalculator.formatCurrency(item.price * item.quantity, currency)}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <TouchableOpacity onPress={() => handleUpdateQuantity(item.productId, -1)} style={styles.qtyBtn}>
                    <Ionicons name="remove" size={18} color={Palette.primary} />
                  </TouchableOpacity>

                  <Text style={[Typography.bodySemibold, { color: Palette.text, minWidth: 20, textAlign: 'center' }]}>
                    {item.quantity}
                  </Text>

                  <TouchableOpacity onPress={() => handleUpdateQuantity(item.productId, 1)} style={styles.qtyBtn}>
                    <Ionicons name="add" size={18} color={Palette.primary} />
                  </TouchableOpacity>

                  <Text style={[Typography.caption, { color: Palette.textMuted, marginLeft: 6 }]}>
                    @ {TaxCalculator.formatCurrency(item.price, currency)}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => setItems(curr => curr.filter(i => i.productId !== item.productId))}>
                  <Text style={[Typography.caption, { color: Palette.error }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.btnOutline} onPress={() => setProductModalVisible(true)}>
            <Text style={[Typography.bodySemibold, { color: Palette.primary }]}>+ Add Item</Text>
          </TouchableOpacity>
        </View>

        {/* 3. TOTALS BLOCK */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Totals</Text>
          
          <View style={styles.summaryRow}>
            <Text style={[Typography.body, { color: Palette.textMuted }]}>Subtotal</Text>
            <Text style={[Typography.body, { color: Palette.text }]}>{TaxCalculator.formatCurrency(totals.subTotal, currency)}</Text>
          </View>
          
          <View style={[styles.summaryRow, { marginVertical: Spacing.sm }]}>
            <Text style={[Typography.caption, { color: Palette.primary }]}>Prices are Tax Inclusive?</Text>
            <TouchableOpacity onPress={() => setIsTaxInclusive(!isTaxInclusive)}>
              <Ionicons name={isTaxInclusive ? "checkbox" : "square-outline"} size={24} color={Palette.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>CGST</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>{TaxCalculator.formatCurrency(totals.cgst, currency)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>SGST</Text>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>{TaxCalculator.formatCurrency(totals.sgst, currency)}</Text>
          </View>
          
          {totals.roundOff !== 0 && (
            <View style={styles.summaryRow}>
              <Text style={[Typography.caption, { color: Palette.textMuted }]}>Round Off</Text>
              <Text style={[Typography.caption, { color: totals.roundOff >= 0 ? Palette.success : Palette.warning }]}>
                {totals.roundOff >= 0 ? '+' : ''}{TaxCalculator.formatCurrency(totals.roundOff, currency)}
              </Text>
            </View>
          )}

          <View style={[styles.summaryRow, { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Palette.border }]}>
            <Text style={[Typography.h3, { color: Palette.text }]}>Grand Total</Text>
            <Text style={[Typography.h2, { color: Palette.primary }]}>{TaxCalculator.formatCurrency(totals.totalAmount, currency)}</Text>
          </View>
        </View>

        {/* 4. PAYMENT BLOCK */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Received</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder={`Total is ${totals.totalAmount}`}
            placeholderTextColor={Palette.textMuted}
            value={amountPaid}
            onChangeText={setAmountPaid}
          />
          {balanceDue > 0 && (
            <Text style={[Typography.bodySemibold, { color: Palette.error, marginTop: Spacing.sm }]}>
              Balance Due: {TaxCalculator.formatCurrency(balanceDue, currency)}
            </Text>
          )}
        </View>

      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View style={styles.footer}>
        <TouchableOpacity style={[{ flex: 1 }, styles.btnOutline, { borderColor: Palette.border, backgroundColor: Palette.background }]} onPress={() => navigation.goBack()}>
          <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Close</Text>
        </TouchableOpacity>
        
        <PremiumButton 
          label="Print"
          onPress={() => handleManualSave(true, false)}
          style={{ flex: 1, backgroundColor: Palette.textSecondary }}
          disabled={items.length === 0}
        />
        
        <PremiumButton 
          label="Save & Share"
          onPress={() => handleManualSave(false, true)}
          style={{ flex: 2 }}
          disabled={items.length === 0}
        />
      </View>

      {/* CUSTOMER SEARCH MODAL */}
      <Modal visible={isCustomerModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
              <Text style={[Typography.h3, { color: Palette.text }]}>Select Customer</Text>
              <TouchableOpacity onPress={() => setCustomerModalVisible(false)}><Ionicons name="close" size={24} color={Palette.text} /></TouchableOpacity>
            </View>

            <SearchBar
              value={customerSearch}
              onChangeText={setCustomerSearch}
              placeholder="Search customer by name or phone..."
            />
            
            <View style={{ backgroundColor: Palette.backgroundAlt, padding: Spacing.md, borderRadius: Radius.md, marginVertical: Spacing.md }}>
              <Text style={[Typography.bodySemibold, { color: Palette.text, marginBottom: Spacing.sm }]}>Quick Add New Customer</Text>
              <TextInput style={[styles.input, { marginBottom: Spacing.sm }]} placeholder="Name" value={newCustName} onChangeText={setNewCustName} />
              <TextInput style={[styles.input, { marginBottom: Spacing.sm }]} placeholder="Phone" keyboardType="phone-pad" value={newCustPhone} onChangeText={setNewCustPhone} />
              <PremiumButton label="Save & Select" onPress={handleQuickAddCustomer} />
            </View>

            <FlatList
              data={filteredCustomers}
              keyExtractor={c => c.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.listItem} onPress={() => { setCustomer(item); setCustomerModalVisible(false); }}>
                  <Text style={[Typography.bodySemibold, { color: Palette.text }]}>{item.name}</Text>
                  {item.phone ? <Text style={[Typography.caption, { color: Palette.textMuted }]}>{item.phone}</Text> : null}
                </TouchableOpacity>
              )}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* PRODUCT SEARCH MODAL */}
      <Modal visible={isProductModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
              <Text style={[Typography.h3, { color: Palette.text }]}>Add Item</Text>
              <TouchableOpacity onPress={() => setProductModalVisible(false)}><Ionicons name="close" size={24} color={Palette.text} /></TouchableOpacity>
            </View>

            <SearchBar
              value={productSearch}
              onChangeText={setProductSearch}
              placeholder="Search product by name or SKU..."
            />

            <FlatList
              data={filteredProducts}
              keyExtractor={p => p.id}
              style={{ marginTop: Spacing.md }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.listItem} onPress={() => {
                  setItems(curr => {
                    const exists = curr.find(i => i.productId === item.id);
                    if (exists) {
                      return curr.map(i => {
                        if (i.productId === item.id) {
                          const newQty = i.quantity + 1;
                          const gross = i.price * newQty;
                          const taxAmt = gross * ((i.taxRate || 18) / 100);
                          return {
                            ...i,
                            quantity: newQty,
                            taxAmount: parseFloat(taxAmt.toFixed(2)),
                            total: parseFloat((gross + taxAmt).toFixed(2))
                          };
                        }
                        return i;
                      });
                    }
                    const itemPrice = item.price || 0;
                    const taxRate = 18;
                    const taxAmt = itemPrice * (taxRate / 100);
                    return [...curr, {
                      productId: item.id,
                      name: item.name,
                      quantity: 1,
                      price: itemPrice,
                      taxRate,
                      taxAmount: parseFloat(taxAmt.toFixed(2)),
                      total: parseFloat((itemPrice + taxAmt).toFixed(2))
                    }];
                  });
                  setProductModalVisible(false);
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[Typography.bodySemibold, { color: Palette.text }]}>{item.name}</Text>
                    <Text style={[Typography.bodySemibold, { color: Palette.primary }]}>{TaxCalculator.formatCurrency(item.price || 0, currency)}</Text>
                  </View>
                  <Text style={[Typography.caption, { color: Palette.textMuted }]}>Stock: {item.stockQuantity ?? 0} {item.unit || ''}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
      
    </SafeAreaView>
  );
};
