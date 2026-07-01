import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, radius, spacing, statusColor, statusLabel } from '@/theme';
import { ReadingStatus } from '@/types/api';

export type { ReadingStatus };

type Props = {
  status: ReadingStatus;
  /** Variante cheia (fundo colorido) ou contorno. */
  variant?: 'solid' | 'outline';
  style?: ViewStyle;
};

/** Pílula colorida do status de leitura (azul/laranja/verde). */
export function StatusBadge({ status, variant = 'solid', style }: Props) {
  const color = statusColor(status);
  const solid = variant === 'solid';

  return (
    <View
      style={[
        styles.badge,
        solid ? { backgroundColor: color } : { borderColor: color, borderWidth: 1 },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: solid ? colors.textOnAccent : color }]} />
      <Text style={[styles.label, { color: solid ? colors.textOnAccent : color }]}>
        {statusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
