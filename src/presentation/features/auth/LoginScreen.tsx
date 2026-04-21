/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './store';
import { BiometryService } from '../../../core/auth/biometry';
import { Theme } from '../../../core/theme';

export const LoginScreen = () => {
  const { t } = useTranslation();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), 'Please fill in all fields');
      return;
    }
    // Simulate API call
    await login('mock_token', { email });
  };

  const handleBiometricLogin = async () => {
    const success = await BiometryService.authenticate(t('auth.biometricPrompt'));
    if (success) {
      await login('mock_token_biometric', { email: 'biometric@user.com' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('common.welcome')}</Text>
        
        <TextInput
          style={styles.input}
          placeholder={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>{t('common.login')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.biometricButton} 
          onPress={handleBiometricLogin}
        >
          <Text style={styles.biometricText}>ðŸ”‘ Use Biometrics</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.Palette.background,
  },
  content: {
    flex: 1,
    padding: Theme.Spacing.lg,
    justifyContent: 'center',
  },
  title: {
    ...Theme.Typography.h1,
    marginBottom: Theme.Spacing.xl,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Theme.Palette.surface,
    padding: Theme.Spacing.md,
    borderRadius: Theme.Spacing.sm,
    borderWidth: 1,
    borderColor: Theme.Palette.border,
    marginBottom: Theme.Spacing.md,
    ...Theme.Typography.body,
  },
  button: {
    backgroundColor: Theme.Palette.primary,
    padding: Theme.Spacing.md,
    borderRadius: Theme.Spacing.sm,
    alignItems: 'center',
    marginTop: Theme.Spacing.md,
  },
  buttonText: {
    color: Theme.Palette.surface,
    ...Theme.Typography.body,
    fontWeight: 'bold',
  },
  biometricButton: {
    marginTop: Theme.Spacing.xl,
    alignItems: 'center',
  },
  biometricText: {
    color: Theme.Palette.primary,
    ...Theme.Typography.body,
  },
});




