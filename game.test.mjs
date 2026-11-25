import test from 'node:test';
import assert from 'node:assert/strict';
import { advance, blinds, buy, deck, evaluate, start, useCards } from './game.mjs';

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
    { name: 'Quinte flush', chips: 141, mult: 22, total: 3102 });
});

test('défausse, pioche et perte après la dernière main', () => {
  let state = start(() => 0.42);
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

test('les six blindes, achat, conservation des jokers et victoire', () => {
  let state = start(() => 0.42);
  for (const [round] of blinds.entries()) {
    const hand = cards('♥10', '♥11', '♥12', '♥13', '♥14');
    state = useCards({ ...state, hand }, hand.map(c => c.id), 'play', () => 0.42);
    assert.equal(state.round, round);
    assert.equal(state.reward, 7);
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
    state = advance(next, () => 0.42);
    assert.deepEqual(state.owned, next.owned);
    assert.equal(state.plays, 4);
    assert.equal(state.score, 0);
  }
  assert.equal(state.phase, 'win');
  assert.equal(advance(state), state);
});
