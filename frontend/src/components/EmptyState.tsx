import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, spacing, typography } from '@/theme';

import { AppButton } from './AppButton';

type Props = {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
};

/** Estado vazio: ícone + título + mensagem + ação opcional. */
export function EmptyState({ icon = 'book-open-page-variant', title, message, actionLabel, onAction, style }: Props) {
  return (
    <View style={[styles.center, style]}>
      <MaterialCommunityIcons name={icon} size={56} color={colors.textMuted} />
      <Text style={[typography.heading, styles.title]}>{title}</Text>
      {message ? <Text style={[typography.bodySecondary, styles.msg]}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <AppButton label={actionLabel} onPress={onAction} fullWidth={false} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  msg: {
    textAlign: 'center',
    maxWidth: 300,
  },
  action: {
    marginTop: spacing.md,
  },
});
