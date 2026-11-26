# CONTRE-PLI — FEUILLE DE ROUTINE CODEX
**Branche à reprendre : `codex/contre-pli-ios` — pas `main`.**
Lire **`AGENTS.md`** et **`docs/CODEX_HANDOFF.md`** avant de modifier quoi que ce soit.

## 0. Mode de travail
- Faire des **interventions courtes, ciblées, réversibles** ; une intention par commit. Ne pas réécrire l'application en bloc.
- L'utilisateur **veut d'abord des vraies cartes Joker illustrées**. Ne pas passer directement aux effets, aux nouveaux packs ou aux microtransactions.
- Ne pas créer une autre branche, ne pas fusionner la PR #1 ni déployer/configurer Pages sans accord.
- Si la consigne **« pause des nouveaux jokers pour ce soir »** s'applique encore, **ne pas lancer de nouveau lot graphique**. Cette feuille prépare seulement la reprise.
- **Conserver** `contre-pli-v1`, le mode infini en cours, les seeds, l'ordre des jokers, les effets négatifs et polychromes, ADN (copie dans paquet + main), l'Orbite de π, la sélection des 9 blindes, la revente au doigt et les consommables.

## 1. Check-list obligatoire AVANT chaque session
- [ ] Vérifier la branche GitHub actuelle et son dernier commit. **Pas d'autre compte / branche.**
- [ ] Relire les décisions `AGENTS.md`, `docs/CODEX_HANDOFF.md`, `docs/REPRISE.md` et les derniers commits : une note ancienne peut être dépassée.
- [ ] Distinguer **demande vérifiée**, **hypothèse** et **bug reproduit**. Ne pas « corriger » un comportement déjà voulu.
- [ ] Inspecter la vraie source actuelle : `app.mjs`, `joker-art.mjs`, `style.css`, `index.html`, `sw.js`, et les tests si nécessaire.
- [ ] Noter les paramètres de référence : paysage iPhone 11, largeur/hauteur utiles, encoche et Safari, écran de jeu / boutique / pack / casino.
- [ ] Conserver l'état de la partie déjà présente. **Jamais de nouveau run forcé.**

## 2. Check-list de réalisation — priorité Joker
- [ ] Comparer la capture Balatro (Joker comme **vraie carte verticale illustrée**) à la capture Contre-Pli, puis à la **version réellement chargée à tester**.
- [ ] Inspecter le moteur d'illustration SVG `joker-art.mjs` (50×75) et les surcharges CSS ; chercher les détails qui donnent encore l'aspect « pictogramme dans une boîte ».
- [ ] Vérifier que le **dessin occupe la majorité de la carte**, avec cadre cohérent, lisibilité à petite échelle, aspect pixel art, édition négative/polychrome distincte ; éviter des motifs répétitifs présentés comme des portraits uniques.
- [ ] Utiliser des images/sources **autorisées à la redistribution**, même si les visuels de Balatro servent de référence. Ne pas déclarer un sprite original exact si cela n'est pas le cas.
- [ ] Vérifier **inventaire**, **boutique**, **pack Joker**, **détails**, **drag de réorganisation** et **vente au carré** avec la même illustration, sans perte de clic/gestes.
- [ ] **Jokers 1 à 5 : aucune superposition. À partir du 6e : chevauchement progressif** ; rester cliquable et visible même avec beaucoup de négatifs.
- [ ] Vérifier que le fan ne masque pas la partie haute et que le jeu **entier ne se déplace jamais lors du glisser**.
- [ ] Faire valider par le propriétaire une capture réelle de la nouvelle présentation. **Ne pas dire « parfait » ni « identique » avant validation.**

## 3. Contrôles à faire POUR CHAQUE LOT, même purement visuel
- [ ] Examiner le diff : uniquement les fichiers strictement nécessaires ; ne pas toucher à `game.mjs` pour un changement de dessin.
- [ ] Lancer, quand un environnement Node est disponible :
  - `node --check app.mjs`
  - `node --check game.mjs`
  - `node --check joker-art.mjs`
  - `node --test game.test.mjs`
