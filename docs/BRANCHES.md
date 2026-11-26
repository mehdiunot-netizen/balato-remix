# État des branches — Contre-Pli
*Vérification GitHub du 26 novembre 2026 ; dépôt `mehdiunot-netizen/balato-remix`.*

## Branche à utiliser
**`codex/contre-pli-ios`** est la branche de travail actuelle. Elle contient les illustrations récentes de 30 jokers, les cartes consommables déplaçables avec confirmation, le système de blindes et les sauvegardes du projet. Continuer sur elle, sans démarrer un développement parallèle.

## Branches à conserver comme historique pour le moment

| Branche | État vérifié par comparaison GitHub | Consigne |
|---|---|---|
| `main` | Branche par défaut, **en retard de 106 commits** sur `codex/contre-pli-ios` au moment de l'inventaire ; la branche active n'est pas en retard sur `main` | Ne pas y travailler ni y fusionner sans validation |
| `codex/contre-pli-ios` | Branche **active**, à jour pour les travaux de ce soir | Unique cible des changements |
| `codex/contre-pli-rebuild` | Ancienne branche, **41 commits derrière** la branche active, avec **0 commit exclusif** | Historique redondant ; candidate à suppression plus tard, seulement avec accord |
| `chatgpt/joker-selling-safety` | Ancienne branche, **93 commits derrière** la branche active, avec **0 commit exclusif** | Historique redondant ; candidate à suppression plus tard, seulement avec accord |

Ces chiffres reflètent les comparaisons faites **avant** la création de cette note ; ils peuvent évoluer après de nouveaux commits. Les deux branches anciennes sont entièrement contenues dans l'historique de la branche active : rien à récupérer ou à fusionner depuis elles.

## Pull request
- **PR #1 — « Contre-Pli, première version solo jouable sur iPhone »** : **ouverte, brouillon**, de `codex/contre-pli-ios` vers `main`.
- Son ancienne description évoquait seulement la première version ; elle ne doit pas être utilisée comme représentation du statut actuel.
- **Ne pas la fusionner**, la déclarer prête ni supprimer la branche de travail avant les contrôles demandés sur iPhone et l'accord explicite du propriétaire.

## Rangement effectué
- Ajout de `AGENTS.md` pour les consignes de continuité des prochains Codex.
- Mise à jour du guide d'accueil et des documents de reprise.
- Aucune suppression de branche, aucun déplacement de ref, aucune fusion. Les anciens noms restent visibles comme archives historiques.

## Prochaine session
Priorités connues et non terminées : vérifier les graphismes réels sur iPhone, finir les portraits de jokers si l'utilisateur le redemande, ajouter les symboles d'enseignes ♥ ♦ ♣ ♠ dans les illustrations des jokers concernés, refaire les sprites de tous les consommables, et vérifier la bande supérieure de l'interface. Ne rien marquer « terminé » sans preuve.
