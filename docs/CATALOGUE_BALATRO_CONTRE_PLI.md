# Catalogue de référence — Balatro → Contre-Pli
État : **inventaire de cadrage vérifié, intégration exhaustive NON terminée**. Mis à jour le 28 novembre 2026.

## Sources de référence
- https://teemo.dev/game-design/balatro/wiki/ — encyclopédie et mécanique
- https://balatrolab.com/en/database/jokers — 150 jokers et effets
- https://teemo.dev/game-design/balatro/systems/tarot-planet-and-spectral-cards-reference/ — 52 consommables, éditions, probabilités
- https://github.com/dylanbailes/Optilatro/blob/main/docs/reference/balatro-mechanics.md — feuille de référence de simulation

## Inventaire de Balatro à couvrir intégralement
| Famille | Nombre | Travail Contre-Pli |
|---|---:|---|
| Jokers | 150 | Nom original, nom Contre-Pli unique, illustration originale, coût, rareté, effet, déclencheur, ordre, compatibilité |
| Tarots | 22 | « cartes magiques » : ciblage, transformation, création, économie |
| Planètes | 12 | amélioration persistante des niveaux de mains |
| Spectrales | 18 | créations, copies, destructions, sceaux et contreparties |
| Consommables | 52 | inventaire de base 2 places, utilisation explicite |
| Bons (vouchers) | 32 | 16 paires de bonus et améliorations, achats persistants par run |
| Decks de départ | 15 | règle initiale, déblocage, interactions |
| Boss | 28 | règle de boss et adaptation Contre-Pli |
| Blindes | 30 | 2 ordinaires + 28 boss, progression et récompenses |
| Tags de skip | 24 | convertir en bonus différés selon règles Remix |
| Mises (stakes) | 8 | modificateurs cumulatifs de difficulté |
| Améliorations de cartes | 8 | effets de score, argent, hasard, pierre, verre, etc. |
| Sceaux | 4 | rouge, bleu, or, violet : effets et moments de déclenchement |
| Éditions | 5 | base, foil, holographique, polychrome, négatif |
| Familles de packs | 6 | Arcane, Celestial, Spectral, Standard, Buffoon et variantes ; vérifier 32 entrées de collection |
| Défis | 20 | règles et conditions propres |
| Mains de poker | 12 | neuf classiques + trois secrètes, niveau, jetons et multiplicateur |

**Attention aux décomptes :** 32 entrées de packs dans la collection, mais 15 variantes mécaniques répertoriées dans certaines références ; documenter les deux conventions plutôt que les confondre.

## Mécaniques à implémenter et tester
1. Tirage déterministe par seed : decks, boss, boutiques, packs, raretés, événements, tirages aléatoires et drops.
2. Sélection de 1 à 5 cartes, détection de main, cartes marquantes, niveaux de main, jetons × multiplicateur.
3. Ordre de résolution : main de base, cartes jouées, améliorations/sceaux, jokers, effets de cartes tenues, répétitions, multiplicateurs multiplicatifs, arrondis.
4. Économie : gains de blinde, mains restantes, intérêts, remises, prix, vente, reroll, dette et plafonds spécifiques Remix.
5. Inventaires : 5 jokers de base, négatifs et copies, ordre des jokers, 2 consommables de base, éditions et limites.
6. Boutique : pondération des offres, prix, rareté, bons, packs, rafraîchissement, restrictions de place.
7. Blindes/boss : handicaps, debuffs, adaptations, fin d'ante, victoire et défaite.
8. Skips : tags originaux transposés en bonus différés, activation, durée, empilement et expiration.
9. Persistance : sauvegardes existantes, déblocages, seed, reprise hors ligne, migration sans perte.
10. Interface : illustrations originales, fan de cartes, réordonnancement, infobulles, accessibilité, iPhone paysage.
11. Tests : effets isolés et combinaisons (Blueprint/Brainstorm/Mime/Baron, négatif, polychrome, retriggers, ADN, légendaires).

## Contraintes Contre-Pli déjà validées — ne pas écraser
- 11 personnages et leurs pouvoirs ; 28 boss adaptés ; carte casino de neuf salles ; trois chemins et dérivations.
- Skips différés, économie personnalisée (récompense de blinde plafonnée), seed « tout gravé ».
- ADN/Copieur Remix : création de deux copies négatives permanentes à la vente, sous conditions approuvées ; ce n'est PAS l'effet standard de DNA dans Balatro.
- Base 5 emplacements jokers ; négatifs libèrent/ajoutent de la place ; copies peuvent dépasser la limite.
- Multijoueur défini mais actuellement en pause ; ne pas l'effacer.
- Conserver les identifiants numériques des jokers existants et la clé de sauvegarde `contre-pli-v1`.

## État technique constaté dans le dépôt
- `jokers.mjs` possède déjà des jokers Contre-Pli et des effets propres : ce n'est pas une table de correspondance exhaustive vérifiée avec les 150 originaux.
- `game.mjs` contient les mécaniques actuelles, une partie des boss et des personnages. La présence d'un nom ne prouve pas l'équivalence fonctionnelle.
- **Ne pas déclarer « intégré » un élément avant comparaison de l'effet et test automatisé.**
- Toute correspondance de nom restant à établir est marquée **À AUDITER** ; ne pas inventer une traduction ni réattribuer un ID existant.

## Matrice de suivi obligatoire (à remplir par famille)
`ID Balatro | nom Balatro | nom Contre-Pli | rareté/prix | effet exact | déclenchement | interactions | code concerné | test | statut`

Statuts autorisés : `À AUDITER`, `À CRÉER`, `EN COURS`, `TESTÉ`, `VALIDÉ SUR IPHONE`.
Priorité : dresser les 150 lignes jokers et 52 lignes consommables, puis 32 bons, 15 decks, 28 boss, 24 tags, et enfin les variantes de packs, défis et règles de score.

Ce document est une base vérifiable de travail et **pas** une déclaration que tout Balatro a déjà été porté.
