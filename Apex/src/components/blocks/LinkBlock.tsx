import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotesStore } from '@/src/stores/useNotesStore';
import { LinkBlock as LinkBlockType } from '@/src/types/note.types';
import { theme } from '@/src/theme';
import { router } from 'expo-router';
import { haptic } from '@/src/utils/haptics';

interface LinkBlockProps {
  block: LinkBlockType;
  onUpdate: (block: LinkBlockType) => void;
  onDelete: () => void;
  isEditing?: boolean;
  onEditPress?: () => void; // Callback para abrir modal de edição
}

/**
 * Bloco de Link Simples
 * Exibe um link destacado e sublinhado para navegar para outro ambiente
 */
export default function LinkBlock({
  block,
  onUpdate,
  onDelete,
  isEditing = false,
  onEditPress,
}: LinkBlockProps) {
  const { notes } = useNotesStore();

  // Obter nota referenciada
  const targetNote = useMemo(() => {
    if (!block.targetNoteId) return null;
    return notes.find((n) => n.id === block.targetNoteId);
  }, [block.targetNoteId, notes]);

  // Se não há targetNoteId, mostrar botão para selecionar
  const hasTarget = block.targetNoteId && block.targetNoteId.trim() !== '';
  const targetExists = targetNote !== null;
  const showWarning = hasTarget && !targetExists;

  // Navegar para nota
  const handleNavigate = () => {
    if (!targetNote) return;
    haptic.medium();
    router.push(`/note/${targetNote.id}`);
  };

  // Abrir edição/seleção
  const handleEdit = () => {
    if (onEditPress) {
      haptic.light();
      onEditPress();
    }
  };

  // Texto a exibir
  const displayText = block.displayText || targetNote?.title || 'Selecione um ambiente';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Ícone do link */}
        <Ionicons
          name="link"
          size={16}
          color={theme.colors.accent.primary}
          style={styles.icon}
        />

        {/* Link clicável ou botão de seleção */}
        {hasTarget && targetExists ? (
          <Pressable
            onPress={handleNavigate}
            style={({ pressed }) => [
              styles.linkButton,
              pressed && styles.linkButtonPressed,
            ]}
          >
            <Text style={styles.linkText} numberOfLines={1}>
              {displayText}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleEdit}
            style={({ pressed }) => [
              styles.selectButton,
              pressed && styles.selectButtonPressed,
            ]}
          >
            <Text style={styles.selectButtonText} numberOfLines={1}>
              {displayText}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.text.tertiary}
            />
          </Pressable>
        )}

        {/* Botões de ação (editar/deletar) */}
        {isEditing && hasTarget && targetExists && (
          <View style={styles.actions}>
            <Pressable onPress={handleEdit} style={styles.actionButton}>
              <Ionicons
                name="create-outline"
                size={18}
                color={theme.colors.text.secondary}
              />
            </Pressable>
            <Pressable onPress={onDelete} style={styles.actionButton}>
              <Ionicons
                name="trash-outline"
                size={18}
                color={theme.colors.accent.error}
              />
            </Pressable>
          </View>
        )}

        {/* Botão de deletar quando não há target */}
        {isEditing && !hasTarget && (
          <Pressable onPress={onDelete} style={styles.actionButton}>
            <Ionicons
              name="trash-outline"
              size={18}
              color={theme.colors.accent.error}
            />
          </Pressable>
        )}
      </View>

      {/* Aviso se nota não existe mais (apenas se havia um target configurado) */}
      {showWarning && (
        <View style={styles.warningContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={14}
            color={theme.colors.accent.warning}
          />
          <Text style={styles.warningText}>
            O ambiente referenciado não existe mais
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
  },
  icon: {
    marginRight: theme.spacing.xs,
  },
  linkButton: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
  },
  linkButtonPressed: {
    opacity: 0.6,
  },
  linkText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.accent.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  selectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderStyle: 'dashed',
  },
  selectButtonPressed: {
    opacity: 0.6,
  },
  selectButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actionButton: {
    padding: theme.spacing.xs,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.accent.warning + '20',
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent.warning,
  },
  warningText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.accent.warning,
    fontStyle: 'italic',
  },
});
