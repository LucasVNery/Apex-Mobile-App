import React from 'react';
import { MotiView } from 'moti';
import { ViewProps } from 'react-native';

type Direction = 'left' | 'right' | 'up' | 'down';

interface SlideInProps extends ViewProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 400,
  distance = 30,
  ...props
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left':
        return { translateX: -distance, translateY: 0 };
      case 'right':
        return { translateX: distance, translateY: 0 };
      case 'up':
        return { translateX: 0, translateY: distance };
      case 'down':
        return { translateX: 0, translateY: -distance };
      default:
        return { translateX: 0, translateY: distance };
    }
  };

  return (
    <MotiView
      from={{
        opacity: 0,
        ...getInitialPosition(),
      }}
      animate={{
        opacity: 1,
        translateX: 0,
        translateY: 0,
      }}
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
