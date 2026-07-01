import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';

import { getApiErrorMessage } from '@/api/client';
import { deleteList, getList, removeBookFromList, reorderListBooks, updateList } from '@/api/lists';
import { AppButton, BookCover, EmptyState, ErrorState, LoadingState, RatingPill, Toast } from '@/components';
import { useToast } from '@/hooks/useToast';
import type { ProfileStackParamList, RootStackParamList } from '@/navigation/types';
import { colors, radius, spacing, typography } from '@/theme';
import { BookList, ListBookItem } from '@/types/api';
import { formatAuthors } from '@/utils/format';

type Nav = NativeStackNavigationProp<ProfileStackParamList & RootStackParamList>;

export function ListDetailScreen() {
  const route = useRoute<RouteProp<ProfileStackParamList, 'ListDetail'>>();
  const navigation = useNavigation<Nav>();
  const { listId } = route.params;
  const toast = useToast();
  const showToast = toast.show;

  const [list, setList] = useState<BookList | null>(null);
  const [items, setItems] = useState<ListBookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const firstLoad = useRef(true);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const applyList = useCallback((l: BookList) => {
    setList(l);
    setItems([...l.books].sort((a, b) => a.position - b.position));
  }, []);

  const load = useCallback(
    async (quiet: boolean) => {
      if (!quiet) setLoading(true);
      setError(null);
      try {
        applyList(await getList(listId));
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    },
    [listId, applyList],
  );

  useFocusEffect(
    useCallback(() => {
      void load(!firstLoad.current);
      firstLoad.current = false;
    }, [load]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: list?.title ?? 'Lista',
      headerRight: () => (
        <View style={styles.headerActions}>
          <Pressable onPress={openRename} hitSlop={8} accessibilityLabel="Renomear lista">
            <MaterialCommunityIcons name="pencil" size={20} color={colors.textSecondary} />
          </Pressable>
          <Pressable onPress={() => setDeleteOpen(true)} hitSlop={8} accessibilityLabel="Excluir lista">
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
          </Pressable>
        </View>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, list?.title]);

  const openRename = () => {
    setRenameValue(list?.title ?? '');
    setRenameOpen(true);
  };

  const onRename = async () => {
    const name = renameValue.trim();
    if (!name) return;
    setRenaming(true);
    try {
      applyList(await updateList(listId, { title: name }));
      setRenameOpen(false);
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Não foi possível renomear'), 'error');
    } finally {
      setRenaming(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await deleteList(listId);
      navigation.goBack();
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Não foi possível excluir'), 'error');
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const onReorder = useCallback(
    async (data: ListBookItem[]) => {
      const previous = items;
      setItems(data); // otimista
      try {
        await reorderListBooks(listId, {
          items: data.map((it, i) => ({ book_id: it.book.id, position: i + 1 })),
        });
      } catch (e) {
        setItems(previous); // rollback
        showToast(getApiErrorMessage(e, 'Não foi possível reordenar'), 'error');
      }
    },
    [items, listId, showToast],
  );

  const onRemoveBook = useCallback(
    async (bookId: string) => {
      const previous = items;
      setItems((prev) => prev.filter((it) => it.book.id !== bookId)); // otimista
      try {
        await removeBookFromList(listId, bookId);
      } catch (e) {
        setItems(previous); // rollback
        showToast(getApiErrorMessage(e, 'Não foi possível remover'), 'error');
      }
    },
    [items, listId, showToast],
  );

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<ListBookItem>) => (
      <ScaleDecorator>
        <View style={[styles.row, isActive && styles.rowActive]}>
          <Pressable onLongPress={drag} delayLongPress={150} hitSlop={6} style={styles.handle} accessibilityLabel="Arrastar para reordenar">
            <MaterialCommunityIcons name="drag" size={24} color={colors.textMuted} />
          </Pressable>
          <Pressable
            style={styles.rowMain}
            onPress={() => navigation.navigate('BookDetail', { bookId: item.book.id })}
          >
            <BookCover uri={item.book.cover_url} width={44} title={item.book.title} />
            <View style={styles.rowText}>
              <Text style={typography.subtitle} numberOfLines={1}>
                {item.book.title}
              </Text>
              <Text style={typography.caption} numberOfLines={1}>
                {formatAuthors(item.book.authors)}
              </Text>
              <RatingPill rating={item.book.avg_rating} count={item.book.total_ratings} style={styles.rating} />
            </View>
          </Pressable>
          <Pressable onPress={() => onRemoveBook(item.book.id)} hitSlop={8} style={styles.remove} accessibilityLabel="Remover da lista">
            <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </ScaleDecorator>
    ),
    [navigation, onRemoveBook],
  );

  if (loading && !list) return <View style={styles.container}><LoadingState /></View>;
  if (error && !list) return <View style={styles.container}><ErrorState onRetry={() => load(false)} /></View>;

  return (
    <View style={styles.container}>
      <DraggableFlatList
        data={items}
        keyExtractor={(item) => item.book.id}
        renderItem={renderItem}
        onDragEnd={({ data }) => onReorder(data)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            {list?.description ? <Text style={typography.bodySecondary}>{list.description}</Text> : null}
            <AppButton
              label="Adicionar livro"
              icon="plus"
              variant="secondary"
              onPress={() => navigation.navigate('AddBookToList', { listId })}
            />
            {items.length > 0 ? (
              <Text style={[typography.caption, styles.hint]}>Segure e arraste pelo ícone ⠿ para reordenar.</Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="book-plus" title="Lista vazia" message="Adicione livros para começar a organizar." />
        }
      />

      <Portal>
        <Dialog visible={renameOpen} onDismiss={() => setRenameOpen(false)} style={styles.dialog}>
          <Dialog.Title>Renomear lista</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="Título"
              value={renameValue}
              onChangeText={setRenameValue}
              maxLength={200}
              autoFocus
              outlineColor={colors.border}
              activeOutlineColor={colors.primary}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRenameOpen(false)} textColor={colors.textSecondary}>Cancelar</Button>
            <Button onPress={onRename} loading={renaming} disabled={!renameValue.trim() || renaming} textColor={colors.primary}>
              Salvar
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={deleteOpen} onDismiss={() => setDeleteOpen(false)} style={styles.dialog}>
          <Dialog.Title>Excluir lista</Dialog.Title>
          <Dialog.Content>
            <Text style={typography.body}>Tem certeza? Esta ação não pode ser desfeita.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteOpen(false)} textColor={colors.textSecondary}>Cancelar</Button>
            <Button onPress={onDelete} loading={deleting} disabled={deleting} textColor={colors.error}>
              Excluir
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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  hint: {
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  rowActive: {
    backgroundColor: colors.surfaceHigh,
  },
  handle: {
    padding: spacing.xs,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rating: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  remove: {
    padding: spacing.xs,
  },
  dialog: {
    backgroundColor: colors.surface,
  },
});
