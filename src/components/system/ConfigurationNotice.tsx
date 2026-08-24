import { AlertTriangle } from 'lucide-react';

import { tmdbRuntimeConfig } from '@/services/tmdb/config';

export function ConfigurationNotice() {
  if (tmdbRuntimeConfig.isConfigured) {
    return null;
  }

  return (
    <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>
        Configuration TMDB absente. Renseigner le secret serveur TMDB pour activer les{' '}
        {'donn\u00e9es distantes.'}
      </p>
    </div>
  );
}
