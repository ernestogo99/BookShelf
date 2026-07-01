import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ListRenderItem, Pressable, StyleSheet, Text, View } from 'react-native';

import { getBook, getBookReviews } from '@/api/books';
import {
  AppButton,
  BookCover,
  EmptyState,
  ErrorState,
  LoadingState,
  RatingPill,
  ReviewCard,
  ScreenContainer,
  StarRating,
  StatusBadge,
} from '@/components';
import type { ExploreStackParamList, RootStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { colors, radius, spacing, typography } from '@/theme';
import { Book, Review } from '@/types/api';
import { formatAuthors, formatBookMeta } from '@/utils/format';

const PER_PAGE = 10;

// Usa hooks (não props) para poder ser registrada tanto no ExploreStack
// quanto no ProfileStack — ambos têm a rota BookDetail com { bookId }.
export function BookDetailScreen() {
  const route = useRoute<RouteProp<ExploreStackParamList, 'BookDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { bookId } = route.params;
  const currentUserId = useAuthStore((s) => s.user?.id);
  const username = useAuthStore((s) => s.user?.username ?? '');

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const firstLoad = useRef(true);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsHasNext, setReviewsHasNext] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const loadBook = useCallback(
    async (quiet: boolean) => {
      if (!quiet) setLoading(true);
      setError(null);
      try {
        setBook(await getBook(bookId));
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    },
    [bookId],
  );

  const loadReviews = useCallback(
    async (page: number) => {
      setReviewsLoading(true);
      try {
        const res = await getBookReviews(bookId, page, PER_PAGE);
        setReviews((prev) => (page === 1 ? res.items : [...prev, ...res.items]));
        setReviewsPage(res.page);
        setReviewsHasNext(res.has_next);
      } catch {
        // erro de resenhas não derruba a tela; mantém o que houver
      } finally {
        setReviewsLoading(false);
      }
    },
    [bookId],
  );

  // Recarrega ao focar (inclusive ao voltar do modal de leitura).
  useFocusEffect(
    useCallback(() => {
      void loadBook(!firstLoad.current);
      void loadReviews(1);
      firstLoad.current = false;
    }, [loadBook, loadReviews]),
  );

  const onEndReached = useCallback(() => {
    if (reviewsHasNext && !reviewsLoading) {
      void loadReviews(reviewsPage + 1);
    }
  }, [reviewsHasNext, reviewsLoading, reviewsPage, loadReviews]);

  const openModal = useCallback(() => {
    navigation.navigate('ReadingModal', { bookId });
  }, [navigation, bookId]);

  const onShare = useCallback(() => {
    if (!book?.my_reading?.rating) return;
    navigation.navigate('ShareCard', {
      variant: 'reading',
      title: book.title,
      subtitle: formatAuthors(book.authors),
      coverUrl: book.cover_url,
      rating: book.my_reading.rating,
      username,
      stats: [],
    });
  }, [navigation, book, username]);

  const renderReview = useCallback<ListRenderItem<Review>>(
    ({ item }) => <ReviewCard review={item} highlightOwn={item.author.id === currentUserId} />,
    [currentUserId],
  );

  if (loading && !book) return <ScreenContainer><LoadingState /></ScreenContainer>;
  if (error && !book) {
    return (
      <ScreenContainer>
        <ErrorState onRetry={() => loadBook(false)} />
      </ScreenContainer>
    );
  }
  if (!book) return null;

  return (
    <ScreenContainer padded={false} edges={['bottom']}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={renderReview}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={styles.reviewGap} />}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={<BookHeader book={book} onPressCta={openModal} onShare={onShare} />}
        ListEmptyComponent={
          !reviewsLoading ? (
            <EmptyState icon="comment-text-outline" title="Sem resenhas ainda" message="Seja o primeiro a resenhar este livro." />
          ) : null
        }
        ListFooterComponent={
          reviewsLoading && reviews.length > 0 ? (
            <ActivityIndicator color={colors.primary} style={styles.footer} />
          ) : null
        }
      />
    </ScreenContainer>
  );
}

function BookHeader({
  book,
  onPressCta,
  onShare,
}: {
  book: Book;
  onPressCta: () => void;
  onShare: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const reading = book.my_reading;

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <BookCover uri={book.cover_url} width={120} title={book.title} />
        <View style={styles.topMeta}>
          <Text style={typography.title}>{book.title}</Text>
          <Text style={[typography.bodySecondary, styles.authors]}>{formatAuthors(book.authors)}</Text>
          {formatBookMeta(book) ? <Text style={typography.caption}>{formatBookMeta(book)}</Text> : null}
          <RatingPill rating={book.avg_rating} count={book.total_ratings} style={styles.rating} />
        </View>
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        {reading ? (
          <>
            <View style={styles.statusRow}>
              <StatusBadge status={reading.status} />
              {reading.rating ? <StarRating rating={reading.rating} size={18} /> : null}
            </View>
            <AppButton label="Editar leitura" icon="pencil" variant="secondary" onPress={onPressCta} />
            {reading.rating ? (
              <AppButton label="Compartilhar" icon="share-variant" variant="ghost" onPress={onShare} />
            ) : null}
          </>
        ) : (
          <AppButton label="Registrar leitura" icon="bookmark-plus" onPress={onPressCta} />
        )}
      </View>

      {/* Sinopse */}
      {book.synopsis ? (
        <View style={styles.block}>
          <Text style={typography.heading}>Sinopse</Text>
          <Text style={typography.body} numberOfLines={expanded ? undefined : 5}>
            {book.synopsis}
          </Text>
          {book.synopsis.length > 220 ? (
            <Pressable onPress={() => setExpanded((e) => !e)} hitSlop={8}>
              <Text style={styles.more}>{expanded ? 'Ver menos' : 'Ver mais'}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/* Gêneros */}
      {book.genres && book.genres.length > 0 ? (
        <View style={styles.block}>
          <Text style={typography.heading}>Gêneros</Text>
          <View style={styles.chips}>
            {book.genres.map((g) => (
              <View key={g} style={styles.chip}>
                <Text style={styles.chipText}>{g}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <Text style={[typography.heading, styles.reviewsTitle]}>Resenhas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  topMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  authors: {
    marginBottom: spacing.xs,
  },
  rating: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  cta: {
    gap: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  block: {
    gap: spacing.sm,
  },
  more: {
    color: colors.primary,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  reviewsTitle: {
    marginTop: spacing.sm,
  },
  reviewGap: {
    height: spacing.md,
  },
  footer: {
    marginVertical: spacing.lg,
  },
});
