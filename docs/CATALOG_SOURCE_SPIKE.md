# Spike source catalogue Viki France

## Contexte

La Phase 1 a valide que TMDB fonctionne pour les metadonnees, mais que Watch Providers `FR` ne retourne pas Rakuten Viki pour `movie` ni `tv`. Rakuten TV est retourne par TMDB, mais c'est un autre service et il ne doit pas etre utilise comme substitut.

Question du spike : trouver une source raisonnable pour repondre a "quels contenus sont disponibles sur Rakuten Viki depuis la France ?" sans backend permanent, sans compte Viki, sans contournement et sans crawler massif.

## Experiences effectuees

### A. TMDB Rakuten Viki global

Endpoints officiels utilises :

- `GET /watch/providers/movie`
- `GET /watch/providers/tv`
- `GET /watch/providers/regions`
- `GET /discover/movie`
- `GET /discover/tv`

Resultats du 2026-08-23 :

- Liste globale `movie` : Rakuten Viki existe sous l'ID `344`; Rakuten TV existe sous l'ID `35`.
- Liste globale `tv` : Rakuten Viki existe sous l'ID `344`; Rakuten TV existe sous l'ID `35`.
- Regions ou TMDB retourne Viki : environ 49 regions pour `movie`, 50 pour `tv`; `FR` n'en fait pas partie.
- `discover` avec `with_watch_providers=344` sans `watch_region` renvoie des volumes non exploitables comme catalogue Viki : environ 1 171 460 resultats `movie` et 229 629 resultats `tv` observes. Cela ressemble a un usage invalide/non filtre du provider sans region.
- `discover` avec `watch_region=US` donne des volumes plausibles : environ 410 films et 1 661 contenus TV.

Conclusion : TMDB global peut identifier l'ID Viki courant, mais ne peut pas servir de source de verite France. Sans `watch_region`, `discover` ne doit pas etre utilise comme candidate list fiable.

### B. Surfaces publiques Viki

Surfaces inspectees :

- `https://www.viki.com/robots.txt`
- `https://www.viki.com/sitemap.xml`
- `https://www.viki.com/sitemaps/tv.xml`
- `https://www.viki.com/sitemaps/movies.xml`
- `https://www.viki.com/sitemaps/categories.xml`
- pages publiques de contenu `/tv/...` et `/movies/...`
- sitemap public Google Cast reference par `robots.txt`

Constats :

- `robots.txt` interdit notamment `/search`, `/explore`, `/v1`, `/v2` et `/player`. Ces surfaces ne doivent pas devenir la base de Dramark.
- `sitemap.xml` expose officiellement `tv.xml`, `movies.xml`, `collections.xml`, `categories.xml`, etc.
- `tv.xml` contenait 1 941 URLs de series ; `movies.xml` contenait 669 URLs de films lors du test.
- Les URLs exposent un ID Viki stable visible : exemples `1007c`, `35652c`, `41692c`.
- Les sitemaps `tv`/`movies` exposent les URLs et locales alternatives, mais pas la disponibilite regionale.
- Les pages contenu publiques exposent des metadonnees JSON-LD utiles : type Schema.org (`TVSeries`, `Movie`), titre, URL canonique, image, date, note, genres, langue, pays, parfois acteurs/realisateurs.
- Les pages contenu inspectees ne portaient pas directement `eligibleRegion` dans leur JSON-LD principal. Les occurrences de messages de restriction region dans le HTML semblaient provenir des traductions embarquees, pas d'un etat de disponibilite fiable pour la page.

Conclusion : les sitemaps et pages publiques Viki sont bons pour l'identite et les metadonnees Viki, mais insuffisants seuls pour determiner la disponibilite France.

### C. Feed public Google Cast Viki

`robots.txt` reference un sitemap officiel :

`https://s3.amazonaws.com/assets.viki-production/outbound_feeds/google_cast/production_google_cast_feed_sitemap.xml`

Constats du 2026-08-23 :

