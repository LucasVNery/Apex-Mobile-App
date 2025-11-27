import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { FadeIn, SlideIn } from '@/src/components/animations';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { useHaptic } from '@/src/hooks/useHaptic';

type BlockType = 'text' | 'heading' | 'todo' | 'list' | 'quote' | 'divider' | 'callout';

interface BlockOption {
  type: BlockType;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  color: string;
}

const blockOptions: BlockOption[] = [
  {
    type: 'text',
    icon: 'text',
    label: 'Texto',
    description: 'Parágrafo de texto simples',
    color: theme.colors.text.secondary,
  },
  {
    type: 'heading',
    icon: 'text-outline',
    label: 'Título',
    description: 'Seção de título grande',
    color: theme.colors.accent.primary,
  },
  {
    type: 'todo',
    icon: 'checkbox-outline',
    label: 'Lista de Tarefas',
    description: 'Lista de itens marcáveis',
    color: theme.colors.accent.warning,
  },
  {
    type: 'list',
    icon: 'list',
    label: 'Lista com Marcadores',
    description: 'Lista simples de itens',
    color: theme.colors.accent.secondary,
  },
  {
    type: 'quote',
    icon: 'quote',
    label: 'Citação',
    description: 'Bloco de citação',
    color: theme.colors.text.tertiary,
  },
  {
    type: 'divider',
    icon: 'remove',
    label: 'Divisor',
    description: 'Linha separadora',
    color: theme.colors.border.medium,
  },
  {
    type: 'callout',
    icon: 'bulb',
    label: 'Destaque',
    description: 'Caixa de destaque com ícone',
    color: theme.colors.accent.primary,
  },
];

export default function EnvironmentsScreen() {
  const { trigger } = useHaptic();
  const [showBlockMenu, setShowBlockMenu] = useState(false);

  const handleBlockPress = (blockType: BlockType) => {
    trigger('light');
    setShowBlockMenu(false);
    // TODO: Implementar adição de bloco
    console.log('Adicionar bloco:', blockType);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <FadeIn>
          <View style={styles.header}>
            <Text variant="title" weight="semibold" color="secondary">
              Crie páginas com blocos poderosos
            </Text>
          </View>
        </FadeIn>

        <FadeIn delay={100}>
          <View style={styles.section}>
            <Text variant="body" weight="semibold" style={styles.sectionTitle}>
              Tipos de Blocos Disponíveis
            </Text>
            <Text variant="caption" color="secondary" style={styles.sectionDescription}>
              Escolha entre diferentes tipos de blocos para construir sua página
            </Text>
          </View>
        </FadeIn>

        <View style={styles.blocksGrid}>
          {blockOptions.map((block, index) => (
            <SlideIn key={block.type} delay={150 + index * 50} direction="up">
              <Pressable
                onPress={() => handleBlockPress(block.type)}
                style={({ pressed }) => [
                  styles.blockCard,
                  pressed && styles.blockCardPressed,
                ]}
              >
                <View style={[styles.blockIcon, { backgroundColor: block.color + '20' }]}>
                  <Ionicons name={block.icon} size={28} color={block.color} />
                </View>
                <View style={styles.blockContent}>
                  <Text variant="body" weight="semibold">
                    {block.label}
                  </Text>
                  <Text variant="caption" color="secondary" numberOfLines={1}>
                    {block.description}
                  </Text>
                </View>
                <Ionicons name="add-circle" size={24} color={theme.colors.accent.primary} />
              </Pressable>
            </SlideIn>
          ))}
        </View>

        <SlideIn delay={500} direction="up">
          <View style={styles.section}>
            <Text variant="body" weight="semibold" style={styles.sectionTitle}>
              Recursos Avançados
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            <Card style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.accent.primary + '20' }]}>
                <Ionicons name="swap-vertical" size={24} color={theme.colors.accent.primary} />
              </View>
              <Text variant="body" weight="semibold" style={styles.featureTitle}>
                Arrastar e Soltar
              </Text>
              <Text variant="caption" color="secondary" style={styles.featureDescription}>
                Reordene blocos facilmente
              </Text>
            </Card>

            <Card style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.accent.warning + '20' }]}>
                <Ionicons name="copy" size={24} color={theme.colors.accent.warning} />
              </View>
              <Text variant="body" weight="semibold" style={styles.featureTitle}>
                Duplicar
              </Text>
              <Text variant="caption" color="secondary" style={styles.featureDescription}>
                Clone blocos rapidamente
              </Text>
            </Card>

            <Card style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.accent.secondary + '20' }]}>
                <Ionicons name="color-palette" size={24} color={theme.colors.accent.secondary} />
              </View>
              <Text variant="body" weight="semibold" style={styles.featureTitle}>
                Customização
              </Text>
              <Text variant="caption" color="secondary" style={styles.featureDescription}>
                Cores e estilos personalizados
              </Text>
            </Card>

            <Card style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.accent.primary + '20' }]}>
                <Ionicons name="link" size={24} color={theme.colors.accent.primary} />
              </View>
              <Text variant="body" weight="semibold" style={styles.featureTitle}>
                Conexões
              </Text>
              <Text variant="caption" color="secondary" style={styles.featureDescription}>
                Vincule páginas e blocos
              </Text>
            </Card>
          </View>
        </SlideIn>

        <SlideIn delay={600} direction="up">
          <Card style={styles.infoCard}>
            <Ionicons name="information-circle" size={32} color={theme.colors.accent.primary} />
            <Text variant="body" color="secondary" style={styles.infoText}>
              Ambientes permitem criar páginas complexas com blocos modulares. Perfeito para
              documentação, wikis, databases e projetos.
            </Text>
          </Card>
        </SlideIn>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: 40,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    marginBottom: theme.spacing.xs / 2,
  },
  sectionDescription: {
    lineHeight: 18,
  },
  blocksGrid: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  blockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  blockCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  blockIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  blockContent: {
    flex: 1,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  featureCard: {
    width: '48%',
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureTitle: {
    marginBottom: theme.spacing.xs / 2,
    textAlign: 'center',
  },
  featureDescription: {
    textAlign: 'center',
    lineHeight: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.accent.primary + '10',
    borderColor: theme.colors.accent.primary + '30',
  },
  infoText: {
    flex: 1,
    lineHeight: 20,
  },
});
