import React from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';

import { colors } from '@/theme';

export type ToastType = 'success' | 'error' | 'info';

type Props = {
  visible: boolean;
  message: string;
  type?: ToastType;
  onDismiss: () => void;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
};

const BG: Record<ToastType, string> = {
  success: colors.success,
  error: colors.error,
  info: colors.surfaceHigh,
};

const FG: Record<ToastType, string> = {
  success: colors.textOnAccent,
  error: colors.text,
  info: colors.text,
};

/** Snackbar de feedback (sucesso/erro/info). Controlado por `visible`. */
export function Toast({ visible, message, type = 'info', onDismiss, duration = 3000, actionLabel, onAction }: Props) {
  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={duration}
      style={[styles.bar, { backgroundColor: BG[type] }]}
      theme={{ colors: { inverseOnSurface: FG[type], inversePrimary: FG[type] } }}
      action={actionLabel && onAction ? { label: actionLabel, onPress: onAction, textColor: FG[type] } : undefined}
    >
      {message}
    </Snackbar>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: 8,
  },
});
