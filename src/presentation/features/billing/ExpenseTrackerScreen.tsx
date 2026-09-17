/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * ExpenseTrackerScreen — Record and track business expenses.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { GradientHeader } from '../../components/ui/GradientHeader';
import { GlassCard } from '../../components/ui/GlassCard';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { LedgerRepository } from '../../../data/repositories/LedgerRepository';
import { useAuthStore } from '../auth/store';
import { Ionicons } from '@expo/vector-icons';

export const ExpenseTrackerScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { Palette } = theme;
  const { currency } = useAuthStore();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Rent');
  const [description, setDescription] = useState('');

  const categories = ['Rent', 'Utilities', 'Marketing', 'Software', 'Travel', 'Other'];

  const handleSave = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount.');
      return;
    }

    try {
      await LedgerRepository.addEntry({
        id: `led-exp-${Date.now()}`,
        type: 'EXPENSE',
        category,
        amount: val,
        currency,
        description: description || `${category} Expense`,
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Expense logged successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save expense');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: Palette.background }]}>
      <GradientHeader title="Log Expense" onLeftPress={() => navigation.goBack()} />

      <ScrollView style={{ padding: Spacing.lg }}>
        <GlassCard padding={Spacing.xl}>
          <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: Spacing.xs }]}>Amount</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: Palette.primary, marginBottom: Spacing.xl }}>
            <Text style={[Typography.h2, { color: Palette.text, marginRight: Spacing.xs }]}>$</Text>
            <TextInput
              style={[Typography.display, { color: Palette.text, flex: 1, height: 60 }]}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={Palette.textMuted}
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: Spacing.sm }]}>Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl }}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.categoryChip,
                  { borderColor: Palette.border },
                  category === c && { backgroundColor: Palette.primary, borderColor: Palette.primary }
                ]}
                onPress={() => setCategory(c)}
              >
                <Text style={[Typography.captionMedium, { color: category === c ? '#FFF' : Palette.text }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: Spacing.xs }]}>Notes / Description</Text>
          <TextInput
            style={[styles.input, { color: Palette.text, borderColor: Palette.border, backgroundColor: Palette.surface }]}
            placeholder="e.g. Office internet bill"
            placeholderTextColor={Palette.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View style={{ marginTop: Spacing.xxl }}>
            <PremiumButton label="Save Expense" onPress={handleSave} fullWidth size="lg" />
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1 },
  input: { padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, minHeight: 80, textAlignVertical: 'top', ...Typography.body },
});
