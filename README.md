# Contre-Pli

Un jeu de cartes solo en français, conçu pour une partie rapide sur iPhone en mode paysage. Les cartes, l’emblème, les jokers et le barème ont été créés pour ce projet.

## Jouer

Servez le dossier avec un serveur statique. Pour tester en local :

```sh
python3 -m http.server 3000
```

Ouvrez http://localhost:3000. Sur iPhone, ouvrez l’adresse HTTPS de votre hébergement statique dans Safari, puis utilisez **Partager → Sur l’écran d’accueil**. Après le premier chargement complet en HTTPS, le jeu peut se lancer hors connexion. La progression est conservée sur l’appareil après chaque action de jeu, si le stockage du navigateur est disponible.

## Objectif

Franchissez huit mises de trois blindes pour gagner, puis poursuivez la même partie en mode infini. Chaque boss applique une contrainte. À chaque blinde, l’objectif tient compte d’une séquence jouable avec la pioche de la seed et les jokers en main. Saisissez une seed avant de jouer pour reproduire la pioche et la boutique en répétant vos décisions. Vous piochez huit cartes et disposez de quatre mains et trois défausses par blinde. Touchez une à cinq cartes pour voir la combinaison et son score avant de la jouer. Entre deux blindes, dépensez vos crédits à la boutique pour équiper jusqu’à trois jokers.

## Tests

```sh
node --test game.test.mjs
```

## Ajouter un joker

Ajoutez une entrée à la fin de `jokers.mjs` pour conserver les identifiants des sauvegardes. Une entrée définit un nom, un symbole, un prix, une description et une fonction `bonus(cartesMarquantes, contexte)`. Le contexte fournit la combinaison, les cartes jouées, les cartes gardées et un indicateur de première main. Retournez `[jetons ajoutés, multiplicateur ajouté, facteur final]`. Le moteur applique les ajouts, puis les facteurs, puis arrondit le score à l’entier inférieur. Les nouvelles entrées apparaissent en boutique dans les nouvelles parties.
