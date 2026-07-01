import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton, FormTextInput, ScreenContainer, Toast } from '@/components';
import { getApiErrorMessage } from '@/api/client';
import { useToast } from '@/hooks/useToast';
import { RegisterForm, registerSchema } from '@/lib/validation';
import type { AuthScreenProps } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme';

export function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  const register = useAuthStore((s) => s.register);
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', username: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    Keyboard.dismiss();
    setSubmitting(true);
    try {
      await register(values);
      // Sucesso → já entra logado (RootNavigator troca de pilha sozinho).
    } catch (err) {
      toast.show(getApiErrorMessage(err, 'Não foi possível criar a conta'), 'error');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <ScreenContainer scroll avoidKeyboard contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={typography.title}>Criar conta</Text>
        <Text style={[typography.bodySecondary, styles.subtitle]}>É rápido — comece a registrar suas leituras</Text>
      </View>

      <FormTextInput control={control} name="name" label="Nome" autoCapitalize="words" error={errors.name?.message} />
      <FormTextInput
        control={control}
        name="username"
        label="Nome de usuário"
        autoCapitalize="none"
        error={errors.username?.message}
      />
      <FormTextInput
        control={control}
        name="email"
        label="E-mail"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email?.message}
      />
      <FormTextInput
        control={control}
        name="password"
        label="Senha"
        secure
        autoCapitalize="none"
        error={errors.password?.message}
      />

      <AppButton label="Criar conta" onPress={onSubmit} loading={submitting} style={styles.submit} />

      <View style={styles.footer}>
        <Text style={typography.bodySecondary}>Já tem conta? </Text>
        <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
          <Text style={styles.link}>Entrar</Text>
        </Pressable>
      </View>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onDismiss={toast.hide} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  submit: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
});
