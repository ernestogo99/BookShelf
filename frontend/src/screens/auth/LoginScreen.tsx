import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton, FormTextInput, ScreenContainer, Toast } from '@/components';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/api/client';
import { LoginForm, loginSchema } from '@/lib/validation';
import type { AuthScreenProps } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme';

export function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const login = useAuthStore((s) => s.login);
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    Keyboard.dismiss();
    setSubmitting(true);
    try {
      await login(values);
      // Sucesso: o RootNavigator troca para a área autenticada automaticamente.
    } catch (err) {
      toast.show(getApiErrorMessage(err, 'Credenciais inválidas'), 'error');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <ScreenContainer scroll avoidKeyboard contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="book-open-page-variant" size={56} color={colors.primary} />
        <Text style={typography.display}>Movel</Text>
        <Text style={[typography.bodySecondary, styles.subtitle]}>Entre para registrar suas leituras</Text>
      </View>

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

      <AppButton label="Entrar" onPress={onSubmit} loading={submitting} style={styles.submit} />

      <View style={styles.footer}>
        <Text style={typography.bodySecondary}>Não tem conta? </Text>
        <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
          <Text style={styles.link}>Cadastre-se</Text>
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
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.xs,
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
