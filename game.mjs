import { cardChips, jokers, matchesSuit } from './jokers.mjs?v=24';
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
  { id: 'chanceux', name: 'Le Chanceux', mark: '✦', text: 'Une carte de ton paquet reçoit un Tarot aléatoire, fixé par la seed.' },
  { id: 'as-copieur', name: 'L’As Copieur', mark: '⌘', text: 'Commence avec ADN : la première main de chaque blinde copie la carte jouée seule dans le paquet et dans ta main.' },
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
  const blind = state.phase !== 'casino' && state.selectedBlind
    ? state.selectedBlind
    : state.round < CLASSIC_ROUNDS ? blinds[state.round] : state.endless ? blindAt(state.round) : undefined;
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


/* The nine blind positions never change. Skip rewards are drawn per seed
   and ante, so each column offers three different types of bonuses instead
   of a permanent free Tarot pack in a fixed position. */
export const casinoRooms = [
  { name: 'Coffre doré', mark: '¤', reward: 'coins', amount: 4, info: '+4 crédits immédiatement' },
  { name: 'Grand coffre', mark: '✧', reward: 'coins', amount: 7, info: '+7 crédits immédiatement' },
  { name: 'Salle des mains', mark: '♠', reward: 'hands', amount: 2, info: '+2 mains à la prochaine blinde' },
  { name: 'Tour des mains', mark: '♜', reward: 'hands', amount: 3, info: '+3 mains à la prochaine blinde' },
  { name: 'Hall négatif', mark: '◐', reward: 'negative', amount: 2, info: 'Deux jokers deviennent négatifs dans 3 blindes' },
  { name: 'Salle du boss', mark: '★', reward: 'boss', amount: 10, info: '+10 crédits après la prochaine victoire contre un boss' },
  { name: 'Épreuve du boss', mark: '⚑', reward: 'boss', amount: 15, info: '+15 crédits après la prochaine victoire contre un boss' },
  { name: 'Salon des tarots', mark: '✺', reward: 'pack', amount: 1, info: 'Un pack Tarot offert' },
];

function casinoSkipRewards(seed, anteIndex, column) {
  const random = seededRandom(seed, 'casino-skip-rewards', anteIndex * 2 + column);
  // No duplicate bonus types in a single Skip: choose among 4 types first.
  const types = shuffle(['coins', 'hands', 'negative', 'boss'], random).slice(0, 3);
  const selected = types.map(type => {
    const variants = casinoRooms.filter(room => room.reward === type);
    return variants[Math.floor(random() * variants.length)];
  });
  // Across both skippable columns, the chance of a free pack is 20% per
  // ante, never twice; the other 80% of antes have no free pack at all.
  const rare = seededRandom(seed, 'casino-skip-rare-pack', anteIndex);
  const packColumn = rare() < 0.2 ? Math.floor(rare() * 2) : -1;
  if (column === packColumn)
    selected[Math.floor(random() * selected.length)] = casinoRooms.find(room => room.reward === 'pack');
  return shuffle(selected, random);
}

export function casinoAvailable(state) {
  return !state.legacy && Number.isSafeInteger(state.round) &&
    (state.endless || state.round + 1 < CLASSIC_ROUNDS);
}

