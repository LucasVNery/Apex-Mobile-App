import React, { useState } from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import * as Haptics from 'expo-haptics';

interface HelpTip {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  examples?: string[];
}

interface HelpButtonProps {
  tips: HelpTip[];
  title?: string;
}

export function HelpButton({ tips, title = 'Como usar' }: HelpButtonProps) {
  const [showHelp, setShowHelp] = useState(false);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowHelp(true);
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.helpButton,
          pressed && styles.helpButtonPressed,
        ]}
        onPress={handlePress}
      >
        <Ionicons
          name="help-circle-outline"
          size={24}
          color={theme.colors.accent.primary}
        />
      </Pressable>

      <Modal
        visible={showHelp}
        animationType="fade"
        transparent
        onRequestClose={() => setShowHelp(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowHelp(false)}>
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <Card style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Ionicons
                    name="information-circle"
                    size={28}
                    color={theme.colors.accent.primary}
                  />
                  <Text variant="title" weight="bold">
                    {title}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setShowHelp(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={theme.colors.text.secondary}
                  />
                </Pressable>
              </View>

              {/* Tips */}
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                {tips.map((tip, index) => (
                  <View key={index} style={styles.tipCard}>
                    <View style={styles.tipHeader}>
                      <View style={styles.tipIcon}>
                        <Ionicons
                          name={tip.icon}
                          size={24}
                          color={theme.colors.accent.primary}
                        />
                      </View>
                      <Text variant="body" weight="bold" style={styles.tipTitle}>
                        {tip.title}
                      </Text>
                    </View>
                    <Text variant="body" color="secondary" style={styles.tipDescription}>
                      {tip.description}
                    </Text>
                    {tip.examples && tip.examples.length > 0 && (
                      <View style={styles.examples}>
                        {tip.examples.map((example, exIndex) => (
                          <View key={exIndex} style={styles.exampleRow}>
                            <Ionicons
                              name="chevron-forward"
                              size={16}
                              color={theme.colors.text.tertiary}
                            />
                            <Text variant="caption" color="tertiary" style={styles.exampleText}>
                              {example}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  helpButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  helpButtonPressed: {
    backgroundColor: theme.colors.accent.primary + '20',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  card: {
    padding: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  scrollView: {
    maxHeight: 500,
  },
  tipCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent.primary,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.accent.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    flex: 1,
  },
  tipDescription: {
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  examples: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  exampleText: {
    flex: 1,
    fontFamily: 'monospace',
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
});
