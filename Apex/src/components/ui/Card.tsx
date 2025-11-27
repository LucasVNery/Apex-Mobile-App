import React from 'react';
import { View, ViewProps, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';
import { useHaptic } from '../../hooks/useHaptic';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, onPress, elevated = true, style, ...props }) => {
  const { trigger } = useHaptic();

  const handlePress = () => {
    if (onPress) {
      trigger('light');
      onPress();
    }
  };

  const cardStyle = [
    styles.card,
    elevated && styles.elevated,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={cardStyle} {...props}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});
