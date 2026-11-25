import test from 'node:test';
import assert from 'node:assert/strict';
import { advance, blindFor, blinds, buy, continueRun, deck, evaluate, jokers, previewHand, restoreRun, start, useCards } from './game.mjs';

const cards = (...ids) => ids.map(id => deck.find(c => c.id === id));

test('les neuf combinaisons, dont la quinte avec as bas', () => {
  const cases = [
    ['Carte haute', '♠14', '♦7'],
    ['Paire', '♠10', '♦10', '♣14'],
    ['Double paire', '♠10', '♦10', '♣14', '♥14'],
    ['Brelan', '♠10', '♦10', '♣10'],
    ['Quinte', '♠14', '♦2', '♣3', '♦4', '♥5'],
    ['Couleur', '♠2', '♠4', '♠6', '♠8', '♠10'],
    ['Full', '♠10', '♦10', '♣10', '♠14', '♥14'],
    ['Carré', '♠10', '♦10', '♣10', '♥10', '♠14'],
    ['Quinte flush', '♠10', '♠11', '♠12', '♠13', '♠14'],
  ];
  for (const [name, ...ids] of cases) assert.equal(evaluate(cards(...ids)).name, name);
});

test('jetons, cartes marquantes et ordre des bonus', () => {
  assert.deepEqual(evaluate(cards('♥10', '♦10', '♥14'), [4, 5]),
    { name: 'Paire', chips: 75, mult: 4, total: 300 });
  assert.deepEqual(evaluate(cards('♥10', '♥11', '♥12', '♥13', '♥14'), [1, 3]),
    { name: 'Quinte flush', chips: 144, mult: 22, total: 3168 });
});

test('défausse, pioche et perte après la dernière main', () => {
  let state = start('test');
  const id = state.hand[0].id;
  assert.equal(useCards(state, [id, id], 'discard'), state);
  state = useCards(state, [id], 'discard');
  assert.equal(state.hand.length, 8);
  assert.equal(state.pile.length, 43);
  assert.equal(state.discards, 2);
  assert.ok(state.hand.every(c => c.id !== id));
  assert.equal(new Set([...state.hand, ...state.pile].map(c => c.id)).size, 51);
  for (let i = 0; i < 4; i++) state = useCards(state, [state.hand[0].id], 'play');
  assert.equal(state.phase, 'lose');
  assert.equal(state.plays, 0);
});

test('huit mises, contraintes des boss, boutique et victoire', () => {
  let state = start('test');
  for (const [round] of blinds.entries()) {
    const hand = cards('♥10', '♥11', '♥12', '♥13', '♥14');
    state = useCards({ ...state, hand }, hand.map(c => c.id), 'play');
    assert.equal(state.round, round);
    assert.equal(state.reward, 3 + (blinds[round].plays ?? 4));
    if (round === blinds.length - 1) break;
    assert.equal(state.phase, 'shop');
    const id = state.offers[0];
    assert.equal(buy({ ...state, credits: 0 }, id).credits, 0);
    const next = buy(state, id);
    if (state.owned.length < 3) {
      assert.equal(next.owned.length, state.owned.length + 1);
      assert.ok(next.credits < state.credits);
      assert.equal(buy(next, id), next);
    } else assert.equal(next, state);
    state = advance(next);
    assert.deepEqual(state.owned, next.owned);
    assert.equal(state.plays, blindFor(state).plays ?? 4);
    assert.equal(state.discards, blindFor(state).discards ?? 3);
    assert.equal(state.hand.length, blindFor(state).size ?? 8);
    assert.equal(state.score, 0);
  }
  assert.equal(state.phase, 'win');
  assert.equal(advance(state), state);
  const endlessShop = continueRun(state);
  assert.equal(endlessShop.phase, 'shop');
  const endless = advance(endlessShop);
  assert.equal(blindFor(endless).ante, 9);
  assert.equal(endless.seed, state.seed);
  assert.deepEqual(advance(restoreRun(JSON.parse(JSON.stringify(endlessShop)))), endless);
});

