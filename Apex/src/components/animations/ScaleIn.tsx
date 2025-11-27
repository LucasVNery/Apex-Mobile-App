import React from 'react';
import { MotiView } from 'moti';
import { ViewProps } from 'react-native';

interface ScaleInProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  initialScale?: number;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  delay = 0,
  duration = 400,
  initialScale = 0.8,
  ...props
}) => {
  return (
    <MotiView
      from={{
        opacity: 0,
        scale: initialScale,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        type: 'spring',
        delay,
        damping: 15,
        stiffness: 150,
      }}
      {...props}
    >
      {children}
    </MotiView>
  );
};
