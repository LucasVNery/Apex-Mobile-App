import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import { BlockType } from '@/src/types/note.types';
import * as Haptics from 'expo-haptics';

interface BlockMenuItem {
  type: BlockType;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  category: 'basic' | 'advanced' | 'locked';
}

interface BlockMenuProps {
  onSelectBlock: (type: BlockType) => void;
  onClose: () => void;
  unlockedFeatures?: string[];
  position?: { x: number; y: number };
}

const BLOCK_MENU_ITEMS: BlockMenuItem[] = [
  {
    type: 'text',
    icon: 'text-outline',
    label: 'Texto',
    description: 'Parágrafo simples',
    category: 'basic',
  },
  {
    type: 'heading',
    icon: 'text',
    label: 'Título',
    description: 'Seção com título',
    category: 'basic',
  },
  {
    type: 'list',
    icon: 'list',
    label: 'Lista',
    description: 'Lista com marcadores',
    category: 'basic',
  },
  {
    type: 'checklist',
    icon: 'checkbox-outline',
    label: 'Checklist',
    description: 'Lista de tarefas',
    category: 'basic',
  },
  {
    type: 'divider',
    icon: 'remove',
    label: 'Divisor',
    description: 'Linha separadora',
    category: 'basic',
  },
  {
    type: 'callout',
    icon: 'bulb-outline',
    label: 'Destaque',
    description: 'Caixa de observação',
    category: 'basic',
  },
  {
    type: 'link',
    icon: 'link-outline',
    label: 'Link',
    description: 'Link para nota',
    category: 'advanced',
  },
  {
    type: 'embed',
    icon: 'code-slash-outline',
    label: 'Embed',
    description: 'Incorporar bloco',
    category: 'advanced',
  },
  {
    type: 'table',
    icon: 'grid-outline',
    label: 'Tabela',
    description: 'Tabela de dados',
    category: 'locked',
  },
];

export function BlockMenu({
  onSelectBlock,
  onClose,
  unlockedFeatures = ['basic-notes'],
  position,
}: BlockMenuProps) {
  const hasAdvancedBlocks = unlockedFeatures.includes('advanced-blocks');
  const hasTables = unlockedFeatures.includes('tables');

  const handleSelectBlock = (type: BlockType) => {
    Haptics.selectionAsync();
    onSelectBlock(type);
    onClose();
  };

  const isBlockLocked = (item: BlockMenuItem) => {
    if (item.category === 'basic') return false;
    if (item.category === 'advanced' && !hasAdvancedBlocks) return true;
    if (item.type === 'table' && !hasTables) return true;
    return false;
  };

  const basicBlocks = BLOCK_MENU_ITEMS.filter((item) => item.category === 'basic');
  const advancedBlocks = BLOCK_MENU_ITEMS.filter(
    (item) => item.category === 'advanced'
  );
  const lockedBlocks = BLOCK_MENU_ITEMS.filter((item) => item.category === 'locked');

  return (
    <View style={[styles.container, position && { top: position.y }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Basic Blocks */}
        <View style={styles.category}>
          <Text variant="caption" color="secondary" style={styles.categoryTitle}>
            Blocos Básicos
          </Text>
          {basicBlocks.map((item) => (
            <BlockMenuItem
              key={item.type}
              item={item}
              onPress={() => handleSelectBlock(item.type)}
              locked={false}
            />
          ))}
        </View>

        {/* Advanced Blocks */}
        {advancedBlocks.length > 0 && (
          <View style={styles.category}>
            <Text variant="caption" color="secondary" style={styles.categoryTitle}>
              🔗 Conectar Ideias
            </Text>
            {advancedBlocks.map((item) => (
              <BlockMenuItem
                key={item.type}
                item={item}
                onPress={() => !isBlockLocked(item) && handleSelectBlock(item.type)}
                locked={isBlockLocked(item)}
              />
            ))}
          </View>
        )}

        {/* Locked Blocks */}
        {lockedBlocks.length > 0 && (
          <View style={styles.category}>
            <Text variant="caption" color="secondary" style={styles.categoryTitle}>
              📊 Avançado
            </Text>
            {lockedBlocks.map((item) => (
              <BlockMenuItem
                key={item.type}
                item={item}
                onPress={() => !isBlockLocked(item) && handleSelectBlock(item.type)}
                locked={isBlockLocked(item)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

interface BlockMenuItemProps {
  item: BlockMenuItem;
  onPress: () => void;
  locked: boolean;
}

function BlockMenuItem({ item, onPress, locked }: BlockMenuItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && !locked && styles.menuItemPressed,
        locked && styles.menuItemLocked,
      ]}
      onPress={onPress}
      disabled={locked}
    >
      <View
        style={[
          styles.iconContainer,
          locked && styles.iconContainerLocked,
        ]}
      >
        <Ionicons
          name={item.icon}
          size={20}
          color={locked ? theme.colors.text.tertiary : theme.colors.accent.primary}
        />
      </View>
      <View style={styles.menuItemContent}>
        <Text
          variant="body"
          weight="semibold"
          style={locked && styles.lockedText}
        >
          {item.label}
        </Text>
        <Text
          variant="caption"
          color="secondary"
          style={locked && styles.lockedText}
        >
          {item.description}
        </Text>
      </View>
      {locked && (
        <Ionicons
          name="lock-closed"
          size={16}
          color={theme.colors.text.tertiary}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    maxHeight: 400,
  },
  scrollView: {
    maxHeight: 400,
  },
  category: {
    paddingVertical: theme.spacing.sm,
  },
  categoryTitle: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  menuItemPressed: {
    backgroundColor: theme.colors.background.secondary,
  },
  menuItemLocked: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.accent.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerLocked: {
    backgroundColor: theme.colors.background.secondary,
  },
  menuItemContent: {
    flex: 1,
  },
  lockedText: {
    opacity: 0.6,
  },
});
