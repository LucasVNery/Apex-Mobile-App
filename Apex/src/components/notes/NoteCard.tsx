import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { Note } from '../../types/note.types';
import { theme } from '../../theme';

interface NoteCardProps {
  note: Note;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note }) => {
  const handlePress = () => {
    router.push(`/note/${note.id}`);
  };

  const getPreviewText = () => {
    const textBlocks = note.blocks.filter(
      (block) => block.type === 'text' || block.type === 'heading'
    );
    if (textBlocks.length > 0) {
      const firstBlock = textBlocks[0] as any;
      return firstBlock.content.substring(0, 100) + (firstBlock.content.length > 100 ? '...' : '');
    }
    return 'Nota vazia';
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;
    return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <Card onPress={handlePress}>
      {note.color && (
        <View style={[styles.colorBar, { backgroundColor: note.color }]} />
      )}
      <View style={styles.content}>
        <Text variant="title" weight="semibold" numberOfLines={1}>
          {note.title}
        </Text>
        <Text variant="body" color="secondary" numberOfLines={2} style={styles.preview}>
          {getPreviewText()}
        </Text>
        <View style={styles.footer}>
          {note.tags.length > 0 && (
            <View style={styles.tags}>
              {note.tags.slice(0, 3).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text variant="caption" color="secondary">
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
          <Text variant="caption" color="tertiary">
            {formatDate(note.updatedAt)}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  colorBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  content: {
    marginTop: theme.spacing.xs,
  },
  preview: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    flex: 1,
  },
  tag: {
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs / 2,
    borderRadius: theme.borderRadius.sm,
  },
});