- [ ] Noter le **nombre exact** de tests passés, échoués, ou « non exécutés ». Un ancien « 40 tests OK » n'est pas une preuve pour ce commit.
- [ ] Vérifier liens/version `?v=...` et assets `sw.js` : pas de cache périmé, pas de noms de ressources fantômes.
- [ ] Vérifier que l'ancienne partie reprend sans remise à zéro ; tester boutique → 9 blindes → manche → boutique, et mode infini si possible.
- [ ] Tester un Joker négatif, un polychrome, le drag/reorder, la consultation, la vente, ADN et l'accès au paquet sans demander une nouvelle sauvegarde.
- [ ] Tester jeu paysage Safari iPhone 11 **réel** quand disponible. Sinon dire **« contrôle manuel iPhone non effectué »**.
- [ ] Mettre à jour `docs/REPRISE.md` avec le commit, le but, les fichiers changés, les tests exécutés, le reste à faire.
- [ ] Informer le propriétaire : **ce qui a été réellement modifié, ce qui a été vérifié, ce qui reste imparfait**. Ne pas promettre un déploiement non vérifié.

## 4. Ordre des chantiers APRÈS validation visuelle Joker
- [ ] **Tarot puis Astral/Spectral** : vraies cartes illustrées, catégories honnêtes, packs distincts ; **Bourse n'est pas un Tarot**.
- [ ] **Cartes à jouer** : figures et rangs lisibles (V/D/R/A), main bien aérée, tri et gestes préservés.
- [ ] **HUD** : grand fond central visible ; jokers en haut, consommables à droite, panneau de points à gauche, main/boutons bas compacts, paquet consultable à droite ; pas de scroll global.
- [ ] **Blindes** : reproduire le bug signalé avant de changer quoi que ce soit. Conserver les 9 positions, les chemins et le Skip triple.
- [ ] **Capacité de Jokers** : constater et tester le décalage **5 attendus / 3 codés** ; adapter moteur, boutique, packs, édition négative, Éclipse, compteur et tests dans un chantier **séparé**.
- [ ] **Balatro complet** : inventorier toutes les règles absentes/prototypes, découper les implémentations et valider chaque pouvoir. Ne pas activer des Jokers non finalisés.
- [ ] **Microtransactions, coop, autres Remix** : **reportés**, ne pas les démarrer maintenant.

## 5. Tableau de validation par fonctionnalité
| Fonction | Vérification minimale | État initial de cette passation |
|---|---|---|
| Art Joker | Vraie carte illustrée, lisible en haut et en boutique | `joker-art.mjs` SVG présent ; rendu iPhone non validé |
| Espacement 1–5 / 6+ | 5 séparés, 6+ chevauchés, gestes accessibles | CSS présent ; rendu iPhone non validé |
| Négatif / polychrome | Contrastes + mêmes effets | Existe en code ; retest nécessaire |
| Main | Sélection, score, tri, pioche, pas de scroll page | Existe en code ; retest nécessaire |
| ADN | Copie dans la main ET le deck, seulement 1re main jouée | Mécanique en code ; non-régression obligatoire |
| Boutique/packs | Achats sûrs, Tarot/Joker, choix non perdu | En code ; Astral à compléter |
| Consommables | Taper = voir, bouton explicite = utiliser, glisser = déplacer | En code ; contrôle tactile nécessaire |
| Neuf blindes | Carte 3×3, chemin, Skip triple, boss | En code ; bug utilisateur à reproduire |
| Sauvegarde | Recharger / poursuivre le même run infini | `contre-pli-v1` ; ne jamais réinitialiser |
| Déploiement | Vérifier la version du site, le cache et l'offline | Non validé pour cette passation |

## 6. Exemple de compte rendu, à remplir après chaque lot
### Version / commit :
### Objectif :
### Fichiers modifiés :
### Comportement/visuel changé :
### Tests Node (nombre et résultat) :
### Vérifications Safari iPhone réelles :
### Sauvegarde/seed préservées :
### Cache / site servi effectivement vérifiés :
### Régressions ou limites restantes :
### Demande à l'utilisateur (si un point exige validation) :

**Règle de fin :** quand l'utilisateur dit « pas encore parfait », ce n'est pas un accord de clôture. Corriger seulement ce qu'il désigne, avec validation intermédiaire.
