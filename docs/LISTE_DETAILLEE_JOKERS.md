# Inventaire détaillé des jokers présents dans Contre-Pli

Extraction du code de `jokers.mjs`, branche `codex/contre-pli-ios`, 28 novembre 2026.

**Portée :** 73 entrées Balatro explicitement définies par les fonctions `indep/scored/held`, et 14 jokers originaux Contre-Pli. Ce n'est **pas** encore la liste exhaustive des 150 jokers Balatro : les entrées générées autrement et les absents restent à auditer. Les noms sont ceux actuellement dans le code, **pas** des nouveaux noms définitifs. Les descriptions sont celles du code et n'attestent pas de l'exactitude vis-à-vis de Balatro.

## Jokers inspirés de Balatro présents dans le code (73)

| # | Clé interne | Nom actuel | Prix | Effet déclaré |
|---:|---|---|---:|---|
| 1 | `balatro-joker` | Joker | 2 | +4 au multiplicateur. |
| 2 | `jolly` | Joker joyeux | 3 | +8 au multiplicateur si la main contient une paire. |
| 3 | `zany` | Joker farfelu | 4 | +12 au multiplicateur si la main contient un brelan. |
| 4 | `mad` | Joker fou | 4 | +10 au multiplicateur si la main contient deux paires. |
| 5 | `crazy` | Joker déjanté | 4 | +12 au multiplicateur si la main contient une suite. |
| 6 | `droll` | Joker pince-sans-rire | 4 | +10 au multiplicateur si la main contient une couleur. |
| 7 | `sly` | Joker sournois | 3 | +50 jetons avec une paire. |
| 8 | `wily` | Joker rusé | 4 | +100 jetons avec un brelan. |
| 9 | `clever` | Joker malin | 4 | +80 jetons avec deux paires. |
| 10 | `devious` | Joker retors | 4 | +100 jetons avec une suite. |
| 11 | `crafty` | Joker habile | 4 | +80 jetons avec une couleur. |
| 12 | `half-joker` | Demi-joker | 5 | +20 au multiplicateur si tu joues au plus trois cartes. |
| 13 | `banner` | Bannière | 5 | +30 jetons par défausse restante. |
| 14 | `mystic-summit` | Sommet mystique | 5 | +15 au multiplicateur quand il ne reste aucune défausse. |
| 15 | `abstract` | Joker abstrait | 4 | +3 au multiplicateur par joker possédé. |
| 16 | `blue-joker` | Joker bleu | 5 | +2 jetons par carte encore dans la pioche. |
| 17 | `bull` | Taureau | 6 | +2 jetons par crédit possédé. |
| 18 | `bootstraps` | Lacets | 7 | +2 au multiplicateur par tranche de 5 crédits possédés. |
| 19 | `stencil` | Pochoir | 8 | ×1 par emplacement de joker vide (les Pochoirs comptent comme vides). |
| 20 | `swashbuckler` | Bretteur | 4 | +1 au multiplicateur par crédit de valeur de vente des autres jokers. |
| 21 | `card-sharp` | Carte affûtée | 6 | ×3 si tu as déjà joué cette combinaison dans la blinde. |
| 22 | `supernova` | Supernova | 5 | +1 au multiplicateur par fois où cette combinaison a été jouée dans la partie. |
| 23 | `erosion` | Érosion | 6 | +4 au multiplicateur par carte manquante sous les 52 cartes de départ. |
| 24 | `misprint` | Erreur d’impression | 4 | Entre +0 et +23 au multiplicateur, déterminé pour chaque main. |
| 25 | `blackboard` | Tableau noir | 6 | ×3 si toutes les cartes gardées sont des piques ou trèfles. |
| 26 | `flower-pot` | Pot de fleurs | 6 | ×3 si les quatre enseignes sont présentes parmi les cartes marquantes. |
| 27 | `seeing-double` | Double vision | 6 | ×2 si les cartes marquantes comprennent un trèfle et une autre enseigne. |
| 28 | `acrobat` | Acrobate | 6 | ×3 lors de la dernière main disponible de la blinde. |
| 29 | `duo` | Le Duo | 8 | ×2 si la main contient une paire. |
| 30 | `trio` | Le Trio | 8 | ×3 si la main contient un brelan. |
| 31 | `family` | La Famille | 8 | ×4 si la main contient un carré. |
| 32 | `order` | L’Ordre | 8 | ×3 si la main contient une suite. |
| 33 | `tribe` | La Tribu | 8 | ×2 si la main contient une couleur. |
| 34 | `baseball-card` | Carte de baseball | 8 | ×1,5 par joker peu commun possédé. |
| 35 | `steel-joker` | Joker d’acier | 7 | ×0,2 de multiplicateur supplémentaire par carte Armure du paquet. |
| 36 | `stone-joker` | Joker de pierre | 6 | +25 jetons par carte Pierre du paquet. |
| 37 | `drivers-license` | Permis | 7 | ×3 avec au moins 16 cartes améliorées dans le paquet. |
| 38 | `fortune-teller` | Voyante | 6 | +1 au multiplicateur par Tarot utilisé dans la partie. |
| 39 | `green-joker` | Joker vert | 4 | Gagne +1 au multiplicateur par main jouée, perd 1 par défausse. |
| 40 | `ride-the-bus` | Prendre le bus | 6 | +1 au multiplicateur par main sans figure marquante ; remis à zéro sinon. |
| 41 | `square-joker` | Joker carré | 4 | Gagne +4 jetons par main jouée avec exactement quatre cartes. |
| 42 | `spare-trousers` | Pantalon de rechange | 6 | Gagne +2 au multiplicateur par main contenant deux paires. |
| 43 | `runner` | Coureur | 5 | Gagne +15 jetons à chaque suite jouée. |
| 44 | `hologram` | Hologramme | 7 | Gagne ×0,25 au multiplicateur par carte ajoutée au paquet. |
| 45 | `red-card` | Carte rouge | 5 | Gagne +3 au multiplicateur par pochette passée. |
| 46 | `ramen` | Ramen | 6 | ×2 au départ, perd ×0,01 par carte défaussée. |
| 47 | `popcorn` | Pop-corn | 5 | +20 au multiplicateur, perd 4 après chaque blinde. |
| 48 | `ice-cream` | Glace | 5 | +100 jetons, perd 5 à chaque main jouée. |
| 49 | `loyalty-card` | Carte de fidélité | 5 | ×4 chaque sixième main jouée. |
| 50 | `flash-card` | Carte flash | 5 | Gagne +2 au multiplicateur à chaque relance de boutique. |
| 51 | `campfire` | Feu de camp | 9 | Gagne ×0,25 par carte vendue ; revient à ×1 après un boss. |
| 52 | `yorick` | Yorick | 20 | Gagne ×1 chaque fois que 23 cartes sont défaussées. |
| 53 | `canio` | Canio | 20 | Gagne ×1 lorsqu’une figure est détruite. |
| 54 | `greedy` | Joker avide | 5 | +3 au multiplicateur par carreau marquant. |
| 55 | `lusty` | Joker passionné | 5 | +3 au multiplicateur par cœur marquant. |
| 56 | `wrathful` | Joker furieux | 5 | +3 au multiplicateur par pique marquant. |
| 57 | `gluttonous` | Joker gourmand | 5 | +3 au multiplicateur par trèfle marquant. |
| 58 | `even-steven` | Pair gagnant | 4 | +4 au multiplicateur pour les rangs pairs marquants. |
| 59 | `odd-todd` | Impair gagnant | 4 | +31 jetons pour les rangs impairs marquants (As inclus). |
| 60 | `fibonacci` | Fibonacci | 8 | +8 au multiplicateur par As, 2, 3, 5 ou 8 marquant. |
| 61 | `scholar` | Érudit | 4 | Chaque As marquant donne +20 jetons et +4 au multiplicateur. |
| 62 | `scary-face` | Visage effrayant | 4 | Chaque figure marquante rapporte +30 jetons. |
| 63 | `smiley-face` | Visage souriant | 4 | +5 au multiplicateur par figure marquante. |
| 64 | `walkie-talkie` | Talkie-walkie | 4 | Chaque 10 et 4 marquant apporte +10 jetons et +4 au multiplicateur. |
| 65 | `arrowhead` | Pointe de flèche | 7 | +50 jetons par pique marquant. |
| 66 | `onyx-agate` | Agate | 7 | +7 au multiplicateur par trèfle marquant. |
| 67 | `rough-gem` | Gemme brute | 7 | Gagne 1 crédit par carreau marquant. |
| 68 | `triboulet` | Triboulet | 20 | Chaque Roi ou Dame marquant donne ×2 au multiplicateur. |
| 69 | `photograph` | Photographie | 5 | ×2 au multiplicateur pour la première figure qui marque. |
| 70 | `bloodstone` | Pierre de sang | 7 | Une chance sur deux de ×1,5 par cœur marquant. |
| 71 | `baron` | Baron | 8 | Chaque Roi conservé en main donne ×1,5 au multiplicateur. |
| 72 | `shoot-the-moon` | Viser la Lune | 5 | Chaque Dame conservée en main donne +13 au multiplicateur. |
| 73 | `raised-fist` | Poing levé | 5 | La plus petite carte gardée en main donne deux fois son rang au multiplicateur. |

