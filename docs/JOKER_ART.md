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
