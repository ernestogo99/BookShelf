import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { getUserReadings } from '@/api/users';
import { AppButton, Avatar, BookCard, EmptyState, ErrorState, LoadingState } from '@/components';
import type { ProfileStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { colors, radius, spacing, statusColor, statusLabel, typography } from '@/theme';
import { Reading, ReadingStatus } from '@/types/api';

const COLUMNS = 3;
const GAP = spacing.md;
const PER_PAGE = 18;

const FILTERS: ReadingStatus[] = ['read', 'reading', 'want_to_read'];

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const { width } = useWindowDimensions();
  const cardWidth = (width - spacing.lg * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  const [status, setStatus] = useState<ReadingStatus>('read');
  const [items, setItems] = useState<Reading[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // Botão de logout no header.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => void logout()} hitSlop={8} accessibilityLabel="Sair da conta">
          <MaterialCommunityIcons name="logout" size={22} color={colors.textSecondary} />
        </Pressable>
      ),
    });
  }, [navigation, logout]);

  const loadPage = useCallback(
    async (pageToLoad: number, mode: 'replace' | 'append' | 'refresh') => {
      if (mode === 'refresh') setRefreshing(true);
      else if (mode === 'replace') setLoading(true);
      setError(null);
      try {
        const res = await getUserReadings({ status, page: pageToLoad, perPage: PER_PAGE });
        setItems((prev) => (pageToLoad === 1 ? res.items : [...prev, ...res.items]));
        setPage(res.page);
        setHasNext(res.has_next);
      } catch (e) {
        if (pageToLoad === 1) setError(e);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [status],
  );

  // Recarrega ao focar e quando o filtro muda (reflete leituras novas/removidas).
  useFocusEffect(
    useCallback(() => {
      void loadPage(1, 'replace');
    }, [loadPage]),
  );

  const onEndReached = useCallback(() => {
    if (hasNext && !loading && !refreshing) void loadPage(page + 1, 'append');
  }, [hasNext, loading, refreshing, page, loadPage]);

  const renderItem = useCallback<ListRenderItem<Reading>>(
    ({ item }) => (
      <BookCard
        width={cardWidth}
        book={item.book}
        coverOnly
        rating={item.rating}
        onPress={() => navigation.navigate('BookDetail', { bookId: item.book.id })}
      />
    ),
    [cardWidth, navigation],
  );

  const counts: Record<ReadingStatus, number> = {
    read: user?.total_read ?? 0,
    reading: user?.total_reading ?? 0,
    want_to_read: user?.total_want_to_read ?? 0,
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.identity}>
        <Avatar uri={user?.avatar_url} name={user?.name} size={72} />
        <View style={styles.identityText}>
          <Text style={typography.title} numberOfLines={1}>
            {user?.name ?? 'Usuário'}
          </Text>
          <Text style={typography.bodySecondary}>@{user?.username}</Text>
        </View>
      </View>

      {user?.bio ? <Text style={[typography.body, styles.bio]}>{user.bio}</Text> : null}

      <View style={styles.shortcuts}>
        <AppButton
          label="Editar perfil"
          icon="pencil"
          variant="secondary"
          fullWidth={false}
          style={styles.shortcut}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <AppButton
          label="Listas"
          icon="format-list-bulleted"
          variant="secondary"
          fullWidth={false}
          style={styles.shortcut}
          onPress={() => navigation.navigate('Lists')}
        />
        <AppButton
          label="Stats"
          icon="chart-bar"
          variant="secondary"
          fullWidth={false}
          style={styles.shortcut}
          onPress={() => navigation.navigate('Stats')}
        />
      </View>

      <View style={styles.pills}>
        {FILTERS.map((s) => {
          const active = status === s;
          return (
            <Pressable
              key={s}
              onPress={() => setStatus(s)}
              style={[styles.pill, active && { borderColor: statusColor(s), backgroundColor: colors.surface }]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.pillCount, active && { color: statusColor(s) }]}>{counts[s]}</Text>
              <Text style={[styles.pillLabel, active && { color: colors.text }]}>{statusLabel(s)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderBody = () => {
    if (loading && items.length === 0) return <LoadingState />;
    if (error && items.length === 0) return <ErrorState onRetry={() => loadPage(1, 'replace')} />;
    if (items.length === 0) {
      return (
        <EmptyState
          icon="bookshelf"
          title={`Nada em "${statusLabel(status)}"`}
          message="Registre leituras na aba Explorar para preencher sua estante."
        />
      );
    }
    return (
      <FlatList
        style={styles.flex}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={COLUMNS}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={() => loadPage(1, 'refresh')}
        ListFooterComponent={
          loading && items.length > 0 ? <ActivityIndicator color={colors.primary} style={styles.footer} /> : null
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      {header}
      <View style={styles.flex}>{renderBody()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.lg,
  },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  identityText: {
    flex: 1,
    gap: spacing.xs,
  },
  bio: {
    color: colors.textSecondary,
  },
  shortcuts: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  shortcut: {
    flex: 1,
  },
  pills: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceVariant,
  },
  pillCount: {
    ...typography.heading,
    color: colors.text,
  },
  pillLabel: {
    ...typography.caption,
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
  footer: {
    marginVertical: spacing.lg,
  },
});
