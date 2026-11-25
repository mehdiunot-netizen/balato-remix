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
