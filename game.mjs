import { cardChips, jokers, matchesSuit } from './jokers.mjs?v=14';
export { jokers };

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

export const characters = [
  { id: 'classique', name: 'Sans personnage', mark: '♠', text: 'Règles classiques, sans bonus.' },
  { id: 'riche', name: 'Le Riche', mark: '¤', text: '+10 crédits au début de la partie.' },
  { id: 'chanceux', name: 'Le Chanceux', mark: '✦', text: 'Une carte de ton paquet reçoit un Augure aléatoire, fixé par la seed.' },
  { id: 'as-copieur', name: 'L’As Copieur', mark: '⌘', text: 'Commence avec ADN : la première main de chaque blinde copie dans le paquet la carte jouée seule.' },
  { id: 'negatif', name: 'Le Négatif', mark: '◐', text: 'Tous les jokers achetés sont négatifs : ils ne prennent pas de place.' },
  { id: 'multiplieur', name: 'Le Multiplieur', mark: '✺', text: 'Commence avec un joker polychrome aléatoire qui donne ×1,5 au multiplicateur final.' },
  { id: 'marchand', name: 'Le Marchand', mark: '◇', text: '−20 % sur les achats en boutique, arrondis au crédit inférieur.' },
  { id: 'stratege', name: 'Le Stratège', mark: '♜', text: '+2 défausses à chaque blinde.' },
  { id: 'magicien', name: 'Le Magicien', mark: '✧', text: 'Quatre emplacements de consommables au lieu de deux.' },
  { id: 'joueur', name: 'Le Joueur', mark: '★', text: 'Commence avec un joker légendaire aléatoire, fixé par la seed.' },
  { id: 'copieur-supreme', name: 'Le Copieur Suprême', mark: '▣', text: 'Commence avec Plan, qui copie le pouvoir du joker immédiatement à sa droite.' },
  { id: 'tricheur', name: 'Le Tricheur', mark: '♠', text: 'Chaque main jouée est considérée comme la première de la blinde.' },
];
export const characterFor = state => characters.find(c => c.id === state?.character) ?? characters[0];
export const shopPrice = (state, price) =>
  state?.character === 'marchand' ? Math.max(1, Math.floor(price * 0.8)) : price;


function blindAt(round) {
  const ante = Math.floor(round / 3) + 1;
  const type = round % 3;
  const rawTarget = 300 * 1.22 ** (ante - 1) * [1, 1.5, 2][type];
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
  if (state.catalogSize) return state;
  return { ...state, seed: state.seed ?? createSeed(), legacy: state.legacy ?? !state.seed, catalogSize: 7 };
}

export const augures = {
  prism: { name: 'Prisme', mark: '✧', text: '+10 au multiplicateur quand cette carte marque.' },
  steel: { name: 'Armure', mark: '◆', text: '×1,5 au multiplicateur quand cette carte reste en main.' },
  gold: { name: 'Ducat', mark: '¤', text: '+3 crédits si cette carte reste en main quand tu gagnes la blinde.' },
  bonus: { name: 'Réserve', mark: '✚', text: '+30 jetons quand cette carte marque.' },
  prune: { name: 'Fil coupé', mark: '✂', text: 'Retire définitivement de une à cinq cartes de ton choix.' },
  wild: { name: 'Caméléon', mark: '✺', text: 'Compte comme n’importe quelle enseigne, sans changer son rang.' },
};
export const packs = [
  { name: 'Pochette d’augures', price: 4, count: 3 },
  { name: 'Grande pochette', price: 6, count: 5 },
];

// Two reusable inventory slots; purchase offers follow the same seed as the run.
export const consumables = [
  { id: 'bourse', name: 'Bourse', mark: '¤', text: 'Gagne 5 crédits.', price: 4 },
  { id: 'relance', name: 'Relance', mark: '↺', text: '+1 défausse pour cette blinde.', price: 4 },
  { id: 'souffle', name: 'Souffle', mark: '✷', text: '+1 main pour cette blinde.', price: 5 },
];
export const CONSUMABLE_SLOTS = 2;
export const consumableSlotsFor = state => CONSUMABLE_SLOTS + (state?.character === 'magicien' ? 2 : 0);

