import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { FadeIn, SlideIn } from '@/src/components/animations';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <FadeIn>
          <View style={styles.header}>
            <Text variant="heading" weight="bold">
              Explorar
            </Text>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              Descubra templates e recursos
            </Text>
          </View>
        </FadeIn>

        <View style={styles.sections}>
          <SlideIn delay={100} direction="up">
            <View style={styles.section}>
              <Text variant="title" weight="semibold" style={styles.sectionTitle}>
                Templates
              </Text>
              <View style={styles.grid}>
                <Card style={styles.templateCard}>
                  <Ionicons name="document-text" size={32} color={theme.colors.accent.primary} />
                  <Text variant="body" weight="semibold" style={styles.templateTitle}>
                    Nota Diária
                  </Text>
                  <Text variant="caption" color="secondary">
                    Template para journaling
                  </Text>
                </Card>
                <Card style={styles.templateCard}>
                  <Ionicons name="list" size={32} color={theme.colors.accent.warning} />
                  <Text variant="body" weight="semibold" style={styles.templateTitle}>
                    Projeto
                  </Text>
                  <Text variant="caption" color="secondary">
                    Organize suas tarefas
                  </Text>
                </Card>
              </View>
            </View>
          </SlideIn>

          <SlideIn delay={200} direction="up">
            <View style={styles.section}>
              <Text variant="title" weight="semibold" style={styles.sectionTitle}>
                Recursos
              </Text>
              <Card style={styles.resourceCard}>
                <View style={styles.resourceIcon}>
                  <Ionicons name="book" size={24} color={theme.colors.accent.primary} />
                </View>
                <View style={styles.resourceContent}>
                  <Text variant="body" weight="semibold">
                    Guia de Markdown
                  </Text>
                  <Text variant="caption" color="secondary">
                    Aprenda a formatar suas notas
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
              </Card>
              <Card style={styles.resourceCard}>
                <View style={styles.resourceIcon}>
                  <Ionicons name="bulb" size={24} color={theme.colors.accent.warning} />
                </View>
                <View style={styles.resourceContent}>
                  <Text variant="body" weight="semibold">
                    Dicas de Produtividade
                  </Text>
                  <Text variant="caption" color="secondary">
                    Maximize seu workflow
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
              </Card>
            </View>
          </SlideIn>
        </View>
      </ScrollView>
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
  header: {
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
  },
  sections: {
    gap: theme.spacing.xl,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    marginBottom: theme.spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  templateCard: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  templateTitle: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs / 2,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  resourceContent: {
    flex: 1,
  },
});
