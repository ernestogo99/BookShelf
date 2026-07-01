import React from 'react';
import { KeyboardAvoidingView, RefreshControl, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

type Props = {
  children: React.ReactNode;
  /** Envolve o conteúdo num ScrollView. */
  scroll?: boolean;
  /** Aplica padding horizontal padrão. */
  padded?: boolean;
  /** Bordas seguras a respeitar (padrão: topo). */
  edges?: readonly Edge[];
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  /** Pull-to-refresh (apenas com scroll). */
  refreshing?: boolean;
  onRefresh?: () => void;
  /**
   * Evita que o teclado cubra os campos (telas de formulário).
   * Necessário no Android com edge-to-edge (SDK 54), onde a janela não
   * encolhe mais sozinha ao abrir o teclado.
   */
  avoidKeyboard?: boolean;
};

/** Casca padrão de tela: fundo escuro + safe area + scroll/padding opcionais. */
export function ScreenContainer({
  children,
  scroll = false,
  padded = true,
  edges = ['top'],
  contentContainerStyle,
  style,
  refreshing,
  onRefresh,
  avoidKeyboard = false,
}: Props) {
  const padStyle = padded ? styles.padded : undefined;

  const inner = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[padStyle, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padStyle, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      {avoidKeyboard ? (
        <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={0}>
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
});
