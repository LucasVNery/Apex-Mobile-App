import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import { BaseBlock } from './BaseBlock';
import { Text } from '@/src/components/ui/Text';
import { theme } from '@/src/theme';
import { useDoubleTap } from '@/src/hooks/useDoubleTap';
import * as Haptics from 'expo-haptics';

interface HeadingBlockProps {
  blockId: string;
  content: string;
  level: 1 | 2 | 3;
  onContentChange: (content: string) => void;
  onDelete?: () => void;
  autoFocus?: boolean;
  showDragHandle?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

export interface HeadingBlockRef {
  blur: () => void;
  focus: () => void;
}

export const HeadingBlock = forwardRef<HeadingBlockRef, HeadingBlockProps>(({
  blockId,
  content,
  level,
  onContentChange,
  onDelete,
  autoFocus = false,
  showDragHandle = false,
  isSelected = false,
  isSelectionMode = false,
  onPress,
  onLongPress,
}, ref) => {
  const [text, setText] = useState(content);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    blur: () => {
      inputRef.current?.blur();
    },
    focus: () => {
      setIsFocused(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    },
  }));

  useEffect(() => {
    setText(content);
  }, [content]);

  const handleTextChange = (newText: string) => {
    if (newText === '' && text === '' && onDelete) {
      onDelete();
      return;
    }

    setText(newText);
    onContentChange(newText);
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

  const handleSingleTap = () => {
    if (isSelectionMode && onPress) {
      onPress();
    }
  };

  const handleDoubleTap = () => {
    if (!isSelectionMode && !isFocused) {
      setIsFocused(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleTap = useDoubleTap({
    onSingleTap: handleSingleTap,
    onDoubleTap: handleDoubleTap,
    delay: 300,
  });

  const handleContainerPress = () => {
    if (isSelectionMode) {
      handleSingleTap();
    } else {
      handleTap();
    }
  };

  const handleContainerLongPress = () => {
    if (onLongPress) {
      onLongPress();
    }
  };

  return (
    <BaseBlock
      showDragHandle={showDragHandle}
      isActive={isFocused}
      isSelected={isSelected}
      isSelectionMode={isSelectionMode}
      onPress={handleContainerPress}
      onLongPress={handleContainerLongPress}
    >
      <View style={styles.container}>
        {!isFocused && text && (
          <Text
            variant="heading"
            weight="bold"
            style={[styles.heading, { fontSize: getFontSize() }]}
          >
            {text}
          </Text>
        )}

        {!isFocused && !text && (
          <View style={styles.emptyPlaceholder}>
            <Text
              variant="heading"
              weight="bold"
              color="tertiary"
              style={[styles.placeholderText, { fontSize: getFontSize() }]}
            >
              {`Título ${level}`}
            </Text>
          </View>
        )}

        {isFocused && (
          <TextInput
            ref={inputRef}
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
            editable={!isSelectionMode}
          />
        )}
      </View>
    </BaseBlock>
  );
});

HeadingBlock.displayName = 'HeadingBlock';

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
  emptyPlaceholder: {
    padding: theme.spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  placeholderText: {
    opacity: 0.5,
  },
});
