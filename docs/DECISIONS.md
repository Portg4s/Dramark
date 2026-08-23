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

## Provider Rakuten Viki resolu via TMDB

Decision : ne pas figer un provider ID depuis une source externe non officielle.

Raison : les IDs et disponibilites doivent venir des endpoints Watch Providers TMDB.

Consequences : la Phase 1 devra valider le provider pour `movie` et `tv`, puis cacher intelligemment les resultats utiles.

## Source de disponibilite Viki France

Decision : utiliser comme cible d'architecture une commande locale de synchronisation basee sur le feed public Google Cast Viki, filtree sur `eligibleRegion` contenant `FR`, puis enrichie par TMDB.

Raison : TMDB Watch Providers ne reference pas Rakuten Viki en France, tandis que le feed public Viki expose des donnees structurees Schema.org avec regions eligibles. Cette approche reste compatible avec une PWA statique et evite une API privee, une authentification ou un crawler permanent.

Consequences : TMDB reste la source de metadonnees enrichies et de matching, mais plus la source de verite disponibilite Viki France. Une future phase devra creer un `catalog:sync` prudent, streamant les shards sans dump brut, avec etats `matched`, `ambiguous` et `unmatched`.
