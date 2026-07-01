import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import { Review } from '@/types/api';
import { formatDate } from '@/utils/format';

import { Avatar } from './Avatar';

type Props = {
  review: Review;
  /** Marca visual de "sua resenha". */
  highlightOwn?: boolean;
};

/** Card de resenha. Spoiler fica oculto até o toque. */
export function ReviewCard({ review, highlightOwn = false }: Props) {
  const [revealed, setRevealed] = useState(!review.has_spoiler);

  return (
    <View style={[styles.card, highlightOwn && styles.own]}>
      <View style={styles.header}>
        <Avatar uri={review.author.avatar_url} name={review.author.name} size={36} />
        <View style={styles.headerText}>
          <Text style={typography.subtitle} numberOfLines={1}>
            {review.author.name}
          </Text>
          <Text style={typography.caption}>
            @{review.author.username} · {formatDate(review.created_at)}
          </Text>
        </View>
      </View>

      {revealed ? (
        <Text style={[typography.body, styles.content]}>{review.content}</Text>
      ) : (
        <Pressable
          onPress={() => setRevealed(true)}
          style={styles.spoiler}
          accessibilityRole="button"
          accessibilityLabel="Revelar resenha com spoiler"
        >
          <MaterialCommunityIcons name="eye-off" size={18} color={colors.warning} />
          <Text style={styles.spoilerText}>Contém spoiler — toque para revelar</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  own: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  content: {
    marginTop: spacing.xs,
  },
  spoiler: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  spoilerText: {
    ...typography.bodySecondary,
    color: colors.warning,
    flexShrink: 1,
  },
});
