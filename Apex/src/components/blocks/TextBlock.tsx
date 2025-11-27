import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { TextBlock as TextBlockType } from '../../types/note.types';
import { theme } from '../../theme';

interface TextBlockProps {
  block: TextBlockType;
}

export const TextBlockComponent: React.FC<TextBlockProps> = ({ block }) => {
  return (
    <Text variant="body" style={styles.text}>
      {block.content}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    marginBottom: theme.spacing.sm,
    lineHeight: 24,
  },
});
