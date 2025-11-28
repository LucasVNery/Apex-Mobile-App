import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Feature } from '@/src/types/progression.types';

interface FeatureUnlockToastProps {
  feature: Feature;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onDismiss: () => void;
}

export function FeatureUnlockToast({
  feature,
  title,
  description,
  icon,
  onDismiss,
}: FeatureUnlockToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();

    // Auto dismiss após 5s
    const timer = setTimeout(() => {
      dismissToast();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <Card style={styles.card} onPress={dismissToast}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={32} color={theme.colors.accent.primary} />
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="body" weight="bold" style={styles.title}>
              🎉 {title}
            </Text>
          </View>
          <Text variant="caption" color="secondary" style={styles.description}>
            {description}
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: theme.spacing.xl,
    left: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 1000,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.elevated,
    borderWidth: 2,
    borderColor: theme.colors.accent.primary + '40',
    shadowColor: theme.colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.accent.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: theme.spacing.xs / 2,
  },
  title: {
    color: theme.colors.text.primary,
  },
  description: {
    lineHeight: 18,
  },
});
