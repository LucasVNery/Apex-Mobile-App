import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/src/theme';

// Constante para altura da tab bar (deve corresponder ao valor em _layout.tsx)
export const TAB_BAR_HEIGHT = 60;

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  withTabBar?: boolean;
  edges?: Edge[];
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
}

export function ScreenContainer({
  children,
  scrollable = true,
  withTabBar = false,
  edges = ['top'],
  contentContainerStyle,
  style,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  // Calcula o padding bottom necessário para não esconder conteúdo atrás da tab bar
  const tabBarPadding = withTabBar ? TAB_BAR_HEIGHT + insets.bottom + theme.spacing.md : 0;

  const containerStyle = [
    styles.container,
    style,
  ];

  const scrollContentStyle = [
    styles.content,
    { paddingBottom: tabBarPadding },
    contentContainerStyle,
  ];

  if (scrollable) {
    return (
      <SafeAreaView style={containerStyle} edges={edges}>
        <ScrollView
          contentContainerStyle={scrollContentStyle}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle} edges={edges}>
      <View style={[styles.content, styles.nonScrollableContent, { paddingBottom: tabBarPadding }]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    padding: theme.spacing.lg,
  },
  nonScrollableContent: {
    flex: 1, // Ocupa toda a altura disponível
  },
});
