export const cardChips = card => Math.min(card.rank, 11);
export const matchesSuit = (card, suit) => card.augure === 'wild' || card.suit === suit;

function coveredSuits(cards) {
  const fixed = new Set(cards.filter(card => card.augure !== 'wild').map(card => card.suit));
  return Math.min(4, fixed.size + cards.filter(card => card.augure === 'wild').length);
}

// Append entries to preserve the numeric identifiers stored in saves.
export const jokers = [
  { name: 'Boussole', mark: '✦', price: 4, text: '+20 jetons à chaque main.',
    bonus: () => [20, 0, 1] },
  { name: 'Cerf-volant', mark: '◇', price: 5, text: '+3 au multiplicateur à chaque main.',
    bonus: () => [0, 3, 1] },
  { name: 'Rose des vents', mark: '✳', price: 5, text: '+6 au multiplicateur si les cartes marquantes couvrent 3 ou 4 enseignes.',
    bonus: cards => [0, coveredSuits(cards) >= 3 ? 6 : 0, 1] },
  { name: 'Girouette', mark: '➶', price: 6, text: '×2 au multiplicateur si cinq cartes marquent.',
    bonus: cards => [0, 0, cards.length === 5 ? 2 : 1] },
  { name: 'Ancre', mark: '⚓︎', price: 4, text: '+40 jetons si exactement deux cartes marquent.',
    bonus: cards => [cards.length === 2 ? 40 : 0, 0, 1] },
  { name: 'Fanion', mark: '⚑', price: 4, text: '+2 au multiplicateur par cœur marquant.',
    bonus: cards => [0, 2 * cards.filter(c => matchesSuit(c, '♥')).length, 1] },
  { name: 'L’Orbite de π', mark: 'π', price: 7, theme: 'orbit', text: 'Multiplie le multiplicateur final par π. Le score est arrondi à l’entier inférieur.',
    bonus: () => [0, 0, Math.PI] },
  { name: 'Balise', mark: '◉', price: 5, text: '+9 jetons par carreau marquant.',
    bonus: cards => [9 * cards.filter(c => matchesSuit(c, '♦')).length, 0, 1] },
  { name: 'Quai de nuit', mark: '☾', price: 5, text: '+3 au multiplicateur par pique marquant.',
    bonus: cards => [0, 3 * cards.filter(c => matchesSuit(c, '♠')).length, 1] },
  { name: 'Veilleuse', mark: '✧', price: 6, text: '+2 au multiplicateur par figure gardée en main.',
    bonus: (_, { held }) => [0, 2 * held.filter(c => c.rank >= 11 && c.rank <= 13).length, 1] },
  { name: 'Écho du quai', mark: '≋', price: 6, text: 'Chaque 2, 3 ou 4 marquant ajoute ses jetons une seconde fois.',
    bonus: cards => [cards.filter(c => c.rank <= 4).reduce((sum, c) => sum + cardChips(c), 0), 0, 1] },
  { name: 'Feu de départ', mark: '✹', price: 6, text: '×1,75 au multiplicateur final lors de la première main jouée de chaque blinde.',
    bonus: (_, { firstPlay }) => [0, 0, firstPlay ? 1.75 : 1] },
  { name: 'Lest', mark: '▣', price: 5, text: '+35 jetons si au moins deux cartes jouées ne marquent pas.',
    bonus: (cards, { played }) => [played.length - cards.length >= 2 ? 35 : 0, 0, 1] },
  { name: 'Chambre d’écho', mark: '◈', price: 6, text: '+5 au multiplicateur pour un full ou une double paire.',
    bonus: (_, { name }) => [0, name === 'Full' || name === 'Double paire' ? 5 : 0, 1] },
];

