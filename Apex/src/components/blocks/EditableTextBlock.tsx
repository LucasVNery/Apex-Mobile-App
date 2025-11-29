import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { TextInput, StyleSheet, View, Animated, Pressable } from 'react-native';
import { BaseBlock } from './BaseBlock';
import { Text } from '@/src/components/ui/Text';
import { theme } from '@/src/theme';
import { LinkParser } from '@/src/utils/linkParser';
import { NoteLink } from '@/src/types/note.types';
import { useDoubleTap } from '@/src/hooks/useDoubleTap';
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
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
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
      isSelected = false,
      isSelectionMode = false,
      onPress,
      onLongPress,
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
    // Detecta backspace em bloco vazio (deletar bloco)
    if (newText === '' && text === '' && onDelete) {
      // Bloco está vazio e usuário pressionou backspace
      onDelete();
      return;
    }

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
      // No modo de seleção, responde imediatamente
      handleSingleTap();
    } else {
      // Fora do modo de seleção, usa double-tap detection
      handleTap();
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
      isActive={isFocused}
      isSelected={isSelected}
      isSelectionMode={isSelectionMode}
      onPress={handleContainerPress}
      onLongPress={handleContainerLongPress}
    >
      <View style={styles.container}>
        {/* Mostra highlights quando não focado e tem texto */}
        {!isFocused && text && renderTextWithHighlights()}

        {/* Mostra placeholder visual quando vazio e não focado */}
        {!isFocused && !text && (
          <View style={styles.emptyPlaceholder}>
            <Text variant="body" color="tertiary" style={styles.placeholderText}>
              {placeholder}
            </Text>
          </View>
        )}

        {/* TextInput - sempre presente mas pode estar oculto */}
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            multiline && styles.multiline,
            (!isFocused && text) && styles.hiddenInput,
            (!isFocused && !text) && styles.hiddenInput
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
          editable={!isSelectionMode}
        />
      </View>
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
  emptyPlaceholder: {
    padding: theme.spacing.sm,
    minHeight: 40,
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: theme.typography.sizes.base,
  },
});
