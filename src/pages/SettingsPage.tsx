import { Download, Info, RefreshCw, Smartphone, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { checkForPwaUpdates } from '@/app/pwaRegistration';
import { createDatedExportFileName, downloadTextFile } from '@/features/settings/downloadTextFile';
import { exportLibraryData, importLibraryData } from '@/features/settings/importExport';

const passiveSettingsItems = [
  { label: 'Crédits et attributions', detail: 'TMDB', icon: Info }
] as const;

export function SettingsPage() {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | undefined>();
  const [isBusy, setIsBusy] = useState(false);

  async function handleExport() {
    setIsBusy(true);

    try {
      const content = await exportLibraryData();

      downloadTextFile({
        content,
        fileName: createDatedExportFileName(),
        mimeType: 'application/json'
      });
      setNotice('Export prêt.');
    } catch {
      setNotice("Impossible d'exporter les données.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleImport(file: File | undefined) {
    if (!file) {
      return;
    }

    setIsBusy(true);

    try {
      const result = await importLibraryData(await file.text());
      const importedLabel = `${result.importedCount} contenu${
        result.importedCount > 1 ? 's' : ''
      } importé${result.importedCount > 1 ? 's' : ''}`;
      const skippedLabel = `${result.skippedCount} déjà présent${
        result.skippedCount > 1 ? 's' : ''
      }`;

      setNotice(`${importedLabel}, ${skippedLabel}.`);
    } catch {
      setNotice('Fichier Dramark invalide.');
    } finally {
      setIsBusy(false);

      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  }

  async function handleCheckForUpdates() {
    setIsBusy(true);

    try {
      const hasRegistration = await checkForPwaUpdates();
      setNotice(
        hasRegistration
          ? 'Recherche de mise à jour terminée.'
          : "La vérification PWA sera disponible après installation de l'app."
      );
    } catch {
      setNotice('Impossible de vérifier les mises à jour.');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="space-y-7">
      <header className="space-y-2 pt-2">
        <p className="text-sm font-semibold text-brand-soft">Réglages</p>
        <h1 className="text-3xl font-black text-white">Paramètres</h1>
      </header>

      <div className="overflow-hidden rounded-[1.45rem] bg-white/[0.055] shadow-[0_16px_42px_rgba(0,0,0,0.24)]">
        <button
          type="button"
          onClick={handleExport}
          disabled={isBusy}
          className="pressable focus-ring flex min-h-16 w-full items-center gap-3 px-4 text-left text-sm text-muted disabled:cursor-wait disabled:opacity-70"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/8 text-brand-soft">
            <Download aria-hidden="true" size={19} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-white">Exporter mes données</span>
            <span className="mt-0.5 block text-xs text-subtle">Sauvegarde JSON locale</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => importInputRef.current?.click()}
          disabled={isBusy}
          className="pressable focus-ring flex min-h-16 w-full items-center gap-3 px-4 text-left text-sm text-muted disabled:cursor-wait disabled:opacity-70"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/8 text-brand-soft">
            <Upload aria-hidden="true" size={19} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-white">Importer mes données</span>
            <span className="mt-0.5 block text-xs text-subtle">
              Ajout sans écraser la liste actuelle
            </span>
          </span>
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Choisir un fichier Dramark"
          onChange={(event) => {
            void handleImport(event.target.files?.[0]);
          }}
        />
        <button
          type="button"
          onClick={handleCheckForUpdates}
          disabled={isBusy}
          className="pressable focus-ring flex min-h-16 w-full items-center gap-3 px-4 text-left text-sm text-muted disabled:cursor-wait disabled:opacity-70"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/8 text-brand-soft">
            <RefreshCw aria-hidden="true" size={19} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-white">Vérifier les mises à jour</span>
            <span className="mt-0.5 block text-xs text-subtle">
              Recharge proposée si une version existe
            </span>
          </span>
        </button>
        <div className="flex min-h-16 w-full items-center gap-3 px-4 text-left text-sm text-muted">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/8 text-brand-soft">
            <Smartphone aria-hidden="true" size={19} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-white">Application PWA</span>
            <span className="mt-0.5 block text-xs text-subtle">Version {__APP_VERSION__}</span>
          </span>
        </div>
        {passiveSettingsItems.map(({ label, detail, icon: Icon }) => (
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

      {notice ? (
        <p className="rounded-[1.1rem] bg-brand/12 px-4 py-3 text-sm font-semibold text-brand-soft">
          {notice}
        </p>
      ) : null}

      <section className="rounded-[1.35rem] bg-white/[0.045] px-4 py-4">
        <h2 className="text-sm font-bold text-white">Crédits</h2>
        <p className="mt-2 text-xs leading-6 text-subtle">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </section>
    </div>
  );
}
