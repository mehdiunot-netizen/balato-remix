# Contre-Pli — Joker portraits, original art
This asset is an original generated pixel-art sheet for Contre-Pli; it is **not** extracted from Balatro.
Image: `art/joker-originals-v1.webp` (300×240 WebP, 5 columns × 3 rows).

Mapped tiles, in row-major order:
1. Boussole
2. Cerf-volant
3. Rose des vents
4. Girouette
5. Ancre
6. Fanion
7. ADN (double helix)
8. Plan (technical blueprint)
9. L’Orbite de π (ringed planet)
10. Balise (lighthouse)
11. Quai de nuit (moonlit pier)
12. Veilleuse (lit window)
13. Écho du quai (echo tunnel)
14. Feu de départ (racetrack and fireworks)
15. Lest (underwater chain/weight)

`app.mjs` maps stable joker numeric IDs to these tiles. Existing jokers not in the first batch
still display the prior symbolic fallback. Keep this mapping stable across save versions.

The negative and polychrome editions use the same art with separate CSS treatments.
Artwork is for visual use only, with no changes to joker effects, blind structure, or saves.


## Second artwork batch (original designs, inspired by retro casino pixel art)

Image: `art/joker-originals-v2.webp` (240×144 WebP, 5 columns × 3 rows).
This is original generated artwork, not a modified copy of Balatro's pixel sprites.

Row-major tile mappings:
1. Chambre d’écho (crystal chamber)
2. Astre souverain (crowned star)
3. Orbe royal (royal crystal globe)
4. Comète d’or (golden meteor)
5. Joker (asymmetric carnival mask)
6. Joker joyeux (laughing gold mask)
7. Joker farfelu (triple purple jester mask)
8. Joker fou (contrasting theater masks)
9. Joker déjanté (spiral jester mask)
10. Joker pince-sans-rire (stone-faced mask)
11. Joker sournois (fox with playing cards)
12. Joker rusé (raven wizard)
13. Joker malin (owl with monocle)
14. Joker retors (serpent around cards)
15. Joker habile (raccoon magician and dice)

The UI chooses the image sheet by stable joker numeric ID, preserving the
original v1 portraits. Remaining jokers retain their symbolic fallback.
The gameplay engine, nine blinds, saves and consumable touch behavior are untouched.

## Dedicated Chambre d’écho artwork
- New original compact portrait: `art/chambre-echo.webp` (56×72 WebP), distinct from the tiny first cell of the v2 sprite sheet.
- `app.mjs` selects this dedicated image only for stable joker ID **13**, in equipped jokers, the shop and joker packs.
- `style.css` uses `.joker-chambre-echo` to show the complete portrait, also in polychrome edition. All other portrait mappings remain unchanged.

## v38 — Full catalogue pixel Joker cards
Every Joker now uses an illustrated 50×75 SVG card via `joker-art.mjs`, including shop and boosters. The frame recreates the look and proportions of a CC0 blank card; the illustrations and colors are original. The source pack used as a design reference is **Jfred — Pixel Cards** (`https://jfredd.itch.io/pixel-cards`), distributed under CC0 1.0. The original ZIP was not imported or redistributed. The matching reusable blank source is `art/joker-blank.svg`.
The original raster sheets remain in the repository for backwards reference; they are not used by the new Joker card component. Numeric Joker IDs, the nine blinds, and save data are unchanged.

## 27 novembre 2026 — quatre portraits détaillés originaux (première reprise)
- Une **planche WebP originale** a été créée pour les quatre Jokers emblématiques. Pour éviter de recopier des sprites commerciaux, elle représente des scènes propres à Contre-Pli, en pixel art coloré avec vrais cadres de cartes.
- Elle est embarquée sous la forme d'un fichier texte module `art/joker-signatures.mjs` (data URI WebP, **128 × 192 px**, 2 colonnes × 2 lignes, **7 584 octets**).
- Correspondance **des ID numériques persistants** : haut gauche **ID 0 = Boussole** ; haut droite **ID 6 = L'Orbite de π** ; bas gauche **ID 14 = ADN** ; bas droite **ID 15 = Plan**. Les autres entrées gardent le générateur de cartes `joker-art.mjs`.
- `joker-art.mjs` choisit ces nouvelles cartes pour les Jokers équipés, la boutique, les packs et les détails. Le moteur et les sauvegardes sont inchangés.
- Références de chargement : `joker-art.mjs?v=3`, `art/joker-signatures.mjs?v=1`, `app.mjs?v=38`, cache `contre-pli-43`.
- **Vérifié :** intégrité de l'image encodée (CRC32 **3370559233**, égal au fichier généré), compatibilité syntaxique et exécution d'un rendu d'un Joker iconique et d'un Joker normal avec retour SVG.
- **Non vérifié :** résultat sur Safari iPhone physique, ressenti visuel de l'utilisateur, suite `node --test game.test.mjs`, déploiement de la branche sur GitHub Pages.
- **Suite :** comparer l'apparence réelle aux deux captures de référence et attendre validation du style avant de remplacer les illustrations du reste du catalogue. La qualité doit primer sur la quantité.
