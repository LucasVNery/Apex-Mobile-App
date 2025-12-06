import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useNotesStore } from '@/src/stores/useNotesStore';
import { useProgressionStore } from '@/src/stores/useProgressionStore';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { FadeIn, SlideIn } from '@/src/components/animations';
import { ScreenContainer } from '@/src/components/layout';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { notes } = useNotesStore();
  const { notesCreated, linksCreated, level } = useProgressionStore();
  const isEmpty = notes.length === 0;

  if (isEmpty) {
    return (
      <ScreenContainer scrollable={false} withTabBar>
        <View style={styles.emptyContainer}>
          <FadeIn>
            <View style={styles.emptyContent}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="sparkles" size={64} color={theme.colors.accent.primary} />
              </View>
              <Text variant="heading" weight="bold" style={styles.emptyTitle}>
                Começa a se organizar por aqui
              </Text>
              <Text variant="body" color="secondary" style={styles.emptyDescription}>
                Crie notas, ambientes ou documentos livres para começar sua jornada de
                organização e produtividade.
              </Text>
              <Button
                variant="primary"
                size="large"
                onPress={() => router.push('/(tabs)/create')}
                style={styles.emptyButton}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="add-circle" size={20} color={theme.colors.text.onAccent} />
                  <Text weight="semibold" style={styles.buttonText}>
                    Criar Primeiro Item
                  </Text>
                </View>
              </Button>
            </View>
          </FadeIn>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer withTabBar>
        <FadeIn>
          <View style={styles.header}>
            <Text variant="heading" weight="bold">
              Bem-vindo
            </Text>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              Aqui está um resumo do que você criou
            </Text>
          </View>
        </FadeIn>

        <View style={styles.statsContainer}>
          <SlideIn delay={100} direction="left">
            <Card style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.accent.primary + '20' }]}>
                <Ionicons name="document-text" size={24} color={theme.colors.accent.primary} />
              </View>
              <Text variant="title" weight="bold" style={styles.statNumber}>
                {notesCreated}
              </Text>
              <Text variant="caption" color="secondary">
                Notas
              </Text>
            </Card>
          </SlideIn>

          <SlideIn delay={150} direction="up">
            <Card style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.accent.warning + '20' }]}>
                <Ionicons name="link-outline" size={24} color={theme.colors.accent.warning} />
              </View>
              <Text variant="title" weight="bold" style={styles.statNumber}>
                {linksCreated}
              </Text>
              <Text variant="caption" color="secondary">
                Conexões
              </Text>
            </Card>
          </SlideIn>

          <SlideIn delay={200} direction="right">
            <Card style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: theme.colors.accent.secondary + '20' }]}>
                <Ionicons name="trending-up-outline" size={24} color={theme.colors.accent.secondary} />
              </View>
              <Text variant="title" weight="bold" style={styles.statNumber}>
                Nível {level}
              </Text>
              <Text variant="caption" color="secondary">
                Progressão
              </Text>
            </Card>
          </SlideIn>
        </View>

        <SlideIn delay={300} direction="up">
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="title" weight="semibold">
                Recentes
              </Text>
              <Text
                variant="caption"
                style={styles.seeAll}
                onPress={() => router.push('/notes')}
              >
                Ver todas
              </Text>
            </View>
            <View style={styles.recentItems}>
              {notes.slice(0, 3).map((note, index) => (
                <Card
                  key={note.id}
                  onPress={() => router.push(`/note/${note.id}`)}
                  style={styles.recentCard}
                >
                  <View style={styles.recentCardContent}>
                    <View style={[styles.recentIcon, { backgroundColor: note.color + '20' || theme.colors.accent.primary + '20' }]}>
                      <Ionicons name="document-text" size={20} color={note.color || theme.colors.accent.primary} />
                    </View>
                    <View style={styles.recentInfo}>
                      <Text variant="body" weight="semibold" numberOfLines={1}>
                        {note.title}
                      </Text>
                      <Text variant="caption" color="tertiary">
                        {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        </SlideIn>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statNumber: {
    marginBottom: theme.spacing.xs / 2,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  seeAll: {
    color: theme.colors.accent.primary,
  },
  recentItems: {
    gap: theme.spacing.sm,
  },
  recentCard: {
    padding: theme.spacing.md,
  },
  recentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  recentInfo: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.accent.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  emptyButton: {
    paddingHorizontal: theme.spacing.xl,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  buttonText: {
    color: theme.colors.text.onAccent,
    fontSize: theme.typography.sizes.base,
  },
});
