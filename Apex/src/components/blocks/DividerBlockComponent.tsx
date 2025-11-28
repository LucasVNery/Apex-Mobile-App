import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { BaseBlock } from './BaseBlock';
import { theme } from '@/src/theme';
import * as Haptics from 'expo-haptics';

interface DividerBlockComponentProps {
  blockId: string;
  onDelete?: () => void;
  showDragHandle?: boolean;
}

export function DividerBlockComponent({
  blockId,
  onDelete,
  showDragHandle = false,
}: DividerBlockComponentProps) {
  const handleLongPress = () => {
    if (onDelete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onDelete();
    }
  };

  return (
    <BaseBlock showDragHandle={showDragHandle}>
      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={500}
        style={styles.container}
      >
        <View style={styles.divider} />
      </Pressable>
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
