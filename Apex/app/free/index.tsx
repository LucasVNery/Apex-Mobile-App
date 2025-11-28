import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { FadeIn } from '@/src/components/animations/FadeIn';
import { ScreenContainer } from '@/src/components/layout';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function FreeScreen() {
  return (
    <ScreenContainer>
        <FadeIn>
          <View style={styles.header}>
            <Text variant="title" weight="semibold" color="secondary">
              Combine texto e blocos livremente
            </Text>
          </View>
        </FadeIn>

        <FadeIn delay={100}>
          <Card style={styles.placeholderCard}>
            <View style={styles.iconContainer}>
              <Ionicons name="color-wand" size={48} color={theme.colors.accent.secondary} />
            </View>
            <Text variant="title" weight="semibold" style={styles.placeholderTitle}>
              Modo Livre em Desenvolvimento
            </Text>
            <Text variant="body" color="secondary" style={styles.placeholderText}>
              O melhor dos dois mundos: escreva em markdown como no Obsidian e, quando precisar,
              adicione blocos poderosos como no Notion. Total liberdade criativa.
            </Text>
            <View style={styles.features}>
              <View style={styles.feature}>
                <Ionicons name="document-text" size={20} color={theme.colors.accent.primary} />
                <Text variant="body" color="secondary">Editor Markdown</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="grid" size={20} color={theme.colors.accent.warning} />
                <Text variant="body" color="secondary">Blocos do Notion</Text>
              </View>
              <View style={styles.feature}>
                <Ionicons name="color-wand" size={20} color={theme.colors.accent.secondary} />
                <Text variant="body" color="secondary">Transição suave entre modos</Text>
              </View>
            </View>
          </Card>
        </FadeIn>

        <Button
          variant="primary"
          size="large"
          style={styles.createButton}
          onPress={() => {
            // TODO: Implementar criação de documento livre
          }}
        >
          Criar Documento Livre
        </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.lg,
  },
  placeholderCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.accent.secondary + '20',
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
  createButton: {
    marginTop: theme.spacing.lg,
  },
});
