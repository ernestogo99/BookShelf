import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { AddBookToListScreen } from '@/screens/AddBookToListScreen';
import { ReadingModalScreen } from '@/screens/ReadingModalScreen';
import { ShareCardScreen } from '@/screens/ShareCardScreen';

import { AppTabs } from './AppTabs';
import { stackHeaderOptions } from './headerOptions';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Pilha raiz da área autenticada: abas + modais. */
export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={stackHeaderOptions}>
      <Stack.Screen name="Tabs" component={AppTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="ReadingModal"
        component={ReadingModalScreen}
        options={{ presentation: 'modal', title: 'Registrar leitura' }}
      />
      <Stack.Screen
        name="AddBookToList"
        component={AddBookToListScreen}
        options={{ presentation: 'modal', title: 'Adicionar livro' }}
      />
      <Stack.Screen
        name="ShareCard"
        component={ShareCardScreen}
        options={{ presentation: 'modal', title: 'Compartilhar' }}
      />
    </Stack.Navigator>
  );
}
