/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * ContactVerificationScreen — OTP / Email verification screen.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { useAuthStore } from './store';

const { width } = Dimensions.get('window');

export const ContactVerificationScreen = ({ route, navigation }: any) => {
  const { theme, isDark } = useTheme();
  const { Palette, Gradients } = theme;
  const login = useAuthStore((state) => state.login);

  const { user, targetIdentifier } = route.params || { targetIdentifier: 'user@gemsphere.io' };

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setIsResendDisabled(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    setTimer(30);
    setIsResendDisabled(true);
    setErrorMsg(null);
    Alert.alert('Code Resent', `A new verification code was sent to ${targetIdentifier}. (Demo OTP: 1234)`);
  };

  const handleVerify = async () => {
    setErrorMsg(null);
    if (!otp.trim()) {
      setErrorMsg('Please enter the 4-digit verification code.');
      return;
    }
    
    // Demo check: accept "1234" or any 4-digit numeric code
    if (otp.trim() !== '1234' && otp.trim().length !== 4) {
      setErrorMsg('Invalid verification code. Enter "1234" for instant verification.');
      return;
    }

    setIsLoading(true);
    setTimeout(async () => {
      setIsLoading(false);
      if (user) {
        await login('session_token_' + Date.now(), user);
        // If user hasn't completed onboarding, navigate to AdaptiveOnboarding
        navigation.navigate('AdaptiveOnboarding');
      } else {
        navigation.navigate('Login');
      }
    }, 600);
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
          {/* Header */}
          <View style={styles.headerSection}>
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="shield-checkmark" size={48} color="#FFF" />
            </View>
            <Text style={styles.brandTitle}>Verify Your Contact</Text>
            <Text style={styles.brandSubtitle}>
              We sent a 4-digit verification code to
            </Text>
            <Text style={styles.identifierText}>{targetIdentifier}</Text>
          </View>

          {/* Form Card */}
          <GlassCard padding={Spacing.xl} style={styles.formCard} noBorder={isDark}>
            {errorMsg ? (
              <View style={[styles.errorBanner, { backgroundColor: `${Palette.error}20`, borderColor: Palette.error }]}>
                <Ionicons name="alert-circle-outline" size={18} color={Palette.error} style={{ marginRight: 6 }} />
                <Text style={[Typography.captionMedium, { color: Palette.error, flex: 1 }]}>
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            <Text style={[Typography.label, { color: Palette.textMuted, textAlign: 'center', marginBottom: Spacing.sm }]}>
              ENTER VERIFICATION CODE (DEMO: 1234)
            </Text>

            <View style={styles.otpInputRow}>
              <TextInput
                style={[
                  styles.otpInput,
                  { color: Palette.text, borderColor: Palette.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF' },
                ]}
                placeholder="1234"
                placeholderTextColor={Palette.textMuted}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={4}
                autoFocus
              />
            </View>

            <View style={{ marginTop: Spacing.xl }}>
              <PremiumButton
                label="Verify & Continue"
                onPress={handleVerify}
                size="lg"
                fullWidth
                loading={isLoading}
              />
            </View>

            {/* Resend & Timer */}
            <View style={styles.resendRow}>
              {isResendDisabled ? (
                <Text style={[Typography.captionMedium, { color: Palette.textMuted }]}>
                  Resend code in {timer}s
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={[Typography.captionMedium, { color: Palette.primary }]}>
                    Resend Verification Code
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginTop: Spacing.md, alignItems: 'center' }}
            >
              <Text style={[Typography.caption, { color: Palette.textMuted }]}>
                Entered wrong email/phone? <Text style={{ color: Palette.primary }}>Go Back</Text>
              </Text>
            </TouchableOpacity>
          </GlassCard>
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
    alignItems: 'center',
    padding: Spacing.lg,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconWrapper: {
    width: 80,
    height: 80,
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
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  identifierText: {
    ...Typography.bodySemibold,
    color: '#FFF',
    marginTop: 2,
  },
  formCard: {
    width: Math.min(width - 32, 420),
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  otpInputRow: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  otpInput: {
    width: 180,
    height: 54,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 8,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
});
