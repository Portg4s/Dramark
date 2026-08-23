# UX

## Direction

Dramark doit ressembler a une application de divertissement mobile premium : sombre, visuelle, tactile, dense sans etre chargee, inspiree par les codes streaming sans copier Netflix, Rakuten Viki ou leurs identites.

## Navigation

Navigation principale en quatre entrees :

1. Accueil
2. Recherche
3. Ma liste
4. Reglages

Sur mobile, la navigation est en barre basse avec zones tactiles confortables et `safe-area-inset-bottom`.

## Principes mobile-first

- Le premier rendu doit etre utile sur telephone.
- Posters et backdrops doivent porter la hierarchie visuelle.
- Les actions principales doivent etre faciles au pouce.
- Les textes doivent rester courts, lisibles et non superposes.
- Desktop est une extension responsive, pas la cible dominante.

## Design system initial

- Theme sombre : fond quasi noir, surfaces translucides mesurees.
- Accent principal : rose premium distinctif, utilise avec parcimonie.
- Rayons moderes : cartes et panneaux autour de 8px.
- Focus visible obligatoire.
- Skeleton loaders pour les chargements de recherche et listes.
- Etats vides explicites.
- Etats d'erreur et offline visibles sans casser le shell.

## Ecrans attendus

### Accueil

Presentation simple du produit, acces rapide vers `Recherche` et `Ma liste`, compteurs locaux si disponibles. Pas de promesse de disponibilite plateforme.

### Recherche

Recherche textuelle TMDB films + series, minimum 2 caracteres, resultats mobiles lisibles, actions immediates `A regarder`, `Vu` et `Retirer`.

### Fiche media

Backdrop, poster, titre, titre original si pertinent, annee, pays, genres, synopsis, episodes pour series, note TMDB, casting principal, type de contenu, actions `A regarder` et `Vu`.

### Ma liste

Deux vues : `A regarder` et `Vu`. Tris : date d'ajout, titre, annee, note TMDB si disponible.

### Reglages

Export, import, informations PWA, credits/attributions, version de l'application.

## Accessibilite

- Contraste suffisant sur fonds sombres.
- Labels accessibles pour navigation et champs.
- Focus clavier visible.
- Pas d'information transmise uniquement par la couleur.
- Tailles tactiles coherentes.
