import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { BookDetailScreen } from '@/screens/BookDetailScreen';
import { EditProfileScreen } from '@/screens/EditProfileScreen';
import { ListDetailScreen } from '@/screens/ListDetailScreen';
import { ListsScreen } from '@/screens/ListsScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { StatsScreen } from '@/screens/StatsScreen';
import { YearSummaryScreen } from '@/screens/YearSummaryScreen';

import { stackHeaderOptions } from './headerOptions';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={stackHeaderOptions}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Editar perfil' }} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="Lists" component={ListsScreen} options={{ title: 'Minhas listas' }} />
      <Stack.Screen name="ListDetail" component={ListDetailScreen} options={{ title: 'Lista' }} />
      <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Estatísticas' }} />
      <Stack.Screen name="YearSummary" component={YearSummaryScreen} options={{ title: 'Meu ano em livros' }} />
    </Stack.Navigator>
  );
}
