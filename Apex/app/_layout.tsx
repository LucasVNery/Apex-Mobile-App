// IMPORTANTE: Este import deve estar ANTES de tudo
// Polyfill para crypto.getRandomValues() necessário para uuid
import 'react-native-get-random-values';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/src/theme';
import { ProgressionSync } from '@/src/components/ProgressionSync';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
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
          </Stack>
          <StatusBar style="light" backgroundColor={theme.colors.background.primary} />
        </ThemeProvider>
      </View>
    </SafeAreaProvider>
  );
}
