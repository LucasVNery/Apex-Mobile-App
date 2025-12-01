import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { FadeIn } from '@/src/components/animations/FadeIn';
import { ScreenContainer } from '@/src/components/layout';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import GraphView from '@/src/components/graph/GraphView';
import { useNotesStore } from '@/src/stores/useNotesStore';
import { buildGraphFromNotes } from '@/src/utils/graphBuilder';
import { applyHierarchicalLayout } from '@/src/utils/graphLayout';
import { calculateGraphStats } from '@/src/utils/graphHelpers';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';

export default function GraphScreen() {
  const { notes } = useNotesStore();

  // Calcular estatísticas do grafo
  const stats = useMemo(() => {
    if (notes.length === 0) {
      return {
        nodeCount: 0,
        edgeCount: 0,
        hierarchyEdges: 0,
        linkEdges: 0,
        rootCount: 0,
        maxDepth: 0,
        avgChildrenCount: 0,
      };
    }

    const graph = buildGraphFromNotes(notes);
    const layouted = applyHierarchicalLayout(graph);
    return calculateGraphStats(layouted);
  }, [notes]);

  // Se não houver notas, mostrar placeholder
  if (notes.length === 0) {
    return (
      <ScreenContainer scrollable={false} withTabBar>
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
              Nenhuma Nota Ainda
            </Text>
            <Text variant="body" color="secondary" style={styles.placeholderText}>
              Crie sua primeira nota para ver o grafo de conhecimento.
              Você poderá visualizar todas as conexões e hierarquias de forma visual e interativa.
            </Text>
          </Card>
        </FadeIn>
      </ScreenContainer>
    );
  }

  // Renderizar grafo
  return (
    <View style={styles.container}>
      {/* Header com estatísticas */}
      <View style={styles.statsHeader}>
        <View style={styles.headerTop}>
          <Text variant="heading" weight="bold">
            Graph View
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="disc" size={16} color={theme.colors.accent.primary} />
            <Text variant="caption" color="secondary">
              {stats.nodeCount} nós
            </Text>
          </View>

          <View style={styles.stat}>
            <Ionicons name="git-branch" size={16} color={theme.colors.accent.primary} />
            <Text variant="caption" color="secondary">
              {stats.hierarchyEdges} hierarquias
            </Text>
          </View>

          <View style={styles.stat}>
            <Ionicons name="link" size={16} color={theme.colors.accent.primary} />
            <Text variant="caption" color="secondary">
              {stats.linkEdges} links
            </Text>
          </View>

          <View style={styles.stat}>
            <Ionicons name="layers" size={16} color={theme.colors.accent.primary} />
            <Text variant="caption" color="secondary">
              {stats.maxDepth + 1} níveis
            </Text>
          </View>
        </View>
      </View>

      {/* Grafo interativo com Error Boundary */}
      <ErrorBoundary>
        <GraphView />
      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
  },
  statsHeader: {
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  headerTop: {
    marginBottom: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
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
});
