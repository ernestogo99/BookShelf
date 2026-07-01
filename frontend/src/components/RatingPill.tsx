import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

type Props = {
  /** Nota média (0 = sem avaliações). */
  rating: number;
  /** Quantidade de avaliações. */
  count?: number;
  style?: ViewStyle;
};

/** Pílula de nota média (estrela verde + valor), estilo Letterboxd. */
export function RatingPill({ rating, count, style }: Props) {
  const hasRatings = rating > 0;

  return (
    <View style={[styles.pill, style]}>
      <MaterialCommunityIcons name="star" size={16} color={colors.star} />
      <Text style={styles.value}>{hasRatings ? rating.toFixed(1) : '—'}</Text>
      {count !== undefined && hasRatings ? (
        <Text style={styles.count}>
          ({count})
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceVariant,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  count: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
});