- Le sitemap liste 22 shards JSON publics.
- Volumetrie declaree totale : environ 413,7 Mo.
- Derniere modification observee : `2026-08-22T22:02:17+00:00`.
- Un shard complet teste contenait 1 800 items : 16 `Movie`, 1 677 `TVEpisode`, 107 `TVSeries`.
- Dans ce shard, 1 755 items incluaient `FR` dans `eligibleRegion`, dont 104 series uniques et 5 films.
- Les objets contiennent des donnees Schema.org publiques : URL Viki, type, titres localises, description, image, langue, acteurs, date, `WatchAction`, `ActionAccessSpecification`, `availabilityStarts`, `availabilityEnds`, `eligibleRegion`, parfois `identifier` comme `41692c-series`.

Conclusion : c'est la meilleure piste trouvee pour la disponibilite Viki France. Elle est publique, officielle, structuree, region-aware et ne depend pas d'une API privee/authentifiee. Elle est trop volumineuse pour le runtime PWA, mais viable pour une commande locale occasionnelle de synchronisation.

### D. Disponibilite France

La meilleure indication exploitable est `ActionAccessSpecification.eligibleRegion` dans le feed Google Cast. Filtrer les elements dont au moins une action contient `FR` permet d'observer une disponibilite annoncee pour la France sans contourner de restriction geographique.

Les pages contenu peuvent servir a verifier manuellement certaines fiches, mais elles ne sont pas la meilleure source automatisee de region.

### E. Matching Viki vers TMDB

Test rapide de matching sur quelques titres FR du feed :

- `To Love and Cherish` -> TMDB TV id `326853` retrouve.
- `Mystic Nine` -> deux candidats TMDB, dont un contenu 2026 et un contenu 2016 : cas ambigu possible.
- `Heartman: Rock and Love` -> TMDB movie id `863149` retrouve.
- `OMG! Oh My Girl` -> TMDB movie id `974782` retrouve.

Le matching ne doit donc pas choisir silencieusement le premier resultat. Il faut un score de confiance base sur plusieurs signaux.

Signaux recommandes :

- type Viki (`Movie` / `TVSeries`) ;
- ID et URL Viki ;
- titres localises Viki : `en-us`, `fr-fr`, original si disponible ;
- date de publication / annee ;
- pays de sortie ;
- langue originale ;
- acteurs/realisateurs lorsque disponibles ;
- resultats TMDB par type ;
- similarite de titre normalisee ;
- penalite si annee/pays/type divergent.

Etats a produire :

- `matched` : un candidat depasse un seuil clair et les signaux concordent ;
- `ambiguous` : plusieurs candidats plausibles ou signaux discordants ;
- `unmatched` : aucun candidat credible.

Les entrees `ambiguous` et `unmatched` doivent etre inspectables, pas resolues arbitrairement.

## Variantes de sync locale

### Variante A — catalogue versionne dans Git

Flux :

```text
machine FR -> npm run catalog:sync -> data/viki-fr.catalog.json -> commit/push -> PWA statique
```

Avantages :

- PWA entierement statique ;
- aucun backend ;
- catalogue disponible immediatement au chargement ;
- une seule machine fait le travail ;
- facilite la reproductibilite et les diffs.

Inconvenients :

- il faut commit/push apres chaque refresh ;
- publication d'un fichier derive du feed Viki, meme pour usage personnel ;
- risque de catalogue legerement ancien.

### Variante B — catalogue local non versionne

Flux :

```text
machine FR -> npm run catalog:sync -> fichier local ignore ou import IndexedDB -> Dramark local
```

Avantages :

- aucune donnee derivee publiee ;
- usage strictement personnel ;
- reduit le risque juridique/conditions d'utilisation.

Inconvenients :

- chaque appareil doit importer/synchroniser ;
- moins pratique pour une PWA deployee ;
- etat plus difficile a reproduire et debugger.

## Matrice de comparaison

| Solution                   | Precision FR          | Stabilite | Complexite | Recommandation  |
| -------------------------- | --------------------- | --------- | ---------- | --------------- |
| TMDB Watch Providers FR    | faible / inoperante   | elevee    | faible     | non             |
| TMDB Viki global           | faible pour FR        | elevee    | faible     | non seul        |
| Sitemaps Viki tv/movies    | inconnue pour FR      | elevee    | faible     | support         |
| Pages publiques Viki       | moyenne pour metadata | moyenne   | moyenne    | support         |
| Feed Google Cast Viki      | elevee pour FR        | moyenne   | moyenne    | oui             |
| Sync locale versionnee     | elevee                | moyenne   | faible     | oui, si accepte |
| Sync locale non versionnee | elevee                | moyenne   | moyenne    | alternative     |

