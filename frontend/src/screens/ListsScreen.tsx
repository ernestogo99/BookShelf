import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Dialog, FAB, Portal, TextInput } from 'react-native-paper';

import { getApiErrorMessage } from '@/api/client';
import { createList, getUserLists } from '@/api/lists';
import { BookCover, EmptyState, ErrorState, LoadingState, Toast } from '@/components';
import { useToast } from '@/hooks/useToast';
import type { ProfileStackParamList } from '@/navigation/types';
import { colors, radius, spacing, typography } from '@/theme';
import { BookList } from '@/types/api';

export function ListsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const toast = useToast();

  const [lists, setLists] = useState<BookList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(async (quiet: boolean) => {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      setLists(await getUserLists());
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load(lists.length > 0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load]),
  );

  const onCreate = async () => {
    const name = title.trim();
    if (!name) return;
    setCreating(true);
    try {
      const created = await createList({ title: name });
      setDialogOpen(false);
      setTitle('');
      navigation.navigate('ListDetail', { listId: created.id });
    } catch (e) {
      toast.show(getApiErrorMessage(e, 'Não foi possível criar a lista'), 'error');
    } finally {
      setCreating(false);
    }
  };

  const renderItem = useCallback<ListRenderItem<BookList>>(
    ({ item }) => (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('ListDetail', { listId: item.id })}
        accessibilityRole="button"
        accessibilityLabel={item.title}
      >
        <View style={styles.thumbs}>
          {item.books.length > 0 ? (
            item.books.slice(0, 4).map((b) => <BookCover key={b.book.id} uri={b.book.cover_url} width={40} />)
          ) : (
            <BookCover uri={null} width={40} />
          )}
        </View>
        <View style={styles.cardText}>
          <Text style={typography.subtitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={typography.caption}>
            {item.books.length} {item.books.length === 1 ? 'livro' : 'livros'}
          </Text>
        </View>
      </Pressable>
    ),
    [navigation],
  );

  return (
    <View style={styles.container}>
      {loading && lists.length === 0 ? (
        <LoadingState />
      ) : error && lists.length === 0 ? (
        <ErrorState onRetry={() => load(false)} />
      ) : lists.length === 0 ? (
        <EmptyState
          icon="format-list-bulleted"
          title="Nenhuma lista ainda"
          message="Crie listas temáticas e organize seus livros."
          actionLabel="Criar lista"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.gap} />}
          showsVerticalScrollIndicator={false}
          refreshing={false}
          onRefresh={() => load(true)}
        />
      )}

      <FAB icon="plus" style={styles.fab} color={colors.textOnAccent} onPress={() => setDialogOpen(true)} />

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)} style={styles.dialog}>
          <Dialog.Title>Nova lista</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="Título"
              value={title}
              onChangeText={setTitle}
              maxLength={200}
              autoFocus
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)} textColor={colors.textSecondary}>
              Cancelar
            </Button>
            <Button onPress={onCreate} loading={creating} disabled={!title.trim() || creating} textColor={colors.primary}>
              Criar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={toast.hide} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 96,
  },
  gap: {
    height: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  thumbs: {
    flexDirection: 'row',
    gap: 2,
  },
  cardText: {
    flex: 1,
    gap: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
  },
  dialog: {
    backgroundColor: colors.surface,
  },
});
