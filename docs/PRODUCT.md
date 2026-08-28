# Produit

## But

Dramark est une PWA mobile-first personnelle pour rechercher des films et series via TMDB, puis les classer localement dans `A regarder` ou `Vu`.

L'application est utilisee principalement en complement de Rakuten Viki : l'utilisateur voit un contenu qui l'interesse, le recherche dans Dramark, puis memorise son choix sur son appareil.

Dramark ne garantit pas qu'un contenu trouve dans TMDB est disponible sur Rakuten Viki. La disponibilite Viki France n'est plus verifiee automatiquement.

## Perimetre V1

- Rechercher des films et series via TMDB : `movie | tv`.
- Ignorer les personnes et autres resultats non media.
- Classer un contenu dans seulement deux statuts : `A regarder` et `Vu`.
- Stocker la bibliotheque personnelle localement, sans compte et sans synchronisation.
- Conserver un snapshot local leger pour afficher la liste rapidement et hors connexion.
- Prevoir un export/import JSON versionne, sans devoir livrer l'interface complete tout de suite.
- Afficher sur les fiches les watch providers France fournis par TMDB/JustWatch, sans verification par saison.

## Non-objectifs V1

- Verification automatique de disponibilite Rakuten Viki France.
- Watchmode, scraping Viki, feed Viki, crawler ou backend catalogue.
- Authentification ou compte utilisateur.
- Backend applicatif metier.
- Base de donnees distante pour les donnees personnelles.
- Synchronisation entre appareils.
- Suivi par episode.
- Statuts `En cours` ou `Abandonne`.
- Notation personnelle, commentaires, social, profils multiples.

## Source externe

TMDB est la source distante pour la recherche et les metadonnees : titres, posters, backdrops, synopsis, dates, pays, genres, casting, notes, IDs et watch providers France fournis via JustWatch.

- Langue principale : `fr-FR`
- Types minimum : `movie | tv`
- Identite locale : `mediaType + tmdbId`

Les donnees personnelles restent locales dans IndexedDB/Dexie. Les snapshots locaux sont des caches d'affichage, pas un catalogue propre a Dramark.

## Attributions

Une section `Credits et attributions` doit mentionner TMDB et JustWatch. Mention TMDB a conserver :

> This product uses the TMDB API but is not endorsed or certified by TMDB.

Dramark ne doit pas suggerer une affiliation, certification ou approbation par Rakuten Viki, TMDB ou JustWatch.
