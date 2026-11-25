const suits = ['♠', '♥', '♣', '♦'];
export const deck = suits.flatMap(suit =>
  Array.from({ length: 13 }, (_, i) => ({ id: suit + (i + 2), suit, rank: i + 2 }))
);
export const blinds = [
  { name: 'Le Parvis', target: 125 },
  { name: 'La Verrière', target: 220 },
  { name: 'Le Belvédère', target: 340 },
  { name: 'Le Phare', target: 475 },
  { name: 'L’Alizé', target: 620 },
  { name: 'L’Œil du vent', target: 800 },
];

export const jokers = [
  { name: 'Boussole', mark: '✦', price: 4, text: '+20 jetons à chaque main.',
    bonus: () => [20, 0, 1] },
  { name: 'Cerf-volant', mark: '◇', price: 5, text: '+3 au multiplicateur à chaque main.',
    bonus: () => [0, 3, 1] },
  { name: 'Rose des vents', mark: '✳', price: 5, text: '+6 au multiplicateur si les cartes marquantes couvrent 3 ou 4 enseignes.',
    bonus: cards => [0, new Set(cards.map(c => c.suit)).size >= 3 ? 6 : 0, 1] },
  { name: 'Girouette', mark: '➶', price: 6, text: '×2 au multiplicateur si cinq cartes marquent.',
    bonus: cards => [0, 0, cards.length === 5 ? 2 : 1] },
  { name: 'Ancre', mark: '⚓︎', price: 4, text: '+40 jetons si exactement deux cartes marquent.',
    bonus: cards => [cards.length === 2 ? 40 : 0, 0, 1] },
  { name: 'Fanion', mark: '⚑', price: 4, text: '+2 au multiplicateur par cœur marquant.',
    bonus: cards => [0, 2 * cards.filter(c => c.suit === '♥').length, 1] },
];

export function evaluate(cards, owned = []) {
  if (!cards.length || cards.length > 5) throw new RangeError('Choisir de 1 à 5 cartes.');
  const sorted = [...cards].sort((a, b) => b.rank - a.rank);
  const groups = new Map();
  for (const card of sorted) {
    if (!groups.has(card.rank)) groups.set(card.rank, []);
    groups.get(card.rank).push(card);
  }
  const sets = [...groups.values()].sort((a, b) => b.length - a.length);
  const [first, second = []] = sets;
  const ranks = [...groups.keys()];
  const five = sorted.length === 5;
  const flush = five && sorted.every(c => c.suit === sorted[0].suit);
  const straight = five && ranks.length === 5 &&
    (ranks[0] - ranks[4] === 4 || ranks.join() === '14,5,4,3,2');

  let result;
  if (straight && flush) result = ['Quinte flush', 90, 8, sorted];
  else if (first.length === 4) result = ['Carré', 65, 7, first];
  else if (first.length === 3 && second.length === 2) result = ['Full', 50, 6, sorted];
  else if (flush) result = ['Couleur', 40, 5, sorted];
  else if (straight) result = ['Quinte', 35, 5, sorted];
  else if (first.length === 3) result = ['Brelan', 30, 4, first];
  else if (first.length === 2 && second.length === 2) result = ['Double paire', 25, 3, [...first, ...second]];
  else if (first.length === 2) result = ['Paire', 15, 2, first];
  else result = ['Carte haute', 8, 1, first];

  const [name, base, multiplier, scoring] = result;
  let chips = base + scoring.reduce((sum, c) => sum + (c.rank === 14 ? 11 : Math.min(c.rank, 10)), 0);
  let mult = multiplier;
  let factor = 1;
  for (const id of owned) {
    const [extraChips, extraMult, extraFactor] = jokers[id].bonus(scoring);
    chips += extraChips;
    mult += extraMult;
    factor *= extraFactor;
  }
  mult *= factor;
  return { name, chips, mult, total: chips * mult };
}

function shuffle(items, random) {
  const mixed = [...items];
  for (let i = mixed.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
  }
  return mixed;
}

export function start(random = Math.random, carry = { round: 0, credits: 3, owned: [] }) {
  const pile = shuffle(deck, random);
  return { ...carry, phase: 'play', score: 0, plays: 4, discards: 3,
    hand: pile.splice(0, 8), pile, offers: [], last: null, reward: 0 };
}

export function useCards(state, ids, action, random = Math.random) {
  const counter = { play: 'plays', discard: 'discards' }[action];
  if (state.phase !== 'play' || !counter || !state[counter] ||
      !ids.length || ids.length > 5 || new Set(ids).size !== ids.length) return state;
  const cards = state.hand.filter(c => ids.includes(c.id));
  if (cards.length !== ids.length) return state;
  const next = { ...state, [counter]: state[counter] - 1 };
  if (action === 'play') {
    next.last = evaluate(cards, state.owned);
    next.score += next.last.total;
    if (next.score >= blinds[state.round].target) {
      next.reward = 4 + next.plays;
      next.credits += next.reward;
      next.phase = state.round === blinds.length - 1 ? 'win' : 'shop';
      if (next.phase === 'shop') {
        const available = jokers.map((_, i) => i).filter(i => !state.owned.includes(i));
        next.offers = shuffle(available, random).slice(0, 3);
      }
      return next;
    }
    if (!next.plays) return { ...next, phase: 'lose' };
  }
  next.pile = state.pile.slice(cards.length);
  next.hand = state.hand.filter(c => !ids.includes(c.id)).concat(state.pile.slice(0, cards.length));
  return next;
}

export function buy(state, id) {
  if (state.phase !== 'shop' || !state.offers.includes(id) || state.owned.includes(id) ||
      state.owned.length >= 3 || state.credits < jokers[id].price) return state;
  return { ...state, credits: state.credits - jokers[id].price,
    owned: [...state.owned, id], offers: state.offers.filter(offer => offer !== id) };
}

export function advance(state, random = Math.random) {
  if (state.phase !== 'shop') return state;
  return start(random, { round: state.round + 1, credits: state.credits, owned: state.owned });
}
