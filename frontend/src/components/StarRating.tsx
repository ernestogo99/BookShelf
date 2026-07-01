import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, hitSize } from '@/theme';

type Props = {
  /** Nota inteira de 0 a 5. */
  rating: number;
  size?: number;
  /** Habilita seleção por toque. */
  interactive?: boolean;
  onChange?: (rating: number) => void;
};

/** Estrelas inteiras (1–5). Modo leitura por padrão; interativo opcional. */
export function StarRating({ rating, size = 18, interactive = false, onChange }: Props) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.row} accessibilityLabel={`Nota ${rating} de 5`}>
      {stars.map((value) => {
        const filled = value <= Math.round(rating);
        const icon = (
          <MaterialCommunityIcons
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={filled ? colors.star : colors.starEmpty}
          />
        );
        if (!interactive) {
          return <View key={value}>{icon}</View>;
        }
        return (
          <Pressable
            key={value}
            onPress={() => onChange?.(value === rating ? 0 : value)}
            hitSlop={8}
            style={styles.touch}
            accessibilityRole="button"
            accessibilityLabel={`Dar ${value} ${value === 1 ? 'estrela' : 'estrelas'}`}
          >
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  touch: {
    minWidth: hitSize / 2,
    minHeight: hitSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
