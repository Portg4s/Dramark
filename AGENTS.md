# Dramark — Carte agent

## Identite

Dramark est une PWA mobile-first personnelle pour suivre les contenus disponibles sur Rakuten Viki en France.
L'utilisateur classe chaque contenu localement dans deux statuts seulement : `A regarder` ou `Vu`.

## Commandes essentielles

- Installer : `npm install`
- Dev : `npm run dev`
- TypeScript : `npm run typecheck`
- Lint : `npm run lint`
- Tests : `npm run test`
- Build : `npm run build`
- Validation complete : `npm run check`

## Carte rapide

- `src/app/` : composition applicative, providers, routes.
- `src/components/` : shell, navigation, composants UI reutilisables.
- `src/pages/` : ecrans routes principaux.
- `src/features/` : futures verticales metier.
- `src/services/tmdb/` : configuration, client et logique TMDB.
- `src/db/` : Dexie, repositories et acces IndexedDB.
- `src/types/` : types metier partages.
- `src/utils/` : helpers petits, nommes et testes.
- `src/styles/` : tokens et styles globaux.
- `docs/` : sources de verite produit, architecture, UX, roadmap, decisions.

## Regles critiques

- Application en francais, region TMDB `FR`, langue `fr-FR`.
- Ne jamais commiter de cle ou token TMDB.
- Les variables `VITE_*` sont exposees au client : ne pas les presenter comme secretes.
- L'identite d'un contenu est `mediaType + tmdbId`, jamais `tmdbId` seul.
- `MediaType` minimum : `movie | tv`.
- V1 : pas de compte, auth, backend metier, sync cloud, suivi episode, notes, social ou profils.
- TMDB reste la source de verite catalogue ; les snapshots locaux ne sont que du cache d'affichage.
- Les donnees personnelles restent locales via IndexedDB/Dexie.
- Attribution requise : TMDB et JustWatch, sans affiliation sous-entendue avec Rakuten Viki, TMDB ou JustWatch.

## Sources de verite

- Produit : `docs/PRODUCT.md`
- Architecture : `docs/ARCHITECTURE.md`
- UX/UI : `docs/UX.md`
- Roadmap : `docs/ROADMAP.md`
- Decisions structurantes : `docs/DECISIONS.md`

## Strategie de validation

- Pendant l'iteration, lancer les tests ou commandes ciblees utiles.
- Avant de terminer une tache importante, lancer `npm run check`.
- Si une validation ne peut pas etre executee, l'indiquer clairement dans le compte rendu.

## Process persistants

- Ne pas laisser de serveur dev, preview, watcher ou autre processus persistant actif apres une tache.
- Si un processus persistant sert a valider, l'arreter explicitement avant le compte rendu final.
- Pour une revue UI manuelle, preferer donner `npm run dev` afin que l'utilisateur lance et arrete le serveur.

## Efficacite contexte

1. Lire ce fichier au debut d'une nouvelle tache.
2. Verifier `git status`.
3. Identifier les modules reellement concernes.
4. Lire uniquement les docs liees a la tache.
5. Utiliser `rg`, recherches de symboles et lectures ciblees.
6. Ne pas relire systematiquement tous les fichiers deja connus.
7. Ne pas afficher de longues sorties terminal sans raison.
8. Ne pas recopier la documentation dans les reponses.
9. Ne pas scanner `node_modules`, `dist`, caches ou fichiers generes.
10. Utiliser `git diff` / `git diff --stat` pour comprendre les changements courants.
11. Executer d'abord les tests cibles pendant l'iteration.
12. Executer la validation complete une fois avant la fin d'une tache importante.
13. Mettre a jour uniquement la documentation impactee.
14. Une information structurante doit avoir une seule source de verite.
15. Ne pas repeter une regle dans cinq fichiers differents.

Ajouter des `AGENTS.md` locaux seulement si le repository grossit assez pour le justifier.
