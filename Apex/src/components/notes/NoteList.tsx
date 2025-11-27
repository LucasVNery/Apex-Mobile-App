import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { NoteCard } from './NoteCard';
import { SlideIn } from '../animations/SlideIn';
import { Note } from '../../types/note.types';
import { theme } from '../../theme';
import { Text } from '../ui/Text';

interface NoteListProps {
  notes: Note[];
}

export const NoteList: React.FC<NoteListProps> = ({ notes }) => {
  if (notes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="title" weight="semibold" color="tertiary">
          Nenhuma nota encontrada
        </Text>
        <Text variant="body" color="tertiary" style={styles.emptyText}>
          Comece criando sua primeira nota
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notes}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <SlideIn delay={index * 50} direction="up">
          <NoteCard note={item} />
        </SlideIn>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
