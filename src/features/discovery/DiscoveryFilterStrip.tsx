import { motion, useReducedMotion } from 'motion/react';

import { discoveryFilters, type DiscoveryFilterKey } from '@/services/tmdb/discovery';

type DiscoveryFilterStripProps = {
  selectedFilter: DiscoveryFilterKey;
  onFilterChange: (filter: DiscoveryFilterKey) => void;
};

export function DiscoveryFilterStrip({
  selectedFilter,
  onFilterChange
}: DiscoveryFilterStripProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
      {discoveryFilters.map((filter) => {
        const isSelected = filter.key === selectedFilter;

        return (
          <motion.button
            key={filter.key}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onFilterChange(filter.key)}
            whileTap={reducedMotion ? undefined : { scale: 0.96 }}
            className={[
              'focus-ring min-h-10 shrink-0 rounded-full px-4 text-sm font-bold transition',
              isSelected
                ? 'bg-brand text-white shadow-[0_12px_28px_rgba(89,183,255,0.24)]'
                : 'bg-surface/64 text-muted hover:bg-surface-2/72 hover:text-white'
            ].join(' ')}
          >
            {filter.label}
          </motion.button>
        );
      })}
    </div>
  );
}
