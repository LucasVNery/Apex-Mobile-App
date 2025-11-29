import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { BaseBlock } from './BaseBlock';
import { theme } from '@/src/theme';
import * as Haptics from 'expo-haptics';

interface DividerBlockComponentProps {
  blockId: string;
  onDelete?: () => void;
  showDragHandle?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function DividerBlockComponent({
  blockId,
  onDelete,
  showDragHandle = false,
  isSelected = false,
  isSelectionMode = false,
  onPress,
  onLongPress,
}: DividerBlockComponentProps) {
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
      showDeleteButton={true}
      onDelete={onDelete}
      isSelected={isSelected}
      isSelectionMode={isSelectionMode}
      onPress={handleContainerPress}
      onLongPress={handleContainerLongPress}
    >
      <View style={styles.container}>
        <View style={styles.divider} />
      </View>
    </BaseBlock>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  divider: {
    height: 2,
    backgroundColor: theme.colors.border.medium,
    borderRadius: 1,
    marginVertical: theme.spacing.md,
  },
});
