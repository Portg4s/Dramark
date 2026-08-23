# Produit

## But

Dramark est une PWA mobile-first personnelle pour suivre les contenus disponibles sur Rakuten Viki en France.
L'application est installee principalement sur telephone et chaque appareil possede sa propre bibliotheque locale.

## Perimetre V1

- Consulter a terme le catalogue pertinent Rakuten Viki France via TMDB et Watch Providers.
- Prendre en charge au minimum les films et series : `movie | tv`.
- Classer un contenu dans seulement deux statuts : `A regarder` et `Vu`.
- Stocker la bibliotheque personnelle localement, sans compte et sans synchronisation.
- Prevoir un export/import JSON versionne, sans devoir livrer l'interface complete en Phase 0.

## Non-objectifs V1

- Authentification ou compte utilisateur.
- Backend applicatif metier.
- Base de donnees distante pour les donnees personnelles.
- Synchronisation entre appareils.
- Suivi par episode.
- Statuts `En cours` ou `Abandonne`.
- Notation personnelle, commentaires, social, profils multiples.

## Catalogue externe

TMDB est la source de donnees catalogue. Les disponibilites plateformes proviennent des Watch Providers TMDB / JustWatch.

- Region cible : `FR`
- Langue principale : `fr-FR`
- Provider cible : Rakuten Viki, resolu/valide via les endpoints officiels Watch Providers quand necessaire.

Pour la recherche textuelle, Dramark devra rechercher films et series, ignorer les personnes, verifier la disponibilite Viki France et cacher les verifications pour eviter les appels inutiles.

## Attributions

Une section `Credits et attributions` doit mentionner TMDB et JustWatch. Mention TMDB a conserver :

> This product uses the TMDB API but is not endorsed or certified by TMDB.

Dramark ne doit pas suggerer une affiliation, certification ou approbation par Rakuten Viki, TMDB ou JustWatch.
