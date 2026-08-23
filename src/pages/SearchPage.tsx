import { Search } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';

export function SearchPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Recherche"
        title="Films et series Viki"
        description="La recherche filtrera films et series, puis verifiera leur disponibilite Rakuten Viki en France."
      />

      <form className="flex min-h-14 items-center gap-3 rounded-lg border border-white/10 bg-surface px-4 shadow-panel">
        <Search aria-hidden="true" className="size-5 shrink-0 text-muted" />
        <input
          disabled
          aria-label="Recherche"
          placeholder="Recherche active en Phase 2"
          className="min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-muted outline-none disabled:cursor-not-allowed"
        />
      </form>

      <div className="rounded-lg border border-dashed border-white/14 bg-white/5 px-5 py-8 text-center">
        <p className="text-sm font-medium text-muted">Aucun resultat local pour le moment.</p>
      </div>
    </div>
  );
}
