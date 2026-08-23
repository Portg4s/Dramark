# Roadmap

## Phase 0 — Foundation

Statut : termine

- Initialiser React, TypeScript, Vite et PWA.
- Configurer qualite : lint, format, tests, typecheck, build.
- Creer shell mobile, navigation et placeholders propres.
- Poser Dexie, types metier, client TMDB et docs.

## Phase 1 — Catalogue Viki France

Statut : termine

- Resoudre/valider le provider Rakuten Viki via TMDB Watch Providers.
- Charger les rails de decouverte `movie` et `tv`.
- Ajouter hooks TanStack Query et mapping UI.
- Afficher l'accueil avec rails reels, cartes media, diagnostics et etats d'erreur.
- Diagnostic local du 2026-08-23 : TMDB Watch Providers `FR` ne retourne pas Rakuten Viki pour `movie` ni `tv`; l'UI gere donc le provider absent sans donnees inventees.

## Phase 1.5 — Source catalogue Viki France

Statut : termine

- Evaluer TMDB Viki global, surfaces publiques Viki et feed Google Cast.
- Recommander une sync locale depuis le feed public Google Cast Viki, filtree sur `eligibleRegion=FR`, avec enrichissement TMDB.
- Documenter limites, risques et strategie de matching dans `docs/CATALOG_SOURCE_SPIKE.md`.

## Phase 2 — Recherche et filtres

Statut : a faire

- Recherche multi films/series.
- Ignorer les personnes.
- Verifier disponibilite Viki France avec cache.
- Ajouter filtres pays.

## Phase 3 — Bibliotheque locale

Statut : a faire

- Actions `A regarder` et `Vu`.
- Vues et tris de `Ma liste`.
- Rafraichissement des snapshots.

## Phase 4 — Fiches detaillees

Statut : a faire

- Page media detaillee.
- Cast, genres, notes TMDB, episodes series.
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
