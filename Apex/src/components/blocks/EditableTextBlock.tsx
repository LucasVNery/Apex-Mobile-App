import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { TextInput, StyleSheet, View, Animated, Pressable } from 'react-native';
import { BaseBlock } from './BaseBlock';
import { Text } from '@/src/components/ui/Text';
import { theme } from '@/src/theme';
import { LinkParser } from '@/src/utils/linkParser';
import { NoteLink } from '@/src/types/note.types';
import * as Haptics from 'expo-haptics';

interface EditableTextBlockProps {
  blockId: string;
  content: string;
  placeholder?: string;
  onContentChange: (content: string, links: NoteLink[]) => void;
  onDelete?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  multiline?: boolean;
  existingNotes?: { id: string; title: string }[];
  showDragHandle?: boolean;
}

export interface EditableTextBlockRef {
  blur: () => void;
  focus: () => void;
}

export const EditableTextBlock = forwardRef<EditableTextBlockRef, EditableTextBlockProps>(
  (
    {
      blockId,
      content,
      placeholder = 'Digite algo...',
      onContentChange,
      onDelete,
      onFocus,
      onBlur,
      autoFocus = false,
      multiline = true,
      existingNotes = [],
      showDragHandle = false,
    },
    ref
  ) => {
    const [text, setText] = useState(content);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Expõe métodos blur e focus para o componente pai
    useImperativeHandle(ref, () => ({
      blur: () => {
        inputRef.current?.blur();
      },
      focus: () => {
        inputRef.current?.focus();
      },
    }));

  useEffect(() => {
    const previousLinks = LinkParser.extractLinks(text);
    const currentLinks = LinkParser.extractLinks(content);

    if (currentLinks.length > previousLinks.length) {
      // Novo link detectado! Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setText(content);
  }, [content]);

  const handleTextChange = (newText: string) => {
    setText(newText);

    // Detecta links no texto
    const links = LinkParser.extractLinks(newText);
    const resolvedLinks = LinkParser.resolveLinks(links, existingNotes);

    onContentChange(newText, resolvedLinks);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleLongPress = () => {
    if (onDelete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onDelete();
    }
  };

  // Renderiza texto com links destacados
  const renderTextWithHighlights = () => {
    if (!isFocused && text) {
      const segments = LinkParser.parseTextWithLinks(text);

      return (
        <View style={styles.previewContainer}>
          {segments.map((segment, index) => (
            <Text
              key={index}
              variant="body"
              style={[
                styles.previewText,
                segment.type === 'link' && styles.linkText,
              ]}
            >
              {segment.content}
            </Text>
          ))}
        </View>
      );
    }

    return null;
  };

  return (
    <BaseBlock showDragHandle={showDragHandle} isActive={isFocused}>
      <Pressable
        onPress={() => {
          if (!isFocused) {
            setIsFocused(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        onLongPress={handleLongPress}
        delayLongPress={500}
        style={styles.container}
      >
        {!isFocused && text && renderTextWithHighlights()}
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            multiline && styles.multiline,
            (!isFocused && text) && styles.hiddenInput
          ]}
          value={text}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          autoFocus={autoFocus}
          multiline={multiline}
          textAlignVertical="top"
        />
      </Pressable>
    </BaseBlock>
  );
});

EditableTextBlock.displayName = 'EditableTextBlock';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    padding: theme.spacing.sm,
    minHeight: 40,
  },
  multiline: {
    minHeight: 80,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  previewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.sm,
  },
  previewText: {
    fontSize: theme.typography.sizes.base,
  },
  linkText: {
    color: theme.colors.accent.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});
