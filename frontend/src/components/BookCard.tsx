import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

import { BookCover, CoverSize } from './BookCover';
import { ReadingStatus, StatusBadge } from './StatusBadge';
import { StarRating } from './StarRating';

/** Forma mínima de livro que o card renderiza (subconjunto do Book da API). */
export type BookCardItem = {
  id: string;
  title: string;
  authors: string[];
  cover_url?: string | null;
};

type Props = {
  book: BookCardItem;
  onPress?: (book: BookCardItem) => void;
  size?: CoverSize;
  /** Largura fixa do card (capas em grid). */
  width?: number;
  /** Status de leitura do usuário (badge). */
  status?: ReadingStatus | null;
  /** Nota dada pelo usuário (estrelas), quando lido. */
  rating?: number | null;
  /** Esconde título/autor (grade só de capas). */
  coverOnly?: boolean;
};

function BookCardBase({ book, onPress, size = 'md', width, status, rating, coverOnly }: Props) {
  const coverWidth = width ?? undefined;

  return (
    <Pressable
      onPress={() => onPress?.(book)}
      style={({ pressed }) => [styles.card, { width: coverWidth }, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={book.title}
    >
      <BookCover uri={book.cover_url} size={size} width={coverWidth} title={book.title} />

      {status ? <StatusBadge status={status} style={styles.badge} /> : null}

      {!coverOnly ? (
        <View style={styles.meta}>
          <Text style={typography.subtitle} numberOfLines={2}>
            {book.title}
          </Text>
          {book.authors.length > 0 ? (
            <Text style={styles.author} numberOfLines={1}>
              {book.authors.join(', ')}
            </Text>
          ) : null}
          {rating != null && rating > 0 ? (
            <StarRating rating={rating} size={14} />
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  badge: {
    marginTop: spacing.xs,
  },
  meta: {
    gap: 2,
    marginTop: spacing.xs,
  },
  author: {
    ...typography.bodySecondary,
    color: colors.textSecondary,
  },
});

/** Card de livro memoizado (capa + título + autor + status/nota). */
export const BookCard = React.memo(BookCardBase);
