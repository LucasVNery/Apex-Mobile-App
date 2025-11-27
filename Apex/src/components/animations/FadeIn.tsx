import React from 'react';
import { MotiView } from 'moti';
import { ViewProps } from 'react-native';

interface FadeInProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, duration = 400, ...props }) => {
  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        type: 'timing',
        duration,
        delay,
      }}
      {...props}
    >
      {children}
    </MotiView>
  );
};