## Recommandation

Source recommandee : feed public Google Cast Viki, consomme par une commande locale manuelle, filtre sur `eligibleRegion` contenant `FR`, puis enrichi/matche via TMDB.

Architecture proposee :

```text
npm run catalog:sync
  -> lit le sitemap Google Cast public Viki
  -> stream les shards JSON sans dump massif
  -> conserve Movie + TVSeries disponibles en FR
  -> deduplique les series depuis les episodes
  -> extrait vikiId, vikiUrl, titres, type, image, pays/langue/date si disponibles
  -> matche vers TMDB avec score de confiance
  -> produit un catalogue JSON versionne
  -> Dramark lit ce catalogue statique/local et utilise TMDB pour l'enrichissement
```

Mode de stockage recommande pour commencer : variante A avec `data/viki-fr.catalog.json`, mais uniquement si l'utilisateur accepte de versionner un catalogue derive public. Pour minimiser le risque, le fichier doit etre compact, sans episodes, sans dumps bruts, sans cookies, sans token, sans payload complet Google Cast.

Mode prudent alternatif : produire `data/local/viki-fr.catalog.json` ignore par Git, puis fournir une UI/import plus tard.

Modele conceptuel :

```ts
type VikiCatalogEntry = {
  vikiId: string;
  vikiUrl: string;
  title: string;
  localizedTitles: Record<string, string>;
  mediaType: 'movie' | 'tv';
  imageUrl?: string;
  originalLanguage?: string;
  originCountry?: string;
  availableRegions: 'FR'[];
  availabilityStarts?: string;
  availabilityEnds?: string;
  tmdbId?: number;
  matchStatus: 'matched' | 'ambiguous' | 'unmatched';
  matchConfidence?: number;
  checkedFromRegion: 'FR';
  checkedAt: string;
};
```

Comportement produit si matching echoue : afficher l'entree Viki avec metadonnees Viki minimales, mais signaler l'absence d'enrichissement TMDB. Ne jamais inventer un `tmdbId`.

Impact sur l'architecture actuelle :

- conserver TMDB Watch Providers comme diagnostic, pas comme source de verite FR ;
- ajouter plus tard une couche `services/vikiCatalog` ou `scripts/catalog-sync` isolee du runtime ;
- faire lire l'accueil depuis le catalogue Viki FR genere, puis enrichir par TMDB lorsque `matched` ;
- ne pas appeler les shards Google Cast depuis le navigateur.

Impact deploiement :

- avec catalogue versionne : aucun backend, deploiement statique intact ;
- avec catalogue local : necessite import/sync par appareil ;
- dans les deux cas : refresh manuel et explicite, pas de crawler permanent.

## Limites et risques

- Les conditions d'utilisation Viki peuvent limiter la reutilisation meme de donnees publiques ; rester sur un usage personnel, bas volume, sans redistribution de dumps.
- Le feed Google Cast peut changer de schema ou disparaitre.
- Volumetrie elevee : le sync doit streamer et dedupliquer, jamais charger/commiter les payloads bruts.
- `eligibleRegion` indique une disponibilite annoncee dans le feed ; il faut accepter de possibles ecarts avec l'app Viki reelle.
- Le matching TMDB peut etre ambigu, surtout avec remakes, titres proches et annees divergentes.

## Commandes reseau executees

- Requetes TMDB Watch Providers globales et par regions, sans afficher le token.
- Requetes TMDB Discover avec provider `344`, sans region puis avec `US`, pour diagnostic.
- Lecture de `https://www.viki.com/robots.txt`.
- Lecture de `https://www.viki.com/sitemap.xml`.
- Echantillonnage de `tv.xml`, `movies.xml`, `categories.xml` et `collections.xml`.
- Echantillonnage de deux pages contenu Viki publiques.
- Lecture du sitemap Google Cast public Viki et analyse en memoire d'un shard complet.
- Quelques recherches TMDB de matching sur titres issus du shard.
