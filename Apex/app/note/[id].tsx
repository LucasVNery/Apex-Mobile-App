import React from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useNotesStore } from '@/src/stores/useNotesStore';
import { Text } from '@/src/components/ui/Text';
import { TextBlockComponent } from '@/src/components/blocks/TextBlock';
import { ChecklistBlockComponent } from '@/src/components/blocks/ChecklistBlock';
import { FadeIn } from '@/src/components/animations/FadeIn';
import { SlideIn } from '@/src/components/animations/SlideIn';
import { theme } from '@/src/theme';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getNoteById } = useNotesStore();
  const note = getNoteById(id as string);

  if (!note) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="title" weight="semibold" color="tertiary">
            Nota não encontrada
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FadeIn>
          {note.color && (
            <View style={[styles.colorBar, { backgroundColor: note.color }]} />
          )}
          <View style={styles.header}>
            <Text variant="heading" weight="bold">
              {note.title}
            </Text>
            <Text variant="caption" color="tertiary" style={styles.date}>
              Atualizado em {formatDate(note.updatedAt)}
            </Text>
            {note.tags.length > 0 && (
              <View style={styles.tags}>
                {note.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text variant="caption" color="secondary">
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </FadeIn>

        <View style={styles.content}>
          {note.blocks.map((block, index) => (
            <SlideIn key={block.id} delay={index * 50} direction="up">
              {block.type === 'text' && <TextBlockComponent block={block} />}
              {block.type === 'checklist' && <ChecklistBlockComponent block={block} />}
              {block.type === 'heading' && (
                <Text
                  variant="title"
                  weight="bold"
                  style={styles.heading}
                >
                  {block.content}
                </Text>
              )}
            </SlideIn>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  colorBar: {
    height: 4,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  date: {
    marginTop: theme.spacing.xs,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  tag: {
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  content: {
    gap: theme.spacing.sm,
  },
  heading: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
