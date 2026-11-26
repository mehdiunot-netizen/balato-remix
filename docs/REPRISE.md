# Balatro Remix — À lire avant de reprendre le projet

**Dépôt :** `mehdiunot-netizen/balato-remix`  
**Branche de développement actuelle :** `codex/contre-pli-ios`  
**Pull request :** #1 (brouillon) vers `main`  
**Nom provisoire du prototype :** Contre-Pli  
**Priorité absolue :** conserver une base de jeu de cartes fidèle au fonctionnement de Balatro, puis ajouter les fonctions Remix sans casser le solo ni les sauvegardes. Ne pas copier les ressources graphiques du jeu commercial.

## Consignes de continuité

1. **Continuer dans la branche `codex/contre-pli-ios`**, sauf nouvelle demande explicite du propriétaire. Ne pas modifier ni fusionner `main` sans demande.
2. Ne jamais supprimer/recommencer le prototype pour ajouter une fonctionnalité. Procéder par changements ciblés et réversibles.
3. Tester chaque changement avec `node --test game.test.mjs`, puis vérifier le rendu tactile sur iPhone quand un test réel est possible.
4. Préserver les sauvegardes `contre-pli-v1` ; prévoir une migration si la structure des données évolue.
5. Conserver la reproductibilité des seeds et les règles de pioche.
6. Documenter ici chaque avancée, les éventuels blocages et les fichiers modifiés ; informer le propriétaire à chaque étape importante.
7. Utiliser uniquement le dépôt du compte GitHub **`mehdiunot-netizen`** ; ne pas utiliser un autre compte.

## État du prototype observé

Le code contient les fichiers `index.html`, `app.mjs`, `game.mjs`, `jokers.mjs`, `game.test.mjs`, `style.css`, `sw.js`, le manifeste et les ressources graphiques.

- Jeu solo : cartes, neuf mains de poker de base, jetons × multiplicateur, pioche et défausse.
- Huit mises de trois blindes, soit 24 manches, puis mode infini ; seulement **trois contraintes de boss originales** tournantes à ce stade.
- Boutique, jokers originaux (14 entrées vérifiées dans `jokers.mjs`), pochettes d'améliorations, effets négatifs/copies.
- Seeds, sauvegarde locale et service worker pour le hors ligne.
- Interface mobile prévue en paysage.
- Une suite de tests unitaires existe. **Le fonctionnement sur un iPhone physique n'est pas encore confirmé.**

Le prototype **n'est pas encore le Balatro Remix complet**. Des règles du jeu commercial n'y sont pas encore reproduites (tous les types de mains, jokers, boss, consommables, decks, tags et économie).

## Cahier des charges validé — cible à respecter

**Fondations d'abord :** mains de poker, blindes/boss, score, boutique, jokers, consommables, paquets, choix de skip, progression et interactions proches de Balatro. Graphismes et noms originaux pour notre projet.

**Puis les fonctions Remix :**
- Coopération de 1 à 4 joueurs ; paquets, jokers, consommables et monnaie individuels ; mains choisies séparément puis révélées ensemble, sans chronomètre.
- Score collectif : **(somme des jetons des joueurs) × (somme des multiplicateurs des joueurs)** ; objectifs de blindes multipliés par le nombre de joueurs.
- Carte de casino 2D à trois colonnes et neuf salles visibles ; progression par chemins de rangée en rangée, sans revenir en arrière.
- Skips améliorés, immédiats ou différés, avec inventaire et compteurs ; les trois skips de la première rangée sont récupérables en la sautant.
- Onze personnages aux pouvoirs déjà validés : Le Riche (+10 $ au départ), Le Chanceux (carte magique initiale issue de la seed), L'As Copieur (ADN initial), Le Négatif (jokers achetés négatifs, sans plafond), Le Multiplieur (joker polychrome initial), Le Marchand (-20 % boutique), Le Stratège (+2 défausses), Le Magicien (+2 emplacements de consommables), Le Joueur (joker légendaire initial issu de la seed), Le Copieur Suprême (Blueprint initial), Le Tricheur (chaque main considérée comme la première).
- 28 boss de référence avec adaptations coopératives ; réintroduire les effets méthodiquement et les tester.
- Échanges entre joueurs, dont une carte contre une carte moyennant 1 $ payé par chacun ; échanges de jokers prévus.
- Économie individuelle : récompense directe de victoire plafonnée à 6 $ par joueur, bonus distincts pouvant la dépasser.
- Même seed + mêmes actions dans le même ordre = mêmes résultats.
- iPhone 11 prioritaire ; coût initial nul ; possibilité d'hébergement Web statique.

Le propriétaire a validé ces grandes orientations : **ne pas redemander une validation générale du cahier des charges**.

## Ordre de développement

1. Rendre le solo robuste et jouable (interactions classiques, économie, jokers, boss, compatibilité tactile).
2. Ajouter progressivement les mécaniques Remix sans dénaturer les fondamentaux.
3. Construire la coopération et les échanges.
4. Tester sur iPhone réel et publier seulement après vérification.

## Historique des interventions

