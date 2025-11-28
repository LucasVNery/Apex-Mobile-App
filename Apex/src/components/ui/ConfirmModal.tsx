import React from 'react';
import { Modal, View, StyleSheet, Pressable, TouchableWithoutFeedback } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { theme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  onConfirm: () => void;
  onCancel: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  icon,
  iconColor = theme.colors.accent.primary,
}: ConfirmModalProps) {
  const handleConfirm = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel();
  };

  const handleBackdropPress = () => {
    handleCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {/* Header with icon */}
              {icon && (
                <View style={styles.iconContainer}>
                  <View style={[styles.iconCircle, { backgroundColor: iconColor + '20' }]}>
                    <Ionicons name={icon} size={32} color={iconColor} />
                  </View>
                </View>
              )}

              {/* Title */}
              <Text variant="heading" weight="bold" style={styles.title}>
                {title}
              </Text>

              {/* Message */}
              <Text variant="body" color="secondary" style={styles.message}>
                {message}
              </Text>

              {/* Actions */}
              <View style={styles.actions}>
                <Button
                  variant="outline"
                  onPress={handleCancel}
                  style={styles.button}
                >
                  {cancelText}
                </Button>
                <Button
                  variant={confirmVariant}
                  onPress={handleConfirm}
                  style={styles.button}
                >
                  {confirmText}
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    fontSize: theme.typography.sizes.xl,
  },
  message: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  button: {
    flex: 1,
  },
});
