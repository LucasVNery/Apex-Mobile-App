import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { theme } from '@/src/theme';
import Svg, { Path, Circle, Line } from 'react-native-svg';

interface EmptyStateProps {
  onCreateFirst: () => void;
}

export function EmptyState({ onCreateFirst }: EmptyStateProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tooltipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in da ilustração
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Tooltip aparece após 2s
    Animated.sequence([
      Animated.delay(2000),
      Animated.timing(tooltipAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.illustration, { opacity: fadeAnim }]}>
        <NetworkIllustration />
      </Animated.View>

      <View style={styles.content}>
        <Text variant="heading" weight="bold" style={styles.title}>
          Sua segunda mente começa aqui
        </Text>

        <Text variant="body" color="secondary" style={styles.subtitle}>
          Capture ideias, conecte pensamentos, organize sua vida
        </Text>

        <Button
          variant="primary"
          size="large"
          onPress={onCreateFirst}
          style={styles.button}
        >
          <Text weight="semibold" style={styles.buttonText}>
            Criar primeira nota
          </Text>
        </Button>

        <Animated.View
          style={[
            styles.tooltip,
            {
              opacity: tooltipAnim,
              transform: [
                {
                  translateY: tooltipAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.tooltipBubble}>
            <Text variant="caption" color="secondary" style={styles.tooltipText}>
              💡 Digite qualquer coisa. Você pode organizar depois.
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

function NetworkIllustration() {
  return (
    <Svg width="200" height="200" viewBox="0 0 200 200">
      {/* Conexões (linhas) */}
      <Line
        x1="100"
        y1="60"
        x2="150"
        y2="100"
        stroke={theme.colors.accent.primary}
        strokeWidth="2"
        opacity="0.3"
      />
      <Line
        x1="100"
        y1="60"
        x2="50"
        y2="100"
        stroke={theme.colors.accent.primary}
        strokeWidth="2"
        opacity="0.3"
      />
      <Line
        x1="150"
        y1="100"
        x2="100"
        y2="140"
        stroke={theme.colors.accent.primary}
        strokeWidth="2"
        opacity="0.3"
      />
      <Line
        x1="50"
        y1="100"
        x2="100"
        y2="140"
        stroke={theme.colors.accent.primary}
        strokeWidth="2"
        opacity="0.3"
      />

      {/* Nós (círculos) */}
      <Circle
        cx="100"
        cy="60"
        r="12"
        fill={theme.colors.accent.primary}
        opacity="0.8"
      />
      <Circle
        cx="150"
        cy="100"
        r="10"
        fill={theme.colors.accent.secondary}
        opacity="0.6"
      />
      <Circle
        cx="50"
        cy="100"
        r="10"
        fill={theme.colors.accent.secondary}
        opacity="0.6"
      />
      <Circle
        cx="100"
        cy="140"
        r="14"
        fill={theme.colors.accent.primary}
        opacity="0.9"
      />

      {/* Nós menores de fundo */}
      <Circle
        cx="30"
        cy="50"
        r="6"
        fill={theme.colors.text.tertiary}
        opacity="0.3"
      />
      <Circle
        cx="170"
        cy="70"
        r="6"
        fill={theme.colors.text.tertiary}
        opacity="0.3"
      />
      <Circle
        cx="40"
        cy="150"
        r="6"
        fill={theme.colors.text.tertiary}
        opacity="0.3"
      />
      <Circle
        cx="160"
        cy="150"
        r="6"
        fill={theme.colors.text.tertiary}
        opacity="0.3"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  illustration: {
    marginBottom: theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  button: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.base,
  },
  tooltip: {
    marginTop: theme.spacing.md,
  },
  tooltipBubble: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  tooltipText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
