import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { colors } from '@/theme';

/** Opções padrão de header para as pilhas nativas (tema escuro). */
export const stackHeaderOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerTitleStyle: { color: colors.text },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};
