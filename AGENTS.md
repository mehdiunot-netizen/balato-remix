# AGENTS.md — Consignes pour tous les agents travaillant sur Contre-Pli

**Lisez ce document avant tout changement.** Mise à jour : 26 novembre 2026.
Projet : `mehdiunot-netizen/balato-remix` — jeu de cartes iPhone 11, en paysage, inspiré des mécaniques de Balatro, avec son identité graphique originale.

## Où travailler
- **Branche active unique : `codex/contre-pli-ios`.** Le dépôt a `main` comme branche par défaut, mais elle n'a pas reçu les changements récents.
- **Pull request #1** : `codex/contre-pli-ios` → `main`, **brouillon, non fusionnée**. Ne pas la fusionner / marquer prête sans demande explicite et tests sérieux.
- `codex/contre-pli-rebuild` et `chatgpt/joker-selling-safety` sont d'anciennes branches dont les commits sont déjà contenus dans la branche active ; **ne pas y développer**. Ne pas les supprimer sans accord du propriétaire.
- Inventaire et justification : [docs/BRANCHES.md](docs/BRANCHES.md).

## Décisions utilisateur à respecter
- **Stop aux nouveaux jokers pour la soirée du 26/11/2026.** Ne pas lancer d'autre lot graphique sans nouvelle demande.
- **Ne jamais remplacer le projet** ni réinitialiser son dépôt. Conserver les sauvegardes sous la clé `contre-pli-v1`, les seeds et les règles de pioche.
- **Ne pas toucher aux neuf positions/cartes de blindes** (grille du casino) ni aux mécaniques sans instruction précise.
- Rendu recherché : jokers comme de **vraies cartes illustrées en pixel art**, inspirées visuellement de Balatro mais **illustrations originales**. Ne pas copier les sprites commerciaux ni se contenter de modifier quelques pixels.
- Jokers : les **5 premiers affichés séparément** ; à partir du 6e, chevauchement progressif. Garder l'interface jouable en paysage sur iPhone 11.
- Les jokers liés à une enseigne pourront recevoir un **symbole intégré dans leur illustration** (♥ cœur, ♦ carreau, ♣ trèfle, ♠ pique). L'utilisateur a approuvé l'idée ; **elle reste à réaliser**, ne pas l'annoncer comme livrée.
- Joker **ADN** : si la *première main jouée d'une blinde* contient **exactement une carte**, celle-ci est copiée avec ses améliorations, définitivement dans le deck **et immédiatement dans la main** ; défausser avant est autorisé.
- Consommables : ce sont des cartes à déplacer au doigt ; un **toucher ouvre les détails**, l'effet ne s'active qu'en appuyant explicitement sur **« Utiliser cette carte »**. Glisser change l'ordre, jamais l'effet. Trois consommables historiques ont des illustrations SVG originales ; les prochains auront besoin de sprites dédiés.

## État du code vérifié
- Deux planches de jokers originales : `art/joker-originals-v1.webp` et `art/joker-originals-v2.webp`, **15 portraits chacune, soit 30 associés à des IDs stables**. Détails : [docs/JOKER_ART.md](docs/JOKER_ART.md). Les autres jokers ont encore des visuels de substitution.
- Entrées, rendu et gestes : `app.mjs` ; logique de jeu : `game.mjs` et `jokers.mjs` ; interface : `style.css` ; cache hors connexion : `sw.js` ; tests : `game.test.mjs`.
- Le service worker utilise le cache `contre-pli-37` à la date de cette note ; actualiser son nom et les versions de `index.html` si nécessaire lorsqu'on change les ressources.
- Aucun essai récent **sur un iPhone physique** ne valide encore l'ensemble du rendu, du swipe des consommables, du hors-ligne et de la bande en haut de l'écran. Ne jamais annoncer ce contrôle comme effectué.
- Le catalogue contient des **jokers prototypes verrouillés** : une entrée dans `jokers.mjs` ne signifie pas que tous ses effets complexes soient jouables. Ne pas les activer sans tests.

## Passation explicite à Codex — 26 novembre 2026

