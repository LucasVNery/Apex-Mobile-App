import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { FadeIn, SlideIn } from '@/src/components/animations';
import { ScreenContainer } from '@/src/components/layout';
import { CreateNoteModal } from '@/src/components/modals/CreateNoteModal';
import { HelpButton } from '@/src/components/help/HelpButton';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useProgressionStore } from '@/src/stores/useProgressionStore';
import { useNotesStore } from '@/src/stores/useNotesStore';

const HELP_TIPS = [
  {
    icon: 'document-text-outline' as const,
    title: 'Notas Simples',
    description: 'Perfeitas para capturar ideias rápidas, anotações de reuniões ou lembretes.',
    examples: ['Pensamentos do dia', 'Lista de compras', 'Anotações da aula'],
  },
  {
    icon: 'link-outline' as const,
    title: 'Links entre Notas',
    description: 'Use [[nome da nota]] para criar conexões. Suas ideias formam uma rede de conhecimento.',
    examples: ['[[Projeto App]] precisa de [[Design]]', 'Estudar [[React Native]]'],
  },
  {
    icon: 'grid-outline' as const,
    title: 'Blocos Modulares',
    description: 'Pressione "/" dentro de uma nota para adicionar listas, títulos, destaques e mais.',
    examples: ['/ para ver opções', 'Arraste blocos para reorganizar'],
  },
  {
    icon: 'git-network-outline' as const,
    title: 'Graph View',
    description: 'Visualize como suas notas se conectam. Desbloqueado após criar 5 notas com links.',
  },
  {
    icon: 'sparkles-outline' as const,
    title: 'Progressão Natural',
    description: 'Novas funcionalidades aparecem conforme você usa o app. Sem complexidade no início!',
  },
];

