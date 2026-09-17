/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * LoginScreen — Premium Auth Screen with gradients and biometrics.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from './store';
import { BiometryService } from '../../../core/auth/biometry';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { PremiumButton } from '../../components/ui/PremiumButton';

const { width } = Dimensions.get('window');

export const LoginScreen = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const { Palette, Gradients } = theme;
  
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const formOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12 });
    logoOpacity.value = withTiming(1, { duration: 800 });
    
    formTranslateY.value = withDelay(300, withSpring(0, { damping: 15 }));
    formOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter email and password.');
      return;
    }
    setIsLoading(true);
    // Simulate API delay
    setTimeout(async () => {
      await login('mock_token', { id: 1, email, name: 'Admin User', tenantId: 'tenant-1' });
      setIsLoading(false);
    }, 1000);
  };

  const handleBiometricLogin = async () => {
    const success = await BiometryService.authenticate('Log in to GemSphere Books');
    if (success) {
      setIsLoading(true);
      setTimeout(async () => {
        await login('mock_token_biometric', { id: 2, email: 'owner@business.com', name: 'Business Owner', tenantId: 'tenant-1' });
        setIsLoading(false);
      }, 500);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setTimeout(async () => {
      await login('demo_token', { id: 3, email: 'demo@gemsphere.com', name: 'Demo User', tenantId: 'demo-tenant' });
      setIsLoading(false);
    }, 800);
  };

  return (
    <LinearGradient
      colors={isDark ? Gradients.hero : Gradients.primary}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Logo Section */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="cube" size={64} color="#FFF" />
            </View>
            <Text style={styles.brandTitle}>GemSphere Books</Text>
            <Text style={styles.brandSubtitle}>Intelligent Business Management</Text>
          </Animated.View>

          {/* Form Section */}
          <Animated.View style={formAnimatedStyle}>
            <GlassCard padding={Spacing.xxl} style={styles.formCard} noBorder={isDark}>
              <Text style={[Typography.h2, { color: Palette.text, marginBottom: Spacing.xl, textAlign: 'center' }]}>
                Welcome Back
              </Text>

              <View style={styles.inputGroup}>
                <Ionicons name="mail-outline" size={20} color={Palette.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: Palette.text, borderBottomColor: Palette.border }]}
                  placeholder="Email Address"
                  placeholderTextColor={Palette.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Ionicons name="lock-closed-outline" size={20} color={Palette.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: Palette.text, borderBottomColor: Palette.border }]}
                  placeholder="Password"
                  placeholderTextColor={Palette.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <Text style={[Typography.captionMedium, { color: Palette.primary, textAlign: 'right', marginBottom: Spacing.xl }]}>
                Forgot Password?
              </Text>

              <PremiumButton 
                label="Sign In" 
                onPress={handleLogin} 
                size="lg" 
                fullWidth 
                loading={isLoading}
              />

              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: Palette.border }]} />
                <Text style={[Typography.caption, { color: Palette.textMuted, marginHorizontal: Spacing.md }]}>
                  OR
                </Text>
                <View style={[styles.divider, { backgroundColor: Palette.border }]} />
              </View>

              <View style={styles.actionRow}>
                <PremiumButton 
                  label="Face / Touch ID" 
                  variant="ghost" 
                  icon={<Ionicons name="finger-print" size={20} color={Palette.primary} />}
                  onPress={handleBiometricLogin} 
                  fullWidth
                />
              </View>

              <View style={{ marginTop: Spacing.lg }}>
                <PremiumButton 
                  label="Continue as Demo" 
                  variant="outline" 
                  onPress={handleDemoLogin} 
                  fullWidth
                />
              </View>

            </GlassCard>
          </Animated.View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.huge,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: Radius.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  brandTitle: {
    ...Typography.h1,
    color: '#FFF',
    letterSpacing: 0,
    marginBottom: 4,
  },
  brandSubtitle: {
    ...Typography.bodyLarge,
    color: 'rgba(255,255,255,0.8)',
  },
  formCard: {
    width: Math.min(width - 32, 400),
    alignSelf: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    ...Typography.bodyLarge,
    borderBottomWidth: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
