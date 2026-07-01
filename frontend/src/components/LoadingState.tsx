import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, spacing, typography } from '@/theme';

type Props = {
  message?: string;
  style?: ViewStyle;
};

/** Estado de carregamento centralizado. */
export function LoadingState({ message, style }: Props) {
  return (
    <View style={[styles.center, style]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={[typography.bodySecondary, styles.msg]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  msg: {
    textAlign: 'center',
  },
});
