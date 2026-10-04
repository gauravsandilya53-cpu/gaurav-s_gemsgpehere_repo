/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * BusinessSelectionScreen — Screen to pick active business or add new business.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAuthStore } from './store';

const { width } = Dimensions.get('window');

export const BusinessSelectionScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const { Palette, Gradients } = theme;

  const user = useAuthStore((state) => state.user);
  const selectBusiness = useAuthStore((state) => state.selectBusiness);

  const businesses = user?.businesses || [];

  const handleSelect = (businessId: string) => {
    selectBusiness(businessId);
    navigation.navigate('Main');
  };

  const handleAddNewBusiness = () => {
    navigation.navigate('AdaptiveOnboarding');
  };

  return (
    <LinearGradient
      colors={isDark ? Gradients.hero : Gradients.primary}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="business" size={44} color="#FFF" />
            </View>
            <Text style={styles.brandTitle}>Select Business Workspace</Text>
            <Text style={styles.brandSubtitle}>
              Welcome back, {user?.name || 'User'}. Choose a business profile to manage.
            </Text>
          </View>

          {/* Business Cards List */}
          <GlassCard padding={Spacing.xl} style={styles.formCard} noBorder={isDark}>
            {businesses.map((b) => {
              const isSelected = user?.tenantId === b.id;
              return (
                <TouchableOpacity
                  key={b.id}
                  style={[
                    styles.businessCard,
                    { borderColor: isSelected ? Palette.primary : Palette.border },
                    isSelected && { backgroundColor: `${Palette.primary}15` },
                  ]}
                  onPress={() => handleSelect(b.id)}
                >
                  <View style={[styles.bizIconWrapper, { backgroundColor: `${Palette.primary}20` }]}>
                    <Ionicons name="briefcase-outline" size={24} color={Palette.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <Text style={[Typography.h4, { color: Palette.text }]}>{b.name}</Text>
                    <Text style={[Typography.captionMedium, { color: Palette.textMuted, marginTop: 2 }]}>
                      {b.businessType} • {b.country}
                    </Text>
                    {b.gstin ? (
                      <Text style={[Typography.caption, { color: Palette.textSecondary, marginTop: 2 }]}>
                        GSTIN: {b.gstin}
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'chevron-forward-outline'}
                    size={24}
                    color={isSelected ? Palette.primary : Palette.textMuted}
                  />
                </TouchableOpacity>
              );
            })}

            {/* Add New Business Button */}
            <TouchableOpacity
              style={[styles.addCard, { borderColor: Palette.primary, backgroundColor: `${Palette.primary}10` }]}
              onPress={handleAddNewBusiness}
            >
              <Ionicons name="add-circle-outline" size={24} color={Palette.primary} style={{ marginRight: Spacing.sm }} />
              <Text style={[Typography.bodySemibold, { color: Palette.primary }]}>
                + Add Another Business
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    paddingBottom: Spacing.xxl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  iconWrapper: {
    width: 76,
    height: 76,
    borderRadius: Radius.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  brandTitle: {
    ...Typography.h2,
    color: '#FFF',
  },
  brandSubtitle: {
    ...Typography.bodyLarge,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 400,
  },
  formCard: {
    width: Math.min(width - 32, 460),
  },
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  bizIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: Spacing.sm,
  },
});
