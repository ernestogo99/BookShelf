import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';

import { spacing } from '@/theme';
import { Book } from '@/types/api';

import { BookCard } from './BookCard';

type Props = {
  books: Book[];
  onPressBook: (bookId: string) => void;
};

const CARD_WIDTH = 110;

/** Lista horizontal de capas (seções de descoberta). */
export function HorizontalBookList({ books, onPressBook }: Props) {
  const renderItem = useCallback<ListRenderItem<Book>>(
    ({ item }) => (
      <BookCard
        width={CARD_WIDTH}
        book={item}
        onPress={() => onPressBook(item.id)}
        rating={item.my_reading?.rating ?? null}
        status={item.my_reading?.status ?? null}
      />
    ),
    [onPressBook],
  );

  return (
    <FlatList
      data={books}
      horizontal
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
});