export function consumableOffer(state) {
  if (state.phase !== 'shop' || state.consumableBought) return undefined;
  const random = seededRandom(state.seed, 'consumable-offer', state.round);
  return consumables[Math.floor(random() * consumables.length)];
}

export function buyConsumable(state, id) {
  const offer = consumableOffer(state);
  if (!offer || id !== offer.id ||
      (state.consumables ?? []).length >= consumableSlotsFor(state) ||
      state.credits < shopPrice(state, offer.price)) return state;
  return { ...state, credits: state.credits - shopPrice(state, offer.price),
    consumables: [...(state.consumables ?? []), id], consumableBought: true };
}

export function useConsumable(state, slot) {
  if (!['play', 'shop'].includes(state.phase) || !Number.isInteger(slot)) return state;
  const inventory = state.consumables ?? [];
  if (slot < 0 || slot >= inventory.length) return state;
  const id = inventory[slot];
  if (id !== 'bourse' && state.phase !== 'play') return state;
  const next = { ...state, consumables: inventory.filter((_, i) => i !== slot) };
  if (id === 'bourse') return { ...next, credits: state.credits + 5 };
  if (id === 'relance') return { ...next, discards: state.discards + 1 };
  if (id === 'souffle') return { ...next, plays: state.plays + 1 };
  return state;
}


export function evaluate(cards, owned = [], { hand = cards, firstPlay = false, trace = false, polychromeSlots = [] } = {}) {
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
  const flush = five && suits.some(suit => sorted.every(card => matchesSuit(card, suit)));
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
  const context = { name, played: cards, held: hand.filter(card => !cards.some(c => c.id === card.id)), firstPlay };
  let chips = base + scoring.reduce((sum, card) => sum + cardChips(card), 0);
  let mult = multiplier;
  let factor = 1;
  const steps = trace ? [{ type: 'base', chips: base, mult: multiplier, cardChips: chips - base }] : null;
  for (const card of scoring) {
    if (card.augure === 'prism') {
      mult += 10;
      steps?.push({ type: 'augure', name: augures.prism.name, mult: 10 });
    } else if (card.augure === 'bonus') {
      chips += 30;
      steps?.push({ type: 'augure', name: augures.bonus.name, chips: 30 });
    }
  }
  for (const card of context.held) {
    if (card.augure !== 'steel') continue;
    mult *= 1.5;
    steps?.push({ type: 'augure', name: augures.steel.name, factor: 1.5 });
  }
  const factors = [];
  // A Plan copies the next joker's ability, including another Plan, but never loops.
  const bonusAt = (slot, seen = new Set()) => {
    if (seen.has(slot) || slot >= owned.length || !jokers[owned[slot]]) return [0, 0, 1];
    const joker = jokers[owned[slot]];
    return joker.copyNext ? bonusAt(slot + 1, new Set([...seen, slot])) : joker.bonus(scoring, context);
  };
  for (const [slot, id] of owned.entries()) {
    const [extraChips, extraMult, extraFactor] = bonusAt(slot);
    chips += extraChips;
    mult += extraMult;
    factor *= extraFactor;
    if (steps) {
      if (extraChips || extraMult) steps.push({ type: 'add', id, slot, chips: extraChips, mult: extraMult });
      if (extraFactor !== 1) factors.push({ type: 'factor', id, slot, factor: extraFactor });
    }
  }
  for (const slot of polychromeSlots) {
    if (!Number.isInteger(slot) || slot < 0 || slot >= owned.length) continue;
    factor *= 1.5;
    factors.push({ type: 'factor', name: 'Polychrome', slot, factor: 1.5 });
  }
  mult *= factor;
  const resultScore = { name, chips, mult, total: Math.floor(chips * mult) };
  if (steps) resultScore.steps = steps.concat(factors);
  return resultScore;
}

function shuffle(items, random) {
  const mixed = [...items];
  for (let i = mixed.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
  }
  return mixed;
}

