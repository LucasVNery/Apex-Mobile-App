import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme';
import * as Haptics from 'expo-haptics';

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

/**
 * Controles flutuantes para o Graph View
 * Inclui zoom e reset
 */
export default function GraphControls({
  onZoomIn,
  onZoomOut,
  onReset,
}: GraphControlsProps) {
  const handlePress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  return (
    <View style={styles.container}>
      {/* Controles de zoom */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePress(onZoomIn)}
        >
          <Ionicons name="add" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePress(onZoomOut)}
        >
          <Ionicons name="remove" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePress(onReset)}
        >
          <Ionicons name="refresh" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  zoomControls: {
    backgroundColor: '#FFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    gap: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary,
  },
});
