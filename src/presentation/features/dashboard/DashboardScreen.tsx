/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../auth/store';
import { Theme } from '../../../core/theme';

export const DashboardScreen = () => {
  const logout = useAuthStore((state) => state.logout);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GemSphere Books</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sales Overview</Text>
          <Text style={styles.stat}>$12,450.00</Text>
        </View>

        <View style={[styles.card, { marginTop: Theme.Spacing.md }]}>
          <Text style={styles.cardTitle}>Expenses</Text>
          <Text style={[styles.stat, { color: Theme.Palette.error }]}>$4,200.00</Text>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.Palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.Palette.border,
  },
  title: {
    ...Theme.Typography.h2,
    color: Theme.Palette.primary,
  },
  logoutText: {
    color: Theme.Palette.error,
    ...Theme.Typography.body,
  },
  content: {
    padding: Theme.Spacing.md,
  },
  card: {
    backgroundColor: Theme.Palette.surface,
    padding: Theme.Spacing.lg,
    borderRadius: Theme.Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    ...Theme.Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stat: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.Palette.success,
    marginTop: Theme.Spacing.xs,
  },
});