- 2026-11-26 : inspection des fichiers et de la PR #1. Création de ce journal de reprise dans la branche de développement existante. Aucun changement dans `main`.
- 2026-11-26 — **Amélioration validée sur la branche de développement** : ajout de `sellJoker()` dans `game.mjs` (revente seulement en boutique, remboursement de la moitié du prix arrondie à l'inférieur, minimum 1 crédit). Interface de vente dans `app.mjs` et test de non-régression dans `game.test.mjs`. Les indices des jokers négatifs sont réajustés lors d'une vente ; les anciennes sauvegardes restent au format actuel. **19 tests sur 19 ont passé dans un environnement JavaScript de vérification**, ce qui ne remplace pas un test réel Safari/iPhone.
- 2026-11-26 — **Textures v14** : enrichissement du tapis, du papier des cartes, des cadres et des jokers par des motifs CSS légers ; images originales conservées. Références d'assets et cache hors ligne passés à `v14` dans `index.html`, `app.mjs`, `game.mjs` et `sw.js`. Cohérence des références contrôlée. **À faire :** test du rendu en paysage sur iPhone 11, vérification de la vente en boutique et du rechargement hors ligne avant fusion. La branche `main` n'a pas été touchée.

- 2026-11-26 — **Vente par glisser-déposer (v15)** : en boutique, un joker équipé peut être pris au doigt ou à la souris ; un carré temporaire « VENDRE » apparaît pendant le geste, avec prix affiché. La vente n'est déclenchée que lors du relâchement dans ce carré ; relâcher ailleurs annule. Le bouton dans les détails du joker est conservé comme alternative accessible. Gestion des pointeurs tactiles dans `app.mjs`, styles de carte/zone de dépôt dans `style.css`, cache mis à jour vers v15 ; `game.mjs` et le format de sauvegarde sont inchangés. **Test tactile sur Safari/iPhone physique restant à effectuer.** Aucun changement sur `main`.

- 2026-11-26 — **v17 déployée sur la branche Codex.** Retour terrain de l'utilisateur : vente par glisser-déposer sur iPhone réussie, mais crédits peu lisibles, absence des deux emplacements de consommables, cible d'Augure imposée, cadres jugés trop présents. Modifications : décor immersif continu de l'observatoire et tapis vert, retrait des gros cadres score/boutique/jokers tout en gardant des cartes et boutons lisibles ; 2 emplacements de consommables (Bourse, Relance, Souffle), offre de boutique et inventaire transmis entre blindes ; Augures désormais en deux étapes (choix de l'effet puis choix explicite de la carte cible), Fil coupé inchangé ; gain de crédit après revente affiché. Le moteur v17 avait ses 21 tests unitaires validés avant l'ajout de l'interface. Clé de sauvegarde inchangée `contre-pli-v1`, `main` non modifiée. À vérifier en direct sous Safari iPhone : lisibilité, ergonomie, sauvegardes et renouvellement du cache.

- 2026-11-26 — **v18, 11 personnages jouables** sélectionnables via « Personnages » avant une nouvelle partie : Le Riche (+10 crédits), Le Chanceux (Augure initial déterminé par la seed), L’As Copieur (ADN initial : première main seule copie une carte dans le paquet), Le Négatif (jokers achetés négatifs, sans plafond), Le Multiplieur (joker de départ polychrome ×1,5), Le Marchand (−20 % en boutique, arrondi inférieur), Le Stratège (+2 défausses par blinde), Le Magicien (4 emplacements de consommables), Le Joueur (joker légendaire initial, fixé par seed), Le Copieur Suprême (Plan initial copie le joker de droite), Le Tricheur (chaque main traitée comme première). Option « Sans personnage ». Nouveaux jokers ajoutés **en fin du catalogue** pour conserver les indices des anciennes sauvegardes. Seed, clé `contre-pli-v1` et mode classique conservés. 28/28 tests JS du moteur passés, essai réel iPhone du choix de personnage à effectuer. Fichiers/caches v18, uniquement sur `codex/contre-pli-ios`.

- 2026-11-26 — **v19 — jokers en éventail de vraies cartes.** L'utilisateur demande des jokers sous forme de cartes verticales, qui se chevauchent afin de gagner de la place sur iPhone. La barre de jokers devient une rangée compacte, chaque joker reste accessible par toucher (détails et revente dans un dialogue dédié), tandis qu'en boutique il peut toujours être glissé vers le carré « VENDRE ». Les bordures restent uniquement sur les cartes, et la liste déborde horizontalement en cas de grand nombre de jokers négatifs. Aucun changement à l'évaluation, à la seed, aux personnages ni au format de sauvegarde `contre-pli-v1`. CSS et application v19, cache de service worker v19 ; branche `main` inchangée. Tester sur iPhone réel le toucher, la vente et l'empilement.

- 2026-11-26 — **v20 : sélection de trois blindes qui se chevauchent et Skip triple.** Nouvelle partie : écran de sélection avant la première blinde ; les trois cartes (Petite, Grosse, Boss) sont simultanément accessibles, avec objectif propre et description du bonus de Skip. Choisir une des trois lance une blinde. Skip saute l'étape **et donne sans choix les trois bonus correspondants** (coins immédiats, pochette gratuite, mains supplémentaires, joker négatif différé ou crédit au boss), qui ne prennent pas d'emplacement de consommable. Rappel des gains et tags en attente en bas des jokers. Boutique : « Blinde suivante » ouvre l'écran ; les parties existantes en mode infini conservent leur sauvegarde et peuvent entrer sur cet écran depuis la boutique. La version antérieure des neuf salles/chemins imposés a été abandonnée conformément à la correction explicite de l'utilisateur. La sélection et les skips sont sérialisés avec la clé existante `contre-pli-v1`. Ne modifier que `codex/contre-pli-ios`.

- Note de sécurité v20 : les définitions supplémentaires des jokers de Balatro présentes en code sont **prototypes verrouillés** : elles ne peuvent pas apparaître dans les boutiques ni dans les pouvoirs de départ tant que le moteur des effets complexes n'est pas finalisé. Les 19 jokers actifs existants restent inchangés. Les pièces ajoutées dans le cadre des trois blindes sont indépendantes des consommables et des jokers non finalisés.
