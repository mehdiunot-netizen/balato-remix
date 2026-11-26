# Test sur iPhone 11 — version de travail v14

**Statut :** à réaliser sur Safari iOS, appareil réel. Les tests JavaScript du moteur ont été exécutés séparément ; **cela ne remplace pas** ce test tactile.

## Conditions de départ

- Ouvrir le site en **HTTPS** depuis Safari, en orientation **paysage**.
- Tester la branche `codex/contre-pli-ios`, **pas** la branche `main`.
- Si GitHub Pages n'est pas encore actif : GitHub > dépôt `balato-remix` > **Settings > Pages** > **Deploy from a branch** > branche `codex/contre-pli-ios` > dossier `/(root)` > **Save**. Attendre que GitHub affiche le lien du site publié. Ne pas choisir `/docs` puisque `index.html` est à la racine.
- En cas d'écran vide : vérifier d'abord l'adresse du site, puis la console si possible. Ne pas supprimer les sauvegardes.

## Parcours tactile (faire dans cet ordre)

- [ ] **Ouverture** : le menu « Contre-Pli » et les boutons `Jouer` et `Seed` sont visibles, sans coupure.
- [ ] **Orientation** : en portrait, un message invite à tourner l'iPhone ; en paysage, le plateau s'affiche.
- [ ] **Nouvelle partie** : saisir `IPHONE11-TEST` dans `Seed`, lancer. Huit cartes affichées et aucun bouton caché.
- [ ] **Sélection** : toucher une carte ; elle se relève et le score prévisionnel s'actualise. Toucher de nouveau pour la désélectionner. Vérifier la sélection maximale de cinq cartes.
- [ ] **Défausse** : sélectionner 1–5 cartes et toucher `Défausser`. Le nombre de défausses diminue et des cartes de remplacement sont piochées.
- [ ] **Jouer** : sélectionner une main, toucher `Jouer`. Le score augmente et le compteur de mains diminue. La blinde se termine après avoir atteint la cible.
- [ ] **Boutique** : acheter un joker (si les crédits suffisent) et vérifier qu'il apparaît dans l'encart des jokers équipés.
- [ ] **Vente v14** : dans la boutique, ouvrir les détails d'un joker équipé, toucher `Vendre`. La vente le retire et crédite la moitié du prix arrondie à l'inférieur (minimum 1 crédit). Vérifier qu'un nouvel achat est possible si un emplacement est libre.
- [ ] **Reprise** : fermer/rouvrir Safari, retrouver `Reprendre`, les cartes et l'argent inchangés.
- [ ] **Mode hors ligne** : après un premier chargement complet en HTTPS, relancer le jeu en mode avion ; le service worker doit fournir les ressources. Le tester seulement **après** que le site a été chargé une première fois.
- [ ] **Petite hauteur d'écran** : ouvrir la boutique, le détail d'un joker, la boîte des règles et le détail du score, vérifier qu'aucun bouton important ne sort de l'écran.
- [ ] **Conservation** : revenir en ligne et vérifier que la seed et la sauvegarde sont toujours présentes.

## Résultat

Renseigner pour chaque anomalie : l'étape, ce qui s'affiche, les boutons non fonctionnels et, si possible, une capture d'écran. Ne pas déclarer « testé sur iPhone » avant un essai physique confirmé.

## Sécurité de développement

Aucune fusion de la pull request #1 tant que le test réel n'est pas validé. Conserver `main` intacte, les sauvegardes au format `contre-pli-v1`, et inscrire les anomalies dans `docs/REPRISE.md`.

## Nouveau geste de vente v15

- [ ] Depuis la boutique, toucher un joker équipé, le faire glisser ; le carré « VENDRE » apparaît au bas de l'écran avec le prix.
- [ ] Relâcher en dehors du carré : **aucune vente**, aucun changement d'argent ou de jokers.
- [ ] Relâcher le joker sur le carré : vendre exactement le joker déplacé, créditer le bon montant et libérer un emplacement.
- [ ] Faire glisser un joker puis interrompre le geste : vérifier qu'aucune vente n'est déclenchée.
- [ ] Toucher simplement un joker : ses détails peuvent encore s'ouvrir, sans vente.
- [ ] Vérifier aussi la vente d'un joker négatif, les emplacements restants et la persistance après rechargement.
- [ ] Vérifier les gestes en paysage sur un véritable iPhone 11 ; les tests automatiques du moteur ne remplacent pas ce contrôle.

## v17 — décor, consommables et ciblage Augures
- [ ] Le décor de table remplace les bordures autour des principaux panneaux ; les cartes et les boutons restent lisibles en mode paysage.
- [ ] Deux emplacements « Consommables 0/2 » apparaissent même vides ; acheter Bourse/Relance/Souffle en boutique, puis utiliser un objet et vérifier l'effet.
- [ ] La limite 2/2 ne peut pas être dépassée ; l'inventaire reste au changement de blinde, après sauvegarde et rechargement.
- [ ] Ouvrir une pochette d'Augures, choisir un effet, puis choisir **librement** une carte précise du paquet et vérifier que seule celle-là reçoit l'effet.
- [ ] Vérifier que « Fil coupé » continue à retirer les cartes choisies.
- [ ] Glisser un joker à vendre : la fenêtre ne bouge pas, le carré « Vendre » marche et le gain de crédits est lisible.

## v18 — personnages
- [ ] Choisir l'un des 11 personnages dans « Personnages » avant une nouvelle partie ; vérifier les symboles, descriptions et sauvegarde.
- [ ] Le Riche : 13 crédits. Le Stratège : 5 défausses. Le Magicien : 4 cases. Le Négatif : jokers achetés négatifs même après 3 jokers. Le Marchand : prix boutique réduits et cohérents.
- [ ] Le Multiplieur : départ avec joker polychrome ; Le Joueur : légendaire de seed ; Le Copieur Suprême : Plan de départ.
- [ ] L’As Copieur : jouer une carte seule à la première main puis retrouver sa copie la blinde suivante ; Le Tricheur : bonus première main sur chaque main.
- [ ] Reprendre une ancienne sauvegarde v17 : elle reste jouable sans effacer les objets, crédits ou la seed.
- [ ] Le menu de personnage défile à l'intérieur de la boîte sur iPhone paysage sans bouger le plateau.
