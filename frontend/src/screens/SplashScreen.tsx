import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

/** Tela de abertura enquanto o authStore valida a sessão (status === 'loading'). */
export function SplashScreen() {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="book-open-page-variant" size={72} color={colors.primary} />
      <Text style={[typography.display, styles.logo]}>Movel</Text>
      <ActivityIndicator color={colors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  logo: {
    marginTop: spacing.md,
  },
  spinner: {
    marginTop: spacing.xl,
  },
});
