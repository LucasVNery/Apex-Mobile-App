import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import * as Haptics from 'expo-haptics';

interface NoteSuggestion {
  id: string;
  title: string;
  preview?: string;
  relevance?: number;
}

interface LinkSuggestionPopupProps {
  query: string;
  notes: { id: string; title: string; blocks?: any[] }[];
  onSelectNote: (noteId: string, noteTitle: string) => void;
  onCreateNew?: (title: string) => void;
  onClose: () => void;
  position?: { x: number; y: number };
}

export function LinkSuggestionPopup({
  query,
  notes,
  onSelectNote,
  onCreateNew,
  onClose,
  position,
}: LinkSuggestionPopupProps) {
  const [suggestions, setSuggestions] = useState<NoteSuggestion[]>([]);
  const [showCreateNew, setShowCreateNew] = useState(false);

  useEffect(() => {
    // Não mostrar sugestões até digitar pelo menos 1 caractere
    if (!query || query.length === 0) {
      setSuggestions([]);
      setShowCreateNew(false);
      return;
    }

    // Busca otimizada - mostra apenas se começar com a letra
    const queryLower = query.toLowerCase();
    const filtered = notes
      .filter((note) => {
        const titleLower = note.title.toLowerCase();
        // Somente mostrar se começar com a query OU se a primeira letra de alguma palavra coincidir
        return (
          titleLower.startsWith(queryLower) ||
          titleLower.split(' ').some((word) => word.startsWith(queryLower))
        );
      })
      .map((note) => ({
        id: note.id,
        title: note.title,
        relevance: note.title.toLowerCase().startsWith(queryLower) ? 100 : 50,
      }))
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
      .slice(0, 4); // Máximo 4 sugestões (minimalista)

    setSuggestions(filtered);

    // Mostrar opção "Criar novo" se não houver match exato
    const hasExactMatch = filtered.some(
      (s) => s.title.toLowerCase() === queryLower
    );
    setShowCreateNew(!hasExactMatch && query.length > 0);
  }, [query, notes]);

  const handleSelectNote = (noteId: string, noteTitle: string) => {
    Haptics.selectionAsync();
    onSelectNote(noteId, noteTitle);
  };

  const getPreview = (note: { blocks?: any[] }): string => {
    if (!note.blocks || note.blocks.length === 0) return '';

    const textBlock = note.blocks.find(
      (b) => b.type === 'text' && b.content && b.content.trim()
    );

    if (textBlock) {
      const preview = textBlock.content.trim();
      return preview.length > 60 ? preview.substring(0, 60) + '...' : preview;
    }

    return '';
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  // Não mostrar nada se não há sugestões nem opção de criar
  if (suggestions.length === 0 && !showCreateNew) {
    return null;
  }

  return (
    <View style={[styles.container, position && { top: position.y }]}>
      {/* Sugestões existentes */}
      {suggestions.map((suggestion, index) => (
        <Pressable
          key={suggestion.id}
          style={({ pressed }) => [
            styles.suggestionItem,
            pressed && styles.suggestionItemPressed,
            index === 0 && styles.firstItem,
          ]}
          onPress={() => handleSelectNote(suggestion.id, suggestion.title)}
        >
          <Ionicons
            name="document-text-outline"
            size={18}
            color={theme.colors.text.secondary}
          />
          <Text variant="body" numberOfLines={1} style={styles.suggestionText}>
            {suggestion.title}
          </Text>
        </Pressable>
      ))}

      {/* Opção de criar novo */}
      {showCreateNew && onCreateNew && (
        <Pressable
          style={({ pressed }) => [
            styles.suggestionItem,
            styles.createNewItem,
            pressed && styles.suggestionItemPressed,
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            onCreateNew(query);
          }}
        >
          <Ionicons
            name="add-circle-outline"
            size={18}
            color={theme.colors.accent.primary}
          />
          <Text variant="body" style={styles.createNewText}>
            Criar "{query}"
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  firstItem: {
    backgroundColor: theme.colors.accent.primary + '05',
  },
  suggestionItemPressed: {
    backgroundColor: theme.colors.background.secondary,
  },
  suggestionText: {
    flex: 1,
    color: theme.colors.text.primary,
  },
  createNewItem: {
    borderBottomWidth: 0,
  },
  createNewText: {
    flex: 1,
    color: theme.colors.accent.primary,
    fontWeight: '500',
  },
});
