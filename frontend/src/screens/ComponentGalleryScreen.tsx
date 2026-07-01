import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  AppButton,
  Avatar,
  BookCard,
  BookCover,
  EmptyState,
  ErrorState,
  LoadingState,
  RatingPill,
  ScreenContainer,
  SectionHeader,
  StarRating,
  StatusBadge,
  Toast,
} from '@/components';
import { colors, spacing, typography } from '@/theme';

// Capas reais (Open Library) só para a galeria.
const COVER_A = 'https://covers.openlibrary.org/b/id/8225261-L.jpg';
const COVER_B = 'https://covers.openlibrary.org/b/id/240727-L.jpg';

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      <View style={styles.blockBody}>{children}</View>
    </View>
  );
}

export function ComponentGalleryScreen() {
  const [stars, setStars] = useState(3);
  const [toast, setToast] = useState<null | 'success' | 'error' | 'info'>(null);

  return (
    <ScreenContainer scroll contentContainerStyle={styles.content}>
      <Text style={typography.display}>Movel</Text>
      <Text style={[typography.bodySecondary, styles.subtitle]}>
        Galeria de componentes (temporária) — Marco 1
      </Text>

      <Block title="Capas (BookCover)">
        <View style={styles.row}>
          <BookCover uri={COVER_A} size="md" title="Com capa" />
          <BookCover uri={null} size="md" title="Sem capa" />
          <BookCover uri={COVER_B} size="sm" title="Pequena" />
        </View>
      </Block>

      <Block title="Card de livro (BookCard)">
        <View style={styles.row}>
          <BookCard
            width={110}
            book={{ id: '1', title: 'O Conde de Monte Cristo', authors: ['Alexandre Dumas'], cover_url: COVER_A }}
            status="read"
            rating={5}
          />
          <BookCard
            width={110}
            book={{ id: '2', title: 'Livro sem capa muito longo para testar o corte', authors: ['Autora Exemplo'], cover_url: null }}
            status="reading"
          />
        </View>
      </Block>

      <Block title="Estrelas (StarRating)">
        <Text style={styles.hint}>Somente leitura:</Text>
        <StarRating rating={4} size={24} />
        <Text style={styles.hint}>Interativo ({stars}/5):</Text>
        <StarRating rating={stars} size={32} interactive onChange={setStars} />
      </Block>

      <Block title="Status (StatusBadge)">
        <Text style={styles.hint}>Solid:</Text>
        <View style={styles.rowWrap}>
          <StatusBadge status="want_to_read" />
          <StatusBadge status="reading" />
          <StatusBadge status="read" />
        </View>
        <Text style={styles.hint}>Outline:</Text>
        <View style={styles.rowWrap}>
          <StatusBadge status="want_to_read" variant="outline" />
          <StatusBadge status="reading" variant="outline" />
          <StatusBadge status="read" variant="outline" />
        </View>
      </Block>

      <Block title="Nota média (RatingPill)">
        <View style={styles.rowWrap}>
          <RatingPill rating={4.2} count={128} />
          <RatingPill rating={0} />
        </View>
      </Block>

      <Block title="Cabeçalho de seção (SectionHeader)">
        <SectionHeader title="Em alta" actionLabel="Ver tudo" onAction={() => setToast('info')} />
      </Block>

      <Block title="Avatar">
        <View style={styles.rowWrap}>
          <Avatar name="Lucas Lopes" size={56} />
          <Avatar uri={COVER_B} name="Com foto" size={56} />
          <Avatar name="A" size={40} />
        </View>
      </Block>

      <Block title="Botões (AppButton)">
        <AppButton label="Registrar leitura" icon="bookmark-plus" onPress={() => setToast('success')} />
        <AppButton label="Editar leitura" variant="secondary" icon="pencil" onPress={() => setToast('info')} />
        <AppButton label="Compartilhar" variant="ghost" icon="share-variant" onPress={() => setToast('info')} />
        <AppButton label="Remover leitura" variant="danger" icon="trash-can-outline" onPress={() => setToast('error')} />
        <AppButton label="Carregando…" loading />
        <AppButton label="Desabilitado" disabled />
      </Block>

      <Block title="Estado de carregamento (LoadingState)">
        <View style={styles.stateBox}>
          <LoadingState message="Carregando livros…" />
        </View>
      </Block>

      <Block title="Estado vazio (EmptyState)">
        <View style={styles.stateBox}>
          <EmptyState
            icon="bookshelf"
            title="Sua estante está vazia"
            message="Registre seu primeiro livro para começar."
            actionLabel="Explorar livros"
            onAction={() => setToast('info')}
          />
        </View>
      </Block>

      <Block title="Estado de erro (ErrorState)">
        <View style={styles.stateBox}>
          <ErrorState onRetry={() => setToast('info')} />
        </View>
      </Block>

      <Block title="Toast (Snackbar)">
        <View style={styles.rowWrap}>
          <AppButton label="Sucesso" variant="secondary" fullWidth={false} onPress={() => setToast('success')} />
          <AppButton label="Erro" variant="secondary" fullWidth={false} onPress={() => setToast('error')} />
          <AppButton label="Info" variant="secondary" fullWidth={false} onPress={() => setToast('info')} />
        </View>
      </Block>

      <View style={{ height: spacing.xxl }} />

      <Toast
        visible={toast !== null}
        type={toast ?? 'info'}
        message={
          toast === 'success'
            ? 'Tudo certo!'
            : toast === 'error'
              ? 'Ops, algo deu errado.'
              : 'Mensagem informativa.'
        }
        onDismiss={() => setToast(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  block: {
    marginBottom: spacing.xl,
  },
  blockTitle: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  blockBody: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  hint: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  stateBox: {
    height: 220,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