// Additional original starting and legendary jokers; keep prior indices stable.
jokers.push(
  { key: 'adn', name: 'ADN', mark: '⌘', price: 8,
    text: 'Si la première main de la blinde ne joue qu’une seule carte, ajoute une copie permanente au paquet et la place immédiatement dans ta main.',
    bonus: () => [0, 0, 1] },
  { key: 'plan', name: 'Plan', mark: '▤', price: 9, copyNext: true,
    text: 'Copie le bonus du joker placé immédiatement à sa droite.',
    bonus: () => [0, 0, 1] },
  { key: 'astre', legendary: true, name: 'Astre souverain', mark: '★', price: 15,
    text: 'Joker légendaire · multiplie le multiplicateur final par 2.',
    bonus: () => [0, 0, 2] },
  { key: 'orbe', legendary: true, name: 'Orbe royal', mark: '✷', price: 15,
    text: 'Joker légendaire · +12 au multiplicateur sur chaque main.',
    bonus: () => [0, 12, 1] },
  { key: 'comete', legendary: true, name: 'Comète d’or', mark: '☄', price: 15,
    text: 'Joker légendaire · +70 jetons à chaque main.',
    bonus: () => [70, 0, 1] },
);


// Balatro-inspired mechanical catalogue (original Contre-Pli icons, no imported art).
// All additions are appended to preserve numeric joker IDs in existing saves.
const neutralBonus = () => [0, 0, 1];
const markFor = (rarity, kind) => kind === 'scored' ? '✦' : kind === 'held' ? '◆' :
  rarity === 'legendary' ? '★' : rarity === 'rare' ? '✷' : '◇';
const addBalatro = (key, name, price, text, props = {}, rarity = 'common') => {
  // These prototype definitions are not offered until their complex effects
  // (retrigger/copy/held-card sequencing) are implemented and regression-tested.
  jokers.push({ key, name, mark: markFor(rarity, props.scoredBonus ? 'scored' : props.heldBonus ? 'held' : ''),
    price, text, rarity, prototype: true, bonus: neutralBonus, ...props });
};
const indep = (key, name, price, text, bonus, rarity = 'common') =>
  addBalatro(key, name, price, text, { bonus }, rarity);
const scored = (key, name, price, text, scoredBonus, rarity = 'common') =>
  addBalatro(key, name, price, text, { scoredBonus }, rarity);
const held = (key, name, price, text, heldBonus, rarity = 'common') =>
  addBalatro(key, name, price, text, { heldBonus }, rarity);
const has = (ctx, type) => Boolean(ctx.contains?.[type]);

// Independent jokers: their payouts apply in joker order after scored/held cards.
indep('balatro-joker', 'Joker', 2, '+4 au multiplicateur.', () => [0, 4, 1]);
indep('jolly', 'Joker joyeux', 3, '+8 au multiplicateur si la main contient une paire.', (_, c) => [0, has(c,'pair') ? 8 : 0, 1]);
indep('zany', 'Joker farfelu', 4, '+12 au multiplicateur si la main contient un brelan.', (_, c) => [0, has(c,'three') ? 12 : 0, 1]);
indep('mad', 'Joker fou', 4, '+10 au multiplicateur si la main contient deux paires.', (_, c) => [0, has(c,'twoPair') ? 10 : 0, 1]);
indep('crazy', 'Joker déjanté', 4, '+12 au multiplicateur si la main contient une suite.', (_, c) => [0, has(c,'straight') ? 12 : 0, 1]);
indep('droll', 'Joker pince-sans-rire', 4, '+10 au multiplicateur si la main contient une couleur.', (_, c) => [0, has(c,'flush') ? 10 : 0, 1]);
indep('sly', 'Joker sournois', 3, '+50 jetons avec une paire.', (_, c) => [has(c,'pair') ? 50 : 0, 0, 1]);
indep('wily', 'Joker rusé', 4, '+100 jetons avec un brelan.', (_, c) => [has(c,'three') ? 100 : 0, 0, 1]);
indep('clever', 'Joker malin', 4, '+80 jetons avec deux paires.', (_, c) => [has(c,'twoPair') ? 80 : 0, 0, 1]);
indep('devious', 'Joker retors', 4, '+100 jetons avec une suite.', (_, c) => [has(c,'straight') ? 100 : 0, 0, 1]);
indep('crafty', 'Joker habile', 4, '+80 jetons avec une couleur.', (_, c) => [has(c,'flush') ? 80 : 0, 0, 1]);
indep('half-joker', 'Demi-joker', 5, '+20 au multiplicateur si tu joues au plus trois cartes.', (_, c) => [0, c.played.length <= 3 ? 20 : 0, 1]);
indep('banner', 'Bannière', 5, '+30 jetons par défausse restante.', (_, c) => [30 * (c.discards ?? 0), 0, 1]);
indep('mystic-summit', 'Sommet mystique', 5, '+15 au multiplicateur quand il ne reste aucune défausse.', (_, c) => [0, c.discards === 0 ? 15 : 0, 1]);
indep('abstract', 'Joker abstrait', 4, '+3 au multiplicateur par joker possédé.', (_, c) => [0, 3 * (c.ownedCount ?? 0), 1], 'uncommon');
indep('blue-joker', 'Joker bleu', 5, '+2 jetons par carte encore dans la pioche.', (_, c) => [2 * (c.pileCount ?? 0), 0, 1]);
indep('bull', 'Taureau', 6, '+2 jetons par crédit possédé.', (_, c) => [2 * Math.max(0,c.credits ?? 0), 0, 1], 'uncommon');
indep('bootstraps', 'Lacets', 7, '+2 au multiplicateur par tranche de 5 crédits possédés.', (_, c) => [0, 2 * Math.floor(Math.max(0,c.credits ?? 0) / 5), 1], 'uncommon');
indep('stencil', 'Pochoir', 8, '×1 par emplacement de joker vide (les Pochoirs comptent comme vides).',
  (_, c) => [0, 0, Math.max(1, (c.jokerSlots ?? 3) - (c.occupiedSlots ?? 0) + (c.stencilCount ?? 0))], 'uncommon');
