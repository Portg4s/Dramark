import { Download, Info, Smartphone, Upload } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';

const settingsItems = [
  { label: 'Exporter mes donnees', icon: Download },
  { label: 'Importer mes donnees', icon: Upload },
  { label: 'Application PWA', icon: Smartphone },
  { label: 'Credits et attributions', icon: Info }
] as const;

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Reglages" title="Parametres" />

      <div className="overflow-hidden rounded-lg border border-white/10 bg-surface shadow-panel">
        {settingsItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            disabled
            className="flex min-h-14 w-full items-center gap-3 border-b border-white/8 px-4 text-left text-sm font-medium text-muted last:border-b-0 disabled:cursor-not-allowed"
          >
            <Icon aria-hidden="true" size={19} />
            {label}
          </button>
        ))}
      </div>

      <p className="text-xs leading-6 text-subtle">
        This product uses the TMDB API but is not endorsed or certified by TMDB. Les donnees de disponibilite
        Watch Providers proviennent de JustWatch.
      </p>
    </div>
  );
}
