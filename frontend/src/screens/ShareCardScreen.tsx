import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Defs,
  Image as SvgImage,
  LinearGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { AppButton, ScreenContainer, Toast } from '@/components';
import { useToast } from '@/hooks/useToast';
import type { RootScreenProps } from '@/navigation/types';
import { colors, spacing } from '@/theme';
import { saveCardToGallery, shareCard } from '@/utils/share';

const W = 340;

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function ShareCardScreen({ route }: RootScreenProps<'ShareCard'>) {
  const { variant, title, subtitle, coverUrl, rating, username, stats } = route.params;
  const svgRef = useRef<Svg>(null);
  const toast = useToast();
  const [working, setWorking] = useState<null | 'save' | 'share'>(null);

  const H = variant === 'reading' ? 560 : 600;

  const capture = (): Promise<string> =>
    new Promise((resolve, reject) => {
      const node = svgRef.current;
      if (!node || typeof node.toDataURL !== 'function') {
        reject(new Error('Não foi possível gerar a imagem.'));
        return;
      }
      node.toDataURL((data: string) => resolve(data));
    });

  const run = async (action: 'save' | 'share') => {
    setWorking(action);
    try {
      const base64 = await capture();
      if (action === 'save') {
        await saveCardToGallery(base64);
        toast.show('Imagem salva na galeria', 'success');
      } else {
        await shareCard(base64);
      }
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Falha ao gerar a imagem', 'error');
    } finally {
      setWorking(null);
    }
  };

  return (
    <ScreenContainer scroll edges={['bottom']} contentContainerStyle={styles.content}>
      <View style={styles.cardWrap}>
        <Svg ref={svgRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <Defs>
            <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={variant === 'year' ? '#1c2b22' : '#1b2026'} />
              <Stop offset="1" stopColor={colors.background} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width={W} height={H} rx="20" fill="url(#bg)" />

          {variant === 'reading'
            ? renderReadingCard({ title, subtitle, coverUrl, rating, username })
            : renderYearCard({ title, subtitle, coverUrl, username, stats })}
        </Svg>
      </View>

      <View style={styles.actions}>
        <AppButton
          label="Salvar na galeria"
          icon="download"
          onPress={() => run('save')}
          loading={working === 'save'}
          disabled={working !== null}
        />
        <AppButton
          label="Compartilhar"
          icon="share-variant"
          variant="secondary"
          onPress={() => run('share')}
          loading={working === 'share'}
          disabled={working !== null}
        />
      </View>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={toast.hide} />
    </ScreenContainer>
  );
}

/** Card estilo Letterboxd: capa grande como protagonista + estrelas verdes. */
function renderReadingCard({
  title,
  subtitle,
  coverUrl,
  rating,
  username,
}: {
  title: string;
  subtitle: string;
  coverUrl: string | null;
  rating: number | null;
  username: string;
}) {
  const COVER_W = 200;
  const COVER_H = 300;
  const coverX = (W - COVER_W) / 2;
  const coverY = 48;
  // Estrelas cheias (estilo Letterboxd: só as preenchidas, em verde).
  const stars = rating ? '★'.repeat(rating) : '';

  return (
    <>
      {/* Moldura sutil atrás da capa */}
      <Rect
        x={coverX - 3}
        y={coverY - 3}
        width={COVER_W + 6}
        height={COVER_H + 6}
        rx="8"
        fill="#000000"
        opacity={0.35}
      />
      {coverUrl ? (
        <SvgImage
          x={coverX}
          y={coverY}
          width={COVER_W}
          height={COVER_H}
          href={{ uri: coverUrl }}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <Rect x={coverX} y={coverY} width={COVER_W} height={COVER_H} rx="6" fill={colors.surfaceVariant} />
      )}

      {/* Estrelas verdes em destaque */}
      {stars ? (
        <SvgText
          x={W / 2}
          y={coverY + COVER_H + 56}
          fill={colors.star}
          fontSize="40"
          letterSpacing="4"
          textAnchor="middle"
        >
          {stars}
        </SvgText>
      ) : null}

      {/* Título + autor (discretos, capa é protagonista) */}
      <SvgText x={W / 2} y={coverY + COVER_H + 96} fill={colors.text} fontSize="19" fontWeight="bold" textAnchor="middle">
        {truncate(title, 28)}
      </SvgText>
      <SvgText x={W / 2} y={coverY + COVER_H + 120} fill={colors.textSecondary} fontSize="14" textAnchor="middle">
        {truncate(subtitle, 36)}
      </SvgText>

      {/* Assinatura */}
      <SvgText x={W / 2} y={560 - 26} fill={colors.textMuted} fontSize="13" textAnchor="middle">
        {`@${username} · movel`}
      </SvgText>
    </>
  );
}

/** Card do "ano em livros": capa do favorito + destaques. */
function renderYearCard({
  title,
  subtitle,
  coverUrl,
  username,
  stats,
}: {
  title: string;
  subtitle: string;
  coverUrl: string | null;
  username: string;
  stats?: { label: string; value: string }[];
}) {
  return (
    <>
      <SvgText x={W / 2} y={48} fill={colors.primary} fontSize="15" fontWeight="bold" textAnchor="middle">
        {subtitle.toUpperCase()}
      </SvgText>
      <SvgText x={W / 2} y={86} fill={colors.text} fontSize="34" fontWeight="bold" textAnchor="middle">
        {title}
      </SvgText>

      {coverUrl ? (
        <SvgImage x={(W - 130) / 2} y={108} width={130} height={195} href={{ uri: coverUrl }} preserveAspectRatio="xMidYMid slice" />
      ) : (
        <Rect x={(W - 130) / 2} y={108} width={130} height={195} rx="8" fill={colors.surfaceVariant} />
      )}

      {stats?.map((s, i) => (
        <SvgText key={s.label} x={W / 2} y={344 + i * 34} fill={colors.text} fontSize="16" textAnchor="middle">
          {`${s.label}: ${truncate(s.value, 22)}`}
        </SvgText>
      ))}

      <SvgText x={W / 2} y={600 - 30} fill={colors.textMuted} fontSize="13" textAnchor="middle">
        {`@${username} · movel`}
      </SvgText>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.xl,
  },
  cardWrap: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  actions: {
    alignSelf: 'stretch',
    gap: spacing.md,
  },
});
