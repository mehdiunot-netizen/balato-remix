# CONTRE-PLI — PASSATION À CODEX
**État de la passation : 26 novembre 2026, soirée (Europe/Paris).**
**Objectif de ce document :** transmettre les décisions vérifiées, les constats de code et les tâches à venir. Ce document n'est **pas** une validation du jeu, ni une demande de refonte globale.
**À lire dans cet ordre :** `AGENTS.md` → `docs/CODEX_HANDOFF.md` (ici) → `docs/CODEX_ROUTINE.md` → `docs/REPRISE.md` → `docs/BRANCHES.md` → `docs/JOKER_ART.md` → code source.

## 1. Où intervenir — règles non négociables
- Compte / dépôt **mehdiunot-netizen/balato-remix**.
- Branche de travail **codex/contre-pli-ios**, en continu : **ne pas créer une autre branche**, ne pas écrire sur `main` et ne pas fusionner la PR #1 (brouillon) sans demande expresse.
- Jeu Web/PWA pour **iPhone 11 en mode paysage**, zéro coût de développement ; page utilisée par l'utilisateur : https://mehdiunot-netizen.github.io/balato-remix/ . **Ne pas supposer que chaque commit de la branche active est effectivement servi sur cette URL** : contrôler la configuration de GitHub Pages et les fichiers chargés.
- **Aucun changement de moteur ou de graphisme effectué par cette passation.** Seuls les deux documents et leur référencement documentaire sont ajoutés.
- La sauvegarde active de l'utilisateur a une grande valeur : clé localStorage **`contre-pli-v1`**, format version 1. **Jamais de reset, de changement de clé, de purge du cache utilisateur, de réinitialisation de partie ni de remplacement du projet.** Conserver la partie en mode infini, les éditions, copies, consommables, ajouts de cartes et ordre de jokers.
- Ne pas réordonner/supprimer les entrées de `jokers.mjs` : les ID numériques sont inscrits dans les sauvegardes. Préserver seeds et tirages déterministes, et le joker signature **L'Orbite de π** (multiplicateur final × Math.PI ; score arrondi à l'inférieur).
- **Ne pas changer les 9 cases/chemins des blindes**, leurs Skip et leurs récompenses pour faire du travail esthétique. L'utilisateur a signalé à un moment « les blindes, tu me les as cassées » : c'est **un signalement à reproduire et qualifier**, pas une preuve qu'un bug précis a été identifié. Il a ensuite insisté : **l'esthétique d'abord**.
- La consigne de `AGENTS.md` est de **ne pas lancer un nouveau lot de jokers pendant cette soirée sans demande**. Cette passation prépare la reprise de Codex ; elle n'autorise pas à travailler en tâche de fond.

## 2. Source de vérité / attentes de l'utilisateur
**Deux captures fournies le 26/11 dans la conversation :**
1. Référence **Balatro** (1536×710) : un vrai Joker illustré, deux Tarots illustrés à droite, zone verte centrale très aérée, main de 8 cartes en éventail en bas, pioche à droite, panneau statistiques à gauche, boutons bas compacts.
2. Capture **Contre-Pli** (1536×710) : interface proche géométriquement mais jokers représentés comme de petites vignettes/rectangles, consommables dorés peu illustrés, proportions et textures différentes, bande sombre importante en haut de la capture.

**Diagnostic exprimé par l'utilisateur :** « les jokers, c'est toujours pas des vraies cartes » ; la différence avec Balatro est « flagrante ». Ne pas répondre que « tout est parfait » ou que le simple rectangle avec icône est terminé. Le code a évolué depuis les captures : les images ne prouvent pas l'apparence du dernier commit ; **il faut retester et comparer la version effectivement chargée**.

**Ordre explicitement demandé :** 1) l'apparence des **jokers**, 2) le reste de l'esthétique (Tarot/Astral, cartes à jouer, HUD/espacement), 3) corrections fonctionnelles constatées, 4) intégralité des mécaniques Balatro/Remix et monétisation **beaucoup plus tard**. Ne pas privilégier l'ajout de nouvelles cartes/effets tant que le visuel est insatisfaisant.

**Recherche de visuels :** l'utilisateur souhaite « les mêmes que Balatro » et signale que les images sont sur Internet. Il faut documenter honnêtement la différence entre consulter ces images comme **référence visuelle** et avoir l'autorisation de **redistribuer les sprites originaux du jeu** dans un dépôt public. Ne jamais importer des graphismes commerciaux sans licence/autorisation explicite. Si les assets exacts ne peuvent pas être légalement utilisés, le dire au propriétaire et proposer un visuel original de qualité comparable, **sans présenter une substitution comme identique**. `joker-art.mjs` utilise actuellement un modèle de carte 50×75 inspiré d'une carte vierge CC0 (voir `docs/JOKER_ART.md`).

