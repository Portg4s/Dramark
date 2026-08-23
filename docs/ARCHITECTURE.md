# Architecture

## Stack

Dramark utilise React, TypeScript strict, Vite, React Router, TanStack Query, Dexie, Tailwind CSS, vite-plugin-pwa, Zod lorsque la validation runtime apporte de la valeur, et Vitest avec Testing Library.

Next.js et les state managers globaux lourds sont exclus tant qu'aucun besoin serveur ou etat global complexe n'existe.

## Modules

- `src/app/` : routes et providers applicatifs.
- `src/components/` : shell, navigation et UI reutilisable.
- `src/pages/` : pages routees.
- `src/features/catalog/` : types media normalises, cartes et helpers de presentation reutilisables.
- `src/features/search/` : hooks de recherche TMDB et query keys.
- `src/features/media/` : route helpers et hooks de fiche detaillee.
- `src/features/library/` : hooks, affichage et tris de bibliotheque.
- `src/services/tmdb/` : configuration, client, recherche, details et mappers TMDB.
- `src/db/` : Dexie et repositories IndexedDB.
- `src/types/` : types metier stables.
- `src/utils/` : helpers petits et nommes.

Le code visuel ne doit pas contenir de logique reseau ou IndexedDB directe. Les composants consomment des hooks/features ; les services et repositories isolent les details externes.

## Flux de donnees

1. React Router affiche les pages.
2. TanStack Query gere les appels TMDB, les lectures IndexedDB et les invalidations UI.
3. `src/services/tmdb` encapsule l'API TMDB et transforme les reponses brutes vers le domaine.
4. `src/features/search` expose la recherche multi TMDB, filtree aux films et series.
5. `src/features/media` expose les fiches detaillees TMDB par `mediaType + tmdbId`.
6. `src/db` encapsule IndexedDB pour la bibliotheque personnelle.
7. `src/features/library` orchestre les mutations `A regarder`, `Vu` et `Retirer` sans state manager global.

## TMDB

La configuration TMDB est centralisee dans `src/services/tmdb/config.ts`.
La langue est `fr-FR`.

L'acces direct navigateur a TMDB est accepte pour cette PWA personnelle initiale. Limite importante : `VITE_TMDB_ACCESS_TOKEN` est expose dans le bundle frontend et ne doit jamais etre considere comme un secret serveur.

L'absence de token leve une erreur explicite et affiche un message de configuration comprehensible dans l'UI.

La recherche active utilise `/search/multi`, ignore les personnes et ne verifie plus la disponibilite Rakuten Viki. Les fiches media utilisent `/movie/{tmdbId}` et `/tv/{tmdbId}` avec `append_to_response` pour les credits utiles. TMDB fournit la recherche et les metadonnees, pas une garantie de catalogue Viki France.

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
    voteAverage?: number
  }
}
```

L'identifiant primaire local est `mediaType:tmdbId` pour eviter les collisions entre films et series.
Le snapshot local est un cache d'affichage hors connexion, rafraichissable, pas un catalogue proprietaire.

Regles de statut :

- nouvelle entree `watchlist` : pas de `watchedAt` ;
- nouvelle entree `watched` : `watchedAt = now` ;
- `watchlist` vers `watched` : conserver `addedAt`, definir `watchedAt` ;
- `watched` vers `watchlist` : conserver `addedAt`, retirer `watchedAt` ;
- re-appuyer sur le meme statut met a jour l'entree existante sans doublon.

## Import / Export

Le format futur est JSON, versionne et valide par Zod. L'interface viendra plus tard.

## PWA

`vite-plugin-pwa` fournit le manifest et le service worker en auto-update. La strategie actuelle se limite a l'app shell et aux assets de build. Le cache fin des appels TMDB et images sera decide en phase PWA/offline.

## Erreurs

- Erreur de configuration TMDB : message explicite.
- Erreur requete TMDB : message utilisateur non technique.
- Etat offline : banniere systeme.
- Etats vides et skeletons : composants UI dedies.

## Securite

Aucune cle TMDB ne doit etre committee. Les secrets reels necessiteraient un backend ou une fonction proxy hors perimetre V1 actuelle.
