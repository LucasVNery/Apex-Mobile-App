import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { theme } from '../../theme';

interface TextProps extends RNTextProps {
  variant?: 'heading' | 'title' | 'body' | 'caption';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: keyof typeof theme.colors.text | string;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  weight = 'regular',
  color = 'primary',
  style,
  children,
  ...props
}) => {
  const textColor =
    color in theme.colors.text
      ? theme.colors.text[color as keyof typeof theme.colors.text]
      : color;

  const fontSize = (() => {
    switch (variant) {
      case 'heading':
        return theme.typography.sizes.xxl;
      case 'title':
        return theme.typography.sizes.xl;
      case 'body':
        return theme.typography.sizes.base;
      case 'caption':
        return theme.typography.sizes.sm;
      default:
        return theme.typography.sizes.base;
    }
  })();

  return (
    <RNText
      style={[
        styles.base,
        {
          fontSize,
          fontWeight: theme.typography.weights[weight],
          color: textColor,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
  },
});
