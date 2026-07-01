import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import { MonthPoint } from '@/utils/stats';

type Props = {
  data: MonthPoint[];
  height?: number;
};

const BAR_WIDTH = 28;
const BAR_GAP = spacing.md;

/** Gráfico de barras feito só com View (sem lib de gráfico). Rola na horizontal. */
export function BarChart({ data, height = 160 }: Props) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
      {data.map((point) => {
        const barHeight = Math.round((point.value / max) * height);
        const showYear = point.month === 0;
        return (
          <View key={point.key} style={styles.col} accessibilityLabel={`${point.label} ${point.year}: ${point.value}`}>
            <Text style={styles.value}>{point.value > 0 ? point.value : ''}</Text>
            <View style={[styles.track, { height }]}>
              <View
                style={[
                  styles.bar,
                  { height: Math.max(point.value > 0 ? 4 : 0, barHeight) },
                  point.value === 0 && styles.barEmpty,
                ]}
              />
            </View>
            <Text style={styles.label}>{point.label}</Text>
            <Text style={styles.year}>{showYear ? point.year : ''}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: BAR_GAP,
    paddingVertical: spacing.sm,
    alignItems: 'flex-end',
  },
  col: {
    width: BAR_WIDTH,
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    ...typography.caption,
    color: colors.textSecondary,
    height: 16,
  },
  track: {
    justifyContent: 'flex-end',
    width: BAR_WIDTH,
  },
  bar: {
    width: BAR_WIDTH,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },
  barEmpty: {
    backgroundColor: colors.surfaceVariant,
    height: 2,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  year: {
    fontSize: 10,
    color: colors.textMuted,
    height: 12,
  },
});
