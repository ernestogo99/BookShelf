import React, { useCallback, useState } from 'react';
import { FlatList, ListRenderItem, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Searchbar } from 'react-native-paper';

import { getTopRated, getTrending, searchBooks } from '@/api/books';
import {
  BookCard,
  EmptyState,
  ErrorState,
  HorizontalBookList,
  LoadingState,
  ScreenContainer,
  SectionHeader,
} from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { useDebounce } from '@/hooks/useDebounce';
import type { ExploreScreenProps } from '@/navigation/types';
import { colors, spacing } from '@/theme';
import { Book } from '@/types/api';

const GAP = spacing.md;
const COLUMNS = 3;

export function ExploreScreen({ navigation }: ExploreScreenProps<'Explore'>) {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query.trim(), 300);
  const isSearching = debounced.length > 0;
  const { width } = useWindowDimensions();
  const cardWidth = (width - spacing.lg * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  const openBook = useCallback(
    (bookId: string) => navigation.navigate('BookDetail', { bookId }),
    [navigation],
  );

  const discover = useAsync(() => Promise.all([getTrending(), getTopRated()]), []);
  const results = useAsync(
    () => (isSearching ? searchBooks(debounced) : Promise.resolve<Book[]>([])),
    [debounced, isSearching],
  );

  const renderGridItem = useCallback<ListRenderItem<Book>>(
    ({ item }) => (
      <BookCard
        width={cardWidth}
        book={item}
        onPress={() => openBook(item.id)}
        status={item.my_reading?.status ?? null}
      />
    ),
    [cardWidth, openBook],
  );

  return (
    <ScreenContainer padded={false}>
      <Searchbar
        placeholder="Buscar livro ou autor"
        value={query}
        onChangeText={setQuery}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
        iconColor={colors.textSecondary}
        placeholderTextColor={colors.textMuted}
      />

      {isSearching ? (
        <SearchResults
          state={results}
          renderItem={renderGridItem}
          numColumns={COLUMNS}
        />
      ) : (
        <DiscoverSections state={discover} onPressBook={openBook} />
      )}
    </ScreenContainer>
  );
}

function SearchResults({
  state,
  renderItem,
  numColumns,
}: {
  state: ReturnType<typeof useAsync<Book[]>>;
  renderItem: ListRenderItem<Book>;
  numColumns: number;
}) {
  if (state.loading && !state.data) return <LoadingState message="Buscando…" />;
  if (state.error) return <ErrorState onRetry={state.reload} />;

  const books = state.data ?? [];
  if (books.length === 0) {
    return (
      <EmptyState
        icon="book-search"
        title="Nenhum livro encontrado"
        message="Tente outro título ou autor."
      />
    );
  }

  return (
    <FlatList
      style={styles.flex}
      data={books}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={numColumns}
      columnWrapperStyle={styles.column}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
    />
  );
}

function DiscoverSections({
  state,
  onPressBook,
}: {
  state: ReturnType<typeof useAsync<[Book[], Book[]]>>;
  onPressBook: (bookId: string) => void;
}) {
  if (state.loading && !state.data) return <LoadingState message="Carregando descobertas…" />;
  if (state.error) return <ErrorState onRetry={state.reload} />;

  const [trending, topRated] = state.data ?? [[], []];

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.discover}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <SectionHeader title="Em alta" />
        {trending.length > 0 ? (
          <HorizontalBookList books={trending} onPressBook={onPressBook} />
        ) : (
          <EmptyState icon="trending-up" title="Sem destaques ainda" />
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Mais avaliados" />
        {topRated.length > 0 ? (
          <HorizontalBookList books={topRated} onPressBook={onPressBook} />
        ) : (
          <EmptyState icon="star" title="Sem avaliações suficientes" />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchbar: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceVariant,
  },
  searchInput: {
    color: colors.text,
  },
  discover: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.xs,
  },
  grid: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: GAP,
  },
  column: {
    gap: GAP,
    marginBottom: GAP,
  },
});
