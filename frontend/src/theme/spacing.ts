/** Escala de espaçamento (múltiplos de 4). Único lugar de spacing do app. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Raios de borda. */
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

/** Área de toque mínima acessível (spec §12: ≥ 44px). */
export const hitSize = 44;
