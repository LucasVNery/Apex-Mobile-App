import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { BaseBlock } from './BaseBlock';
import { Text } from '@/src/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import * as Haptics from 'expo-haptics';

interface ListBlockComponentProps {
  blockId: string;
  items: string[];
  ordered: boolean;
  onItemsChange: (items: string[]) => void;
  onDelete?: () => void;
  showDragHandle?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function ListBlockComponent({
  blockId,
  items,
  ordered,
  onItemsChange,
  onDelete,
  showDragHandle = false,
  isSelected = false,
  isSelectionMode = false,
  onPress,
  onLongPress,
}: ListBlockComponentProps) {
  const [listItems, setListItems] = useState(items.length > 0 ? items : ['']);

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...listItems];
    newItems[index] = value;
    setListItems(newItems);
    onItemsChange(newItems.filter((item) => item.trim() !== ''));
  };

  const handleAddItem = () => {
    const newItems = [...listItems, ''];
    setListItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    if (listItems.length === 1) return;
    const newItems = listItems.filter((_, i) => i !== index);
    setListItems(newItems);
    onItemsChange(newItems);
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
        <View style={styles.container}>
          {listItems.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text variant="body" style={styles.bullet}>
                {ordered ? `${index + 1}.` : '•'}
              </Text>
              <TextInput
                style={styles.input}
                value={item}
                onChangeText={(value) => handleItemChange(index, value)}
                placeholder="Item da lista"
                placeholderTextColor={theme.colors.text.tertiary}
                autoFocus={index === listItems.length - 1 && item === ''}
                onSubmitEditing={handleAddItem}
                returnKeyType="next"
                editable={!isSelectionMode}
              />
              {listItems.length > 1 && !isSelectionMode && (
                <Pressable
                  onPress={() => handleRemoveItem(index)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={theme.colors.text.tertiary}
                  />
                </Pressable>
              )}
            </View>
          ))}
          {!isSelectionMode && (
            <Pressable onPress={handleAddItem} style={styles.addButton}>
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={theme.colors.accent.primary}
              />
              <Text variant="caption" style={styles.addText}>
                Adicionar item
              </Text>
            </Pressable>
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
  container: {
    gap: theme.spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  bullet: {
    width: 24,
    color: theme.colors.text.secondary,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    padding: theme.spacing.xs,
    minHeight: 32,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingLeft: 36,
  },
  addText: {
    color: theme.colors.accent.primary,
  },
});
