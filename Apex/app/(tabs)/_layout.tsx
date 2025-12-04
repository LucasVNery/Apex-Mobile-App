import { Tabs, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';

function TabBarBackground() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: -insets.bottom,
      backgroundColor: theme.colors.background.elevated,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    }} />
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const isNoteRoute = segments[0] === 'note';
    const isSignInRoute = segments[0] === 'sign-in';

    // Se não está autenticado e está tentando acessar rotas protegidas
    if (!isSignedIn && (inAuthGroup || isNoteRoute)) {
      router.replace('/sign-in');
    } 
    // Se está autenticado e está na tela de login, redirecionar para home
    else if (isSignedIn && isSignInRoute) {
      router.replace('/(tabs)');
    }
    // Não redirecionar se estiver acessando rotas válidas como /note/[id]
    // Permitir navegação para rotas de notas quando autenticado
  }, [isSignedIn, isLoaded, segments]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background.primary }}>
        <ActivityIndicator size="large" color={theme.colors.accent.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.accent.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopColor: theme.colors.border.medium,
          borderTopWidth: 2,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 6,
          paddingHorizontal: 0,
          position: 'absolute',
          elevation: 0,
        },
        tabBarBackground: TabBarBackground,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="graph"
        options={{
          title: 'Graph',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "git-network" : "git-network-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Criar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "add-circle" : "add-circle-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "compass" : "compass-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
