import { TextStyle } from 'react-native';

import { colors } from './colors';

/**
 * Tipografia. Usa a FONTE DO SISTEMA (spec §1.3) para máxima compatibilidade
 * de aparelhos — sem carregamento de fonte custom.
 */
export const typography = {
  display: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 22,
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
