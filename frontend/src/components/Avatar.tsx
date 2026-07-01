import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors } from '@/theme';

type Props = {
  uri?: string | null;
  /** Nome para gerar iniciais quando não há foto. */
  name?: string;
  size?: number;
  style?: ViewStyle;
};

function initials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** Avatar circular: foto (avatar_url) ou iniciais como fallback. */
export function Avatar({ uri, name, size = 48, style }: Props) {
  const box: ViewStyle = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View
      style={[styles.wrap, box, style]}
      accessibilityLabel={name ? `Avatar de ${name}` : 'Avatar'}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.image} contentFit="cover" transition={150} cachePolicy="memory-disk" />
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials(name)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.surfaceHigh,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: colors.text,
    fontWeight: '700',
  },
});
