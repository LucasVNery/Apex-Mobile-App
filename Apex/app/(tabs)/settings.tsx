import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { FadeIn } from '@/src/components/animations/FadeIn';
import { ScreenContainer } from '@/src/components/layout';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { signOut, user } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/sign-in');
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer withTabBar>
        <FadeIn>
          <View style={styles.header}>
            <Text variant="heading" weight="bold">
              Configurações
            </Text>
            {user && (
              <Text variant="caption" color="secondary" style={styles.userEmail}>
                {user.primaryEmailAddress?.emailAddress}
              </Text>
            )}
          </View>
        </FadeIn>

        <FadeIn delay={100}>
          <View style={styles.section}>
            <Text variant="title" weight="semibold" style={styles.sectionTitle}>
              Aparência
            </Text>
            <Card style={styles.settingCard}>
              <View style={styles.settingIcon}>
                <Ionicons name="moon" size={20} color={theme.colors.accent.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text variant="body" weight="semibold">
                  Tema Escuro
                </Text>
                <Text variant="caption" color="secondary">
                  Ativado
                </Text>
              </View>
            </Card>
          </View>
        </FadeIn>

        <FadeIn delay={150}>
          <View style={styles.section}>
            <Text variant="title" weight="semibold" style={styles.sectionTitle}>
              Editor
            </Text>
            <Card style={styles.settingCard}>
              <View style={styles.settingIcon}>
                <Ionicons name="text" size={20} color={theme.colors.accent.warning} />
              </View>
              <View style={styles.settingContent}>
                <Text variant="body" weight="semibold">
                  Fonte do Editor
                </Text>
                <Text variant="caption" color="secondary">
                  Padrão do Sistema
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
            </Card>
          </View>
        </FadeIn>

        <FadeIn delay={200}>
          <View style={styles.section}>
            <Text variant="title" weight="semibold" style={styles.sectionTitle}>
              Sobre
            </Text>
            <Card>
              <Text variant="body" weight="semibold">
                Apex
              </Text>
              <Text variant="caption" color="secondary" style={styles.version}>
                Versão 1.0.0
              </Text>
              <Text variant="caption" color="tertiary" style={styles.description}>
                Um aplicativo de notas minimalista com foco em conexões entre ideias. Combine o
                melhor do Obsidian e Notion em um só lugar.
              </Text>
            </Card>
          </View>
        </FadeIn>

        <FadeIn delay={250}>
          <View style={styles.section}>
            <Text variant="title" weight="semibold" style={styles.sectionTitle}>
              Conta
            </Text>
            <Button
              variant="outline"
              size="large"
              onPress={handleSignOut}
              style={styles.signOutButton}
            >
              <View style={styles.signOutContent}>
                <Ionicons name="log-out-outline" size={20} color={theme.colors.accent.warning} />
                <Text weight="semibold" style={styles.signOutText}>
                  Sair da Conta
                </Text>
              </View>
            </Button>
          </View>
        </FadeIn>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.lg,
  },
  userEmail: {
    marginTop: theme.spacing.xs,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  version: {
    marginTop: theme.spacing.xs,
  },
  description: {
    marginTop: theme.spacing.sm,
    lineHeight: 18,
  },
  signOutButton: {
    marginTop: theme.spacing.sm,
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  signOutText: {
    color: theme.colors.accent.warning,
  },
});
