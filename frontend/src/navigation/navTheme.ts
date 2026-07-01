import { DarkTheme, Theme } from '@react-navigation/native';

import { colors } from '@/theme';

/** Tema do React Navigation alinhado à paleta escura do app. */
export const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
};
