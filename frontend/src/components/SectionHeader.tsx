import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, spacing, typography } from '@/theme';

type Props = {
  title: string;
  /** Texto da ação à direita (ex.: "Ver tudo"). */
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
};

/** Cabeçalho de seção: título à esquerda, ação opcional à direita. */
export function SectionHeader({ title, actionLabel, onAction, style }: Props) {
  return (
    <View style={[styles.row, style]}>
      <Text style={typography.heading}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  action: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
