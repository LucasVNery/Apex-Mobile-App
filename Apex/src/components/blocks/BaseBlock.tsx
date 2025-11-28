import React, { ReactNode } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import * as Haptics from 'expo-haptics';

interface BaseBlockProps {
  children: ReactNode;
  onLongPress?: () => void;
  onPress?: () => void;
  showDragHandle?: boolean;
  isActive?: boolean;
  style?: any;
}

export function BaseBlock({
  children,
  onLongPress,
  onPress,
  showDragHandle = false,
  isActive = false,
  style,
}: BaseBlockProps) {
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.();
  };

  return (
    <View style={[styles.container, isActive && styles.active, style]}>
      {showDragHandle && (
        <Pressable
          style={styles.dragHandle}
          onLongPress={handleLongPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={20} color={theme.colors.text.tertiary} />
        </Pressable>
      )}
      <Pressable style={styles.content} onPress={onPress}>
        {children}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.xs,
  },
  active: {
    backgroundColor: theme.colors.accent.primary + '10',
  },
  dragHandle: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.xs,
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
});
