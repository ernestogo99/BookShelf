import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, spacing, typography } from '@/theme';

import { AppButton } from './AppButton';

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
};

/** Estado de erro: ícone + mensagem + botão "Tentar de novo". */
export function ErrorState({
  title = 'Algo deu errado',
  message = 'Não foi possível carregar. Verifique sua conexão e tente novamente.',
  onRetry,
  style,
}: Props) {
  return (
    <View style={[styles.center, style]}>
      <MaterialCommunityIcons name="alert-circle-outline" size={56} color={colors.error} />
      <Text style={[typography.heading, styles.title]}>{title}</Text>
      <Text style={[typography.bodySecondary, styles.msg]}>{message}</Text>
      {onRetry ? (
        <AppButton label="Tentar de novo" icon="refresh" onPress={onRetry} fullWidth={false} style={styles.action} />
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
