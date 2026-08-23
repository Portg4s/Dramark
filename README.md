# Dramark

Dramark est une PWA personnelle mobile-first pour suivre les contenus disponibles sur Rakuten Viki en France.
La V1 vise une bibliotheque locale simple : `A regarder` et `Vu`, sans compte, backend metier ou synchronisation cloud.

## Stack

- React + TypeScript strict
- Vite
- React Router
- TanStack Query
- Dexie / IndexedDB
- Tailwind CSS
- vite-plugin-pwa
- Vitest + Testing Library

## Demarrage local

```bash
npm install
npm run dev
```

## Environnement

Copier `.env.example` vers `.env` puis renseigner si besoin :

```bash
VITE_TMDB_ACCESS_TOKEN=
```

Attention : les variables `VITE_*` sont integrees au bundle frontend. Pour cette PWA personnelle, l'acces direct navigateur a TMDB est accepte comme premiere etape, mais ce n'est pas un secret serveur.

## Commandes

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run check
```

`npm run check` lance les controles essentiels avant de terminer une grosse tache.
