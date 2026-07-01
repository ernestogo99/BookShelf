import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect } from 'react';

import { SplashScreen } from '@/screens/SplashScreen';
import { useAuthStore } from '@/store/authStore';

import { AppNavigator } from './AppNavigator';
import { AuthStack } from './AuthStack';
import { navTheme } from './navTheme';

/** Decide entre Splash / área autenticada / fluxo de login conforme o status. */
export function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (status === 'loading') {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {status === 'authenticated' ? <AppNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
