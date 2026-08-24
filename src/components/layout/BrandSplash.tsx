import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

import splashBackground from '@/assets/brand/dramark-splash-bg.png';
import brandMark from '@/assets/brand/dramark-markV2.png';
import { motionEase } from '@/utils/motion';

const MIN_SPLASH_MS = 1050;
const REDUCED_MIN_SPLASH_MS = 700;
const ARTWORK_VISIBLE_HOLD_MS = 620;
const REDUCED_ARTWORK_VISIBLE_HOLD_MS = 500;
const FINISH_HOLD_MS = 140;
const IMAGE_READY_TIMEOUT_MS = 3500;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | undefined> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(undefined), timeoutMs);

    promise
      .then((value) => resolve(value))
      .catch(() => resolve(undefined))
      .finally(() => window.clearTimeout(timer));
  });
}

function decodeImage(src: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  const image = new Image();
  image.src = src;

  const loadPromise = new Promise<void>((resolve) => {
    image.onload = () => resolve();
    image.onerror = () => resolve();
  });

  if (image.decode) {
    return Promise.race([image.decode(), loadPromise]).catch(() => undefined);
  }

  return loadPromise;
}

function waitForFonts(): Promise<unknown> {
  if (typeof document === 'undefined' || !document.fonts?.ready) {
    return Promise.resolve();
  }

  return document.fonts.ready.catch(() => undefined);
}

export function BrandSplash() {
  const reducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const startedAt = performance.now();
    const minimumDuration = reducedMotion ? REDUCED_MIN_SPLASH_MS : MIN_SPLASH_MS;
    const artworkVisibleHold = reducedMotion
      ? REDUCED_ARTWORK_VISIBLE_HOLD_MS
      : ARTWORK_VISIBLE_HOLD_MS;

    const progressTimer = window.setInterval(
      () => {
        setProgress((currentProgress) => {
          if (currentProgress < 54) {
            return Math.min(54, currentProgress + 8);
          }

          if (currentProgress < 82) {
            return Math.min(82, currentProgress + 2.8);
          }

          return currentProgress;
        });
      },
      reducedMotion ? 110 : 70
    );

    Promise.all([
      withTimeout(decodeImage(splashBackground), IMAGE_READY_TIMEOUT_MS),
      withTimeout(decodeImage(brandMark), IMAGE_READY_TIMEOUT_MS),
      waitForFonts()
    ]).finally(() => {
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, minimumDuration - elapsed, artworkVisibleHold);

      window.setTimeout(() => {
        if (cancelled) {
          return;
        }

        window.clearInterval(progressTimer);
        setProgress(100);
        window.setTimeout(() => {
          if (cancelled) {
            return;
          }

          setIsFinishing(true);
          window.setTimeout(
            () => {
              if (!cancelled) {
                setIsVisible(false);
              }
            },
            reducedMotion ? 80 : 320
          );
        }, FINISH_HOLD_MS);
      }, remaining);
    });

    return () => {
      cancelled = true;
      window.clearInterval(progressTimer);
    };
  }, [reducedMotion]);

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          className="fixed inset-0 z-50 min-h-dvh overflow-hidden bg-app"
          aria-hidden="true"
          initial={{ opacity: 1 }}
          animate={{ opacity: isFinishing ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.08 : 0.32, ease: motionEase }}
        >
          <img
            src={splashBackground}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(89,183,255,0.13),transparent_16rem),linear-gradient(180deg,rgba(11,18,32,0.10)_0%,rgba(11,18,32,0.36)_58%,#0B1220_100%)]" />
          <motion.div
            className="relative flex min-h-dvh flex-col items-center justify-center px-8 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-[calc(2.5rem+env(safe-area-inset-top))] text-center"
            animate={isFinishing && !reducedMotion ? { opacity: 0, y: -6 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.26, ease: motionEase }}
          >
            <motion.img
              src={brandMark}
              alt=""
              className="size-28 object-contain drop-shadow-[0_0_28px_rgba(89,183,255,0.26)] sm:size-32"
              decoding="async"
              fetchPriority="high"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.52, ease: motionEase }}
            />
            <motion.p
              className="mt-5 text-[2.15rem] font-black leading-none tracking-[0.01em] text-white drop-shadow-[0_0_18px_rgba(89,183,255,0.20)]"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: reducedMotion ? 0 : 0.08, ease: motionEase }}
            >
              Dramark
            </motion.p>
            <motion.p
              className="mt-3 text-[0.68rem] font-bold tracking-[0.24em] text-brand-soft/92"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: reducedMotion ? 0 : 0.14, ease: motionEase }}
            >
              VOTRE BIBLIOTHÈQUE DE DRAMAS
            </motion.p>
            <div className="mt-8 h-1 w-36 overflow-hidden rounded-full bg-surface-2/70 shadow-[0_0_18px_rgba(0,210,255,0.16)]">
              <motion.div
                className="h-full origin-left rounded-full bg-[linear-gradient(90deg,#3EA6FF,#00D2FF,#A5E1FF)] shadow-[0_0_16px_rgba(0,210,255,0.42)]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress / 100 }}
                transition={{ duration: reducedMotion ? 0.08 : 0.18, ease: motionEase }}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