indep('swashbuckler', 'Bretteur', 4, '+1 au multiplicateur par crédit de valeur de vente des autres jokers.',
  (_, c) => [0, (c.owned ?? []).filter((id,i) => i !== c.currentSlot).reduce((v,id) => v + Math.max(1,Math.floor((jokers[id]?.price ?? 0)/2)),0),1], 'uncommon');
indep('card-sharp', 'Carte affûtée', 6, '×3 si tu as déjà joué cette combinaison dans la blinde.',
  (_, c) => [0, 0, (c.handCountBefore ?? 0) > 0 ? 3 : 1], 'uncommon');
indep('supernova', 'Supernova', 5, '+1 au multiplicateur par fois où cette combinaison a été jouée dans la partie.',
  (_, c) => [0, (c.handCountTotal ?? 0) + 1, 1]);
indep('erosion', 'Érosion', 6, '+4 au multiplicateur par carte manquante sous les 52 cartes de départ.',
  (_, c) => [0, 4 * Math.max(0, 52 - (c.fullDeckCount ?? 52)), 1], 'uncommon');
indep('misprint', 'Erreur d’impression', 4, 'Entre +0 et +23 au multiplicateur, déterminé pour chaque main.',
  (_, c) => [0, c.misprintRoll ?? 0, 1]);
indep('blackboard', 'Tableau noir', 6, '×3 si toutes les cartes gardées sont des piques ou trèfles.',
  (_, c) => [0, 0, c.held.every(card => card.suit === '♠' || card.suit === '♣' || card.augure === 'wild') ? 3 : 1], 'uncommon');
indep('flower-pot', 'Pot de fleurs', 6, '×3 si les quatre enseignes sont présentes parmi les cartes marquantes.',
  (cards) => [0, 0, ['♠','♥','♣','♦'].every(suit => cards.some(card => matchesSuit(card,suit))) ? 3 : 1], 'uncommon');
indep('seeing-double', 'Double vision', 6, '×2 si les cartes marquantes comprennent un trèfle et une autre enseigne.',
  (cards) => [0, 0, cards.some(card=>matchesSuit(card,'♣')) &&
    cards.some(card=>card.augure==='wild' || (card.suit!=='♣')) ? 2 : 1], 'uncommon');
