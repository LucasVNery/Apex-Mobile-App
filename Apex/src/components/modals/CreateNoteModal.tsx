import React, { useState } from 'react';
import { View, StyleSheet, Modal, Pressable, TextInput } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Ionicons } from '@expo/vector-icons';
import { v4 as uuidv4 } from 'uuid';
import { theme } from '@/src/theme';
import { router } from 'expo-router';
import { useNotesStore } from '@/src/stores/useNotesStore';
import { useProgressionStore } from '@/src/stores/useProgressionStore';
import * as Haptics from 'expo-haptics';

interface CreateNoteModalProps {
  visible: boolean;
  onClose: () => void;
}

type NoteTemplate = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  placeholder: string;
};

const BLANK_TEMPLATE: NoteTemplate = {
  id: 'blank',
  title: 'Nota em Branco',
  description: 'Comece do zero',
  icon: 'document-outline',
  color: theme.colors.accent.primary,
  placeholder: 'No que você está pensando?',
};

export function CreateNoteModal({ visible, onClose }: CreateNoteModalProps) {
  const [noteTitle, setNoteTitle] = useState('');

  const { addNote } = useNotesStore();
  const { incrementNotes } = useProgressionStore();

  const handleCreate = () => {
    if (!noteTitle.trim()) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Cria a nota SEM blocos iniciais
    const newNote = addNote({
      title: noteTitle.trim(),
      blocks: [], // Array vazio - usuário escolhe o primeiro bloco
      tags: [],
      color: BLANK_TEMPLATE.color,
    });

    // Incrementa progresso
    incrementNotes();

    // Fecha modal
    onClose();
    resetModal();

    // Navega para a nota
    router.push(`/note/${newNote.id}`);
  };

  const resetModal = () => {
    setNoteTitle('');
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetModal, 300);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <Card style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text variant="title" weight="bold">
                Criar Nova Nota
              </Text>
              <Pressable onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
              </Pressable>
            </View>

            {/* Title Input */}
            <View style={styles.titleContainer}>
              <View style={[styles.selectedTemplateIcon, { backgroundColor: BLANK_TEMPLATE.color + '20' }]}>
                <Ionicons name={BLANK_TEMPLATE.icon} size={40} color={BLANK_TEMPLATE.color} />
              </View>
              <TextInput
                style={styles.titleInput}
                value={noteTitle}
                onChangeText={setNoteTitle}
                placeholder={BLANK_TEMPLATE.placeholder}
                placeholderTextColor={theme.colors.text.tertiary}
                autoFocus
                onSubmitEditing={handleCreate}
                returnKeyType="done"
              />
              <Button
                variant="primary"
                onPress={handleCreate}
                style={styles.createButton}
                disabled={!noteTitle.trim()}
              >
                <Text weight="semibold" style={styles.createButtonText}>
                  Criar Nota
                </Text>
              </Button>
            </View>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
  },
  card: {
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  titleContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  selectedTemplateIcon: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  titleInput: {
    width: '100%',
    fontSize: theme.typography.sizes.xl,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.accent.primary,
    marginBottom: theme.spacing.xl,
  },
  createButton: {
    width: '100%',
  },
  createButtonText: {
    color: '#FFFFFF',
  },
});
