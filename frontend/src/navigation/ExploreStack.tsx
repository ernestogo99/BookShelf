import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { BookDetailScreen } from '@/screens/BookDetailScreen';
import { ExploreScreen } from '@/screens/ExploreScreen';

import { stackHeaderOptions } from './headerOptions';
import type { ExploreStackParamList } from './types';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={stackHeaderOptions}>
      <Stack.Screen name="Explore" component={ExploreScreen} options={{ title: 'Explorar' }} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}
