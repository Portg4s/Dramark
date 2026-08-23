import { Check } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

import { menuTransition } from '@/utils/motion';

type MenuItem = {
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  selected?: boolean;
  destructive?: boolean;
};

type ActionMenuProps = {
  label: string;
  align?: 'left' | 'right';
  side?: 'top' | 'bottom';
  trigger: (props: {
    ref: RefObject<HTMLButtonElement | null>;
    isOpen: boolean;
    toggle: () => void;
  }) => ReactNode;
  items: MenuItem[];
};

export function ActionMenu({
  label,
  align = 'right',
  side = 'top',
  trigger,
  items
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    const focusTimer = window.setTimeout(() => firstItemRef.current?.focus(), 0);
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative inline-flex">
      {trigger({ ref: triggerRef, isOpen, toggle: () => setIsOpen((value) => !value) })}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            role="menu"
            aria-label={label}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 4 }}
            transition={reducedMotion ? { duration: 0.08 } : menuTransition}
            style={{ transformOrigin: `${align} ${side === 'top' ? 'bottom' : 'top'}` }}
            className={[
              'absolute z-30 min-w-52 rounded-[1.1rem] border border-white/8 bg-surface/96 p-1.5 text-sm shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-2xl',
              align === 'right' ? 'right-0' : 'left-0',
              side === 'top' ? 'bottom-[calc(100%+0.5rem)]' : 'top-[calc(100%+0.5rem)]'
            ].join(' ')}
          >
            {items.map((item, index) => (
              <motion.button
                key={item.label}
                ref={index === 0 ? firstItemRef : undefined}
                type="button"
                role="menuitem"
                onClick={() => {
                  item.onSelect();
                  setIsOpen(false);
                }}
                whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                className={[
                  'focus-ring flex min-h-11 w-full items-center gap-3 rounded-[0.85rem] px-3 text-left font-semibold transition hover:bg-surface-2/80',
                  item.selected ? 'bg-surface-2/65' : '',
                  item.destructive ? 'text-danger' : 'text-white'
                ].join(' ')}
              >
                <span className="flex size-5 shrink-0 items-center justify-center text-current">
                  {item.selected ? <Check aria-hidden="true" className="size-4" /> : item.icon}
                </span>
                <span>{item.label}</span>
              </motion.button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
