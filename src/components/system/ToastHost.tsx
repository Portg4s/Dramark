import { X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

import {
  dismissToast,
  subscribeToasts,
  type AppToast,
  type ToastListener
} from '@/components/system/toastStore';
import { quickFade } from '@/utils/motion';

type ToastHostProps = {
  subscribe?: (listener: ToastListener) => () => void;
};

export function ToastHost({ subscribe = subscribeToasts }: ToastHostProps) {
  const [toasts, setToasts] = useState<AppToast[]>([]);
  const reducedMotion = useReducedMotion();

  useEffect(() => subscribe(setToasts), [subscribe]);

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            role="status"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            transition={quickFade}
            className="pointer-events-auto flex items-center gap-3 rounded-[1.2rem] border border-white/10 bg-surface-2/95 px-4 py-3 text-sm text-white shadow-[0_18px_48px_rgba(0,0,0,0.36)] backdrop-blur-xl"
          >
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{toast.title}</span>
              {toast.detail ? (
                <span className="mt-0.5 block text-xs leading-5 text-subtle">{toast.detail}</span>
              ) : null}
            </span>
            {toast.actionLabel && toast.onAction ? (
              <button
                type="button"
                onClick={() => {
                  void toast.onAction?.();
                  dismissToast(toast.id);
                }}
                className="pressable focus-ring min-h-10 shrink-0 rounded-full bg-brand/18 px-3 text-xs font-black text-brand-soft hover:bg-brand/25"
              >
                {toast.actionLabel}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="pressable focus-ring flex size-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-white/8 hover:text-white"
              aria-label="Fermer la notification"
            >
              <X aria-hidden="true" size={17} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
