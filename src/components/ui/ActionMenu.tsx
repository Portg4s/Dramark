import { Check } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';

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
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
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

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => firstItemRef.current?.focus(), 0);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative inline-flex">
      {trigger({ ref: triggerRef, isOpen, toggle: () => setIsOpen((value) => !value) })}
      {isOpen ? (
        <div
          role="menu"
          aria-label={label}
          className={[
            'absolute z-30 min-w-52 rounded-[1.1rem] border border-white/8 bg-[#0b101d]/96 p-1.5 text-sm shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-2xl',
            align === 'right' ? 'right-0' : 'left-0',
            side === 'top' ? 'bottom-[calc(100%+0.5rem)]' : 'top-[calc(100%+0.5rem)]'
          ].join(' ')}
        >
          {items.map((item, index) => (
            <button
              key={item.label}
              ref={index === 0 ? firstItemRef : undefined}
              type="button"
              role="menuitem"
              onClick={() => {
                item.onSelect();
                setIsOpen(false);
              }}
              className={[
                'focus-ring flex min-h-11 w-full items-center gap-3 rounded-[0.85rem] px-3 text-left font-semibold transition hover:bg-white/8',
                item.destructive ? 'text-danger' : 'text-white'
              ].join(' ')}
            >
              <span className="flex size-5 shrink-0 items-center justify-center text-current">
                {item.selected ? <Check aria-hidden="true" className="size-4" /> : item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
