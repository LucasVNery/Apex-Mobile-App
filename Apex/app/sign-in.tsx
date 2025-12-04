import React, { useState } from 'react';
import { View, StyleSheet, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import { useWarmUpBrowser } from '@/hooks/useWarmUpBrowser';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { ScreenContainer } from '@/src/components/layout';
import { FadeIn, SlideIn } from '@/src/components/animations';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';

// Completa a autenticação OAuth no navegador
WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Aquecer o navegador para melhor performance
  useWarmUpBrowser();

  // Configurar OAuth para cada provedor
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startFacebookOAuth } = useOAuth({ strategy: 'oauth_facebook' });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: 'oauth_apple' });

  const handleOAuthPress = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setLoading(provider);
      setError('');

      let startOAuthFlow;
      const providerNames = {
        google: 'Google',
        facebook: 'Facebook',
        apple: 'Apple',
      };

      switch (provider) {
        case 'google':
          startOAuthFlow = startGoogleOAuth;
          break;
        case 'facebook':
          startOAuthFlow = startFacebookOAuth;
          break;
        case 'apple':
          startOAuthFlow = startAppleOAuth;
          break;
        default:
          throw new Error('Provedor inválido');
      }

      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/(tabs)');
      } else {
        throw new Error('Falha ao criar sessão de autenticação');
      }
    } catch (err: any) {
      const providerNames = {
        google: 'Google',
        facebook: 'Facebook',
        apple: 'Apple',
      };
      setError(err.errors?.[0]?.message || `Erro ao fazer login com ${providerNames[provider]}. Tente novamente.`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <ScreenContainer scrollable={false} withTabBar={false}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
          <FadeIn>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="sparkles" size={64} color={theme.colors.accent.primary} />
              </View>
              <Text variant="heading" weight="bold" style={styles.title}>
                Bem-vindo ao Apex
              </Text>
              <Text variant="body" color="secondary" style={styles.subtitle}>
                Faça login para continuar
              </Text>
            </View>
          </FadeIn>

          <FadeIn delay={100}>
            <View style={styles.oauthContainer}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={theme.colors.accent.warning} />
                  <Text variant="caption" style={styles.errorText}>
                    {error}
                  </Text>
                </View>
              ) : null}

              <Text variant="body" color="secondary" style={styles.oauthSubtitle}>
                Escolha uma forma de entrar
              </Text>

              <View style={styles.oauthButtons}>
                {/* Google */}
                <SlideIn delay={150} direction="up">
                  <Button
                    variant="outline"
                    size="large"
                    onPress={() => handleOAuthPress('google')}
                    disabled={!!loading}
                    style={styles.oauthButton}
                  >
                    <View style={styles.oauthButtonContent}>
                      {loading === 'google' ? (
                        <ActivityIndicator size="small" color={theme.colors.accent.primary} />
                      ) : (
                        <Ionicons name="logo-google" size={24} color={theme.colors.accent.primary} />
                      )}
                      <Text weight="semibold" style={styles.oauthButtonText}>
                        Continuar com Google
                      </Text>
                    </View>
                  </Button>
                </SlideIn>

                {/* Facebook */}
                <SlideIn delay={200} direction="up">
                  <Button
                    variant="outline"
                    size="large"
                    onPress={() => handleOAuthPress('facebook')}
                    disabled={!!loading}
                    style={styles.oauthButton}
                  >
                    <View style={styles.oauthButtonContent}>
                      {loading === 'facebook' ? (
                        <ActivityIndicator size="small" color={theme.colors.accent.primary} />
                      ) : (
                        <Ionicons name="logo-facebook" size={24} color={theme.colors.accent.primary} />
                      )}
                      <Text weight="semibold" style={styles.oauthButtonText}>
                        Continuar com Facebook
                      </Text>
                    </View>
                  </Button>
                </SlideIn>

                {/* Apple - apenas iOS */}
                {Platform.OS === 'ios' && (
                  <SlideIn delay={250} direction="up">
                    <Button
                      variant="outline"
                      size="large"
                      onPress={() => handleOAuthPress('apple')}
                      disabled={!!loading}
                      style={styles.oauthButton}
                    >
                      <View style={styles.oauthButtonContent}>
                        {loading === 'apple' ? (
                          <ActivityIndicator size="small" color={theme.colors.accent.primary} />
                        ) : (
                          <Ionicons name="logo-apple" size={24} color={theme.colors.accent.primary} />
                        )}
                        <Text weight="semibold" style={styles.oauthButtonText}>
                          Continuar com Apple
                        </Text>
                      </View>
                    </Button>
                  </SlideIn>
                )}
              </View>
            </View>
          </FadeIn>
        </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
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
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
  },
  oauthContainer: {
    width: '100%',
  },
  oauthSubtitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  oauthButtons: {
    gap: theme.spacing.md,
  },
  oauthButton: {
    width: '100%',
  },
  oauthButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  oauthButtonText: {
    color: theme.colors.accent.primary,
    fontSize: theme.typography.sizes.base,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent.warning + '15',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  errorText: {
    flex: 1,
    color: theme.colors.accent.warning,
  },
});

