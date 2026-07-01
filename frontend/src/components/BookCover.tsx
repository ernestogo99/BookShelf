import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

export type CoverSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const WIDTHS: Record<CoverSize, number> = {
  xs: 40,
  sm: 64,
  md: 96,
  lg: 128,
  xl: 168,
};

/** Proporção de capa de livro (2:3). */
const RATIO = 3 / 2;

type Props = {
  uri?: string | null;
  size?: CoverSize;
  /** Largura custom (sobrepõe `size`). */
  width?: number;
  title?: string;
  style?: ViewStyle;
};

/** Capa de livro com cache (expo-image) e placeholder quando sem URL. */
export function BookCover({ uri, size = 'md', width, title, style }: Props) {
  const w = width ?? WIDTHS[size];
  const h = w * RATIO;
  const box: ViewStyle = { width: w, height: h, borderRadius: radius.md };

  return (
    <View style={[styles.wrap, box, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          accessibilityLabel={title ? `Capa de ${title}` : 'Capa do livro'}
        />
      ) : (
        <View style={styles.placeholder} accessibilityLabel={title ? `Sem capa: ${title}` : 'Livro sem capa'}>
          <MaterialCommunityIcons name="book-variant" size={w * 0.4} color={colors.textMuted} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceVariant,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceVariant,
  },
});
