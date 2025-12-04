// IMPORTANTE: Este import deve estar ANTES de tudo
// Polyfill para crypto.getRandomValues() necessário para uuid
import 'react-native-get-random-values';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/src/theme';
import { ProgressionSync } from '@/src/components/ProgressionSync';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      // Handle error
    }
  },
};

// Tenta obter a chave de várias fontes
const getPublishableKey = () => {
  // 1. Tenta do process.env (funciona no desenvolvimento com .env)
  const envKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (envKey && envKey.trim() !== '') {
    return envKey.trim();
  }
  
  // 2. Tenta do Constants (funciona em builds)
  const constantsKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (constantsKey && constantsKey.trim() !== '') {
    return constantsKey.trim();
  }
  
  // 3. Fallback apenas em desenvolvimento (__DEV__)
  // Em produção, isso nunca deve ser usado
  if (__DEV__) {
    // Chave de desenvolvimento - substitua pela sua chave real
    const devKey = 'pk_test_c3dlZXQtc2hpbmVyLTAuY2xlcmsuYWNjb3VudHMuZGV2JA';
    console.warn(
      '⚠️ Usando chave de desenvolvimento hardcoded. ' +
      'Configure EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY no arquivo .env para produção.'
    );
    return devKey;
  }
  
  // 4. Em produção, a chave deve estar configurada
  throw new Error(
    'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY não encontrada. ' +
    'Configure a variável de ambiente no arquivo .env ou nas configurações de build.'
  );
};

const publishableKey = getPublishableKey();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  // Criar o tema dentro do componente para melhor hot reload
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: theme.colors.background.primary,
      card: theme.colors.background.elevated,
      border: theme.colors.border.medium,
    },
  };

  return (
    <ErrorBoundary>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
          <ThemeProvider value={customDarkTheme}>
            {/* Sincronizar progressão com dados reais */}
            <ProgressionSync />

            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: theme.colors.background.primary },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="note/[id]"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="sign-in"
                options={{
                  headerShown: false,
                  presentation: 'modal',
                }}
              />
            </Stack>
            <StatusBar style="light" backgroundColor={theme.colors.background.primary} />
          </ThemeProvider>
        </View>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <RootLayoutNav />
    </ClerkProvider>
  );
}