indep('acrobat', 'Acrobate', 6, '×3 lors de la dernière main disponible de la blinde.',
  (_, c) => [0, 0, c.plays === 1 ? 3 : 1], 'uncommon');
indep('duo', 'Le Duo', 8, '×2 si la main contient une paire.', (_, c) => [0, 0, has(c,'pair')?2:1], 'rare');
indep('trio', 'Le Trio', 8, '×3 si la main contient un brelan.', (_, c) => [0, 0, has(c,'three')?3:1], 'rare');
indep('family', 'La Famille', 8, '×4 si la main contient un carré.', (_, c) => [0, 0, has(c,'four')?4:1], 'rare');
indep('order', 'L’Ordre', 8, '×3 si la main contient une suite.', (_, c) => [0, 0, has(c,'straight')?3:1], 'rare');
indep('tribe', 'La Tribu', 8, '×2 si la main contient une couleur.', (_, c) => [0, 0, has(c,'flush')?2:1], 'rare');
indep('baseball-card', 'Carte de baseball', 8, '×1,5 par joker peu commun possédé.',
  (_, c) => [0, 0, 1.5 ** (c.owned ?? []).filter(id=>jokers[id]?.rarity==='uncommon').length], 'rare');
indep('steel-joker', 'Joker d’acier', 7, '×0,2 de multiplicateur supplémentaire par carte Armure du paquet.',
  (_, c) => [0, 0, 1 + .2 * (c.steelCount ?? 0)], 'uncommon');
indep('stone-joker', 'Joker de pierre', 6, '+25 jetons par carte Pierre du paquet.',
  (_, c) => [25 * (c.stoneCount ?? 0), 0, 1], 'uncommon');
indep('drivers-license', 'Permis', 7, '×3 avec au moins 16 cartes améliorées dans le paquet.',
  (_, c) => [0, 0, (c.enhancedCount ?? 0) >= 16 ? 3 : 1], 'rare');
indep('fortune-teller', 'Voyante', 6, '+1 au multiplicateur par Tarot utilisé dans la partie.',
  (_, c) => [0, c.tarotsUsed ?? 0, 1]);
indep('green-joker', 'Joker vert', 4, 'Gagne +1 au multiplicateur par main jouée, perd 1 par défausse.',
  (_, c) => [0, Math.max(0,c.progress?.green ?? 0), 1]);
indep('ride-the-bus', 'Prendre le bus', 6, '+1 au multiplicateur par main sans figure marquante ; remis à zéro sinon.',
  (_, c) => [0, c.progress?.bus ?? 0, 1]);
indep('square-joker', 'Joker carré', 4, 'Gagne +4 jetons par main jouée avec exactement quatre cartes.',
  (_, c) => [c.progress?.square ?? 0, 0, 1]);
indep('spare-trousers', 'Pantalon de rechange', 6, 'Gagne +2 au multiplicateur par main contenant deux paires.',
  (_, c) => [0, c.progress?.trousers ?? 0, 1], 'uncommon');
indep('runner', 'Coureur', 5, 'Gagne +15 jetons à chaque suite jouée.',
  (_, c) => [c.progress?.runner ?? 0, 0, 1]);
indep('hologram', 'Hologramme', 7, 'Gagne ×0,25 au multiplicateur par carte ajoutée au paquet.',
  (_, c) => [0, 0, 1 + (c.progress?.hologram ?? 0) * .25], 'uncommon');
indep('red-card', 'Carte rouge', 5, 'Gagne +3 au multiplicateur par pochette passée.',
  (_, c) => [0, c.progress?.red ?? 0, 1]);
indep('ramen', 'Ramen', 6, '×2 au départ, perd ×0,01 par carte défaussée.',
  (_, c) => [0, 0, Math.max(1,2 - (c.progress?.ramen ?? 0) * .01)], 'uncommon');
indep('popcorn', 'Pop-corn', 5, '+20 au multiplicateur, perd 4 après chaque blinde.',
  (_, c) => [0, Math.max(0,20 - 4*(c.progress?.popcorn ?? 0)), 1]);
