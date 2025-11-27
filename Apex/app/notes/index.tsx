import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNotesStore } from '@/src/stores/useNotesStore';
import { NoteList } from '@/src/components/notes/NoteList';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { FadeIn } from '@/src/components/animations/FadeIn';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function NotesScreen() {
  const { getFilteredNotes, searchQuery, setSearchQuery } = useNotesStore();
  const notes = getFilteredNotes();

  return (
    <View style={styles.container}>
      <FadeIn>
        <View style={styles.header}>
          <Input
            placeholder="Buscar notas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={
              <Ionicons name="search" size={20} color={theme.colors.text.tertiary} />
            }
          />
          <Button
            variant="primary"
            size="medium"
            style={styles.newButton}
            onPress={() => {
              // TODO: Implementar criação de nota
            }}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </View>
          </Button>
        </View>
      </FadeIn>
      <NoteList notes={notes} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  newButton: {
    paddingHorizontal: theme.spacing.md,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
});