// Nine distinct blinds, three per column, travelled from left to right.
export function casinoBoard(state) {
  if (!casinoAvailable(state) && state.phase !== 'casino') return [];
  const nextRound = state.round + 1;
  if (!state.endless && nextRound >= CLASSIC_ROUNDS) return [];
  const anteIndex = Math.floor(nextRound / 3);
  const step = nextRound % 3;
  const prior = (state.casinoPath ?? []).find(entry => entry.round === nextRound - 1);
  const priorLane = prior?.lane ?? null;
  const visits = (state.casinoPath ?? []).filter(entry =>
    entry.round >= anteIndex * 3 && entry.round < anteIndex * 3 + 3);
  const rewardsByColumn = [casinoSkipRewards(state.seed, anteIndex, 0),
    casinoSkipRewards(state.seed, anteIndex, 1)];
  return [0,1,2].flatMap(column => [0,1,2].map(lane => {
    const base = blindAt(anteIndex * 3 + column);
    const boss = column === 2 ? bosses[(anteIndex + lane) % bosses.length] : null;
    const blind = {
      ...base, ...(boss ?? {}),
      name: column === 0 ? 'Petite blinde ' + (lane + 1) :
        column === 1 ? 'Grosse blinde ' + (lane + 1) : boss.name,
      target: Math.round(base.target * (1 + lane * .12) / 5) * 5,
    };
    const visit = visits.find(entry => entry.round === anteIndex * 3 + column);
    return { column, lane, blind, reward: column === 2 ? null : rewardsByColumn[column][lane],
      active: column === step,
      reachable: column === step && (step === 0 || priorLane === null || Math.abs(lane-priorLane) <= 1),
      visited: visit?.lane === lane, skipped: visit?.lane === null, completed: column < step };
  }));
}
export function casinoOffers(state) {
  return casinoBoard(state).filter(offer => offer.active);
}
export function openCasino(state) {
  if (state.phase !== 'shop' || !casinoAvailable(state)) return state;
  return { ...state, phase: 'casino', casinoSkipSummary: [] };
}
export function startInCasino(seed = createSeed(), character = 'classique') {
  const initial = start(seed, character);
  const { target, selectedBlind, ...withoutBlind } = initial;
  return { ...withoutBlind, phase: 'casino', round: -1,
    casinoPath: [], casinoTags: [],
    casinoSkipSummary: [], freeCasinoPacks: 0 };
}
export function chooseCasinoRoom(state, lane) {
  if (state.phase !== 'casino' || !Number.isInteger(lane)) return state;
  const offer = casinoOffers(state).find(choice => choice.lane === lane);
  if (!offer || !offer.reachable) return state;
  const nextRound = state.round + 1;
  const path = [...(state.casinoPath ?? []), { round: nextRound, lane }];
  return deal({ ...state, round: nextRound, target: undefined,
    selectedBlind: offer.blind, casinoLane: lane, casinoPath: path,
    casinoSkipSummary: [] });
}
function addCasinoTag(state, room, roomId, nextRound) {
  const { reward: kind, info: label } = room;
  if (kind === 'coins') return { ...state, credits: state.credits + (room.amount ?? 4) };
  if (kind === 'pack') return { ...state, freeCasinoPacks: (state.freeCasinoPacks ?? 0) + 1 };
  const tags = state.casinoTags ?? [];
  return { ...state, casinoTags: [...tags, {
    id: 'tag-' + nextRound + '-' + roomId, kind, label, amount: room.amount,
    remaining: kind === 'negative' ? 3 : null,
  }] };
}
export function skipCasinoRow(state) {
  if (state.phase !== 'casino') return state;
  const offers = casinoOffers(state);
  const nextRound = state.round + 1;
  if (offers.length !== 3 || nextRound % 3 === 2) return state;
  let next = { ...state };
  // Atomic skip: all three tags from the visible blind cards, with no selection.
  for (const option of offers)
    next = addCasinoTag(next, option.reward, option.lane, nextRound);
  const { target, selectedBlind, ...withoutBlind } = next;
  next = { ...withoutBlind, round: nextRound, phase: 'casino',
    casinoSkipSummary: offers.map(option => option.reward.info),
    casinoPath: [...(next.casinoPath ?? []), { round: nextRound, lane: null }] };
  return !next.endless && nextRound >= CLASSIC_ROUNDS - 1
    ? { ...next, phase: 'win' } : next;
}
export function openCasinoBonusPack(state) {
  if (state.phase !== 'casino' || !(state.freeCasinoPacks > 0)) return state;
  const { candidates, kinds } = augureOptions(state);
  const eligibleKinds = kinds.filter(kind => kind === 'prune' || candidates.length);
  if (!eligibleKinds.length) return state;
  const random = seededRandom(state.seed, 'casino-bonus-pack', (state.casinoPath ?? []).length + state.round * 53);
  const available = shuffle(eligibleKinds, random);
  const drawn = shuffle(candidates, random);
  const choices = available.slice(0, 3).map((augure, index) =>
    augure === 'prune' ? { id: 'prune', augure } : { ...(drawn[index % drawn.length]), augure });
  return { ...state, phase: 'pack', choices, freeCasinoPacks: state.freeCasinoPacks - 1,
    returnToCasino: true };
}
function resolveCasinoTagsOnDeal(state) {
  let extraHands = 0;
  const keep = [];
  const negativeSlots = [...(state.negativeSlots ?? [])];
  const random = seededRandom(state.seed, 'casino-negative', state.round);
  for (const tag of state.casinoTags ?? []) {
    if (tag.kind === 'hands') { extraHands += tag.amount ?? 3; continue; }
    if (tag.kind !== 'negative') { keep.push(tag); continue; }
    if (tag.remaining > 1) { keep.push({ ...tag, remaining: tag.remaining - 1 }); continue; }
    const eligible = state.owned.map((_, index) => index).filter(i => !negativeSlots.includes(i));
    if (!eligible.length) { keep.push({ ...tag, remaining: 0 }); continue; }
    negativeSlots.push(...shuffle(eligible, random).slice(0, 2));
  }
  return { ...state, negativeSlots, casinoTags: keep, casinoExtraHands: extraHands };
}

