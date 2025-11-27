import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MotiView } from 'moti';
import { Text } from './Text';
import { theme } from '../../theme';
import { useHaptic } from '../../hooks/useHaptic';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  onPress,
  children,
  style,
  ...props
}) => {
  const { trigger } = useHaptic();

  const handlePress = (e: any) => {
    if (!disabled && !loading) {
      trigger('light');
      onPress?.(e);
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border.light;
    switch (variant) {
      case 'primary':
        return theme.colors.accent.primary;
      case 'secondary':
        return theme.colors.accent.secondary;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return theme.colors.accent.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.text.tertiary;
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
      case 'ghost':
        return theme.colors.accent.primary;
      default:
        return '#FFFFFF';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md };
      case 'medium':
        return { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg };
      case 'large':
        return { paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.xl };
      default:
        return { paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.lg };
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={style}
      {...props}
    >
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' }}
        style={[
          styles.button,
          {
            backgroundColor: getBackgroundColor(),
            borderWidth: variant === 'outline' ? 1 : 0,
            borderColor: variant === 'outline' ? theme.colors.accent.primary : 'transparent',
            ...getPadding(),
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : typeof children === 'string' ? (
          <Text weight="semibold" style={{ color: getTextColor() }}>
            {children}
          </Text>
        ) : (
          children
        )}
      </MotiView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