test('la même seed reproduit la pioche et la boutique après sauvegarde', () => {
  const original = start('Même seed');
  assert.deepEqual(start('Même seed'), original);
  assert.notDeepEqual(start('Autre seed').hand, original.hand);
  const ids = original.hand.slice(0, 3).map(card => card.id);
  const discarded = useCards(original, ids, 'discard');
  const restored = restoreRun(JSON.parse(JSON.stringify(discarded)));
  assert.deepEqual(restored, discarded);

  const hand = cards('♥10', '♥11', '♥12', '♥13', '♥14');
  const win = state => useCards({ ...state, hand }, hand.map(card => card.id), 'play');
  const shop = win(discarded);
  assert.equal(shop.phase, 'shop');
  assert.deepEqual(win(restored), shop);
  assert.deepEqual(advance(restoreRun(JSON.parse(JSON.stringify(shop)))), advance(shop));
});

test('une sauvegarde du prototype conserve la progression à six blindes', () => {
  const { seed, catalogSize, ...old } = start('ancienne');
  const saved = { ...old, round: 5 };
  const restored = restoreRun(saved);
  assert.equal(blindFor(restored).name, 'L’Œil du vent');
  assert.deepEqual(restored.hand, saved.hand);
  const hand = cards('♥10', '♥11', '♥12', '♥13', '♥14');
  assert.equal(useCards({ ...restored, hand }, hand.map(c => c.id), 'play').phase, 'win');
});

test('un boss du mode infini reste battable avec le paquet distribué', () => {
  for (const seed of ['TALUS', 'VENT', 'PHARE']) {
    let state = advance({ ...start(seed), endless: true, phase: 'shop', round: 301 });
    const target = blindFor(state).target;
    assert.ok(target > 0 && target < 10000);
    assert.equal(blindFor(restoreRun(JSON.parse(JSON.stringify(state)))).target, target);
    while (state.phase === 'play') {
      let best = { cards: [], total: 0 };
      for (let mask = 1; mask < 2 ** state.hand.length; mask++) {
        const cards = state.hand.filter((_, index) => (mask >> index) & 1);
        if (cards.length > 5) continue;
        const { total } = evaluate(cards, state.owned);
        if (total > best.total) best = { cards, total };
      }
      state = useCards(state, best.cards.map(card => card.id), 'play');
    }
    assert.equal(state.phase, 'shop');
    assert.ok(state.score >= target);
  }
});

test('le joker π applique le facteur final puis arrondit le score', () => {
  const orbit = jokers.findIndex(joker => joker.theme === 'orbit');
  const hand = cards('♥10', '♦10');
  const preview = evaluate(hand, [1, orbit]);
  assert.equal(preview.chips, 35);
  assert.equal(preview.mult, 5 * Math.PI);
  assert.equal(preview.total, Math.floor(175 * Math.PI));
});

test('les nouveaux jokers utilisent les cartes gardées et le numéro de main dans le score réel', () => {
  const owned = ['Veilleuse', 'Lest', 'Feu de départ'].map(name => jokers.findIndex(j => j.name === name));
  const hand = cards('♥10', '♦10', '♠7', '♣3', '♥13', '♣12');
  const played = hand.slice(0, 4);
  const state = { ...start('joker-context'), hand, owned };
  const preview = previewHand(state, played);
  assert.equal(preview.chips, 70);
  assert.equal(preview.mult, 10.5);
  const { steps, ...scored } = useCards(state, played.map(c => c.id), 'play').last;
  assert.deepEqual(scored, preview);
  assert.deepEqual(steps, [
    { type: 'base', chips: 15, mult: 2, cardChips: 20 },
    { type: 'add', id: owned[0], chips: 0, mult: 4 },
    { type: 'add', id: owned[1], chips: 35, mult: 0 },
    { type: 'factor', id: owned[2], factor: 1.75 },
  ]);
  assert.equal(previewHand({ ...state, plays: 3 }, played).mult, 6);
  assert.equal(restoreRun({ ...state, catalogSize: undefined }).catalogSize, 7);
});

test('les figures et les as valent onze jetons', () => {
  for (let rank = 2; rank <= 14; rank++) {
    const result = evaluate(cards('♠' + rank));
    assert.equal(result.chips - 8, Math.min(rank, 11));
  }
});
