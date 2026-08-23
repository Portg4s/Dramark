import { useEffect, useState } from 'react';

import splashArtwork from '@/assets/brand/dramark-splash.png';

const SPLASH_DURATION_MS = 900;
const REDUCED_MOTION_DURATION_MS = 450;
const FADE_DURATION_MS = 240;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function BrandSplash() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const duration = prefersReducedMotion() ? REDUCED_MOTION_DURATION_MS : SPLASH_DURATION_MS;
    const leaveDelay = prefersReducedMotion() ? duration : duration - FADE_DURATION_MS;
    const leaveTimer = window.setTimeout(() => setIsLeaving(true), leaveDelay);
    const hideTimer = window.setTimeout(() => setIsVisible(false), duration);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={[
        'fixed inset-0 z-50 min-h-dvh overflow-hidden bg-app transition-opacity duration-300 ease-[var(--ease-dramark)] motion-reduce:transition-none',
        isLeaving ? 'opacity-0' : 'opacity-100'
      ].join(' ')}
      aria-hidden="true"
    >
      <img
        src={splashArtwork}
        alt=""
        className="h-full w-full object-cover object-center"
        decoding="async"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_47%,rgba(89,183,255,0.08),transparent_16rem),linear-gradient(180deg,rgba(7,9,18,0.04)_0%,rgba(7,9,18,0.08)_48%,#070912_100%)]" />
    </div>
  );
}
