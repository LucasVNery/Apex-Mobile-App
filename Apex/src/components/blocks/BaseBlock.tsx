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
  isSelected?: boolean;
  isSelectionMode?: boolean;
  style?: any;
}

export function BaseBlock({
  children,
  onLongPress,
  onPress,
  showDragHandle = false,
  isActive = false,
  isSelected = false,
  isSelectionMode = false,
  style,
}: BaseBlockProps) {
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.();
  };

  const handlePress = () => {
    if (isSelectionMode) {
      Haptics.selectionAsync();
    }
    onPress?.();
  };

  return (
    <View style={[
      styles.container,
      isActive && styles.active,
      isSelected && styles.selected,
      isSelectionMode && styles.selectionMode,
      style
    ]}>
      {/* Checkbox de seleção */}
      {isSelectionMode && (
        <View style={styles.checkboxContainer}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && (
              <Ionicons name="checkmark" size={16} color={theme.colors.background.primary} />
            )}
          </View>
        </View>
      )}

      {showDragHandle && !isSelectionMode && (
        <Pressable
          style={styles.dragHandle}
          onLongPress={handleLongPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={20} color={theme.colors.text.tertiary} />
        </Pressable>
      )}
      <Pressable style={styles.content} onPress={handlePress} onLongPress={handleLongPress}>
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
  selected: {
    backgroundColor: theme.colors.accent.primary + '20',
    borderWidth: 2,
    borderColor: theme.colors.accent.primary,
  },
  selectionMode: {
    paddingLeft: theme.spacing.xs,
  },
  checkboxContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border.medium,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.accent.primary,
    borderColor: theme.colors.accent.primary,
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
    minHeight: 44, // Garante área de toque mínima mesmo para blocos vazios
  },
});
