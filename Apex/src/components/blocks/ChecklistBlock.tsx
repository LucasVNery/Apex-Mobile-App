import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../ui/Text';
import { ChecklistBlock as ChecklistBlockType } from '../../types/note.types';
import { theme } from '../../theme';

interface ChecklistBlockProps {
  block: ChecklistBlockType;
  onToggle?: (itemId: string) => void;
}

export const ChecklistBlockComponent: React.FC<ChecklistBlockProps> = ({ block, onToggle }) => {
  return (
    <View style={styles.container}>
      {block.items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.item}
          onPress={() => onToggle?.(item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
            {item.completed && <View style={styles.checkmark} />}
          </View>
          <Text
            variant="body"
            style={[styles.text, item.completed && styles.textCompleted]}
          >
            {item.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.sm / 2,
    borderWidth: 2,
    borderColor: theme.colors.border.medium,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.accent.primary,
    borderColor: theme.colors.accent.primary,
  },
  checkmark: {
    width: 10,
    height: 10,
    borderRadius: theme.borderRadius.sm / 4,
    backgroundColor: '#FFFFFF',
  },
  text: {
    flex: 1,
    lineHeight: 20,
  },
  textCompleted: {
    color: theme.colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
});