indep('ice-cream', 'Glace', 5, '+100 jetons, perd 5 à chaque main jouée.',
  (_, c) => [Math.max(0,100 - 5*(c.progress?.icecream ?? 0)), 0, 1]);
indep('loyalty-card', 'Carte de fidélité', 5, '×4 chaque sixième main jouée.',
  (_, c) => [0, 0, (c.handsPlayed ?? 0) % 6 === 5 ? 4 : 1], 'uncommon');
indep('flash-card', 'Carte flash', 5, 'Gagne +2 au multiplicateur à chaque relance de boutique.',
  (_, c) => [0, c.progress?.flash ?? 0, 1], 'uncommon');
indep('campfire', 'Feu de camp', 9, 'Gagne ×0,25 par carte vendue ; revient à ×1 après un boss.',
  (_, c) => [0, 0, 1 + (c.progress?.campfire ?? 0) * .25], 'rare');
indep('yorick', 'Yorick', 20, 'Gagne ×1 chaque fois que 23 cartes sont défaussées.',
  (_, c) => [0, 0, 1 + Math.floor((c.progress?.yorick ?? 0)/23)], 'legendary');
indep('canio', 'Canio', 20, 'Gagne ×1 lorsqu’une figure est détruite.',
  (_, c) => [0, 0, 1 + (c.progress?.canio ?? 0)], 'legendary');

// Per-scoring-card triggers: processed before independent jokers.
scored('greedy', 'Joker avide', 5, '+3 au multiplicateur par carreau marquant.',
  card => [0, matchesSuit(card,'♦') ? 3 : 0, 1]);
scored('lusty', 'Joker passionné', 5, '+3 au multiplicateur par cœur marquant.',
  card => [0, matchesSuit(card,'♥') ? 3 : 0, 1]);
scored('wrathful', 'Joker furieux', 5, '+3 au multiplicateur par pique marquant.',
  card => [0, matchesSuit(card,'♠') ? 3 : 0, 1]);
scored('gluttonous', 'Joker gourmand', 5, '+3 au multiplicateur par trèfle marquant.',
  card => [0, matchesSuit(card,'♣') ? 3 : 0, 1]);
scored('even-steven', 'Pair gagnant', 4, '+4 au multiplicateur pour les rangs pairs marquants.',
  card => [0, card.rank % 2 === 0 && card.rank <= 10 ? 4 : 0, 1]);
scored('odd-todd', 'Impair gagnant', 4, '+31 jetons pour les rangs impairs marquants (As inclus).',
  card => [(card.rank === 14 || card.rank % 2 === 1) ? 31 : 0, 0, 1]);
scored('fibonacci', 'Fibonacci', 8, '+8 au multiplicateur par As, 2, 3, 5 ou 8 marquant.',
  card => [0, [14,2,3,5,8].includes(card.rank) ? 8 : 0, 1], 'uncommon');
scored('scholar', 'Érudit', 4, 'Chaque As marquant donne +20 jetons et +4 au multiplicateur.',
  card => card.rank===14 ? [20,4,1] : [0,0,1]);
scored('scary-face', 'Visage effrayant', 4, 'Chaque figure marquante rapporte +30 jetons.',
  card => card.rank >= 11 && card.rank <= 13 ? [30,0,1] : [0,0,1]);
scored('smiley-face', 'Visage souriant', 4, '+5 au multiplicateur par figure marquante.',
  card => [0, card.rank>=11 && card.rank<=13 ? 5 : 0, 1]);
scored('walkie-talkie', 'Talkie-walkie', 4, 'Chaque 10 et 4 marquant apporte +10 jetons et +4 au multiplicateur.',
  card => card.rank === 10 || card.rank === 4 ? [10,4,1] : [0,0,1]);
scored('arrowhead', 'Pointe de flèche', 7, '+50 jetons par pique marquant.',
  card => [matchesSuit(card,'♠') ? 50 : 0,0,1], 'uncommon');
scored('onyx-agate', 'Agate', 7, '+7 au multiplicateur par trèfle marquant.',
  card => [0,matchesSuit(card,'♣')?7:0,1], 'uncommon');
