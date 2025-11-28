import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Pressable } from 'react-native';
import { Text } from '../ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { v4 as uuidv4 } from 'uuid';
import { ChecklistItem } from '@/src/types/note.types';
import { BaseBlock } from './BaseBlock';
import * as Haptics from 'expo-haptics';

interface EditableChecklistBlockProps {
  blockId: string;
  items: ChecklistItem[];
  onItemsChange: (items: ChecklistItem[]) => void;
  onDelete?: () => void;
  showDragHandle?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function EditableChecklistBlock({
  blockId,
  items,
  onItemsChange,
  onDelete,
  showDragHandle = false,
  isSelected = false,
  isSelectionMode = false,
  onPress,
  onLongPress,
}: EditableChecklistBlockProps) {
  const [newItemText, setNewItemText] = useState('');

  const toggleItem = (itemId: string) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onItemsChange(updatedItems);
  };

  const updateItemText = (itemId: string, text: string) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, text } : item
    );
    onItemsChange(updatedItems);
  };

  const deleteItem = (itemId: string) => {
    const updatedItems = items.filter((item) => item.id !== itemId);
    onItemsChange(updatedItems);
  };

  const addNewItem = () => {
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: uuidv4(),
      text: newItemText.trim(),
      completed: false,
    };

    onItemsChange([...items, newItem]);
    setNewItemText('');
  };

  const handleContainerPress = () => {
    if (isSelectionMode && onPress) {
      onPress();
    }
  };

  const handleContainerLongPress = () => {
    // Sempre chama onLongPress se existir (para iniciar/continuar seleção)
    if (onLongPress) {
      onLongPress();
    }
  };

  return (
    <BaseBlock
      showDragHandle={showDragHandle}
      isSelected={isSelected}
      isSelectionMode={isSelectionMode}
      onPress={handleContainerPress}
      onLongPress={handleContainerLongPress}
    >
      <View style={styles.pressableContainer}>
        <View style={styles.content}>
        {/* Items existentes */}
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => toggleItem(item.id)}
              activeOpacity={0.7}
              disabled={isSelectionMode}
            >
              <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
                {item.completed && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>

            <TextInput
              style={[styles.itemInput, item.completed && styles.itemInputCompleted]}
              value={item.text}
              onChangeText={(text) => updateItemText(item.id, text)}
              placeholder="Item da checklist"
              placeholderTextColor={theme.colors.text.tertiary}
              editable={!isSelectionMode}
            />

            {!isSelectionMode && (
              <Pressable onPress={() => deleteItem(item.id)} style={styles.deleteButton}>
                <Ionicons name="close-circle" size={20} color={theme.colors.text.tertiary} />
              </Pressable>
            )}
          </View>
        ))}

        {/* Input para novo item */}
        {!isSelectionMode && (
          <View style={styles.newItemRow}>
            <View style={styles.checkboxContainer}>
              <View style={styles.checkbox} />
            </View>

            <TextInput
              style={styles.itemInput}
              value={newItemText}
              onChangeText={setNewItemText}
              placeholder="Adicionar item..."
              placeholderTextColor={theme.colors.text.tertiary}
              onSubmitEditing={addNewItem}
              returnKeyType="done"
            />

            {newItemText.length > 0 && (
              <Pressable onPress={addNewItem} style={styles.addButton}>
                <Ionicons name="add-circle" size={20} color={theme.colors.accent.primary} />
              </Pressable>
            )}
          </View>
        )}
      </View>
      </View>
    </BaseBlock>
  );
}

const styles = StyleSheet.create({
  pressableContainer: {
    width: '100%',
  },
  content: {
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  newItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  checkboxContainer: {
    marginRight: theme.spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.accent.primary,
    borderColor: theme.colors.accent.primary,
  },
  itemInput: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.xs,
  },
  itemInputCompleted: {
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  addButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});