## 3. État du code constaté pour cette passation
- `index.html` référence **`style.css?v=38`** et **`app.mjs?v=34`**. Le `sw.js` lu lors de la préparation indique le cache **`contre-pli-39`** et précharge notamment `game.mjs?v=28`, `jokers.mjs?v=24`, `joker-art.mjs?v=1`. Ces numéros sont des **observations à recontrôler**, pas des vérités immuables.
- `app.mjs` importe `jokerArtwork` depuis `joker-art.mjs` et affiche aujourd'hui des **cartes Joker SVG originales 50×75**, dans l'inventaire, les boutiques et les packs. `style.css` possède des règles `.joker-made-card`, `.joker-pixel-svg` et l'historique de styles v19–v38. Ne pas repartir du principe qu'il n'y a que des symboles : examiner **la dernière version sur iPhone** et améliorer le rendu sans réintroduire les mini-vignettes.
- Deux anciennes planches d'images (`art/joker-originals-v1.webp`, `art/joker-originals-v2.webp`) et un portrait `art/chambre-echo.webp` restent dans le dépôt ; le journal `docs/JOKER_ART.md` indique que la variante v38 utilise `joker-art.mjs` plutôt que ces planches. Éviter d'empiler trois systèmes graphiques actifs.
- Le moteur `game.mjs` conserve **une limite d'achat de 3 jokers non négatifs** à plusieurs endroits (`buy`, pack Joker, Éclipse). **Mais la demande utilisateur pour la présentation et la règle de base est 5 jokers** ; le CSS tente déjà d'afficher 5 sans chevauchement. **Incohérence majeure à traiter explicitement après priorité visuelle**, avec tests et contrôle des sauvegardes ; ne pas la corriger furtivement lors d'une retouche CSS.
- `game.mjs` définit **3 packs Tarot** (3/5/6 choix), **2 packs Joker** (2/4 choix avec 1 joker à choisir) ; pas d'implémentation complète des packs **Astral/Spectral** de Balatro confirmée. Les Tarots présents restent des **améliorations originales limitées** ; ne pas les présenter comme l'intégralité des Tarots Balatro.
- `Bourse` est un **consommable original de crédit**, **pas un effet de Tarot Balatro**. L'utilisateur l'a signalé. Ne pas le ranger sous « Tarot » ; clarifier catégories/noms, sans supprimer de sauvegardes historiques (`relance`, `souffle`).
- `ADN` : sur la première main **jouée** d'une blinde, avec **une seule carte**, génère une copie permanente dans le deck **et immédiatement dans la main**. Une défausse préalable ne doit pas consommer son déclenchement. Les copies et éditions doivent suivre la carte source.
- Personnages, éditions négative/polychrome, copies de jokers (Plan/Blueprint), ordre/revente par glisser, détails des jokers, consommables déplaçables puis action confirmée, bouton d'inspection du paquet et tri de la main existent en code ; éviter de casser ces gestes pour gagner quelques pixels.
- Le fichier `jokers.mjs` contient des prototypes de pouvoirs complexes : la présence d'un nom dans le catalogue ne prouve pas que son pouvoir est opérationnel. Garder les prototypes verrouillés tant que l'évaluation et les effets de phases ne sont pas testés.
- `docs/REPRISE.md` a des historiques de versions parfois contradictoires (par ex. ancien mode à 3 cartes de blinde contre grille de 9), donc **code actuel + décisions utilisateur récentes** priment.
- Suite existante : `node --test game.test.mjs` ; **aucune exécution de tests ni validation physique iPhone n'a été effectuée au cours de cette passation**.

## 4. Backlog ordonné — actions attendues de Codex
### P0 — Visuels des Jokers : seul chantier graphique prioritaire
1. Recharger la branche actuelle, examiner `joker-art.mjs`, `app.mjs`, `style.css`, les assets et les captures de référence. Faire **un état des lieux avant modification** : cartes équipées, carte négative/polychrome, boutique, pack Joker, dialogue détail et drag/reorder/vendre.
2. Rendre chaque Joker **reconnaissable comme une véritable carte illustrée sur toute sa surface**, cadre et proportions cohérents, art lisible en petit format paysage. Une décoration répétée ou un gros pictogramme au centre ne suffit pas. Respecter des œuvres originales ou des assets autorisés (cf. `2`).
3. Conserver l'art actuel fonctionnel jusqu'à vérification d'une amélioration réelle. Optimiser le rendu sur iPhone 11 (Safari, taille, contrastes, figures et lettrage, pas de coupure en haut).
4. **5 premiers jokers côte à côte, non superposés ; à partir du 6e, chevauchement progressif**. Un joker reste consultable et déplaçable malgré le recouvrement ; gérer beaucoup de jokers négatifs sans couper les derniers. Éviter un swipe de **tout l'écran** : si défilement nécessaire, uniquement dans un composant explicitement prévu.
5. Les jokers affiliés à un symbole d'enseigne (♥ ♦ ♣ ♠) doivent, plus tard, l'afficher **dans l'illustration**, idée approuvée mais non réalisée. Ne pas déclarer ce point achevé sans images vérifiées.
6. Pas de nouveaux lots graphiques pendant la pause demandée ce soir ; préparer le travail et attendre l'instruction de reprise.

