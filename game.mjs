const suits = ['♠', '♥', '♣', '♦'];
export const deck = suits.flatMap(suit =>
  Array.from({ length: 13 }, (_, i) => ({ id: suit + (i + 2), suit, rank: i + 2 }))
);
const legacyBlinds = [
  { name: 'Le Parvis', target: 125 },
  { name: 'La Verrière', target: 220 },
  { name: 'Le Belvédère', target: 340 },
  { name: 'Le Phare', target: 475 },
  { name: 'L’Alizé', target: 620 },
  { name: 'L’Œil du vent', target: 800 },
];

const bosses = [
  { name: 'Le Grain', rule: 'Trois mains à jouer.', plays: 3 },
  { name: 'La Brume', rule: 'Sept cartes en main.', size: 7 },
  { name: 'Le Contrevent', rule: 'Deux défausses.', discards: 2 },
];

const CLASSIC_ROUNDS = 24;

function blindAt(round) {
  const ante = Math.floor(round / 3) + 1;
  const type = round % 3;
  const rawTarget = 125 * 1.22 ** (ante - 1) * [1, 1.45, 1.85][type];
  const target = Math.min(Number.MAX_SAFE_INTEGER, Math.round(rawTarget / 5) * 5);
  if (type === 2) return { ante, target, kind: 'Boss', ...bosses[(ante - 1) % bosses.length] };
  const name = type === 0 ? 'Petite blinde' : 'Grosse blinde';
  return { ante, target, kind: name, name };
}

export const blinds = Array.from({ length: CLASSIC_ROUNDS }, (_, round) => blindAt(round));

export function blindFor(state) {
  if (state.legacy) return legacyBlinds[state.round];
  if (!Number.isSafeInteger(state.round) || state.round < 0) return undefined;
  const blind = state.round < CLASSIC_ROUNDS ? blinds[state.round] : state.endless ? blindAt(state.round) : undefined;
  return blind && state.target !== undefined ? { ...blind, target: state.target } : blind;
}

// Each round and purpose has its own stream. Replays and previews never advance it.
function seededRandom(seed, purpose, round) {
  let hash = 2166136261;
  for (const char of JSON.stringify([seed, purpose, round])) {
    hash = Math.imul(hash ^ char.codePointAt(0), 16777619);
  }
  return () => {
    hash = (hash + 0x6d2b79f5) | 0;
    let bits = Math.imul(hash ^ (hash >>> 15), hash | 1);
    bits ^= bits + Math.imul(bits ^ (bits >>> 7), bits | 61);
    return ((bits ^ (bits >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeed() {
  return Array.from(globalThis.crypto.getRandomValues(new Uint32Array(2)),
    number => number.toString(36).padStart(7, '0')).join('').toUpperCase();
}

export function restoreRun(state) {
  return state.seed ? state : { ...state, seed: createSeed(), legacy: true };
}

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
  { name: 'L’Orbite de π', mark: 'π', price: 7, theme: 'orbit', text: 'Multiplie le multiplicateur final par π. Le score est arrondi à l’entier inférieur.',
    bonus: () => [0, 0, Math.PI] },
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
  return { name, chips, mult, total: Math.floor(chips * mult) };
}

function shuffle(items, random) {
  const mixed = [...items];
  for (let i = mixed.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
  }
  return mixed;
}

export function start(seed = createSeed()) {
  return deal({ seed, round: 0, credits: 3, owned: [] });
}

function deal(carry) {
  const blind = blindFor(carry);
  const pile = shuffle(deck, seededRandom(carry.seed, 'deck', carry.round));
  const hand = pile.splice(0, blind.size ?? 8);
  const plays = blind.plays ?? 4;
  const target = carry.legacy ? blind.target : Math.min(
    blind.target, reachableScore(hand, pile, plays, carry.owned),
  );
  return { ...carry, target, phase: 'play', score: 0, plays, discards: blind.discards ?? 3,
    hand, pile, offers: [], last: null, reward: 0 };
}

// Simulate a legal sequence with the actual draw order. Its score is a lower
// bound on the best attainable score, since the player can also use discards.
function reachableScore(hand, pile, plays, owned) {
  let score = 0;
  let drawn = 0;
  for (let turn = 0; turn < plays && hand.length; turn++) {
    let bestCards = [];
    let bestScore = 0;
    for (let mask = 1; mask < (1 << hand.length); mask++) {
      const cards = hand.filter((_, i) => mask & (1 << i));
      if (cards.length > 5) continue;
      const total = evaluate(cards, owned).total;
      if (total > bestScore) {
        bestScore = total;
        bestCards = cards;
      }
    }
    score += bestScore;
    hand = hand.filter(card => !bestCards.includes(card))
      .concat(pile.slice(drawn, drawn + bestCards.length));
    drawn += bestCards.length;
  }
  return score;
}

export function useCards(state, ids, action) {
  const counter = { play: 'plays', discard: 'discards' }[action];
  if (state.phase !== 'play' || !counter || !state[counter] ||
      !ids.length || ids.length > 5 || new Set(ids).size !== ids.length) return state;
  const cards = state.hand.filter(c => ids.includes(c.id));
  if (cards.length !== ids.length) return state;
  const next = { ...state, [counter]: state[counter] - 1 };
  if (action === 'play') {
    next.last = evaluate(cards, state.owned);
    next.score += next.last.total;
    if (next.score >= blindFor(state).target) {
      next.reward = 4 + next.plays;
      next.credits += next.reward;
      const lastLegacyBlind = state.legacy && state.round === legacyBlinds.length - 1;
      const classicWin = !state.legacy && state.round === CLASSIC_ROUNDS - 1;
      next.phase = lastLegacyBlind || classicWin ? 'win' : 'shop';
      if (!lastLegacyBlind) {
        const available = jokers.map((_, i) => i).filter(i => !state.owned.includes(i));
        next.offers = shuffle(available, seededRandom(state.seed, 'shop', state.round)).slice(0, 3);
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

export function continueRun(state) {
  if (state.phase !== 'win' || state.legacy || state.round !== CLASSIC_ROUNDS - 1) return state;
  return { ...state, phase: 'shop', endless: true };
}

export function advance(state) {
  if (state.phase !== 'shop') return state;
  return deal({ seed: state.seed, legacy: state.legacy ?? false, endless: state.endless ?? false, round: state.round + 1,
    credits: state.credits, owned: state.owned });
}
