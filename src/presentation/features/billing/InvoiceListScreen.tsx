/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * InvoiceListScreen — Premium billing list with filters and swipe actions.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { showDestructiveConfirm } from '../../../core/utils/alert';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../auth/store';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { InvoiceRepository } from '../../../data/repositories/InvoiceRepository';
import { Invoice } from '../../../domain/entities/billing';
import { TaxCalculator } from '../../../core/utils/tax-calculator';
import { PDFService } from '../../../core/services/PDFService';

// UI Components
import { GradientHeader } from '../../components/ui/GradientHeader';
import { SearchBar } from '../../components/ui/SearchBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { InvoiceStatusBadge } from '../../components/ui/Badge';
import { GlassCard } from '../../components/ui/GlassCard';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { BottomSheet } from '../../components/ui/BottomSheet';

export const InvoiceListScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { Palette } = theme;
  const { currency } = useAuthStore();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'UNPAID' | 'DRAFT'>('ALL');
  const [isFabOpen, setFabOpen] = useState(false);

  const loadInvoices = async () => {
    try {
      const all = await InvoiceRepository.getAll();
      setInvoices(all);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadInvoices();
    }, [])
  );

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customerName && inv.customerName.toLowerCase().includes(search.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (filter === 'ALL') return true;
    if (filter === 'UNPAID') return inv.status === 'PENDING';
    return inv.status === filter;
  });

  const handleDelete = (inv: Invoice) => {
    showDestructiveConfirm(
      'Delete Document',
      `Are you sure you want to delete ${inv.number}?`,
      'Delete',
      async () => {
        await InvoiceRepository.delete(inv.id);
        loadInvoices();
      }
    );
  };

  const renderFilterChip = (label: string, value: typeof filter) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        filter === value && { backgroundColor: Palette.primary, borderColor: Palette.primary }
      ]}
      onPress={() => setFilter(value)}
    >
      <Text style={[
        Typography.captionMedium, 
        { color: filter === value ? '#FFF' : Palette.textMuted }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <GlassCard padding={Spacing.md} style={styles.invoiceCard}>
      <TouchableOpacity 
        style={styles.invoiceContent}
        onPress={() => {
          if (item.status === 'DRAFT') {
            navigation.navigate('InvoiceCreator', { draftInvoice: item });
          } else {
            // View PDF logic could go here
            PDFService.generateAndShare(item, {
              name: 'GemSphere Books',
              address: '123 Tech Lane',
              phone: '+1 234 567 8900'
            });
          }
        }}
      >
        <View style={styles.avatar}>
          <Text style={{ color: Palette.primary, fontWeight: 'bold' }}>
            {item.customerName?.charAt(0).toUpperCase() || 'C'}
          </Text>
        </View>
        <View style={{ flex: 1, marginHorizontal: Spacing.md }}>
          <Text style={[Typography.bodySemibold, { color: Palette.text }]} numberOfLines={1}>
            {item.customerName}
          </Text>
          <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
            {item.number} • {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[Typography.bodySemibold, { color: Palette.text, marginBottom: 4 }]}>
            {TaxCalculator.formatCurrency(item.totalAmount, item.currency || currency)}
          </Text>
          <InvoiceStatusBadge status={item.status} />
        </View>
      </TouchableOpacity>
      
      <View style={styles.actionRow}>
        {!item.synced && item.status !== 'DRAFT' && (
          <Ionicons name="cloud-offline" size={16} color={Palette.warning} style={{ marginRight: Spacing.sm }} />
        )}
        <View style={{ flex: 1 }} />
        {item.status === 'DRAFT' && (
          <TouchableOpacity onPress={() => navigation.navigate('InvoiceCreator', { draftInvoice: item })} style={styles.iconBtn}>
            <Ionicons name="pencil" size={18} color={Palette.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}>
          <Ionicons name="trash-outline" size={18} color={Palette.error} />
        </TouchableOpacity>
      </View>
    </GlassCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: Palette.background }]}>
      <GradientHeader title="Billing & Orders" />
      
      <View style={styles.searchContainer}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or number..."
        />
        <View style={styles.filterRow}>
          {renderFilterChip('All', 'ALL')}
          {renderFilterChip('Paid', 'PAID')}
          {renderFilterChip('Unpaid', 'UNPAID')}
          {renderFilterChip('Drafts', 'DRAFT')}
        </View>
      </View>

      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoice}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No invoices found"
            body="Create your first invoice to get started."
            actionLabel="Create Invoice"
            onAction={() => setFabOpen(true)}
          />
        }
      />

      {/* FAB to open doc type sheet */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: Palette.primary, shadowColor: Palette.primary }]}
        onPress={() => setFabOpen(true)}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      <BottomSheet visible={isFabOpen} onClose={() => setFabOpen(false)} height={350}>
        <View style={{ padding: Spacing.xl }}>
          <Text style={[Typography.h3, { color: Palette.text, marginBottom: Spacing.xl }]}>
            Create New Document
          </Text>
          
          <PremiumButton 
            label="Tax Invoice" 
            icon={<Ionicons name="document-text" size={20} color="#FFF" />}
            onPress={() => {
              setFabOpen(false);
              navigation.navigate('InvoiceCreator');
            }} 
            fullWidth 
            style={{ marginBottom: Spacing.md }}
          />
          
          <PremiumButton 
            label="Estimate / Quotation" 
            variant="secondary"
            icon={<Ionicons name="calculator" size={20} color="#FFF" />}
            onPress={() => {
              setFabOpen(false);
              navigation.navigate('InvoiceCreator', { type: 'ESTIMATE' });
            }} 
            fullWidth 
            style={{ marginBottom: Spacing.md }}
          />

          <PremiumButton 
            label="Log Expense" 
            variant="outline"
            icon={<Ionicons name="cash-outline" size={20} color={Palette.primary} />}
            onPress={() => {
              setFabOpen(false);
              // navigation.navigate('ExpenseTracker');
            }} 
            fullWidth 
          />
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.sm,
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
  invoiceCard: {
    marginBottom: Spacing.md,
  },
  invoiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(79, 99, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  iconBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
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
    zIndex: 999,
  },
});
