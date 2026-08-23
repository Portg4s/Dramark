import type { Transition } from 'motion/react';

export const motionEase = [0.16, 1, 0.3, 1] as const;

export const quickFade: Transition = {
  duration: 0.18,
  ease: motionEase
};

export const pageTransition: Transition = {
  duration: 0.28,
  ease: motionEase
};

export const menuTransition: Transition = {
  duration: 0.18,
  ease: motionEase
};

export const softSpring: Transition = {
  type: 'spring',
  stiffness: 520,
  damping: 42,
  mass: 0.82
};

export const listSpring: Transition = {
  type: 'spring',
  stiffness: 460,
  damping: 44,
  mass: 0.88
};

export function reducedTransition(reducedMotion: boolean | null): Transition {
  return reducedMotion ? { duration: 0.01 } : pageTransition;
}
