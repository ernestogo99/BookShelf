import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getApiErrorStatus } from '@/api/client';
import { getYearSummary } from '@/api/stats';
import { AppButton, BookCover, ErrorState, LoadingState, ScreenContainer } from '@/components';
import { useAsync } from '@/hooks/useAsync';
import type { ProfileStackParamList, RootStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { colors, radius, spacing, typography } from '@/theme';
import { YearSummary } from '@/types/api';

const CURRENT_YEAR = new Date().getFullYear();

type Nav = NativeStackNavigationProp<ProfileStackParamList & RootStackParamList>;

export function YearSummaryScreen() {
  const route = useRoute<RouteProp<ProfileStackParamList, 'YearSummary'>>();
  const navigation = useNavigation<Nav>();
  const username = useAuthStore((s) => s.user?.username ?? '');
  const [year, setYear] = useState(route.params.year);

  const summary = useAsync(() => getYearSummary(year), [year]);

  const YearSelector = (
    <View style={styles.yearSelector}>
      <Pressable onPress={() => setYear((y) => y - 1)} hitSlop={8} accessibilityLabel="Ano anterior">
        <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
      </Pressable>
      <Text style={typography.title}>{year}</Text>
      <Pressable
        onPress={() => setYear((y) => Math.min(CURRENT_YEAR, y + 1))}
        hitSlop={8}
        disabled={year >= CURRENT_YEAR}
        accessibilityLabel="Próximo ano"
      >
        <MaterialCommunityIcons
          name="chevron-right"
          size={28}
          color={year >= CURRENT_YEAR ? colors.textMuted : colors.text}
        />
      </Pressable>
    </View>
  );

  const renderBody = () => {
    if (summary.loading && !summary.data) return <LoadingState />;

    if (summary.error) {
      // 400 = menos de 3 livros lidos no ano → aviso amigável.
      if (getApiErrorStatus(summary.error) === 400) {
        return (
          <View style={styles.notice}>
            <MaterialCommunityIcons name="book-clock" size={56} color={colors.textMuted} />
            <Text style={[typography.heading, styles.noticeTitle]}>Quase lá!</Text>
            <Text style={[typography.bodySecondary, styles.noticeMsg]}>
              Leia pelo menos 3 livros em {year} para gerar seu resumo do ano.
            </Text>
          </View>
        );
      }
      return <ErrorState onRetry={summary.reload} />;
    }

    const data = summary.data;
    if (!data) return null;
    return <SummaryCard data={data} year={year} username={username} navigation={navigation} />;
  };

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      {YearSelector}
      {renderBody()}
    </ScreenContainer>
  );
}

function SummaryCard({
  data,
  year,
  username,
  navigation,
}: {
  data: YearSummary;
  year: number;
  username: string;
  navigation: Nav;
}) {
  const highlights: { label: string; value: string }[] = [
    { label: 'Livros', value: String(data.total_books) },
    { label: 'Páginas', value: String(data.total_pages) },
    ...(data.top_genre ? [{ label: 'Gênero', value: data.top_genre }] : []),
    ...(data.top_author ? [{ label: 'Autor', value: data.top_author }] : []),
    ...(data.avg_rating != null ? [{ label: 'Nota média', value: data.avg_rating.toFixed(1) }] : []),
  ];

  return (
    <>
      <LinearGradient colors={['#1c2b22', colors.surface]} style={styles.card}>
        <Text style={[typography.label, styles.cardKicker]}>Meu ano em livros</Text>
        {data.favorite_book ? (
          <BookCover uri={data.favorite_book.cover_url} width={120} title={data.favorite_book.title} />
        ) : null}

        <View style={styles.cardStats}>
          {highlights.map((h) => (
            <View key={h.label} style={styles.cardStatRow}>
              <Text style={typography.bodySecondary}>{h.label}</Text>
              <Text style={[typography.subtitle, styles.cardStatValue]} numberOfLines={1}>
                {h.value}
              </Text>
            </View>
          ))}
        </View>

        {data.favorite_book ? (
          <Text style={[typography.caption, styles.fav]} numberOfLines={2}>
            Favorito: {data.favorite_book.title}
          </Text>
        ) : null}
      </LinearGradient>

      <AppButton
        label="Salvar / Compartilhar imagem"
        icon="image"
        onPress={() =>
          navigation.navigate('ShareCard', {
            variant: 'year',
            title: String(year),
            subtitle: 'Meu ano em livros',
            coverUrl: data.favorite_book?.cover_url ?? null,
            rating: null,
            username,
            stats: highlights,
          })
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  notice: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  noticeTitle: {
    marginTop: spacing.sm,
  },
  noticeMsg: {
    textAlign: 'center',
    maxWidth: 300,
  },
  card: {
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl,
  },
  cardKicker: {
    color: colors.primary,
  },
  cardStats: {
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  cardStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardStatValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  fav: {
    textAlign: 'center',
  },
});