export function previewHand(state, cards, trace = false) {
  const opening = blindFor(state).plays ?? 4;
  return evaluate(cards, state.owned, {
    hand: state.hand,
    firstPlay: state.character === 'tricheur' ||
      (state.plays >= opening && !state.firstHandPlayed),
    trace,
    polychromeSlots: state.polychromeSlots ?? [],
  });
}

export function start(seed = createSeed(), character = 'classique') {
  const chosen = characters.some(c => c.id === character) ? character : 'classique';
  const state = { seed, character: chosen, round: 0,
    credits: chosen === 'riche' ? 13 : 3,
    owned: [], consumables: [], catalogSize: jokers.length };
  const random = seededRandom(seed, 'character-start', 0);
  if (chosen === 'chanceux') {
    const card = deck[Math.floor(random() * deck.length)];
    const kinds = Object.keys(augures).filter(id => id !== 'prune');
    state.enhancements = { [card.id]: kinds[Math.floor(random() * kinds.length)] };
  }
  if (chosen === 'as-copieur') state.owned = [jokers.findIndex(j => j.key === 'adn')];
  if (chosen === 'copieur-supreme') state.owned = [jokers.findIndex(j => j.key === 'plan')];
  if (chosen === 'multiplieur') {
    const ordinary = jokers.map((j, i) => ({ j, i }))
      .filter(({ j }) => !j.legendary && !j.copyNext && j.key !== 'adn');
    state.owned = [ordinary[Math.floor(random() * ordinary.length)].i];
    state.polychromeSlots = [0];
  }
  if (chosen === 'joueur') {
    const legendary = jokers.map((j, i) => ({ j, i })).filter(({ j }) => j.legendary);
    state.owned = [legendary[Math.floor(random() * legendary.length)].i];
  }
  return deal(state);
}

function deal(carry) {
  const blind = blindFor(carry);
  const pile = shuffle(remainingDeck(carry), seededRandom(carry.seed, 'deck', carry.round)).map(card => {
    const augure = carry.enhancements?.[card.id];
    return augure ? { ...card, augure } : card;
  });
  const hand = pile.splice(0, blind.size ?? 8);
  const plays = blind.plays ?? 4;
  const target = carry.legacy ? blind.target : Math.min(
    blind.target, reachableScore(hand, pile, plays, carry.owned, carry),
  );
  return { ...carry, target, phase: 'play', score: 0, plays,
    discards: (blind.discards ?? 3) + (carry.character === 'stratege' ? 2 : 0),
    firstHandPlayed: false,
    consumableBought: false, hand, pile, offers: [], last: null, reward: 0 };
}

