import { CheckCircle2, Clock3 } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';

const tabs = [
  { label: 'A regarder', icon: Clock3 },
  { label: 'Vu', icon: CheckCircle2 }
] as const;

export function LibraryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ma liste"
        title="Deux statuts, aucune friction"
        description="La bibliotheque locale utilisera IndexedDB sur cet appareil, sans compte ni synchronisation."
      />

      <div className="grid grid-cols-2 gap-2 rounded-lg bg-white/10 p-1">
        {tabs.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-white/10 px-3 text-sm font-semibold text-white"
          >
            <Icon aria-hidden="true" size={18} />
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-white/10 bg-surface px-5 py-8 text-center shadow-panel">
        <p className="text-sm font-medium text-muted">
          Votre liste sera stockee localement sur cet appareil.
        </p>
      </div>
    </div>
  );
}
