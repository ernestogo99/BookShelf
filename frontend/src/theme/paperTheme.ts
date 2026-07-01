import { MD3DarkTheme } from 'react-native-paper';

import { colors } from './colors';

/**
 * Tema do React Native Paper (MD3 escuro) alinhado à paleta Letterboxd.
 * Fornecido via <PaperProvider theme={paperTheme}> na raiz.
 */
export const paperTheme = {
  ...MD3DarkTheme,
  dark: true,
  roundness: 8,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    onPrimary: colors.textOnAccent,
    primaryContainer: colors.primaryDark,
    onPrimaryContainer: colors.text,
    secondary: colors.wantToRead,
    background: colors.background,
    onBackground: colors.text,
    surface: colors.surface,
    onSurface: colors.text,
    surfaceVariant: colors.surfaceVariant,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    outlineVariant: colors.divider,
    error: colors.error,
    onError: colors.text,
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level0: colors.background,
      level1: colors.surface,
      level2: colors.surfaceVariant,
      level3: colors.surfaceVariant,
      level4: colors.surfaceHigh,
      level5: colors.surfaceHigh,
    },
  },
} as const;

export type PaperTheme = typeof paperTheme;
