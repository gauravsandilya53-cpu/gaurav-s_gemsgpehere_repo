/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * This code is the intellectual property of GemSphere Technologies Private Limited.
 * Unauthorized copying, distribution, or usage is strictly prohibited.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Base English translations
const en = {
  common: {
    welcome: 'Welcome to GemSphere Books',
    login: 'Login',
    signup: 'Sign Up',
    save: 'Save',
    cancel: 'Cancel',
    error: 'An error occurred',
  },
  auth: {
    email: 'Email',
    password: 'Password',
    biometricPrompt: 'Sign in with Biometrics',
  },
  dashboard: {
    totalSales: 'Total Sales',
    lowStock: 'Low Stock Alerts',
  }
};

// Base Arabic (RTL) translations
const ar = {
  common: {
    welcome: 'Ù…Ø±Ø­Ø¨Ø§Ù‹ Ø¨Ùƒ ÙÙŠ Ø¬ÙŠÙ… Ø³ÙÙŠØ± Ø¨ÙˆÙƒØ³',
    login: 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„',
    signup: 'Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø³Ø§Ø¨',
    save: 'Ø­ÙØ¸',
    cancel: 'Ø¥Ù„ØºØ§Ø¡',
    error: 'Ø­Ø¯Ø« Ø®Ø·Ø£ Ù…Ø§',
  },
  auth: {
    email: 'Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ',
    password: 'ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±',
    biometricPrompt: 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ù‚ÙŠØ§Ø³Ø§Øª Ø§Ù„Ø­ÙŠÙˆÙŠØ©',
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;