## Jokers originaux Contre-Pli (14)

| # | Nom | Prix | Effet déclaré |
|---:|---|---:|---|
| 1 | Boussole | 4 | +20 jetons à chaque main. |
| 2 | Cerf-volant | 5 | +3 au multiplicateur à chaque main. |
| 3 | Rose des vents | 5 | +6 au multiplicateur si les cartes marquantes couvrent 3 ou 4 enseignes. |
| 4 | Girouette | 6 | ×2 au multiplicateur si cinq cartes marquent. |
| 5 | Ancre | 4 | +40 jetons si exactement deux cartes marquent. |
| 6 | Fanion | 4 | +2 au multiplicateur par cœur marquant. |
| 7 | L’Orbite de π | 7 | Multiplie le multiplicateur final par π. Le score est arrondi à l’entier inférieur. |
| 8 | Balise | 5 | +9 jetons par carreau marquant. |
| 9 | Quai de nuit | 5 | +3 au multiplicateur par pique marquant. |
| 10 | Veilleuse | 6 | +2 au multiplicateur par figure gardée en main. |
| 11 | Écho du quai | 6 | Chaque 2, 3 ou 4 marquant ajoute ses jetons une seconde fois. |
| 12 | Feu de départ | 6 | ×1,75 au multiplicateur final lors de la première main jouée de chaque blinde. |
| 13 | Lest | 5 | +35 jetons si au moins deux cartes jouées ne marquent pas. |
| 14 | Chambre d’écho | 6 | +5 au multiplicateur pour un full ou une double paire. |

## Travail restant avant intégration exhaustive

- Reconstituer les 150 correspondances individuelles Balatro, sans confondre nouveaux jokers et jokers déjà adaptés.
- Renommer chaque joker de manière originale en conservant les identifiants numériques sauvegardés.
- Détailler les 52 consommables, 32 bons, 15 decks, 28 boss, 24 tags et les autres familles dans des tableaux similaires.
- Comparer chaque effet à une source de référence, implémenter les manquants et tester les interactions.
- Ne jamais considérer cette extraction documentaire comme une validation des effets ni une publication de gameplay complet.
