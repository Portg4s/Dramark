# UX

## Direction

Dramark doit ressembler a une application de divertissement mobile premium : sombre, visuelle, tactile, dense sans etre chargee, inspiree par les codes streaming asiatique sans copier Netflix, Rakuten Viki ou leurs identites.

La direction active est : streaming asiatique premium + editorial + cinematographique + mobile-first.

## Navigation

Navigation principale en quatre entrees :

1. Accueil
2. Recherche
3. Ma liste
4. Reglages

Sur mobile, la navigation est en barre basse translucide avec zones tactiles confortables et `safe-area-inset-bottom`. Les fiches media peuvent masquer cette barre pour une experience immersive, avec un retour clair et compatible navigation navigateur.

## Principes mobile-first

- Le premier rendu doit etre utile sur telephone.
- Posters et backdrops doivent porter la hierarchie visuelle.
- Les actions principales doivent etre faciles au pouce.
- Les textes doivent rester courts, lisibles et non superposes.
- Desktop est une extension responsive, pas la cible dominante.

## Design system initial

- Theme sombre nuit : fond quasi noir bleute, surfaces translucides mesurees.
- Accent principal : rose/corail premium, utilise pour CTA, actif, focus et details de marque.
- Accent froid cyan tres discret pour profondeur.
- Rayons doux coherents sur posters, actions et controles.
- Bordures visibles limitees ; privilegier overlays, ombres et espace negatif.
- Focus visible obligatoire.
- Skeleton loaders pour les chargements de recherche, listes et fiches.
- Etats vides explicites.
- Etats d'erreur et offline visibles sans casser le shell.
- Motion sobre : 150-300 ms, transform/opacity, respect `prefers-reduced-motion`.

## Ecrans attendus

### Accueil

Dashboard personnel visuel : identite Dramark, compteurs discrets, rails `A regarder` et `Recemment vus` si la bibliotheque contient des medias, empty state oriente recherche sinon.

### Recherche

Recherche textuelle TMDB films + series, minimum 2 caracteres, resultats mobiles avec poster dominant, metadonnees compactes, actions immediates `A regarder`, `Vu` et `Retirer`. La zone media ouvre la fiche detail.

### Fiche media

Ecran immersif avec grand backdrop, poster, titre, titre original, annee, pays, genres, note TMDB, actions `A regarder` et `Vu`, disponibilites France `Regarder sur`, synopsis, informations essentielles et rail de casting.

### Ma liste

Deux vues : `A regarder` et `Vu`, segmented control anime, tri compact, items de collection avec poster dominant et actions secondaires discretes.

### Reglages

Liste sobre : export, import, informations PWA, credits/attributions, version de l'application lorsque disponible.

## Accessibilite

- Contraste suffisant sur fonds sombres.
- Labels accessibles pour navigation, champs et boutons icon-only.
- Focus clavier visible.
- Pas d'information transmise uniquement par la couleur.
- Tailles tactiles coherentes.
- Images avec `alt` pertinent ou decorative si elles doublonnent un contexte textuel.
