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
