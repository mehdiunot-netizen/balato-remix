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
