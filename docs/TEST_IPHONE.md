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