scored('rough-gem', 'Gemme brute', 7, 'Gagne 1 crédit par carreau marquant.',
  card => [0,0,1], 'uncommon');
scored('triboulet', 'Triboulet', 20, 'Chaque Roi ou Dame marquant donne ×2 au multiplicateur.',
  card => [0,0,(card.rank===12||card.rank===13)?2:1], 'legendary');
scored('photograph', 'Photographie', 5, '×2 au multiplicateur pour la première figure qui marque.',
  (card,c) => [0,0,card.rank>=11&&card.rank<=13&&c.firstScoredFace ? 2 : 1]);
scored('bloodstone', 'Pierre de sang', 7, 'Une chance sur deux de ×1,5 par cœur marquant.',
  (card,c) => [0,0,matchesSuit(card,'♥') && c.coin ? 1.5 : 1], 'uncommon');

// Effects on cards held in hand (repeat with Mime).
held('baron', 'Baron', 8, 'Chaque Roi conservé en main donne ×1,5 au multiplicateur.',
  card => [0,0,card.rank===13?1.5:1], 'rare');
held('shoot-the-moon', 'Viser la Lune', 5, 'Chaque Dame conservée en main donne +13 au multiplicateur.',
  card => [0,card.rank===12?13:0,1]);
held('raised-fist', 'Poing levé', 5, 'La plus petite carte gardée en main donne deux fois son rang au multiplicateur.',
  (card,c) => [0,c.lowestHeldId===card.id?2*cardChips(card):0,1]);

// Retriggers and copy effects are resolved by the score engine.
addBalatro('hanging-chad','Tchad suspendu',4,'La première carte marquante est activée deux fois de plus.',
  { scoredRetriggers:(card,c)=>c.firstScored?2:0 },'common');
addBalatro('hack','Pirate',6,'Chaque 2, 3, 4 ou 5 marquant est activé une seconde fois.',
  { scoredRetriggers:card=>card.rank>=2&&card.rank<=5?1:0 },'uncommon');
addBalatro('sock-buskin','Tragédie et Comédie',6,'Chaque figure marquante est activée une seconde fois.',
  { scoredRetriggers:card=>card.rank>=11&&card.rank<=13?1:0 },'uncommon');
addBalatro('dusk','Crépuscule',5,'Sur la dernière main, toutes les cartes marquantes sont activées une deuxième fois.',
  { scoredRetriggers:(_,c)=>c.plays===1?1:0 },'uncommon');
addBalatro('mime','Mime',5,'Répète une fois les effets de chaque carte gardée en main.',
  { heldRetriggers:()=>1 },'uncommon');
addBalatro('blueprint','Blueprint',10,'Copie le pouvoir du joker placé immédiatement à droite.',
  { copyNext:true },'rare');
addBalatro('brainstorm','Brainstorm',10,'Copie le pouvoir du joker le plus à gauche.',
  { copyLeftmost:true },'rare');

// Two additional passive, rules-changing, and shop-phase jokers.
addBalatro('chicot','Chicot',20,'Ignore les restrictions des boss.',
  { disableBoss:true, legendary:true },'legendary');
addBalatro('perkeo','Perkeo',20,'À la sortie de la boutique, copie un consommable en négatif sans occuper de place.',
  { perkeo:true, legendary:true },'legendary');
addBalatro('drunkard','Ivrogne',4,'+1 défausse à chaque blinde.',
  { extraDiscards:1 });
addBalatro('juggler','Jongleur',4,'+1 carte en main à chaque distribution.',
  { extraHandSize:1 });
addBalatro('merry-andy','Joyeux Andy',7,'+3 défausses et −1 carte en main.',
  { extraDiscards:3, extraHandSize:-1 },'uncommon');
addBalatro('splash','Plouf',3,'Toutes les cartes jouées participent au score.',
  { allScoring:true });
addBalatro('pareidolia','Paréidolie',5,'Toutes les cartes sont considérées comme des figures.',
  { allFaces:true },'uncommon');
