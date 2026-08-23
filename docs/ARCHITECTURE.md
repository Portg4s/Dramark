# Architecture

## Stack

Dramark utilise React, TypeScript strict, Vite, React Router, TanStack Query, Dexie, Tailwind CSS, vite-plugin-pwa, Zod lorsque la validation runtime apporte de la valeur, et Vitest avec Testing Library.

Next.js et les state managers globaux lourds sont exclus tant qu'aucun besoin serveur ou etat global complexe n'existe.

## Modules

- `src/app/` : routes et providers applicatifs.
- `src/components/` : shell, navigation et UI reutilisable.
- `src/pages/` : pages routees.
- `src/features/` : futures verticales `catalog`, `library`, `search`.
- `src/services/tmdb/` : details TMDB, token, requetes, provider Rakuten Viki.
- `src/db/` : Dexie et repositories.
- `src/types/` : types metier stables.
- `src/utils/` : helpers petits et nommes.

Le code visuel ne doit pas contenir de logique reseau ou IndexedDB directe. Les composants consomment des hooks/features ; les services et repositories isolent les details externes.

## Flux de donnees

1. React Router affiche les pages.
2. TanStack Query gerera les appels TMDB et leur cache memoire.
3. `src/services/tmdb` encapsule l'API TMDB.
4. `src/db` encapsule IndexedDB pour la bibliotheque personnelle et les caches locaux persistants.
5. Les features orchestrent les transformations entre types externes et types metier.

## TMDB

La configuration TMDB est centralisee dans `src/services/tmdb/config.ts`.
La region est `FR` et la langue est `fr-FR`.

L'acces direct navigateur a TMDB est accepte pour cette PWA personnelle initiale. Limite importante : `VITE_TMDB_ACCESS_TOKEN` est expose dans le bundle frontend et ne doit jamais etre considere comme un secret serveur.

L'absence de token leve une erreur explicite et affiche un avertissement de configuration dans l'app shell.

Le provider Rakuten Viki ne doit pas etre hardcode depuis une source non officielle. La resolution est prevue via les endpoints Watch Providers TMDB pour `movie` et `tv`.

## IndexedDB

Dexie gere la base locale `dramark`, version 1.

Schema minimal d'une entree :

```ts
{
  mediaType: 'movie' | 'tv'
  tmdbId: number
  status: 'watchlist' | 'watched'
  addedAt: string
  updatedAt: string
  watchedAt?: string
  snapshot?: {
    title: string
    posterPath?: string
    releaseYear?: number
    primaryCountry?: string
  }
}
```

L'identifiant primaire local est `mediaType:tmdbId` pour eviter les collisions entre films et series.
Le snapshot local est un cache d'affichage hors connexion, rafraichissable, pas un catalogue proprietaire.

## Import / Export

Le format futur est JSON, versionne et valide par Zod. La Phase 0 fournit le schema `version: 1`; l'interface viendra plus tard.

## PWA

`vite-plugin-pwa` fournit le manifest et le service worker en auto-update. La strategie Phase 0 se limite a l'app shell et aux assets de build. Le cache fin des appels TMDB et images sera decide apres les flux reels.

## Erreurs

- Erreur de configuration TMDB : message explicite.
- Erreur requete TMDB : erreur typee avec statut HTTP.
- Etat offline : banniere systeme.
- Etats vides et skeletons : composants UI dedies.

## Securite

Aucune cle TMDB ne doit etre committee. Les secrets reels necessiteraient un backend ou une fonction proxy hors perimetre V1 actuelle.
