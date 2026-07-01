import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import { getApiErrorMessage } from '@/api/client';
import { updateProfile } from '@/api/users';
import { AppButton, Avatar, FormTextInput, ScreenContainer, Toast } from '@/components';
import { useToast } from '@/hooks/useToast';
import { ProfileForm, profileSchema } from '@/lib/validation';
import type { ProfileStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { spacing, typography } from '@/theme';

export function EditProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const applyUserUpdate = useAuthStore((s) => s.applyUserUpdate);
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      bio: user?.bio ?? '',
      avatar_url: user?.avatar_url ?? '',
    },
  });

  const bio = watch('bio');
  const avatarUrl = watch('avatar_url');

  const onSubmit = handleSubmit(async (values) => {
    Keyboard.dismiss();
    setSubmitting(true);
    try {
      const updated = await updateProfile({
        name: values.name.trim(),
        bio: values.bio.trim() ? values.bio.trim() : null,
        avatar_url: values.avatar_url.trim() ? values.avatar_url.trim() : null,
      });
      applyUserUpdate(updated);
      toast.show('Perfil atualizado', 'success');
      navigation.goBack();
    } catch (e) {
      toast.show(getApiErrorMessage(e, 'Não foi possível salvar o perfil'), 'error');
      setSubmitting(false);
    }
  });

  return (
    <ScreenContainer scroll avoidKeyboard contentContainerStyle={styles.content}>
      <View style={styles.avatarPreview}>
        <Avatar uri={avatarUrl?.trim() || null} name={user?.name} size={96} />
      </View>

      <FormTextInput control={control} name="name" label="Nome" autoCapitalize="words" error={errors.name?.message} />
      <FormTextInput
        control={control}
        name="bio"
        label="Bio"
        multiline
        autoCapitalize="sentences"
        maxLength={150}
        currentLength={bio?.length ?? 0}
        error={errors.bio?.message}
      />
      <FormTextInput
        control={control}
        name="avatar_url"
        label="URL da foto (avatar)"
        autoCapitalize="none"
        keyboardType="url"
        error={errors.avatar_url?.message}
      />
      <Text style={[typography.caption, styles.hint]}>
        O backend não faz upload de imagem — cole o link de uma foto (ex.: https://…/foto.jpg).
      </Text>

      <AppButton label="Salvar" icon="check" onPress={onSubmit} loading={submitting} style={styles.save} />

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={toast.hide} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  avatarPreview: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  hint: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  save: {
    marginTop: spacing.sm,
  },
});
