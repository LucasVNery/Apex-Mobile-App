import React, { useState } from 'react';
import { TextInput, StyleSheet, Pressable } from 'react-native';
import { BaseBlock } from './BaseBlock';
import { Text } from '@/src/components/ui/Text';
import { theme } from '@/src/theme';
import * as Haptics from 'expo-haptics';

interface HeadingBlockProps {
  blockId: string;
  content: string;
  level: 1 | 2 | 3;
  onContentChange: (content: string) => void;
  onDelete?: () => void;
  autoFocus?: boolean;
  showDragHandle?: boolean;
}

export function HeadingBlock({
  blockId,
  content,
  level,
  onContentChange,
  onDelete,
  autoFocus = false,
  showDragHandle = false,
}: HeadingBlockProps) {
  const [text, setText] = useState(content);
  const [isFocused, setIsFocused] = useState(false);

  const handleTextChange = (newText: string) => {
    setText(newText);
    onContentChange(newText);
  };

  const handleLongPress = () => {
    if (onDelete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onDelete();
    }
  };

  const getFontSize = () => {
    switch (level) {
      case 1:
        return theme.typography.sizes.xxl;
      case 2:
        return theme.typography.sizes.xl;
      case 3:
        return theme.typography.sizes.lg;
    }
  };

  return (
    <BaseBlock showDragHandle={showDragHandle} isActive={isFocused}>
      <Pressable
        onPress={() => !isFocused && setIsFocused(true)}
        onLongPress={handleLongPress}
        delayLongPress={500}
        style={styles.container}
      >
        {!isFocused && text ? (
          <Text
            variant="heading"
            weight="bold"
            style={[styles.heading, { fontSize: getFontSize() }]}
          >
            {text}
          </Text>
        ) : (
          <TextInput
            style={[
              styles.input,
              { fontSize: getFontSize() },
              styles.headingInput,
            ]}
            value={text}
            onChangeText={handleTextChange}
            onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={`Título ${level}`}
          placeholderTextColor={theme.colors.text.tertiary}
          autoFocus={autoFocus}
        />
      )}
      </Pressable>
    </BaseBlock>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  heading: {
    padding: theme.spacing.sm,
  },
  input: {
    color: theme.colors.text.primary,
    fontWeight: '700',
    padding: theme.spacing.sm,
  },
  headingInput: {
    minHeight: 44,
  },
});
