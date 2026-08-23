# Roadmap

## Phase 0 — Foundation

Statut : termine

- Initialiser React, TypeScript, Vite et PWA.
- Configurer qualite : lint, format, tests, typecheck, build.
- Creer shell mobile, navigation et placeholders propres.
- Poser Dexie, types metier, client TMDB et docs.

## Phase 1 — Investigation catalogue Viki France

Statut : termine / historique

- Valider l'integration TMDB et Watch Providers.
- Constater que TMDB Watch Providers `FR` ne retourne pas Rakuten Viki pour `movie` ni `tv`.
- Conserver le travail comme diagnostic historique, pas comme direction produit active.

## Phase 1.5 — Source catalogue Viki France

Statut : termine / historique

- Evaluer TMDB Viki global, surfaces publiques Viki et feed Google Cast.
- Documenter limites, risques et strategie de matching dans `docs/CATALOG_SOURCE_SPIKE.md`.
- Recommandation technique finalement abandonnee au profit d'un produit plus simple centre sur la recherche TMDB et la bibliotheque locale.

## Phase 2 — Core Loop : Recherche + Bibliotheque

Statut : termine

- Recherche multi TMDB films/series.
- Ignorer les personnes.
- Actions immediates `A regarder`, `Vu` et `Retirer`.
- Bibliotheque locale IndexedDB avec deux vues, compteurs et tris simples.

## Phase 3 — Decouverte / accueil

Statut : a faire

- Accueil de decouverte base sur TMDB sans promesse de disponibilite Viki.
- Rails ou suggestions utiles pour alimenter la recherche et la bibliotheque.
- Etats loading/erreur/empty adaptes.

## Phase 4 — Fiches detaillees

Statut : a faire

- Page media detaillee.
- Cast, genres, notes TMDB, episodes series si pertinent.
- Actions bibliotheque depuis la fiche.

## Phase 5 — Import / Export

Statut : a faire

- Export JSON versionne.
- Import valide et non destructif.
- Gestion des erreurs de schema.

## Phase 6 — PWA / Offline / Polish

Statut : a faire

- Strategie cache TMDB/images.
- Etats offline avances.
- Installation et experience mobile finale.

## Phase 7 — QA finale

Statut : a faire

- Tests parcours principaux.
- Audit accessibilite.
- Validation responsive et PWA.