**Critère d'acceptation P0 :** l'utilisateur ouvre la dernière version sur iPhone 11, reconnaît des **cartes Joker illustrées** comparables en présence visuelle à sa capture Balatro, voit les cartes non recouvertes jusqu'à 5, teste toucher, glisser, ordre, vente et éditions. Seul l'utilisateur valide le rendu.

### P1 — Autres visuels, seulement après accord P0
- Tarots et Astrals/Spectraux : vraies **cartes illustrées** et packs clairement identifiés, pas de cases dorées vides ; distinguer Tarot / Astral / consommable original / buff.
- Main : proportions et lisibilité des 8 cartes, figures V/D/R/As en coin **au-dessus de l'image**, lettre du bas correctement recouverte par l'angle si souhaité ; conserver tri Valeur/Couleur, sélection de 1 à 5 cartes.
- HUD : réutiliser au mieux les proportions de la référence : panneau scores à gauche, jokers en haut, consommables à droite, **grand fond visible**, cartes et actions basses, pioche cliquable affichant les vraies cartes du deck. Petits boutons « Jouer la main » / « Défausser », lisibles et faciles à toucher. **Pas de page qui glisse/swipe** en jouant ; contrôler la bande vide supérieure et les encoches/safe areas.
- Ne pas toucher au fond/à l'identité du projet sans vérifier que le propriétaire préfère la nouvelle version.

### P2 — Bugs/écarts fonctionnels à diagnostiquer APRÈS P0/P1, un par un
- Signalement « les blindes sont cassées » : reproduire sur le chemin de 9 cases (3 colonnes × 3 rangées), choix de salle, itinéraire, Skip triple, boss, shop → casino → manche, sauvegarde en mode infini. **Ne pas supprimer cette mécanique** ; demander quel écran/gestuelle pose problème si impossible à reproduire.
- Limite joker **3 en logique / 5 attendus** : définir une constante testée ; adapter achats, packs Joker, Éclipse, compteurs et négatifs sans perdre de parties.
- Bourse : ne pas confondre avec Tarot ; clarifier la présentation par catégorie.
- Vérifier qu'un joker acquis est bien visible avec ses éditions et ses pouvoirs ; vérifier l'effet des packs et l'actualisation du cache/service worker.
- Après accord de l'utilisateur seulement : catalogue complet Balatro fonctionnel, vrais Tarots/Astrals, scoring par ordre des déclenchements, boss, économie et événements. **Ne pas promettre que tout fonctionne parce que les entrées existent.**

### P3 — Hors périmètre immédiat
- Microtransactions/monétisation : **explicitement reportées à plus tard**.
- Coop, échanges et autres systèmes Remix : consignes historiques dans `docs/REPRISE.md` ; **ne pas commencer pendant le chantier graphique**.
- Nouvelle branche, fusion ou refonte totale : **interdit sans décision utilisateur**.

## 5. Fichiers et contraintes d'implémentation
| Élément | Emplacement | Attention |
|---|---|---|
| Interfaces/touch, cartes et jokers | `app.mjs` | Gestion pointer/tap/drag, aperçu du score, rendu DOM |
| Carte de Joker SVG actuelle | `joker-art.mjs` | Identifiants/rendus 50×75 originaux ; ne pas copier de sprite Balatro |
| Disposition et versions visuelles | `style.css` | Long historique de surcharges CSS ; viser la cascade finale, nettoyer prudemment |
| Score, blindes, boutique, packs, sauvegarde | `game.mjs` | Stable, seed déterministe ; changements seulement lorsque demandés et testés |
| Catalogue de jokers | `jokers.mjs` | ID numériques persistants ; prototypes non finis |
| Référencement et dialogues | `index.html` | Mise à jour des ?v quand CSS/JS bougent |
| Hors connexion et cache | `sw.js` | Bump du cache et cohérence exacte des ressources |
| Tests | `game.test.mjs` | Ajouter tests ciblés, exécuter suite complète |
| Suivi documentaire | `AGENTS.md`, `docs/REPRISE.md`, `docs/JOKER_ART.md`, ce dossier | Journal honnête, pas d'affirmation non testée |

## 6. Critères de sortie / restitution au propriétaire
Un lot est terminé seulement si : diff limité au périmètre ; seed et sauvegarde inchangées ; tests pertinents réellement passés ; pas de régression visible en boutique/manche/9 blindes ; rendu iPhone **vérifié ou explicitement « non vérifié »** ; versions CSS/JS/PWA cohérentes ; liste des actions faites et des défauts restants. Ne pas imposer une nouvelle partie pour voir les modifications. Ne pas annoncer « en ligne » sans vérification.
**Message de reprise à Codex :** « Lis AGENTS.md et les deux documents de passation. Vérifie l'état exact de codex/contre-pli-ios. Priorité esthétique Joker, sans refonte ni changement de mécaniques. Suis la feuille de routine, montre le résultat réel sur iPhone avant de demander validation. »
