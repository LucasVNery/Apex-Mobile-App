import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { FadeIn } from '@/src/components/animations/FadeIn';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function GraphScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <FadeIn>
          <View style={styles.header}>
            <Text variant="heading" weight="bold">
              Graph View
            </Text>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              Visualize conexões entre suas notas
            </Text>
          </View>
        </FadeIn>

        <FadeIn delay={100}>
          <Card style={styles.placeholderCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="git-network" size={64} color={theme.colors.accent.primary} />
            </View>
            <Text variant="title" weight="semibold" style={styles.placeholderTitle}>
              Graph View em Desenvolvimento
            </Text>
            <Text variant="body" color="secondary" style={styles.placeholderText}>
              Aqui você poderá visualizar todas as suas notas e como elas se conectam entre si,
              criando uma rede de conhecimento visual e interativa.
            </Text>
            <View style={styles.features}>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent.primary} />
                <Text variant="body" color="secondary">Visualização interativa</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent.primary} />
                <Text variant="body" color="secondary">Links bidirecionais</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.accent.primary} />
                <Text variant="body" color="secondary">Filtros por tags</Text>
              </View>
            </View>
          </Card>
        </FadeIn>
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
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
  },
  placeholderCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.accent.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  placeholderTitle: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  placeholderText: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  features: {
    gap: theme.spacing.sm,
    width: '100%',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
});
