import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/src/components/ui/Text';
import { FadeIn, SlideIn } from '@/src/components/animations';
import { theme } from '@/src/theme';
import { useHaptic } from '@/src/hooks/useHaptic';
import { Ionicons } from '@expo/vector-icons';

interface ModeCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  delay?: number;
}

const ModeCard: React.FC<ModeCardProps> = ({ title, description, icon, color, onPress, delay = 0 }) => {
  const { trigger } = useHaptic();

  const handlePress = () => {
    trigger('light');
    onPress();
  };

  return (
    <SlideIn delay={delay} direction="up">
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.modeCard,
          pressed && styles.modeCardPressed,
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={32} color={color} />
        </View>
        <View style={styles.modeContent}>
          <Text variant="title" weight="bold" style={styles.modeTitle}>
            {title}
          </Text>
          <Text variant="body" color="secondary" style={styles.modeDescription}>
            {description}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={theme.colors.text.tertiary} />
      </Pressable>
    </SlideIn>
  );
};

export default function CreateScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <FadeIn>
          <View style={styles.header}>
            <Text variant="heading" weight="bold">
              Criar Novo
            </Text>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              Escolha como deseja criar
            </Text>
          </View>
        </FadeIn>

        <View style={styles.modesContainer}>
          <ModeCard
            title="Notas"
            description="Foco em texto, estilo Obsidian. Markdown e blocos básicos."
            icon="document-text"
            color={theme.colors.accent.primary}
            onPress={() => router.push('/notes')}
            delay={100}
          />

          <ModeCard
            title="Ambientes"
            description="Blocos poderosos, estilo Notion. Máxima flexibilidade."
            icon="grid"
            color={theme.colors.accent.warning}
            onPress={() => router.push('/environments')}
            delay={200}
          />

          <ModeCard
            title="Livre"
            description="Mescle texto e blocos como preferir. O melhor dos dois mundos."
            icon="color-wand"
            color={theme.colors.accent.secondary}
            onPress={() => router.push('/free')}
            delay={300}
          />
        </View>
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
    marginBottom: theme.spacing.xxl,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
  },
  modesContainer: {
    gap: theme.spacing.md,
  },
  modeCard: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  modeCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    marginBottom: theme.spacing.xs / 2,
  },
  modeDescription: {
    lineHeight: 20,
  },
});
