/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * ForgotPasswordScreen — Secure Password Recovery Screen.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../core/theme/ThemeContext';
import { Typography, Spacing, Radius } from '../../../core/theme';
import { GlassCard } from '../../components/ui/GlassCard';
import { PremiumButton } from '../../components/ui/PremiumButton';
import { AuthService } from '../../../domain/services/AuthService';

const { width } = Dimensions.get('window');

export const ForgotPasswordScreen = ({ navigation }: any) => {
  const { theme, isDark } = useTheme();
  const { Palette, Gradients } = theme;

  const [identifier, setIdentifier] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleRequestCode = async () => {
    setErrorMsg(null);
    if (!identifier.trim()) {
      setErrorMsg('Please enter your registered email or mobile number.');
      return;
    }

    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 500));
    setIsLoading(false);

    // Neutral security confirmation message to prevent account enumeration
    setInfoMsg(`If an account exists for "${identifier}", password recovery instructions and a 4-digit code (Demo code: 1234) have been dispatched.`);
    setStep('reset');
  };

  const handleResetPassword = async () => {
    setErrorMsg(null);
    if (!otp.trim()) {
      setErrorMsg('Please enter the 4-digit verification code.');
      return;
    }
    if (otp.trim() !== '1234' && otp.trim().length !== 4) {
      setErrorMsg('Invalid verification code. Enter "1234" for demo reset.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const result = await AuthService.resetPassword(identifier, newPassword);
    setIsLoading(false);

    if (!result.success) {
      setErrorMsg(result.error || 'Password reset failed.');
      return;
    }

    Alert.alert(
      'Password Reset Successful',
      'Your password has been updated. Please log in with your new password.',
      [{ text: 'Log In', onPress: () => navigation.navigate('Login') }]
    );
  };

  return (
    <LinearGradient
      colors={isDark ? Gradients.hero : Gradients.primary}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.headerSection}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="key-outline" size={38} color="#FFF" />
              </View>
              <Text style={styles.brandTitle}>Reset Password</Text>
              <Text style={styles.brandSubtitle}>
                {step === 'request'
                  ? 'Enter your registered email or mobile number to recover your account.'
                  : 'Enter the verification code and set your new password.'}
              </Text>
            </View>

            {/* Form Card */}
            <GlassCard padding={Spacing.lg} style={styles.formCard} noBorder={isDark}>
            {infoMsg ? (
              <View style={[styles.infoBanner, { backgroundColor: `${Palette.info}20`, borderColor: Palette.info }]}>
                <Ionicons name="information-circle-outline" size={20} color={Palette.info} style={{ marginRight: 8 }} />
                <Text style={[Typography.captionMedium, { color: Palette.text, flex: 1 }]}>
                  {infoMsg}
                </Text>
              </View>
            ) : null}

            {errorMsg ? (
              <View style={[styles.errorBanner, { backgroundColor: `${Palette.error}20`, borderColor: Palette.error }]}>
                <Ionicons name="alert-circle-outline" size={18} color={Palette.error} style={{ marginRight: 6 }} />
                <Text style={[Typography.captionMedium, { color: Palette.error, flex: 1 }]}>
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            {step === 'request' ? (
              <>
                <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>
                  Email Address or Mobile Number
                </Text>
                <View style={[styles.inputGroup, { borderBottomColor: Palette.border }]}>
                  <Ionicons name="mail-outline" size={20} color={Palette.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: Palette.text }]}
                    placeholder="email@domain.com or +91 98765..."
                    placeholderTextColor={Palette.textMuted}
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                  />
                </View>

                <View style={{ marginTop: Spacing.xl }}>
                  <PremiumButton
                    label="Send Reset Instructions"
                    onPress={handleRequestCode}
                    size="lg"
                    fullWidth
                    loading={isLoading}
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={[Typography.label, { color: Palette.textMuted, marginBottom: 4 }]}>
                  4-Digit Code (Demo: 1234)
                </Text>
                <View style={[styles.inputGroup, { borderBottomColor: Palette.border }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={Palette.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: Palette.text }]}
                    placeholder="1234"
                    placeholderTextColor={Palette.textMuted}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>

                <Text style={[Typography.label, { color: Palette.textMuted, marginTop: Spacing.md, marginBottom: 4 }]}>
                  New Password
                </Text>
                <View style={[styles.inputGroup, { borderBottomColor: Palette.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={Palette.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: Palette.text }]}
                    placeholder="At least 6 characters"
                    placeholderTextColor={Palette.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Palette.textMuted} />
                  </TouchableOpacity>
                </View>

                <View style={{ marginTop: Spacing.xl }}>
                  <PremiumButton
                    label="Update Password & Log In"
                    onPress={handleResetPassword}
                    size="lg"
                    fullWidth
                    loading={isLoading}
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={{ marginTop: Spacing.xl, alignItems: 'center' }}
            >
              <Text style={[Typography.bodyMedium, { color: Palette.primary }]}>
                ← Return to Login
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>
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
  marginBottom: Spacing.md,
  paddingHorizontal: Spacing.md,
},
iconWrapper: {
  width: 56,
  height: 56,
  borderRadius: Radius.xxl,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: Spacing.sm,
},
  brandTitle: {
    ...Typography.h2,
    color: '#FFF',
  },
  brandSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 380,
  },
  formCard: {
    width: Math.min(width - 32, 440),
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    marginBottom: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    ...Typography.bodyLarge,
  },
  eyeIcon: {
    padding: Spacing.xs,
  },
});