export const packs = [
  { name: 'Pack Tarot', price: 4, count: 3 },
  { name: 'Grand pack Tarot', price: 6, count: 5 },
  { name: 'Pack Tarot géant', price: 8, count: 6 },
];
export const jokerPacks = [
  { name: 'Pack Joker', price: 4, count: 2 },
  { name: 'Grand pack Joker', price: 6, count: 4 },
];

// Two reusable inventory slots; purchase offers follow the same seed as the run.
export const consumables = [
  { id: 'bourse', name: 'Bourse', mark: '¤', text: 'Gagne 5 crédits.', price: 4 },
  { id: 'relance', name: 'Défausse bonus', mark: '↺', text: '+1 défausse pour cette blinde (ancienne sauvegarde).', price: 4 },
  { id: 'souffle', name: 'Souffle', mark: '✷', text: '+1 main pour cette blinde.', price: 5 },
];
export const CONSUMABLE_SLOTS = 2;
export const consumableSlotsFor = state => CONSUMABLE_SLOTS + (state?.character === 'magicien' ? 2 : 0);

export function consumableOffer(state) {
  if (state.phase !== 'shop' || state.consumableBought) return undefined;
  const random = seededRandom(state.seed, 'consumable-offer', state.round);
  const available = consumables.filter(item => item.id !== 'relance');
  return available[Math.floor(random() * available.length)];
}

export function buyConsumable(state, id) {
  const offer = consumableOffer(state);
  if (!offer || id !== offer.id ||
      (state.consumables ?? []).length >= consumableSlotsFor(state) ||
      state.credits < shopPrice(state, offer.price)) return state;
  return { ...state, credits: state.credits - shopPrice(state, offer.price),
    consumables: [...(state.consumables ?? []), id], consumableBought: true };
}

// Cards can be rearranged without using them, including identical copies.
// Array order is persisted in the existing save format.
export function reorderConsumable(state, from, to) {
  const inventory = state.consumables ?? [];
  if (!Number.isInteger(from) || !Number.isInteger(to) ||
      from < 0 || to < 0 || from >= inventory.length ||
      to >= inventory.length || from === to) return state;
  const reordered = [...inventory];
  const [card] = reordered.splice(from, 1);
  reordered.splice(to, 0, card);
  return { ...state, consumables: reordered };
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
    owned: [], handHistory: [], consumables: [], catalogSize: jokers.length };
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
      .filter(({ j }) => !j.legendary && !j.copyNext && j.key !== 'adn' && !j.prototype);
    state.owned = [ordinary[Math.floor(random() * ordinary.length)].i];
    state.polychromeSlots = [0];
  }
  if (chosen === 'joueur') {
    const legendary = jokers.map((j, i) => ({ j, i })).filter(({ j }) => j.legendary && !j.prototype);
    state.owned = [legendary[Math.floor(random() * legendary.length)].i];
  }
  return deal(state);
}

