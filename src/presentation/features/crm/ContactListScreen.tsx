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
  TouchableOpacity,
} from 'react-native';
import { Theme } from '../../../core/theme';
import { Contact, ContactType } from '../../../domain/entities/contact';
import { ContactRepository } from '../../../data/repositories/ContactRepository';
import { TaxCalculator } from '../../../core/utils/tax-calculator';

export const ContactListScreen = () => {
  const [type, setType] = useState<ContactType>('CUSTOMER');
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    loadContacts();
  }, [type]);

  const loadContacts = () => {
    const all = ContactRepository.getAllByType(type);
    setContacts(all);
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactDetails}>{item.phone} | {item.email}</Text>
      </View>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text
          style={[
            styles.balanceValue,
            { color: item.currentBalance >= 0 ? Theme.Palette.success : Theme.Palette.error },
          ]}
        >
          {TaxCalculator.formatCurrency(item.currentBalance, item.currency)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contacts</Text>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, type === 'CUSTOMER' && styles.activeTab]}
            onPress={() => setType('CUSTOMER')}
          >
            <Text style={[styles.tabText, type === 'CUSTOMER' && styles.activeTabText]}>Customers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, type === 'SUPPLIER' && styles.activeTab]}
            onPress={() => setType('SUPPLIER')}
          >
            <Text style={[styles.tabText, type === 'SUPPLIER' && styles.activeTabText]}>Suppliers</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {type.toLowerCase()}s found.</Text>
          </View>
        }
      />
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Theme.Palette.background,
    borderRadius: Theme.Spacing.sm,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.Spacing.sm,
    alignItems: 'center',
    borderRadius: Theme.Spacing.sm,
  },
  activeTab: {
    backgroundColor: Theme.Palette.surface,
    elevation: 2,
  },
  tabText: {
    ...Theme.Typography.caption,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: Theme.Palette.primary,
  },
  listContent: {
    padding: Theme.Spacing.md,
  },
  contactCard: {
    backgroundColor: Theme.Palette.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.Spacing.md,
    borderRadius: Theme.Spacing.sm,
    marginBottom: Theme.Spacing.sm,
    elevation: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    ...Theme.Typography.body,
    fontWeight: 'bold',
  },
  contactDetails: {
    ...Theme.Typography.caption,
    marginTop: 2,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 10,
    color: Theme.Palette.textMuted,
  },
  balanceValue: {
    ...Theme.Typography.body,
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




