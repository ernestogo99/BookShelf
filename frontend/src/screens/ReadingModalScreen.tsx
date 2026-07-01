import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Switch, TextInput } from 'react-native-paper';

import { getBook } from '@/api/books';
import { getApiErrorMessage, getApiErrorStatus } from '@/api/client';
import { deleteReading, upsertReading } from '@/api/readings';
import { createReview, deleteReview, updateReview } from '@/api/reviews';
import { getMyReviewForBook } from '@/api/users';
import { AppButton, BookCover, LoadingState, ScreenContainer, StarRating, Toast } from '@/components';
import { useToast } from '@/hooks/useToast';
import type { RootScreenProps } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { colors, radius, spacing, statusColor, statusLabel, typography } from '@/theme';
import { Book, ReadingStatus, Review } from '@/types/api';

const STATUSES: ReadingStatus[] = ['want_to_read', 'reading', 'read'];
const MAX_REVIEW = 2000;

export function ReadingModalScreen({ route, navigation }: RootScreenProps<'ReadingModal'>) {
  const { bookId } = route.params;
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const toast = useToast();
  const showToast = toast.show;

  const [book, setBook] = useState<Book | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState<ReadingStatus>('want_to_read');
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [spoiler, setSpoiler] = useState(false);

  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  // Carrega o livro e inicializa o formulário. A busca da resenha existente é
  // feita SEPARADAMENTE (best-effort) para nunca bloquear o carregamento do
  // livro — o que esconderia o botão "Remover leitura".
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const b = await getBook(bookId);
        if (!active) return;
        setBook(b);
        if (b.my_reading) {
          setStatus(b.my_reading.status);
          setRating(b.my_reading.rating ?? 0);
        }
        navigation.setOptions({ title: b.my_reading ? 'Editar leitura' : 'Registrar leitura' });
      } catch (e) {
        if (active) showToast(getApiErrorMessage(e), 'error');
      } finally {
        if (active) setLoading(false);
      }

      // Resenha existente — falha aqui não afeta o resto do modal.
      try {
        const review = await getMyReviewForBook(bookId);
        if (!active || !review) return;
        setExistingReview(review);
        setReviewText(review.content);
        setSpoiler(review.has_spoiler);
      } catch {
        // ignora — usuário ainda pode escrever/editar (POST cai em 409→PATCH).
      }
    })();
    return () => {
      active = false;
    };
  }, [bookId, navigation, showToast]);

  const persistReview = useCallback(async () => {
    const content = reviewText.trim();
    // Sem texto: remove a resenha existente (se houver) e sai.
    if (!content) {
      if (existingReview) await deleteReview(existingReview.id);
      return;
    }
    if (existingReview) {
      await updateReview(existingReview.id, { content, has_spoiler: spoiler });
      return;
    }
    try {
      await createReview({ book_id: bookId, content, has_spoiler: spoiler });
    } catch (e) {
      // 409: já existe resenha → localizar e atualizar.
      if (getApiErrorStatus(e) === 409) {
        const mine = await getMyReviewForBook(bookId);
        if (mine) {
          await updateReview(mine.id, { content, has_spoiler: spoiler });
          return;
        }
      }
      throw e;
    }
  }, [reviewText, spoiler, existingReview, bookId]);

  const onSave = useCallback(async () => {
    setSaving(true);
    try {
      await upsertReading({
        book_id: bookId,
        status,
        rating: status === 'read' && rating > 0 ? rating : null,
      });
      await persistReview();
      await refreshUser();
      navigation.goBack();
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Não foi possível salvar'), 'error');
      setSaving(false);
    }
  }, [bookId, status, rating, persistReview, refreshUser, navigation, showToast]);

  const onRemove = useCallback(async () => {
    const readingId = book?.my_reading?.id;
    if (!readingId) return;
    setRemoving(true);
    try {
      await deleteReading(readingId);
      await refreshUser();
      navigation.goBack();
    } catch (e) {
      showToast(getApiErrorMessage(e, 'Não foi possível remover'), 'error');
      setRemoving(false);
    }
  }, [book, refreshUser, navigation, showToast]);

  if (loading) {
    return (
      <ScreenContainer edges={['bottom']}>
        <LoadingState />
      </ScreenContainer>
    );
  }

  const busy = saving || removing;

  return (
    <ScreenContainer scroll avoidKeyboard edges={['bottom']} contentContainerStyle={styles.content}>
      {book ? (
        <View style={styles.bookRow}>
          <BookCover uri={book.cover_url} size="sm" title={book.title} />
          <View style={styles.bookMeta}>
            <Text style={typography.subtitle} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={typography.bodySecondary} numberOfLines={1}>
              {book.authors.join(', ')}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Status */}
      <Text style={typography.label}>Status</Text>
      <View style={styles.segments}>
        {STATUSES.map((s) => {
          const active = status === s;
          return (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              style={[
                styles.segment,
                active && { backgroundColor: statusColor(s), borderColor: statusColor(s) },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{statusLabel(s)}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Nota (só quando Lido) */}
      {status === 'read' ? (
        <View style={styles.ratingBlock}>
          <Text style={typography.label}>Sua nota</Text>
          <StarRating rating={rating} size={36} interactive onChange={setRating} />
        </View>
      ) : null}

      {/* Resenha */}
      <View style={styles.reviewBlock}>
        <Text style={typography.label}>Resenha (opcional)</Text>
        <TextInput
          mode="outlined"
          value={reviewText}
          onChangeText={setReviewText}
          placeholder="O que você achou deste livro?"
          multiline
          numberOfLines={5}
          maxLength={MAX_REVIEW}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          style={styles.reviewInput}
        />
        <Text style={[typography.caption, styles.counter]}>
          {reviewText.length}/{MAX_REVIEW}
        </Text>

        <View style={styles.spoilerRow}>
          <Text style={typography.body}>Contém spoiler</Text>
          <Switch value={spoiler} onValueChange={setSpoiler} color={colors.warning} />
        </View>
      </View>

      <AppButton label="Salvar" icon="check" onPress={onSave} loading={saving} disabled={busy} style={styles.save} />

      {book?.my_reading ? (
        <AppButton
          label="Remover leitura"
          icon="trash-can-outline"
          variant="danger"
          onPress={onRemove}
          loading={removing}
          disabled={busy}
        />
      ) : null}

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={toast.hide} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  bookRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  bookMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  segments: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  segmentText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  segmentTextActive: {
    color: colors.textOnAccent,
  },
  ratingBlock: {
    gap: spacing.sm,
  },
  reviewBlock: {
    gap: spacing.xs,
  },
  reviewInput: {
    backgroundColor: colors.surface,
    minHeight: 120,
  },
  counter: {
    alignSelf: 'flex-end',
  },
  spoilerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  save: {
    marginTop: spacing.sm,
  },
});