export default function CreateScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { level } = useProgressionStore();
  const { clearAll, notes } = useNotesStore();

  // Usar contagem real de notas em vez de notesCreated
  const notesCount = notes.length;

  const handleClearAllEnvironments = () => {
    if (notes.length === 0) {
      Alert.alert('Nenhum ambiente', 'Não há ambientes para apagar.');
      return;
    }

    Alert.alert(
      'Apagar Todos os Ambientes',
      `Você tem certeza que deseja apagar todos os ${notes.length} ambientes? Esta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Apagar Tudo',
          style: 'destructive',
          onPress: () => {
            clearAll();
            Alert.alert('Sucesso', 'Todos os ambientes foram apagados.');
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer withTabBar>
      {/* Header com botão de ajuda */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Ionicons name="create-outline" size={28} color={theme.colors.accent.primary} />
          <Text variant="title" weight="bold">
            Criar
          </Text>
        </View>
        <HelpButton tips={HELP_TIPS} title="Guia de Criação" />
      </View>

      {/* Botão de Criar Novo Ambiente */}
      <FadeIn>
        <Button
          variant="primary"
          size="large"
          onPress={() => setShowCreateModal(true)}
          style={styles.createButton}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="add-circle" size={24} color={theme.colors.text.onAccent} />
            <Text weight="bold" style={styles.buttonText}>
              Criar Novo Ambiente
            </Text>
          </View>
        </Button>
      </FadeIn>

      {/* Stats Card */}
      {notesCount > 0 && (
        <SlideIn delay={100} direction="up">
          <Card style={styles.statsCard}>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text variant="heading" weight="bold" style={styles.statNumber}>
                  {notesCount}
                </Text>
                <Text variant="caption" color="secondary">
                  Ambientes criados
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text variant="heading" weight="bold" style={styles.statNumber}>
                  Nível {level}
                </Text>
                <Text variant="caption" color="secondary">
                  Progressão
                </Text>
              </View>
            </View>
          </Card>
        </SlideIn>
      )}

      {/* Quick Tips */}
      <SlideIn delay={150} direction="up">
        <View style={styles.tipsSection}>
          <Text variant="title" weight="semibold" style={styles.sectionTitle}>
            💡 Dicas Rápidas
          </Text>

          <Pressable style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Ionicons name="flash-outline" size={20} color={theme.colors.accent.warning} />
            </View>
            <View style={styles.tipContent}>
              <Text variant="body" weight="semibold">
                Digite "/" em qualquer nota
              </Text>
              <Text variant="caption" color="secondary">
                Adicione blocos como listas, títulos e destaques
              </Text>
            </View>
          </Pressable>

          <Pressable style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Ionicons name="link-outline" size={20} color={theme.colors.accent.primary} />
            </View>
            <View style={styles.tipContent}>
              <Text variant="body" weight="semibold">
                Use [[nome]] para linkar
              </Text>
              <Text variant="caption" color="secondary">
                Conecte ideias relacionadas automaticamente
              </Text>
            </View>
          </Pressable>

          <Pressable style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Ionicons name="apps-outline" size={20} color={theme.colors.accent.secondary} />
            </View>
            <View style={styles.tipContent}>
              <Text variant="body" weight="semibold">
                Organize como quiser
              </Text>
              <Text variant="caption" color="secondary">
                Arraste blocos, use tags ou deixe fluir naturalmente
              </Text>
            </View>
          </Pressable>
        </View>
      </SlideIn>

      {/* Danger Zone - Reestilizada */}
      <SlideIn delay={200} direction="up">
        <View style={styles.dangerZone}>
          <View style={styles.dangerHeader}>
            <Ionicons name="warning" size={20} color={theme.colors.accent.error} />
            <Text variant="title" weight="bold" style={styles.dangerTitle}>
              Zona de Perigo
            </Text>
          </View>

          <Card style={styles.dangerCard}>
            <View style={styles.dangerCardInner}>
              {/* Warning Banner */}
              <View style={styles.warningBanner}>
                <Ionicons name="alert-circle" size={18} color={theme.colors.accent.error} />
                <Text variant="caption" style={styles.warningText}>
                  Ações irreversíveis
                </Text>
              </View>

              {/* Content */}
              <View style={styles.dangerContent}>
                <View style={styles.dangerInfo}>
                  <View style={styles.dangerIconContainer}>
                    <Ionicons name="trash-bin" size={28} color={theme.colors.accent.error} />
                  </View>
                  <View style={styles.dangerTextContainer}>
                    <Text variant="body" weight="bold" style={styles.dangerActionTitle}>
                      Apagar Todos os Ambientes
                    </Text>
                    <Text variant="caption" style={styles.dangerDescription}>
                      Remove <Text weight="bold">{notes.length} ambiente(s)</Text> permanentemente.
                      Esta ação não pode ser desfeita.
                    </Text>
                  </View>
                </View>

                {/* Delete Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteButton,
                    pressed && styles.deleteButtonPressed,
                  ]}
                  onPress={handleClearAllEnvironments}
                >
                  <Ionicons name="trash" size={20} color={theme.colors.text.onAccent} />
                  <Text weight="bold" style={styles.deleteButtonText}>
                    Apagar Tudo
                  </Text>
                </Pressable>
              </View>
            </View>
          </Card>
        </View>
      </SlideIn>

      {/* Create Modal */}
      <CreateNoteModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  createButton: {
    marginBottom: theme.spacing.lg,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  buttonText: {
    color: theme.colors.text.onAccent,
    fontSize: theme.typography.sizes.lg,
  },
  statsCard: {
    marginBottom: theme.spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    padding: theme.spacing.md,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: theme.colors.accent.primary,
    marginBottom: theme.spacing.xs / 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.border.medium,
    marginHorizontal: theme.spacing.md,
  },
  tipsSection: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    marginBottom: theme.spacing.sm,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
  },
  dangerZone: {
    marginTop: theme.spacing.xl * 1.5,
    marginBottom: theme.spacing.lg,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
  },
  dangerTitle: {
    color: theme.colors.accent.error,
  },
  dangerCard: {
    borderWidth: 2,
    borderColor: theme.colors.accent.error + '50',
    backgroundColor: theme.colors.accent.error + '05',
    overflow: 'hidden',
  },
  dangerCardInner: {
    padding: 0,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.accent.error + '15',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.accent.error + '30',
  },
  warningText: {
    color: theme.colors.accent.error,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: theme.typography.sizes.xs,
    letterSpacing: 0.5,
  },
  dangerContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  dangerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  dangerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.accent.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.accent.error + '30',
  },
  dangerTextContainer: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  dangerActionTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.base,
  },
  dangerDescription: {
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.accent.error,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.accent.error,
    shadowColor: theme.colors.accent.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  deleteButtonText: {
    color: theme.colors.text.onAccent,
    fontSize: theme.typography.sizes.base,
  },
});

