# Decisions

## Vite + React sans backend

Decision : utiliser React, TypeScript strict et Vite pour une PWA statique.

Raison : Dramark n'a pas besoin de SSR, d'authentification ou de backend metier en V1.

Consequences : l'application reste simple a developper et deployer. Toute protection de secret reel necessiterait une evolution d'architecture.

## Acces TMDB direct depuis le navigateur

Decision : prevoir `VITE_TMDB_ACCESS_TOKEN` pour la premiere version personnelle.

Raison : cela suffit pour initialiser la PWA sans serveur applicatif.

Consequences : le token est visible dans le bundle frontend. Il ne doit pas etre presente comme secret, et une future fonction proxy pourra remplacer cette strategie si necessaire.

## Identite locale composite

Decision : utiliser `mediaType:tmdbId` comme cle locale.

Raison : les IDs TMDB de films et series appartiennent a des espaces differents.

Consequences : les repositories, caches et exports doivent toujours conserver `mediaType`.

## Dexie comme frontiere IndexedDB

Decision : centraliser IndexedDB dans `src/db` via Dexie.

Raison : eviter les acces disperses et garder un schema versionnable.

Consequences : les features consomment des repositories plutot que l'API IndexedDB brute.

## Provider Rakuten Viki resolu via TMDB — supersedee

Decision : ne pas figer un provider ID depuis une source externe non officielle.

Raison : les IDs et disponibilites devaient venir des endpoints Watch Providers TMDB.

Consequences : decision conservee comme historique de Phase 1. Elle est supersedee par la decision de ne plus automatiser le catalogue Viki France.

## Source de disponibilite Viki France — supersedee

Decision : utiliser comme cible d'architecture une commande locale de synchronisation basee sur le feed public Google Cast Viki, filtree sur `eligibleRegion` contenant `FR`, puis enrichie par TMDB.

Raison : TMDB Watch Providers ne reference pas Rakuten Viki en France, tandis que le feed public Viki expose des donnees structurees Schema.org avec regions eligibles. Cette approche restait compatible avec une PWA statique et evitait une API privee, une authentification ou un crawler permanent.

Consequences : decision conservee comme historique de Phase 1.5. Elle est supersedee par le pivot produit vers une bibliotheque personnelle sans verification de disponibilite.

## Ne pas automatiser le catalogue Viki France

Decision : Dramark ne determine plus automatiquement quels contenus sont disponibles sur Rakuten Viki France.

Raison : le besoin reel est le suivi personnel, et une recherche TMDB suffit pour ajouter les contenus vus ou reperes par l'utilisateur. Les sources tierces de disponibilite Viki France sont incompletes ou ajoutent une complexite injustifiee pour un petit produit personnel.

Consequences : Dramark ne pretend pas representer le catalogue Viki France. TMDB devient la source distante pour la recherche et les metadonnees ; la disponibilite Viki reste une connaissance externe de l'utilisateur.
