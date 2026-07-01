import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getUserStats } from '@/api/stats';
import {
  AppButton,
  BarChart,
  EmptyState,
  ErrorState,
  LoadingState,
  ScreenContainer,
  SectionHeader,
} from '@/components';
import { useAsync } from '@/hooks/useAsync';
import type { ProfileStackParamList } from '@/navigation/types';
import { colors, radius, spacing, typography } from '@/theme';
import { monthsSeries } from '@/utils/stats';

const CURRENT_YEAR = new Date().getFullYear();

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={typography.display}>{value}</Text>
      <Text style={typography.caption}>{label}</Text>
    </View>
  );
}

export function StatsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const stats = useAsync(() => getUserStats(), []);

  if (stats.loading && !stats.data) {
    return (
      <ScreenContainer>
        <LoadingState />
      </ScreenContainer>
    );
  }
  if (stats.error && !stats.data) {
    return (
      <ScreenContainer>
        <ErrorState onRetry={stats.reload} />
      </ScreenContainer>
    );
  }

  const data = stats.data;
  if (!data || data.total_read === 0) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="chart-bar"
          title="Sem estatísticas ainda"
          message="Marque livros como lidos para ver seus números aqui."
        />
      </ScreenContainer>
    );
  }

  const series = monthsSeries(data.books_by_month);
  const avg = data.avg_rating_given == null ? '—' : data.avg_rating_given.toFixed(1);

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <View style={styles.cards}>
        <StatCard label="Lidos" value={String(data.total_read)} />
        <StatCard label="Páginas" value={String(data.total_pages)} />
        <StatCard label="Nota média" value={avg} />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Livros por mês" />
        {series.length > 0 ? (
          <BarChart data={series} />
        ) : (
          <Text style={typography.bodySecondary}>Ainda sem datas de leitura registradas.</Text>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Gêneros favoritos" />
        {data.top_genres.length > 0 ? (
          data.top_genres.map((g, i) => (
            <View key={g.genre} style={styles.genreRow}>
              <Text style={styles.genreRank}>{i + 1}</Text>
              <Text style={[typography.body, styles.genreName]} numberOfLines={1}>
                {g.genre}
              </Text>
              <Text style={typography.caption}>{g.count}</Text>
            </View>
          ))
        ) : (
          <Text style={typography.bodySecondary}>Sem gêneros suficientes ainda.</Text>
        )}
      </View>

      <AppButton
        label="Meu ano em livros"
        icon="trophy"
        onPress={() => navigation.navigate('YearSummary', { year: CURRENT_YEAR })}
        style={styles.yearBtn}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  cards: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  section: {
    gap: spacing.sm,
  },
  genreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  genreRank: {
    ...typography.heading,
    color: colors.primary,
    width: 24,
  },
  genreName: {
    flex: 1,
  },
  yearBtn: {
    marginTop: spacing.sm,
  },
});
