import React, { useCallback, useState } from 'react';
import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Searchbar } from 'react-native-paper';

import { searchBooks } from '@/api/books';
import { getApiErrorMessage, getApiErrorStatus } from '@/api/client';
import { addBookToList } from '@/api/lists';
import { BookCover, EmptyState, LoadingState, ScreenContainer, Toast } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/useToast';
import type { RootScreenProps } from '@/navigation/types';
import { colors, radius, spacing, typography } from '@/theme';
import { Book } from '@/types/api';
import { formatAuthors } from '@/utils/format';

export function AddBookToListScreen({ route, navigation }: RootScreenProps<'AddBookToList'>) {
  const { listId } = route.params;
  const toast = useToast();
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query.trim(), 300);
  const [addingId, setAddingId] = useState<string | null>(null);

  const results = useAsync(
    () => (debounced ? searchBooks(debounced) : Promise.resolve<Book[]>([])),
    [debounced],
  );

  const onAdd = useCallback(
    async (book: Book) => {
      setAddingId(book.id);
      try {
        await addBookToList(listId, book.id);
        navigation.goBack();
      } catch (e) {
        if (getApiErrorStatus(e) === 409) {
          toast.show('Esse livro já está na lista', 'info');
        } else {
          toast.show(getApiErrorMessage(e, 'Não foi possível adicionar'), 'error');
        }
        setAddingId(null);
      }
    },
    [listId, navigation, toast],
  );

  const renderItem = useCallback<ListRenderItem<Book>>(
    ({ item }) => (
      <Pressable style={styles.row} onPress={() => onAdd(item)} disabled={addingId !== null}>
        <BookCover uri={item.cover_url} width={40} title={item.title} />
        <View style={styles.rowText}>
          <Text style={typography.subtitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={typography.caption} numberOfLines={1}>
            {formatAuthors(item.authors)}
          </Text>
        </View>
        {addingId === item.id ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Text style={styles.add}>Adicionar</Text>
        )}
      </Pressable>
    ),
    [onAdd, addingId],
  );

  return (
    <ScreenContainer padded={false} edges={['bottom']}>
      <Searchbar
        placeholder="Buscar livro para adicionar"
        value={query}
        onChangeText={setQuery}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
        iconColor={colors.textSecondary}
        placeholderTextColor={colors.textMuted}
        autoFocus
      />

      {!debounced ? (
        <EmptyState icon="book-search" title="Busque um livro" message="Digite um título ou autor para adicionar à lista." />
      ) : results.loading && !results.data ? (
        <LoadingState message="Buscando…" />
      ) : (results.data ?? []).length === 0 ? (
        <EmptyState icon="book-search" title="Nenhum resultado" message="Tente outro termo." />
      ) : (
        <FlatList
          data={results.data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={toast.hide} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchbar: {
    margin: spacing.lg,
    backgroundColor: colors.surfaceVariant,
  },
  searchInput: {
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sep: {
    height: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  add: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
});
