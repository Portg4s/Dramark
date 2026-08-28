import { RefreshCw, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

import { applyPwaUpdate, subscribePwaUpdates, type PwaUpdateListener } from '@/app/pwaRegistration';
import { quickFade } from '@/utils/motion';

type PwaUpdatePromptProps = {
  applyUpdate?: () => Promise<void> | void;
  subscribeUpdates?: (listener: PwaUpdateListener) => () => void;
};

export function PwaUpdatePrompt({
  applyUpdate = applyPwaUpdate,
  subscribeUpdates = subscribePwaUpdates
}: PwaUpdatePromptProps) {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    return subscribeUpdates((snapshot) => setNeedsRefresh(snapshot.needsRefresh));
  }, [subscribeUpdates]);

  async function handleApplyUpdate() {
    setIsUpdating(true);
    await applyUpdate();
  }

  return (
    <AnimatePresence>
      {needsRefresh ? (
        <motion.div
          role="status"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={quickFade}
          className="fixed inset-x-4 bottom-[calc(10rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md items-center gap-3 rounded-[1.35rem] border border-petal/35 bg-surface-2/95 p-3 text-sm text-white shadow-[0_18px_48px_rgba(0,0,0,0.36)] backdrop-blur-xl"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/18 text-brand-soft">
            <RefreshCw aria-hidden="true" size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold">Nouvelle version disponible</span>
            <span className="mt-0.5 block text-xs leading-5 text-subtle">
              Rechargez Dramark pour appliquer les derniers changements.
            </span>
          </span>
          <button
            type="button"
            onClick={handleApplyUpdate}
            disabled={isUpdating}
            className="pressable focus-ring min-h-11 shrink-0 rounded-full bg-petal px-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(255,107,182,0.22)] disabled:cursor-wait disabled:opacity-70"
            aria-label="Mettre a jour Dramark"
          >
            {isUpdating ? '...' : 'Mettre a jour'}
          </button>
          <button
            type="button"
            onClick={() => setNeedsRefresh(false)}
            className="pressable focus-ring flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-white/8 hover:text-white"
            aria-label="Ignorer la mise a jour"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
