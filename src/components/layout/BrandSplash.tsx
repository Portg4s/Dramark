import { useEffect, useState } from 'react';

import splashBackground from '@/assets/brand/dramark-splash-bg.png';
import brandMark from '@/assets/brand/dramark-mark.png';

const SPLASH_DURATION_MS = 1250;
const REDUCED_MOTION_DURATION_MS = 650;
const FADE_DURATION_MS = 320;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function BrandSplash() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const reducedMotion = prefersReducedMotion();
    const duration = reducedMotion ? REDUCED_MOTION_DURATION_MS : SPLASH_DURATION_MS;
    const leaveDelay = reducedMotion ? duration : duration - FADE_DURATION_MS;
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
        'fixed inset-0 z-50 min-h-dvh overflow-hidden bg-app transition-opacity duration-[320ms] ease-[var(--ease-dramark)] motion-reduce:transition-none',
        isLeaving ? 'opacity-0' : 'opacity-100'
      ].join(' ')}
      aria-hidden="true"
    >
      <img
        src={splashBackground}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        decoding="async"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(89,183,255,0.13),transparent_16rem),linear-gradient(180deg,rgba(7,9,18,0.10)_0%,rgba(7,9,18,0.34)_58%,#070912_100%)]" />
      <div className="relative flex min-h-dvh flex-col items-center justify-center px-8 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-[calc(2.5rem+env(safe-area-inset-top))] text-center">
        <img
          src={brandMark}
          alt=""
          className="brand-splash-mark size-28 object-contain drop-shadow-[0_0_28px_rgba(89,183,255,0.26)] sm:size-32"
          decoding="async"
          fetchPriority="high"
        />
        <p className="mt-5 text-[2.15rem] font-black leading-none tracking-[0.01em] text-white drop-shadow-[0_0_18px_rgba(89,183,255,0.20)]">
          Dramark
        </p>
        <p className="mt-3 text-[0.68rem] font-bold tracking-[0.24em] text-brand-soft/92">
          VOTRE BIBLIOTHÈQUE DE DRAMAS
        </p>
        <div className="mt-8 h-1 w-36 overflow-hidden rounded-full bg-white/12 shadow-[0_0_18px_rgba(89,183,255,0.16)]">
          <div className="brand-splash-loader h-full w-1/2 rounded-full bg-[linear-gradient(90deg,rgba(89,183,255,0.10),rgba(154,216,255,0.98),rgba(113,215,255,0.55))]" />
        </div>
      </div>
    </div>
  );
}
