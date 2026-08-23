import { Download, Info, Smartphone, Upload } from 'lucide-react';

const settingsItems = [
  { label: 'Exporter mes données', detail: 'Bientôt disponible', icon: Download },
  { label: 'Importer mes données', detail: 'Bientôt disponible', icon: Upload },
  { label: 'Application PWA', detail: 'Installation et mode hors ligne', icon: Smartphone },
  { label: 'Crédits et attributions', detail: 'TMDB', icon: Info }
] as const;

export function SettingsPage() {
  return (
    <div className="space-y-7">
      <header className="space-y-2 pt-2">
        <p className="text-sm font-semibold text-brand-soft">Réglages</p>
        <h1 className="text-3xl font-black text-white">Paramètres</h1>
      </header>

      <div className="overflow-hidden rounded-[1.45rem] bg-white/[0.055] shadow-[0_16px_42px_rgba(0,0,0,0.24)]">
        {settingsItems.map(({ label, detail, icon: Icon }) => (
          <button
            key={label}
            type="button"
            disabled
            className="flex min-h-16 w-full items-center gap-3 px-4 text-left text-sm text-muted disabled:cursor-not-allowed disabled:opacity-75"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/8 text-brand-soft">
              <Icon aria-hidden="true" size={19} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-white">{label}</span>
              <span className="mt-0.5 block text-xs text-subtle">{detail}</span>
            </span>
          </button>
        ))}
      </div>

      <section className="rounded-[1.35rem] bg-white/[0.045] px-4 py-4">
        <h2 className="text-sm font-bold text-white">Crédits</h2>
        <p className="mt-2 text-xs leading-6 text-subtle">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </section>
    </div>
  );
}
