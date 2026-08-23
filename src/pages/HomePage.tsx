import { Sparkles } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import { PosterSkeleton } from '@/components/ui/PosterSkeleton';
import { SectionTitle } from '@/components/ui/SectionTitle';

export function HomePage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(255,79,135,0.20),rgba(91,141,239,0.12)_45%,rgba(255,255,255,0.05))] px-5 py-6 shadow-panel sm:px-8 sm:py-10">
        <div className="flex items-center gap-2 text-sm font-semibold text-viki-soft">
          <Sparkles aria-hidden="true" size={18} />
          Rakuten Viki France
        </div>
        <PageHeader
          title="Dramark"
          description="Une bibliotheque personnelle pour reperer les films et series disponibles en France, puis les classer en deux gestes."
        />
      </section>

      <section>
        <SectionTitle title="Decouverte" action="Phase 1" />
        <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="w-36 shrink-0 lg:w-auto">
              <PosterSkeleton />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