function deal(carry) {
  carry = resolveCasinoTagsOnDeal(carry);
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
  return { ...carry, target, phase: 'play', score: 0, plays: plays + (carry.casinoExtraHands ?? 0),
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

// DNA also triggers when Blueprint, Plan or Brainstorm copies its ability.
// Resolve each joker slot separately so multiple valid copies can stack.
function dnaActivations(state) {
  const owned = state.owned ?? [];
  function resolvesToDna(slot, visited = new Set()) {
    if (slot < 0 || slot >= owned.length || visited.has(slot)) return false;
    const joker = jokers[owned[slot]];
    if (!joker) return false;
    const nextVisited = new Set([...visited, slot]);
    if (joker.copyNext) return resolvesToDna(slot + 1, nextVisited);
    if (joker.copyLeftmost) return resolvesToDna(0, nextVisited);
    return joker.key === 'adn';
  }
  return owned.reduce((sum, _, slot) => sum + Number(resolvesToDna(slot)), 0);
}

export function useCards(state, ids, action) {
  const counter = { play: 'plays', discard: 'discards' }[action];
  if (state.phase !== 'play' || !counter || !state[counter] ||
      !ids.length || ids.length > 5 || new Set(ids).size !== ids.length) return state;
  const cards = state.hand.filter(c => ids.includes(c.id));
  if (cards.length !== ids.length) return state;
  const next = { ...state, [counter]: state[counter] - 1 };
  const dnaCopies = [];
  if (action === 'play') {
    // Copies enter the hand immediately and become permanent deck cards.
    // Multiple triggering jokers can push the hand beyond its usual size.
    if (!state.firstHandPlayed && cards.length === 1) {
      const existing = state.bonusCards ?? [];
      const source = cards[0];
      for (let i = 0; i < dnaActivations(state); i++) {
        dnaCopies.push({ ...source, id: 'adn-' + state.round + '-' + (existing.length + i) });
      }
      if (dnaCopies.length) next.bonusCards = [...existing, ...dnaCopies];
    }
    next.firstHandPlayed = true;
    next.last = previewHand(state, cards, true);
    // Persist every played combination, not discards, across blinds and resumes.
    next.handHistory = [...(state.handHistory ?? []), {
      round: state.round, name: next.last.name,
      cards: cards.map(card => ({ rank: card.rank, suit: card.suit })),
      chips: next.last.chips, mult: next.last.mult, total: next.last.total,
    }];
    next.score += next.last.total;
    if (next.score >= blindFor(state).target) {
      next.goldReward = state.hand.filter(card => card.augure === 'gold' && !ids.includes(card.id)).length * 3;
      next.reward = 4 + next.plays + next.goldReward;
      if (blindFor(state).kind === 'Boss') {
        const pending = (state.casinoTags ?? []).filter(tag => tag.kind === 'boss');
        next.reward += pending.reduce((sum, tag) => sum + (tag.amount ?? 10), 0);
        next.casinoTags = (state.casinoTags ?? []).filter(tag => tag.kind !== 'boss');
      }
      next.credits += next.reward;
      const lastLegacyBlind = state.legacy && state.round === legacyBlinds.length - 1;
      const classicWin = !state.legacy && state.round === CLASSIC_ROUNDS - 1;
      next.phase = lastLegacyBlind || classicWin ? 'win' : 'shop';
      next.rerolls = 0;
      if (!lastLegacyBlind) {
        const available = jokers.slice(0, state.catalogSize ?? 7).map((_, i) => i)
          .filter(i => !state.owned.includes(i) && !jokers[i].legendary && !jokers[i].prototype);
        next.offers = shuffle(available, seededRandom(state.seed, 'shop', state.round)).slice(0, 3);
      }
      if (dnaCopies.length) next.hand = state.hand.filter(c => !ids.includes(c.id)).concat(dnaCopies);
      return next;
    }
    if (!next.plays) return { ...next, phase: 'lose' };
  }
  const remainingHand = state.hand.filter(c => !ids.includes(c.id));
  const handLimit = blindFor(state).size ?? 8;
  // Ordinary draws refill only to the hand limit; DNA copies are independent
  // and are never discarded or denied when the hand is already full.
  const drawCount = Math.min(state.pile.length,
    Math.max(0, handLimit - remainingHand.length - dnaCopies.length));
  next.pile = state.pile.slice(drawCount);
  next.hand = remainingHand.concat(dnaCopies, state.pile.slice(0, drawCount));
  return next.hand.length ? next : { ...next, phase: 'lose' };
}

// Reordering follows each card's negative/polychrome edition and changes
// the effects of positional joker copies without replacing saved joker IDs.
export function reorderJoker(state, from, to) {
  if (!Number.isInteger(from) || !Number.isInteger(to) ||
      from < 0 || to < 0 || from >= state.owned.length ||
      to >= state.owned.length || from === to) return state;
  const ordered = state.owned.map((id, oldSlot) => ({ id, oldSlot }));
  const [moved] = ordered.splice(from, 1);
  ordered.splice(to, 0, moved);
  const follow = slots => slots?.map(oldSlot =>
    ordered.findIndex(item => item.oldSlot === oldSlot)).filter(slot => slot >= 0);
  return { ...state, owned: ordered.map(item => item.id),
    negativeSlots: follow(state.negativeSlots),
    polychromeSlots: follow(state.polychromeSlots) };
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

// Shop rerolls are buttons, not inventory consumables. Their cost increases
// within a shop and resets after a blind; the seed reproduces every reroll.
export function rerollPrice(state) {
  return 5 + (state.rerolls ?? 0);
}

export function rerollShop(state) {
  if (state.phase !== 'shop' || state.credits < rerollPrice(state)) return state;
  const available = jokers.slice(0, state.catalogSize ?? 7).map((joker, id) => ({ joker, id }))
    .filter(({ joker, id }) => !state.owned.includes(id) && !joker.legendary && !joker.prototype)
    .map(({ id }) => id);
  if (!available.length) return state;
  const oldOffers = state.offers ?? [];
  const nextRoll = state.rerolls ?? 0;
  const random = seededRandom(state.seed, 'shop-reroll', state.round * 100000 + nextRoll);
  // Prefer unfamiliar offers; refill from previous cards only if necessary.
  const fresh = shuffle(available.filter(id => !oldOffers.includes(id)), random);
  const repeats = shuffle(available.filter(id => oldOffers.includes(id)), random);
  return { ...state, credits: state.credits - rerollPrice(state),
    offers: [...fresh, ...repeats].slice(0, 3), rerolls: nextRoll + 1 };
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
  const roll = random();
  return count >= packs[2].count && roll < 0.12 ? 2 :
    count >= packs[1].count && roll < 0.35 ? 1 : 0;
}

function jokerPackCandidates(state) {
  return jokers.map((joker, id) => ({ joker, id }))
    .filter(({ joker, id }) => id < (state.catalogSize ?? jokers.length) &&
      !state.owned.includes(id) && !joker.legendary && !joker.prototype)
    .map(({ id }) => id);
}

export function offeredJokerPack(state) {
  if (state.phase !== 'shop' || state.jokerPackBought ||
      (state.character !== 'negatif' && jokerSlotsUsed(state) >= 3)) return undefined;
  const count = jokerPackCandidates(state).length;
  if (count < jokerPacks[0].count) return undefined;
  const random = seededRandom(state.seed, 'joker-pack-offer', state.round);
  return count >= jokerPacks[1].count && random() < 0.3 ? 1 : 0;
}

// Drawing a joker pack never modifies the shop offers or the saved collection.
// The selected joker is added only after a valid choice.
export function openJokerPack(state, id) {
  const pack = jokerPacks[id];
  if (!pack || offeredJokerPack(state) !== id ||
      state.credits < shopPrice(state, pack.price)) return state;
  const available = jokerPackCandidates(state);
  const choices = shuffle(available,
    seededRandom(state.seed, 'joker-pack-contents', state.round)).slice(0, pack.count);
  if (choices.length !== pack.count) return state;
  return { ...state, phase: 'joker-pack', jokerPackBought: true,
    credits: state.credits - shopPrice(state, pack.price), jokerPackChoices: choices };
}

export function chooseJokerPack(state, id) {
  if (state.phase !== 'joker-pack') return state;
  if (id === null) return { ...state, phase: 'shop', jokerPackChoices: [] };
  if (!Number.isInteger(id) || !state.jokerPackChoices?.includes(id) ||
      state.owned.includes(id) || !jokers[id] ||
      (state.character !== 'negatif' && jokerSlotsUsed(state) >= 3)) return state;
  return { ...state, phase: 'shop', jokerPackChoices: [],
    owned: [...state.owned, id],
    negativeSlots: state.character === 'negatif'
      ? [...(state.negativeSlots ?? []), state.owned.length] : state.negativeSlots,
    offers: (state.offers ?? []).filter(offer => offer !== id) };
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
  if (id === null) return { ...state, phase: state.returnToCasino ? 'casino' : 'shop',
    choices: [], pendingAugure: null, returnToCasino: false };
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
  return { ...state, phase: state.returnToCasino ? 'casino' : 'shop',
    choices: [], pendingAugure: null, returnToCasino: false,
    enhancements: { ...(state.enhancements ?? {}), [cardId]: state.pendingAugure } };
}

export function pruneDeck(state, ids) {
  if (state.phase !== 'prune') return state;
  if (ids === null) return { ...state, phase: 'pack' };
  if (!ids.length || ids.length > removableCount(state) || new Set(ids).size !== ids.length ||
      ids.some(id => !remainingDeck(state).some(card => card.id === id))) return state;
  return { ...state, phase: state.returnToCasino ? 'casino' : 'shop',
    returnToCasino: false, choices: [], removed: [...(state.removed ?? []), ...ids] };
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
  return { ...state, phase: state.casinoPath?.length ? 'casino' : 'shop',
    endless: true, casinoSkipSummary: [] };
}

export function advance(state) {
  if (state.phase !== 'shop') return state;
  return deal({ seed: state.seed, legacy: state.legacy ?? false, endless: state.endless ?? false, round: state.round + 1,
    credits: state.credits, owned: state.owned, catalogSize: state.catalogSize,
    consumables: state.consumables ?? [], character: state.character,
    handHistory: state.handHistory ?? [],
    bonusCards: state.bonusCards, polychromeSlots: state.polychromeSlots,
    enhancements: state.enhancements, removed: state.removed, negativeSlots: state.negativeSlots,
    casinoPath: state.casinoPath, casinoTags: state.casinoTags,
    freeCasinoPacks: state.freeCasinoPacks, selectedBlind: undefined,
    casinoSkipSummary: [] });
}