// Simulate a legal sequence with the actual draw order. Its score is a lower
// bound on the best attainable score, since the player can also use discards.
function reachableScore(hand, pile, plays, owned, characterState = {}) {
  let score = 0;
  let drawn = 0;
  for (let turn = 0; turn < plays && hand.length; turn++) {
    let bestCards = [];
    let bestScore = 0;
    for (let mask = 1; mask < (1 << hand.length); mask++) {
      const cards = hand.filter((_, i) => mask & (1 << i));
      if (cards.length > 5) continue;
      const total = evaluate(cards, owned, {
        hand,
        firstPlay: turn === 0 || characterState.character === 'tricheur',
        polychromeSlots: characterState.polychromeSlots ?? [],
      }).total;
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
    if (!state.firstHandPlayed && cards.length === 1 &&
        state.owned.some(id => jokers[id]?.key === 'adn')) {
      const existing = state.bonusCards ?? [];
      const source = cards[0];
      const id = 'adn-' + state.round + '-' + existing.length;
      next.bonusCards = [...existing, { ...source, id }];
    }
    next.firstHandPlayed = true;
    next.last = previewHand(state, cards, true);
    next.score += next.last.total;
    if (next.score >= blindFor(state).target) {
      next.goldReward = state.hand.filter(card => card.augure === 'gold' && !ids.includes(card.id)).length * 3;
      next.reward = 4 + next.plays + next.goldReward;
      next.credits += next.reward;
      const lastLegacyBlind = state.legacy && state.round === legacyBlinds.length - 1;
      const classicWin = !state.legacy && state.round === CLASSIC_ROUNDS - 1;
      next.phase = lastLegacyBlind || classicWin ? 'win' : 'shop';
      if (!lastLegacyBlind) {
        const available = jokers.slice(0, state.catalogSize ?? 7).map((_, i) => i)
          .filter(i => !state.owned.includes(i) && !jokers[i].legendary);
        next.offers = shuffle(available, seededRandom(state.seed, 'shop', state.round)).slice(0, 3);
      }
      return next;
    }
    if (!next.plays) return { ...next, phase: 'lose' };
  }
  next.pile = state.pile.slice(cards.length);
  next.hand = state.hand.filter(c => !ids.includes(c.id)).concat(state.pile.slice(0, cards.length));
  return next.hand.length ? next : { ...next, phase: 'lose' };
}

// A sale can only happen in the shop. Remap negative-slot indices on deletion.
export function sellJoker(state, slot) {
  if (state.phase !== 'shop' || !Number.isInteger(slot) ||
      slot < 0 || slot >= state.owned.length) return state;
  const id = state.owned[slot];
  const value = Math.max(1, Math.floor(jokers[id].price / 2));
  const remap = indexes => (indexes ?? [])
    .filter(index => index !== slot)
    .map(index => index > slot ? index - 1 : index);
  return { ...state, credits: state.credits + value,
    owned: state.owned.filter((_, index) => index !== slot),
    negativeSlots: remap(state.negativeSlots),
    polychromeSlots: remap(state.polychromeSlots) };
}

export function buy(state, id) {
  if (state.phase !== 'shop' || !state.offers.includes(id) || state.owned.includes(id) ||
      !jokers[id] || (state.character !== 'negatif' && jokerSlotsUsed(state) >= 3) ||
      state.credits < shopPrice(state, jokers[id].price)) return state;
  return { ...state, credits: state.credits - shopPrice(state, jokers[id].price),
    owned: [...state.owned, id],
    negativeSlots: state.character === 'negatif'
      ? [...(state.negativeSlots ?? []), state.owned.length]
      : state.negativeSlots,
    offers: state.offers.filter(offer => offer !== id) };
}

function remainingDeck(state) {
  return [...deck, ...(state.bonusCards ?? [])]
    .filter(card => !state.removed?.includes(card.id));
}

export function removableCount(state) {
  return Math.min(5, remainingDeck(state).length - 8);
}

export function deckFor(state) {
  return remainingDeck(state);
}

function augureOptions(state) {
  const candidates = remainingDeck(state).filter(card => !state.enhancements?.[card.id]);
  const kinds = Object.keys(augures).filter(kind => kind !== 'prune' || removableCount(state) > 0);
  return { candidates, kinds, count: Math.min(kinds.length, candidates.length + Number(kinds.includes('prune'))) };
}

export function offeredPack(state) {
  if (state.phase !== 'shop' || state.packBought) return undefined;
  const { count } = augureOptions(state);
  if (count < packs[0].count) return undefined;
  const random = seededRandom(state.seed, 'pack-offer', state.round);
  return count >= packs[1].count && random() < 0.25 ? 1 : 0;
}

export function openPack(state, id) {
  const pack = packs[id];
  if (!pack || offeredPack(state) !== id || state.credits < shopPrice(state, pack.price)) return state;
  const { candidates, kinds } = augureOptions(state);
  const shuffledCards = shuffle(candidates, seededRandom(state.seed, 'augures', state.round));
  const shuffledKinds = shuffle(kinds, seededRandom(state.seed, 'augure-kinds', state.round));
  let index = 0;
  const choices = shuffledKinds.flatMap(augure => {
    if (augure === 'prune') return [{ id: 'prune', augure }];
    return index < shuffledCards.length ? [{ ...shuffledCards[index++], augure }] : [];
  }).slice(0, pack.count);
  return { ...state, phase: 'pack', packBought: true, credits: state.credits - shopPrice(state, pack.price), choices };
}

export function chooseAugure(state, id) {
  if (state.phase !== 'pack') return state;
  if (id === null) return { ...state, phase: 'shop', choices: [], pendingAugure: null };
  const choice = state.choices.find(card => card.id === id);
  if (!choice) return state;
  if (choice.augure === 'prune') return { ...state, phase: 'prune' };
  // Select effect first, then let the player pick which card receives it.
  return { ...state, phase: 'augure-target', pendingAugure: choice.augure };
}

export function cancelAugureTarget(state) {
  if (state.phase !== 'augure-target') return state;
  return { ...state, phase: 'pack', pendingAugure: null };
}

export function applyAugure(state, cardId) {
  if (state.phase !== 'augure-target' || !augures[state.pendingAugure] ||
      state.pendingAugure === 'prune' ||
      !remainingDeck(state).some(card => card.id === cardId) ||
      state.enhancements?.[cardId]) return state;
  return { ...state, phase: 'shop', choices: [], pendingAugure: null,
    enhancements: { ...(state.enhancements ?? {}), [cardId]: state.pendingAugure } };
}

export function pruneDeck(state, ids) {
  if (state.phase !== 'prune') return state;
  if (ids === null) return { ...state, phase: 'pack' };
  if (!ids.length || ids.length > removableCount(state) || new Set(ids).size !== ids.length ||
      ids.some(id => !remainingDeck(state).some(card => card.id === id))) return state;
  return { ...state, phase: 'shop', choices: [], removed: [...(state.removed ?? []), ...ids] };
}

export const ECLIPSE_PRICE = 5;

export function jokerSlotsUsed(state) {
  return state.owned.length - (state.negativeSlots?.length ?? 0);
}

export function eclipseOffer(state) {
  if (state.phase !== 'shop' || state.eclipseBought || !state.owned.length) return false;
  const random = seededRandom(state.seed, 'eclipse-offer', state.round);
  return random() < 0.4 && (jokerSlotsUsed(state) < 3 ||
    state.owned.some((_, index) => !state.negativeSlots?.includes(index)));
}

export function openEclipse(state) {
  if (!eclipseOffer(state) || state.credits < shopPrice(state, ECLIPSE_PRICE)) return state;
  const random = seededRandom(state.seed, 'eclipse-targets', state.round);
  const normal = state.owned.map((_, index) => index).filter(index => !state.negativeSlots?.includes(index));
  const eclipse = {
    negative: normal.length ? normal[Math.floor(random() * normal.length)] : null,
    copy: jokerSlotsUsed(state) < 3 ? Math.floor(random() * state.owned.length) : null,
  };
  return { ...state, phase: 'eclipse', eclipse, eclipseBought: true, credits: state.credits - shopPrice(state, ECLIPSE_PRICE) };
}

export function chooseEclipse(state, effect) {
  if (state.phase !== 'eclipse') return state;
  const next = { ...state, phase: 'shop', eclipse: null };
  if (effect === null) return next;
  const index = state.eclipse[effect];
  if (index == null) return state;
  if (effect === 'negative') return { ...next, negativeSlots: [...(state.negativeSlots ?? []), index] };
  if (effect === 'copy') return { ...next, owned: [...state.owned, state.owned[index]] };
  return state;
}

export function continueRun(state) {
  if (state.phase !== 'win' || state.legacy || state.round !== CLASSIC_ROUNDS - 1) return state;
  return { ...state, phase: 'shop', endless: true };
}

export function advance(state) {
  if (state.phase !== 'shop') return state;
  return deal({ seed: state.seed, legacy: state.legacy ?? false, endless: state.endless ?? false, round: state.round + 1,
    credits: state.credits, owned: state.owned, catalogSize: state.catalogSize,
    consumables: state.consumables ?? [], character: state.character,
    bonusCards: state.bonusCards, polychromeSlots: state.polychromeSlots,
    enhancements: state.enhancements, removed: state.removed, negativeSlots: state.negativeSlots });
}
