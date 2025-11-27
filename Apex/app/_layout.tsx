import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { theme } from '@/src/theme';

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
    <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <ThemeProvider value={customDarkTheme}>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: theme.colors.background.primary },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="notes/index"
            options={{
              headerShown: true,
              title: 'Notas',
              presentation: 'card',
              headerStyle: {
                backgroundColor: theme.colors.background.elevated,
                height: 100,
              },
              headerTintColor: theme.colors.text.primary,
              headerTransparent: false,
              headerLeftContainerStyle: {
                paddingTop: 20,
              },
              headerTitleContainerStyle: {
                paddingTop: 20,
              },
              headerRightContainerStyle: {
                paddingTop: 20,
              },
            }}
          />
          <Stack.Screen
            name="environments/index"
            options={{
              headerShown: true,
              title: 'Ambientes',
              presentation: 'card',
              headerStyle: {
                backgroundColor: theme.colors.background.elevated,
                height: 100,
              },
              headerTintColor: theme.colors.text.primary,
              headerTransparent: false,
              headerLeftContainerStyle: {
                paddingTop: 20,
              },
              headerTitleContainerStyle: {
                paddingTop: 20,
              },
              headerRightContainerStyle: {
                paddingTop: 20,
              },
            }}
          />
          <Stack.Screen
            name="free/index"
            options={{
              headerShown: true,
              title: 'Livre',
              presentation: 'card',
              headerStyle: {
                backgroundColor: theme.colors.background.elevated,
                height: 100,
              },
              headerTintColor: theme.colors.text.primary,
              headerTransparent: false,
              headerLeftContainerStyle: {
                paddingTop: 20,
              },
              headerTitleContainerStyle: {
                paddingTop: 20,
              },
              headerRightContainerStyle: {
                paddingTop: 20,
              },
            }}
          />
          <Stack.Screen
            name="note/[id]"
            options={{
              headerShown: true,
              title: 'Nota',
              presentation: 'card',
              headerStyle: { backgroundColor: theme.colors.background.elevated },
              headerTintColor: theme.colors.text.primary,
            }}
          />
        </Stack>
        <StatusBar style="light" backgroundColor={theme.colors.background.primary} />
      </ThemeProvider>
    </View>
  );
}
