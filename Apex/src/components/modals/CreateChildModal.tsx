import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface CreateChildModalProps {
  visible: boolean;
  parentId: string;
  parentTitle: string;
  onClose: () => void;
  onCreateChild: (title: string, tags: string[]) => void;
}

/**
 * Modal para criar nota filha
 */
export default function CreateChildModal({
  visible,
  parentId,
  parentTitle,
  onClose,
  onCreateChild,
}: CreateChildModalProps) {
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [titleError, setTitleError] = useState('');

  // Limpar campos ao abrir/fechar
  useEffect(() => {
    if (visible) {
      setTitle('');
      setTagsInput('');
      setTitleError('');
    }
  }, [visible]);

  const handleCreate = () => {
    // Validação: título obrigatório
    if (!title.trim()) {
      setTitleError('Título é obrigatório');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // Processar tags (separadas por vírgula)
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // Criar filho
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onCreateChild(title.trim(), tags);

    // Limpar campos
    setTitle('');
    setTagsInput('');
    setTitleError('');
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={handleCancel} />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Criar Sub-ambiente</Text>
            <Pressable onPress={handleCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#7F8C8D" />
            </Pressable>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Parent info */}
            <View style={styles.parentInfo}>
              <Ionicons name="arrow-down" size={16} color="#7F8C8D" />
              <Text style={styles.parentLabel}>Filho de:</Text>
              <Text style={styles.parentTitle}>{parentTitle}</Text>
            </View>

            {/* Title input */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Título <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, titleError && styles.inputError]}
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  setTitleError('');
                }}
                placeholder="Nome do sub-ambiente"
                placeholderTextColor="#BDC3C7"
                autoFocus
                maxLength={100}
              />
              {titleError ? (
                <Text style={styles.errorText}>{titleError}</Text>
              ) : null}
            </View>

            {/* Tags input */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Tags (opcional)</Text>
              <TextInput
                style={styles.input}
                value={tagsInput}
                onChangeText={setTagsInput}
                placeholder="matemática, cálculo (separadas por vírgula)"
                placeholderTextColor="#BDC3C7"
                maxLength={200}
              />
              <Text style={styles.hint}>
                Separe múltiplas tags com vírgula
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleCancel}
              style={({ pressed }) => [
                styles.button,
                styles.buttonCancel,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.buttonCancelText}>Cancelar</Text>
            </Pressable>

            <Pressable
              onPress={handleCreate}
              style={({ pressed }) => [
                styles.button,
                styles.buttonCreate,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons
                name="add-circle"
                size={20}
                color="#FFFFFF"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonCreateText}>Criar Filho</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
  },
  closeButton: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  parentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 20,
  },
  parentLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  parentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  required: {
    color: '#E74C3C',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  errorText: {
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonCancel: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  buttonCreate: {
    backgroundColor: '#27AE60',
  },
  buttonCreateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonIcon: {
    marginRight: 6,
  },
});
