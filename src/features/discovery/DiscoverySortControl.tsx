import { motion, useReducedMotion } from 'motion/react';

import { discoverySorts, type DiscoverySortKey } from '@/services/tmdb/discovery';
import { softSpring } from '@/utils/motion';

type DiscoverySortControlProps = {
  selectedSort: DiscoverySortKey;
  onSortChange: (sort: DiscoverySortKey) => void;
};

export function DiscoverySortControl({ selectedSort, onSortChange }: DiscoverySortControlProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-3 rounded-full bg-surface/60 p-1">
      {discoverySorts.map((sort) => {
        const isSelected = sort.key === selectedSort;

        return (
          <button
            key={sort.key}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSortChange(sort.key)}
            className={[
              'focus-ring relative min-h-10 rounded-full px-2 text-xs font-bold transition-colors sm:text-sm',
              isSelected ? 'text-white' : 'text-muted hover:text-white'
            ].join(' ')}
          >
            {isSelected ? (
              <motion.span
                layoutId="discovery-sort-active"
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-surface-2/90 shadow-[0_10px_24px_rgba(89,183,255,0.16)]"
                transition={reducedMotion ? { duration: 0.01 } : softSpring}
              />
            ) : null}
            <span className="relative z-10">{sort.label}</span>
          </button>
        );
      })}
    </div>
  );
}
