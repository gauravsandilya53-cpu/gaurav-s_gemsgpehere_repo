/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * ContactListScreen — Comprehensive Customer & Supplier management screen with full CRUD functionality.
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity,
  Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { Contact, ContactType } from '../../../domain/entities/contact';
import { ContactRepository } from '../../../data/repositories/ContactRepository';
import { TaxCalculator } from '../../../core/utils/tax-calculator';
import { useAuthStore } from '../auth/store';
import { generateUUID } from '../../../core/utils/uuid';
import { showAlert, showDestructiveConfirm } from '../../../core/utils/alert';

// UI Components
import { GradientHeader } from '../../components/ui/GradientHeader';
import { SearchBar } from '../../components/ui/SearchBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { GlassCard } from '../../components/ui/GlassCard';
import { PremiumButton } from '../../components/ui/PremiumButton';

export const ContactListScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const { currency } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'CUSTOMER' | 'SUPPLIER' | 'ALL'>('CUSTOMER');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formGstin, setFormGstin] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formType, setFormType] = useState<ContactType>('CUSTOMER');
  const [formOpeningBalance, setFormOpeningBalance] = useState('');

  const loadContacts = useCallback(async () => {
    try {
      if (activeTab === 'ALL') {
        const all = await ContactRepository.getAllContacts();
        setContacts(all);
      } else {
        const filtered = await ContactRepository.getAllByType(activeTab);
        setContacts(filtered);
      }
    } catch (e) {
      console.error('Failed to load contacts:', e);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [loadContacts])
  );

  const openAddModal = (presetType: ContactType = 'CUSTOMER') => {
    setEditingContact(null);
    setFormName('');
    setFormContactPerson('');
    setFormPhone('');
    setFormEmail('');
    setFormGstin('');
    setFormAddress('');
    setFormType(presetType);
    setFormOpeningBalance('');
    setModalVisible(true);
  };

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setFormName(contact.name);
    setFormContactPerson(contact.contactPerson || '');
    setFormPhone(contact.phone || '');
    setFormEmail(contact.email || '');
    setFormGstin(contact.gstin || '');
    setFormAddress(contact.address || '');
    setFormType(contact.type);
    setFormOpeningBalance(contact.openingBalance ? String(contact.openingBalance) : '');
    setModalVisible(true);
  };

  const handleSaveContact = async () => {
    if (!formName.trim()) {
      showAlert('Validation Error', 'Customer / Contact name is required.');
      return;
    }

    try {
      const openingBal = parseFloat(formOpeningBalance) || 0;
      const contactData: Contact = {
        id: editingContact?.id || generateUUID(),
        tenantId: 'default',
        name: formName.trim(),
        contactPerson: formContactPerson.trim() || undefined,
        phone: formPhone.trim(),
        email: formEmail.trim(),
        address: formAddress.trim(),
        gstin: formGstin.trim() || undefined,
        type: formType,
        openingBalance: openingBal,
        currentBalance: editingContact ? editingContact.currentBalance : openingBal,
        status: 'ACTIVE',
        createdAt: editingContact?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await ContactRepository.save(contactData);
      setModalVisible(false);
      loadContacts();
      showAlert(
        'Success',
        `${formType === 'CUSTOMER' ? 'Customer' : 'Supplier'} ${editingContact ? 'updated' : 'added'} successfully!`
      );
    } catch (e: any) {
      showAlert('Error', `Failed to save contact: ${e?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteContact = (contact: Contact) => {
    showDestructiveConfirm(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      'Delete',
      async () => {
        try {
          await ContactRepository.delete(contact.id);
          loadContacts();
        } catch (e) {
          showAlert('Error', 'Failed to delete contact.');
        }
      }
    );
  };

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.gstin && c.gstin.toLowerCase().includes(q))
    );
  }, [contacts, searchQuery]);

  const renderContactItem = ({ item }: { item: Contact }) => {
    const isCustomer = item.type === 'CUSTOMER';
    const avatarBg = isCustomer ? `${Palette.primary}15` : `${Palette.secondary}15`;
    const avatarColor = isCustomer ? Palette.primary : Palette.secondary;

    return (
      <GlassCard padding={Spacing.md} style={styles.card}>
        <View style={styles.cardHeader}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
            <Text style={[styles.avatarText, { color: avatarColor }]}>
              {item.name?.charAt(0).toUpperCase() || 'C'}
            </Text>
          </View>

          {/* Details */}
          <View style={{ flex: 1, marginHorizontal: Spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[Typography.bodySemibold, { color: Palette.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={[styles.typeBadge, { backgroundColor: `${avatarColor}20` }]}>
                <Text style={[Typography.caption, { color: avatarColor, fontSize: 10, fontWeight: '700' }]}>
                  {item.type}
                </Text>
              </View>
            </View>

            {item.contactPerson ? (
              <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
                Contact: {item.contactPerson}
              </Text>
            ) : null}

            <Text style={[Typography.caption, { color: Palette.textMuted, marginTop: 2 }]}>
              {[item.phone, item.email].filter(Boolean).join(' • ') || 'No contact details'}
            </Text>

            {item.gstin ? (
              <Text style={[Typography.caption, { color: Palette.primary, marginTop: 2, fontWeight: '600' }]}>
                GSTIN: {item.gstin}
              </Text>
            ) : null}
          </View>

          {/* Balance */}
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[Typography.caption, { color: Palette.textMuted }]}>Balance</Text>
            <Text
              style={[
                Typography.bodySemibold,
                { color: item.currentBalance >= 0 ? Palette.success : Palette.error, marginTop: 2 }
              ]}
            >
              {TaxCalculator.formatCurrency(item.currentBalance, item.currency || currency)}
            </Text>
          </View>
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <View style={{ flex: 1 }}>
            {item.address ? (
              <Text style={[Typography.caption, { color: Palette.textMuted }]} numberOfLines={1}>
                📍 {item.address}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
            <Ionicons name="pencil" size={18} color={Palette.primary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleDeleteContact(item)} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={18} color={Palette.error} />
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  };

  const renderFilterChip = (label: string, value: typeof activeTab) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        activeTab === value && { backgroundColor: Palette.primary, borderColor: Palette.primary }
      ]}
      onPress={() => setActiveTab(value)}
    >
      <Text style={[
        Typography.captionMedium, 
        { color: activeTab === value ? '#FFF' : Palette.textMuted }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Palette.background }]}>
      <GradientHeader title="Customers & Contacts" />

      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, phone, email, GSTIN..."
        />
        <View style={styles.filterRow}>
          {renderFilterChip('Customers', 'CUSTOMER')}
          {renderFilterChip('Suppliers', 'SUPPLIER')}
          {renderFilterChip('All Contacts', 'ALL')}
        </View>
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContactItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title={`No ${activeTab.toLowerCase()}s found`}
            body="Tap the button below to add your first contact."
            actionLabel="+ Add Contact"
            onAction={() => openAddModal(activeTab === 'SUPPLIER' ? 'SUPPLIER' : 'CUSTOMER')}
          />
        }
      />

      {/* FAB to add contact */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Palette.primary, shadowColor: Palette.primary }]}
        onPress={() => openAddModal(activeTab === 'SUPPLIER' ? 'SUPPLIER' : 'CUSTOMER')}
      >
        <Ionicons name="person-add" size={26} color="#FFF" />
      </TouchableOpacity>

      {/* ADD / EDIT CUSTOMER MODAL */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: Palette.background }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[Typography.h3, { color: Palette.text }]}>
                {editingContact ? 'Edit Contact' : 'Add New Customer / Supplier'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Palette.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }}>
              {/* Type Toggle */}
              <View style={styles.typeToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.typeToggleBtn,
                    formType === 'CUSTOMER' && { backgroundColor: Palette.primary }
                  ]}
                  onPress={() => setFormType('CUSTOMER')}
                >
                  <Text style={{ color: formType === 'CUSTOMER' ? '#FFF' : Palette.textMuted, fontWeight: '700' }}>
                    Customer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeToggleBtn,
                    formType === 'SUPPLIER' && { backgroundColor: Palette.primary }
                  ]}
                  onPress={() => setFormType('SUPPLIER')}
                >
                  <Text style={{ color: formType === 'SUPPLIER' ? '#FFF' : Palette.textMuted, fontWeight: '700' }}>
                    Supplier
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Input Fields */}
              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: Palette.text }]}>Full Name / Company Name *</Text>
                <TextInput
                  style={[styles.input, { borderColor: Palette.border, color: Palette.text, backgroundColor: Palette.backgroundAlt }]}
                  placeholder="e.g. Acme Corp or John Doe"
                  placeholderTextColor={Palette.textMuted}
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: Palette.text }]}>Contact Person (Optional)</Text>
                <TextInput
                  style={[styles.input, { borderColor: Palette.border, color: Palette.text, backgroundColor: Palette.backgroundAlt }]}
                  placeholder="e.g. Jane Smith"
                  placeholderTextColor={Palette.textMuted}
                  value={formContactPerson}
                  onChangeText={setFormContactPerson}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: Palette.text }]}>Phone Number</Text>
                  <TextInput
                    style={[styles.input, { borderColor: Palette.border, color: Palette.text, backgroundColor: Palette.backgroundAlt }]}
                    placeholder="+91 98765 43210"
                    placeholderTextColor={Palette.textMuted}
                    keyboardType="phone-pad"
                    value={formPhone}
                    onChangeText={setFormPhone}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: Palette.text }]}>Email Address</Text>
                  <TextInput
                    style={[styles.input, { borderColor: Palette.border, color: Palette.text, backgroundColor: Palette.backgroundAlt }]}
                    placeholder="contact@company.com"
                    placeholderTextColor={Palette.textMuted}
                    keyboardType="email-address"
                    value={formEmail}
                    onChangeText={setFormEmail}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: Palette.text }]}>GSTIN / Tax ID</Text>
                  <TextInput
                    style={[styles.input, { borderColor: Palette.border, color: Palette.text, backgroundColor: Palette.backgroundAlt }]}
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    placeholderTextColor={Palette.textMuted}
                    autoCapitalize="characters"
                    value={formGstin}
                    onChangeText={setFormGstin}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: Palette.text }]}>Opening Balance</Text>
                  <TextInput
                    style={[styles.input, { borderColor: Palette.border, color: Palette.text, backgroundColor: Palette.backgroundAlt }]}
                    placeholder="0.00"
                    placeholderTextColor={Palette.textMuted}
                    keyboardType="numeric"
                    value={formOpeningBalance}
                    onChangeText={setFormOpeningBalance}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.inputLabel, { color: Palette.text }]}>Billing / Delivery Address</Text>
                <TextInput
                  style={[styles.input, { height: 80, borderColor: Palette.border, color: Palette.text, backgroundColor: Palette.backgroundAlt }]}
                  placeholder="Street, City, State, PIN Code"
                  placeholderTextColor={Palette.textMuted}
                  multiline
                  value={formAddress}
                  onChangeText={setFormAddress}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md }}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: Palette.border }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[Typography.bodySemibold, { color: Palette.text }]}>Cancel</Text>
                </TouchableOpacity>

                <PremiumButton
                  label={editingContact ? 'Update Contact' : 'Save Contact'}
                  onPress={handleSaveContact}
                  style={{ flex: 2 }}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchSection: { padding: Spacing.lg, paddingBottom: Spacing.sm },
  filterRow: { flexDirection: 'row', marginTop: Spacing.md, gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  listContent: { padding: Spacing.lg, paddingBottom: 100 },
  card: { marginBottom: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: 'bold' },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  iconBtn: { padding: Spacing.xs, marginLeft: Spacing.sm },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 999,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  typeToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.md,
  },
  typeToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  formGroup: { marginBottom: Spacing.md },
  formRow: { flexDirection: 'row', gap: Spacing.md },
  inputLabel: { ...Typography.captionMedium, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: 15,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
});
