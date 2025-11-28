import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { BaseBlock } from './BaseBlock';
import { Text } from '@/src/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import * as Haptics from 'expo-haptics';

interface CalloutBlockComponentProps {
  blockId: string;
  content: string;
  icon?: string;
  color?: string;
  onContentChange: (content: string) => void;
  onIconChange?: (icon: string) => void;
  onDelete?: () => void;
  showDragHandle?: boolean;
}

const CALLOUT_ICONS: Array<{ name: keyof typeof Ionicons.glyphMap; label: string }> = [
  { name: 'bulb-outline', label: 'Ideia' },
  { name: 'information-circle-outline', label: 'Info' },
  { name: 'warning-outline', label: 'Aviso' },
  { name: 'checkmark-circle-outline', label: 'Sucesso' },
  { name: 'alert-circle-outline', label: 'Erro' },
  { name: 'sparkles-outline', label: 'Destaque' },
];

export function CalloutBlockComponent({
  blockId,
  content,
  icon = 'bulb-outline',
  color = theme.colors.accent.primary,
  onContentChange,
  onIconChange,
  onDelete,
  showDragHandle = false,
}: CalloutBlockComponentProps) {
  const [text, setText] = useState(content);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleLongPress = () => {
    if (onDelete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onDelete();
    }
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    onContentChange(newText);
  };

  const handleIconSelect = (newIcon: string) => {
    onIconChange?.(newIcon);
    setShowIconPicker(false);
  };

  return (
    <BaseBlock showDragHandle={showDragHandle}>
      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={500}
        style={styles.pressableContainer}
      >
        <View style={[styles.container, { borderLeftColor: color }]}>
          <Pressable
            onPress={() => setShowIconPicker(!showIconPicker)}
            style={[styles.iconButton, { backgroundColor: color + '20' }]}
          >
            <Ionicons
              name={icon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={color}
            />
          </Pressable>

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={handleTextChange}
            placeholder="Digite uma observação..."
            placeholderTextColor={theme.colors.text.tertiary}
            multiline
          />

          {showIconPicker && (
            <View style={styles.iconPicker}>
              {CALLOUT_ICONS.map((iconItem) => (
                <Pressable
                  key={iconItem.name}
                  style={styles.iconOption}
                  onPress={() => handleIconSelect(iconItem.name)}
                >
                  <Ionicons name={iconItem.name} size={24} color={color} />
                  <Text variant="caption" color="secondary">
                    {iconItem.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </Pressable>
    </BaseBlock>
  );
}

const styles = StyleSheet.create({
  pressableContainer: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.primary,
    minHeight: 40,
  },
  iconPicker: {
    position: 'absolute',
    top: 60,
    left: theme.spacing.md,
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  iconOption: {
    alignItems: 'center',
    padding: theme.spacing.xs,
    gap: theme.spacing.xs / 2,
  },
});