**Avant tout nouveau travail, lire [docs/CODEX_HANDOFF.md](docs/CODEX_HANDOFF.md) et [docs/CODEX_ROUTINE.md](docs/CODEX_ROUTINE.md).** Le premier donne l'état vérifié, les captures comparées, les priorités et les écarts à corriger ; le second est la feuille de contrôles à cocher. L'utilisateur a demandé une passation propre sans nouvelle intervention de code à ce stade. La priorité de la prochaine reprise, après son feu vert, reste l'esthétique des cartes Joker, pas les mécaniques.

## Procédure de reprise
1. Vérifier que la branche active est `codex/contre-pli-ios`, comparer sa tête GitHub avant toute écriture et ne pas changer `main` par défaut.
2. Lire [docs/REPRISE.md](docs/REPRISE.md), [docs/BRANCHES.md](docs/BRANCHES.md) et [docs/JOKER_ART.md](docs/JOKER_ART.md). Les historiques anciens peuvent contenir des descriptions dépassées : donner priorité au code actuel et à cette note.
3. Modifier seulement les fichiers nécessaires ; préserver l'ordre numérique de `jokers` pour ne pas casser les sauvegardes.
4. Exécuter `node --test game.test.mjs` quand un environnement JS est disponible. Tester sur Safari iPhone 11 avant de déclarer un rendu ou un geste validé.
5. Consigner les changements, les tests réellement exécutés et les limites restantes dans [docs/REPRISE.md](docs/REPRISE.md).
6. Ne pas fermer/fusionner la PR #1, supprimer des branches ou modifier le déploiement sans instruction explicite.

## Statut à la fin de la session
Dernier travail de gameplay/visuels : 30 jokers illustrés, consommables déplaçables et confirmation d'utilisation. Rangement documentaire des branches seulement ensuite ; **aucune branche supprimée, aucune fusion**.

## Demandes visuelles confirmées — 28 novembre 2026

L'utilisateur demande à ChatGPT de réaliser les corrections dans le code, et pas seulement de préparer une passation pour Codex. Ces changements concernent **uniquement l'interface** et doivent être réalisés prudemment, sans réécrire le jeu.

1. **Jokers** : les représenter comme de véritables cartes verticales illustrées posées sur la table, avec cadre et éditions visibles, et non comme des boutons de menu. Respecter les portraits originaux et les gestes existants.
2. **Zone des jokers** : un seul conteneur partagé, sobre, affichant les cartes côte à côte avec chevauchement lorsque nécessaire ; compteur de capacité dynamique (base 5, effets négatifs et copies selon les règles déjà codées). Pas de boîtes individuelles dorées.
3. **Zone des consommables** : un seul conteneur partagé, sobre, avec cartes côte à côte et compteur 0/2, 1/2 ou 2/2 selon l'occupation. Conserver l'ouverture des détails au toucher, le déplacement par glissement et l'utilisation seulement après confirmation.
4. **Ambiance** : remplacer les couleurs trop froides par une palette plus chaleureuse, riche et lisible, avec une atmosphère de casino, adaptée au paysage sur iPhone 11.
5. **Enseignes des cartes ordinaires** : affichage quatre couleurs, sans modifier la taille ni la forme des symboles : ♥ rouge, ♦ orange/doré, ♣ vert, ♠ bleu. Appliquer de manière cohérente.
6. **Consultation du paquet** : au clic sur le paquet, montrer les cartes restantes regroupées par enseigne en piles/éventails compacts, avec chevauchement plutôt qu'une grille de cartes isolées. La demande orale précise un « éventail de 2 cartes » ; vérifier le rendu attendu avant d'interpréter ce détail comme une nouvelle règle de jeu.

### Garde-fous de réalisation
- **Ne pas casser ce qui fonctionne** : préserver gameplay, seeds déterministes, sauvegardes `contre-pli-v1`, blindes, carte du casino, boutiques, personnages et interactions.
- Travailler à partir de `codex/contre-pli-ios` ; vérifier le SHA avant écriture, conserver une possibilité de retour arrière, limiter les modifications aux fichiers nécessaires. Ne pas fusionner la PR #1 ni modifier `main`.
- Contrôler les régressions avec `node --test game.test.mjs` si possible et vérifier le rendu sur iPhone 11/Safari avant de déclarer la correction terminée.
- **Statut au moment de cette note : demandes documentées, corrections visuelles non encore appliquées ni validées sur appareil.**
