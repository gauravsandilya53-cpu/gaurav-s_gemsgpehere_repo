/**
 * © GemSphere Technologies Private Limited. All rights reserved.
 * ThemeContext — Manages dark/light mode across the entire app.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { LightTheme, DarkTheme } from './index';
import { StorageService } from '../storage/mmkv';

type ThemeMode = 'light' | 'dark' | 'system';
type AppTheme = typeof LightTheme;

interface ThemeContextValue {
  theme: AppTheme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: LightTheme,
  mode: 'system',
  isDark: false,
  setMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await StorageService.getString('theme_mode');
      if (saved) setModeState(saved as ThemeMode);
    };
    loadTheme();
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    StorageService.set('theme_mode', newMode);
    setModeState(newMode);
  }, []);

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const theme = isDark ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode, isDark, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => useContext(ThemeContext);
