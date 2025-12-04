// IMPORTANTE: Este import deve estar ANTES de tudo
// Polyfill para crypto.getRandomValues() necessário para uuid
import 'react-native-get-random-values';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/src/theme';
import { ProgressionSync } from '@/src/components/ProgressionSync';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.error('❌ Erro ao recuperar token do SecureStore:', err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      // Log do erro para diagnóstico
      console.error('❌ Erro crítico: Falha ao salvar token no SecureStore:', err);
      // Re-throw para que o Clerk saiba que a operação falhou
      // Isso previne que a autenticação pareça bem-sucedida quando o token não foi persistido
      throw new Error(
        'Falha ao salvar token de autenticação. ' +
        'Verifique as permissões de armazenamento seguro do dispositivo.'
      );
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
  
  // 3. Fallback APENAS em desenvolvimento local (__DEV__)
  // ⚠️ ATENÇÃO: Este fallback é apenas para desenvolvimento
  // Em builds de produção, isso NUNCA será usado pois __DEV__ será false
  // A chave hardcoded aqui só existe para facilitar desenvolvimento local
  // e será removida automaticamente em builds de produção
  if (__DEV__) {
    const devKey = 'pk_test_c3dlZXQtc2hpbmVyLTAuY2xlcmsuYWNjb3VudHMuZGV2JA';
    console.warn(
      '⚠️ AVISO DE DESENVOLVIMENTO: Usando chave hardcoded como fallback.\n' +
      '   Isso só funciona em modo desenvolvimento (__DEV__ = true).\n' +
      '   Para builds de produção, configure EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.\n' +
      '   Reinicie o Metro bundler após criar/modificar o arquivo .env: npx expo start --clear'
    );
    return devKey;
  }
  
  // 4. Em produção, NUNCA usar fallback hardcoded por questões de segurança
  // A chave hardcoded seria incluída no bundle e poderia ser extraída
  // Se não encontrar a chave, lançar erro imediatamente
  throw new Error(
    'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY não encontrada. ' +
    'Configure a variável de ambiente no arquivo .env ou nas configurações de build. ' +
    'Em desenvolvimento, crie um arquivo .env na raiz do projeto com: ' +
    'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=sua_chave_aqui'
  );
};

const publishableKey = getPublishableKey();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { isSignedIn, isLoaded } = useAuth();

  // 🛡️ BUG 3 & 4 FIX: Guard de autenticação no root layout
  // Protege todas as rotas antes de renderizar qualquer conteúdo
  useEffect(() => {
    if (!isLoaded) return;

    const currentRoute = segments[0];
    const isProtectedRoute = currentRoute === '(tabs)' || currentRoute === 'note';
    const isSignInRoute = currentRoute === 'sign-in';

    // Se não está autenticado e tenta acessar rota protegida
    if (!isSignedIn && isProtectedRoute) {
      router.replace('/sign-in');
      return;
    }

    // Se está autenticado e está na tela de login, redirecionar para home
    if (isSignedIn && isSignInRoute) {
      router.replace('/(tabs)');
      return;
    }
  }, [isSignedIn, isLoaded, segments, router]);

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

  // Mostrar loading enquanto verifica autenticação
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.primary }}>
        <ActivityIndicator size="large" color={theme.colors.accent.primary} />
      </View>
    );
  }

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
