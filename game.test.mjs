import test from 'node:test';
import assert from 'node:assert/strict';
import { advance, applyAugure, casinoBoard, casinoOffers, chooseCasinoRoom, skipCasinoRow, openCasino, openCasinoBonusPack, startInCasino, characterFor, characters, consumableSlotsFor, shopPrice, blindFor, blinds, buy, buyConsumable, cancelAugureTarget, chooseAugure, chooseEclipse, consumableOffer, continueRun, deckFor, eclipseOffer, deck, evaluate, jokers, jokerSlotsUsed, offeredPack, offeredJokerPack, openEclipse, openPack, openJokerPack, chooseJokerPack, jokerPacks, packs, previewHand, pruneDeck, restoreRun, reorderConsumable, reorderJoker, sellJoker, start, useCards, useConsumable } from './game.mjs';

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
    state = useCards({ ...state, hand, score: blindFor(state).target - 1 }, hand.map(c => c.id), 'play');
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
    { type: 'add', id: owned[0], slot: 0, chips: 0, mult: 4 },
    { type: 'add', id: owned[1], slot: 1, chips: 35, mult: 0 },
    { type: 'factor', id: owned[2], slot: 2, factor: 1.75 },
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

test('une pochette tirée par la seed survit à un rechargement et transforme une carte', () => {
  const shop = { ...start('augures'), phase: 'shop', credits: 8 };
  const id = offeredPack(shop);
  const opened = openPack(shop, id);
  assert.equal(opened.credits, 8 - packs[id].price);
  assert.equal(opened.choices.length, packs[id].count);
  assert.deepEqual(opened, openPack(shop, id));
  assert.equal(openPack(shop, 1 - id), shop);
  const offered = Array.from({ length: 32 }, (_, i) => offeredPack({ ...shop, seed: String(i) }));
  assert.ok(offered.every(id => Number.isInteger(id) && id >= 0 && id < packs.length));
  assert.ok(offered.includes(0));
  assert.equal(advance(opened), opened);
  const saved = restoreRun(JSON.parse(JSON.stringify(opened)));
  const choice = saved.choices.find(card => card.augure !== 'prune');
  const picking = chooseAugure(saved, choice.id);
  assert.equal(picking.phase, 'augure-target');
  assert.equal(cancelAugureTarget(picking).phase, 'pack');
  const target = deckFor(saved).find(card => card.id !== choice.id);
  const resolved = applyAugure(picking, target.id);
  assert.equal(resolved.enhancements[target.id], choice.augure);
  assert.equal(resolved.enhancements[choice.id], undefined);
  assert.equal(openPack(resolved, id), resolved);
  const next = advance(resolved);
  assert.equal([...next.hand, ...next.pile].find(card => card.id === target.id).augure, choice.augure);
  assert.equal(chooseAugure(saved, null).credits, opened.credits);
});

test('Prisme agit seulement sur les cartes marquantes et Armure sur les cartes gardées', () => {
  const [a, b, c, d, e] = cards('♥10', '♦10', '♣14', '♠4', '♣5');
  const played = [{ ...a, augure: 'prism' }, b, { ...c, augure: 'prism' }];
  const { mult, chips, steps } = evaluate(played, [1], {
    hand: [...played, { ...d, augure: 'steel' }, { ...e, augure: 'steel' }], trace: true,
  });
  assert.equal(mult, (2 + 10) * 2.25 + 3);
  assert.equal(chips, 35);
  assert.deepEqual(steps.slice(1, 4).map(step => step.name), ['Prisme', 'Armure', 'Armure']);
});

test('Réserve ajoute des jetons, Caméléon complète une couleur et active les jokers d’enseigne', () => {
  const hand = cards('♥2', '♥5', '♥7', '♥9', '♣11');
  hand[0] = { ...hand[0], augure: 'bonus' };
  hand[4] = { ...hand[4], augure: 'wild' };
  const result = evaluate(hand, [5], { trace: true });
  assert.equal(result.name, 'Couleur');
  assert.equal(result.chips, 104);
  assert.equal(result.mult, 15);
  assert.equal(result.steps[1].name, 'Réserve');
});

test('Ducat rapporte uniquement quand la carte est gardée sur la main gagnante', () => {
  const [a, b, c] = cards('♥10', '♦10', '♣11');
  const state = { ...start('ducat'), target: 40, hand: [
    a, { ...b, augure: 'gold' }, { ...c, augure: 'gold' },
  ] };
  const won = useCards(state, [a.id, b.id], 'play');
  assert.equal(won.phase, 'shop');
  assert.equal(won.goldReward, 3);
  assert.equal(won.credits - state.credits, 10);
});

test('Fil coupé retire de une à cinq cartes, qui ne reviennent pas à la distribution', () => {
  const state = { ...start('fil-coupe'), phase: 'pack', choices: [{ id: 'prune', augure: 'prune' }] };
  const picking = chooseAugure(state, 'prune');
  assert.equal(pruneDeck(picking, null).phase, 'pack');
  assert.equal(pruneDeck(picking, []), picking);
  const ids = deck.slice(0, 6).map(card => card.id);
  assert.equal(pruneDeck(picking, ids), picking);
  const removed = ids.slice(0, 5);
  const result = pruneDeck(picking, removed);
  assert.deepEqual(result.removed, removed);
  const next = advance(result);
  assert.ok([...next.hand, ...next.pile].every(card => !removed.includes(card.id)));
  assert.deepEqual(next, advance(restoreRun(JSON.parse(JSON.stringify(result)))));
  assert.equal(pruneDeck(picking, removed.slice(0, 1)).removed.length, 1);
});

test('les Éclipses conservent les jokers et la main, et la copie utilise une place normale', () => {
  const base = { ...start('eclipse'), phase: 'shop', credits: 10, owned: [0, 1], negativeSlots: [0] };
  const seed = Array.from({ length: 32 }, (_, i) => String(i)).find(seed => eclipseOffer({ ...base, seed }));
  const shop = { ...base, seed };
  const pack = openEclipse(shop);
  assert.equal(pack.credits, 5);
  assert.deepEqual(pack, openEclipse(shop));
  const negative = chooseEclipse(pack, 'negative');
  assert.deepEqual(negative.owned, base.owned);
  assert.equal(jokerSlotsUsed(negative), 0);
  assert.equal(advance(negative).hand.length, 8);
  const copy = chooseEclipse({ ...pack, eclipse: { ...pack.eclipse, copy: 0 } }, 'copy');
  assert.deepEqual(copy.owned, [0, 1, 0]);
  assert.deepEqual(copy.negativeSlots, [0]);
  assert.equal(jokerSlotsUsed(copy), 2);
  assert.equal(openEclipse(copy), copy);
});

test('une seed fixe la blinde dès la distribution et le paquet réduit peut avoir une cible réalisable', () => {
  const opening = start('fixe');
  assert.equal(start('fixe').target, opening.target);
  const removed = deck.slice(0, 44).map(card => card.id);
  let state = advance({ ...opening, phase: 'shop', round: 300, endless: true, removed });
  const target = state.target;
  assert.ok(target > 0);
  while (state.phase === 'play') {
    let best = { cards: [], total: 0 };
    for (let mask = 1; mask < 2 ** state.hand.length; mask++) {
      const cards = state.hand.filter((_, index) => (mask >> index) & 1);
      if (cards.length > 5) continue;
      const { total } = previewHand(state, cards);
      if (total > best.total) best = { cards, total };
    }
    state = useCards(state, best.cards.map(card => card.id), 'play');
    assert.equal(state.target, target);
  }
  assert.equal(state.phase, 'shop');
});

test('les trois types de blinde partent du même barème de mise', () => {
  assert.deepEqual(blinds.slice(0, 3).map(blind => blind.target), [300, 450, 600]);
  assert.ok(start('limite').target <= 300);
});

test('vente en boutique, slots négatifs, copie et sauvegardes', () => {
  const shop = { ...start('vente'), phase: 'shop', owned: [0,1,2],
    negativeSlots: [1], credits: 0, offers: [3] };
  const sold = sellJoker(shop,0);
  assert.deepEqual(sold.owned,[1,2]);
  assert.deepEqual(sold.negativeSlots,[0]);
  assert.equal(sold.credits,2);
  assert.equal(jokerSlotsUsed(sold),1);
  assert.deepEqual(restoreRun(JSON.parse(JSON.stringify(sold))),sold);
  const bought = buy({...sold,credits:10},3);
  assert.deepEqual(bought.owned,[1,2,3]);
  assert.equal(jokerSlotsUsed(bought),2);
  const negativeSold = sellJoker(shop,1);
  assert.deepEqual(negativeSold.negativeSlots,[]);
  assert.equal(jokerSlotsUsed(negativeSold),2);
  assert.equal(sellJoker(shop,-1),shop);
  assert.equal(sellJoker(shop,3),shop);
  assert.equal(sellJoker(shop,1.5),shop);
  const playing={...shop,phase:'play'};
  assert.equal(sellJoker(playing,0),playing);
  assert.deepEqual(sellJoker({...shop,owned:[0,0],negativeSlots:[0]},0).negativeSlots,[]);
});

test('consommables : deux emplacements, achat, activation et sauvegarde', () => {
  let shop = { ...start('DEUX-SLOTS'), phase: 'shop', credits: 40 };
  const first = consumableOffer(shop);
  shop = buyConsumable(shop, first.id);
  assert.deepEqual(shop.consumables, [first.id]);
  assert.equal(shop.credits, 40 - first.price);
  assert.equal(buyConsumable(shop, first.id), shop);
  shop = { ...shop, consumableBought: false, seed: 'AUTRE' };
  const second = consumableOffer(shop);
  shop = buyConsumable(shop, second.id);
  assert.equal(shop.consumables.length, 2);
  const full = { ...shop, consumableBought: false };
  assert.equal(buyConsumable(full, second.id), full);
  const round = advance(restoreRun(JSON.parse(JSON.stringify(shop))));
  assert.deepEqual(round.consumables, shop.consumables);
  const slot = round.consumables.indexOf('bourse') >= 0 ? round.consumables.indexOf('bourse') : 0;
  const used = useConsumable(round, slot);
  assert.equal(used.consumables.length, 1);
  const kind = round.consumables[slot];
  if (kind === 'bourse') assert.equal(used.credits, round.credits + 5);
  if (kind === 'relance') assert.equal(used.discards, round.discards + 1);
  if (kind === 'souffle') assert.equal(used.plays, round.plays + 1);
  assert.equal(useConsumable(round, 2), round);
  const finished = { ...round, phase: 'lose' };
  assert.equal(useConsumable(finished, slot), finished);
});


test('consommables : glisser change l’ordre, sans consommer ni perdre la sauvegarde', () => {
  const run = { ...start('GLISSER-CARTES'), phase: 'play',
    consumables: ['bourse', 'souffle', 'relance'] };
  const moved = reorderConsumable(run, 0, 2);
  assert.deepEqual(moved.consumables, ['souffle', 'relance', 'bourse']);
  assert.deepEqual(run.consumables, ['bourse', 'souffle', 'relance']);
  assert.equal(moved.credits, run.credits);
  assert.equal(moved.plays, run.plays);
  assert.equal(moved.discards, run.discards);
  assert.deepEqual(restoreRun(JSON.parse(JSON.stringify(moved))).consumables,
    moved.consumables);
  assert.equal(reorderConsumable(run, 1, 1), run);
  assert.equal(reorderConsumable(run, -1, 1), run);
  assert.equal(reorderConsumable(run, 0, 3), run);
  assert.equal(reorderConsumable(run, 0.5, 1), run);
  const used = useConsumable(moved, 2);
  assert.deepEqual(used.consumables, ['souffle', 'relance']);
  assert.equal(used.credits, run.credits + 5);
  const duplicates = { ...run, consumables: ['bourse', 'souffle', 'bourse'] };
  assert.deepEqual(reorderConsumable(duplicates, 0, 2).consumables,
    ['souffle', 'bourse', 'bourse']);
});

test('Augure : le joueur choisit la carte cible indépendamment de la pochette', () => {
  const base = { ...start('CIBLE-CHOISIE'), phase: 'shop', credits: 10 };
  const opened = openPack(base, offeredPack(base));
  const choice = opened.choices.find(card => card.augure !== 'prune');
  const pending = chooseAugure(opened, choice.id);
  assert.equal(pending.phase, 'augure-target');
  assert.equal(applyAugure(pending, 'inconnue'), pending);
  const chosen = deckFor(base).find(card => card.id !== choice.id);
  const result = applyAugure(pending, chosen.id);
  assert.equal(result.enhancements[chosen.id], choice.augure);
  assert.equal(result.enhancements[choice.id], undefined);
  assert.equal(result.phase, 'shop');
});

test('les onze personnages sont proposés avec une option classique compatible', () => {
  assert.equal(characters.length, 12);
  assert.equal(new Set(characters.map(c => c.id)).size, 12);
  assert.equal(characterFor(start('legacy')).id, 'classique');
  assert.equal(characterFor({}).id, 'classique');
  assert.equal(start('riche', 'riche').credits, 13);
  assert.equal(start('ordinaire').credits, 3);
  assert.deepEqual(start('FIXE', 'chanceux'), start('FIXE', 'chanceux'));
  const chanceux = start('FIXE', 'chanceux');
  assert.equal(Object.keys(chanceux.enhancements).length, 1);
  assert.ok(deck.some(c => c.id === Object.keys(chanceux.enhancements)[0]));
  assert.equal(start('X', 'stratege').discards, 5);
  assert.equal(consumableSlotsFor(start('X', 'magicien')), 4);
  assert.equal(consumableSlotsFor(start('X')), 2);
  assert.equal(start('X', 'copieur-supreme').owned.length, 1);
  assert.equal(jokers[start('X', 'copieur-supreme').owned[0]].key, 'plan');
  assert.ok(jokers[start('X', 'joueur').owned[0]].legendary);
  assert.deepEqual(start('FIXE', 'joueur'), start('FIXE', 'joueur'));
  assert.equal(jokers[start('X', 'as-copieur').owned[0]].key, 'adn');
});

test('Le Négatif achète des jokers sans limite et préserve la place libre', () => {
  let s = start('NEGATIF', 'negatif');
  for (const i of [0, 1, 2, 3]) {
    s = buy({ ...s, phase: 'shop', credits: 100, offers: [i] }, i);
  }
  assert.equal(s.owned.length, 4);
  assert.deepEqual(s.negativeSlots, [0, 1, 2, 3]);
  assert.equal(jokerSlotsUsed(s), 0);
  const sold = sellJoker(s, 1);
  assert.deepEqual(sold.negativeSlots, [0, 1, 2]);
});
test('Le Marchand bénéficie du même prix affiché et payé', () => {
  const s = start('MARCHAND', 'marchand');
  assert.equal(shopPrice(s, 5), 4);
  assert.equal(shopPrice(s, 4), 3);
  let shop = { ...s, phase: 'shop', credits: 20, offers: [0] };
  const purchased = buy(shop, 0);
  assert.equal(shop.credits - purchased.credits, shopPrice(shop, jokers[0].price));
  const c = consumableOffer(shop);
  assert.equal(shop.credits - buyConsumable(shop, c.id).credits, shopPrice(shop, c.price));
  const pack = offeredPack(shop);
  assert.equal(shop.credits - openPack(shop, pack).credits, shopPrice(shop, packs[pack].price));
});
test('Le Multiplieur commence avec un polychrome qui multiplie le total', () => {
  const s = start('POLY', 'multiplieur');
  assert.equal(s.owned.length, 1);
  assert.deepEqual(s.polychromeSlots, [0]);
  const cards = deck.filter(c => ['♠2', '♥2'].includes(c.id));
  const base = evaluate(cards, s.owned).total;
  const value = previewHand({ ...s, hand: cards }, cards);
  assert.equal(value.total, Math.floor(base * 1.5));
  const sold = sellJoker({ ...s, phase: 'shop', credits: 0 }, 0);
  assert.deepEqual(sold.polychromeSlots, []);
});
test('Plan copie le joker de droite et ADN ajoute une copie en main et au paquet', () => {
  const plan = jokers.findIndex(j => j.key === 'plan');
  const normal = evaluate(deck.slice(0, 1), [1]);
  const copied = evaluate(deck.slice(0, 1), [plan, 1]);
  assert.equal(copied.mult, normal.mult + 3);
  assert.equal(evaluate(deck.slice(0, 1), [plan]).mult, 1);
  const chain = evaluate(deck.slice(0, 1), [plan, plan, 1]);
  assert.equal(chain.mult, normal.mult + 6);
  let s = start('ADN', 'as-copieur');
  const first = s.hand[0];
  const after = useCards(s, [first.id], 'play');
  assert.equal(after.bonusCards.length, 1);
  assert.equal(after.bonusCards[0].rank, first.rank);
  assert.notEqual(after.bonusCards[0].id, first.id);
  assert.equal(after.hand.length, s.hand.length, 'la copie remplace la pioche normale');
  assert.equal(after.pile.length, s.pile.length, 'ADN ne consomme pas la prochaine carte');
  assert.ok(after.hand.some(card => card.id === after.bonusCards[0].id),
    'la copie permanente rejoint la main immédiatement');
  assert.equal(useCards(after, [after.hand[0].id], 'play').bonusCards.length, 1,
    'ADN ne se redéclenche pas à la deuxième main');
  const afterNext = advance({ ...after, phase: 'shop' });
  assert.ok(deckFor(afterNext).some(c => c.id === after.bonusCards[0].id));
  const notSingle = useCards(s, s.hand.slice(0, 2).map(c => c.id), 'play');
  assert.equal(notSingle.bonusCards, undefined);
});
test('ADN respecte la taille de main et se cumule avec les jokers copieurs', () => {
  const original = start('ADN-MAINS', 'as-copieur');
  const dna = jokers.findIndex(j => j.key === 'adn');
  const plan = jokers.findIndex(j => j.key === 'plan');
  const blueprint = jokers.findIndex(j => j.key === 'blueprint');
  const brainstorm = jokers.findIndex(j => j.key === 'brainstorm');
  const firstId = original.hand[0].id;

  // ADN alone does not replace extra cards once the normal hand is refilled.
  const lone = useCards(original, [firstId], 'play');
  assert.equal(lone.hand.length, 8);
  assert.equal(lone.bonusCards.length, 1);

  for (const owned of [[dna, dna], [plan, dna], [blueprint, dna],
                       [dna, brainstorm], [plan, blueprint, dna]]) {
    const state = { ...original, owned };
    const next = useCards(state, [firstId], 'play');
    const expected = owned.length === 3 ? 3 : 2;
    assert.equal(next.bonusCards.length, expected, 'une carte par activation ADN');
    assert.equal(next.hand.length, 7 + expected, 'les copies peuvent dépasser 8');
    assert.equal(next.pile.length, state.pile.length, 'pas de pioche si main pleine');
    assert.equal(new Set(next.bonusCards.map(card => card.id)).size, expected);
    assert.deepEqual(restoreRun(JSON.parse(JSON.stringify(next))), next);
    assert.equal(deckFor(next).length, deckFor(state).length + expected);
  }

  // With a partial hand, draw only the missing cards up to the limit.
  const shortState = { ...original, hand: original.hand.slice(0, 4) };
  const refilled = useCards(shortState, [firstId], 'play');
  assert.equal(refilled.hand.length, 8);
  assert.equal(refilled.pile.length, original.pile.length - 4);

  // The copied card keeps its actual enhancement, not only rank and suit.
  const enhanced = { ...original, hand: [{ ...original.hand[0], augure: 'steel' }, ...original.hand.slice(1)] };
  const copied = useCards(enhanced, [firstId], 'play');
  assert.equal(copied.bonusCards[0].augure, 'steel');

  const multiCardPlay = useCards({ ...original, owned: [plan, dna] },
    original.hand.slice(0, 2).map(card => card.id), 'play');
  assert.equal(multiCardPlay.bonusCards, undefined);
});

test('Le Tricheur garde tous les bonus de première main et les sauvegardes existantes', () => {
  const first = jokers.findIndex(j => j.name === 'Feu de départ');
  const a = deck[0];
  const tricheur = { ...start('TRICHE', 'tricheur'), owned: [first], plays: 2 };
  const normal = { ...start('NORMAL'), owned: [first], plays: 2 };
  assert.equal(previewHand(tricheur, [a]).total, Math.floor(previewHand(normal, [a]).total * 1.75));
  const legacy = restoreRun({ ...start('old'), character: undefined });
  assert.equal(characterFor(legacy).id, 'classique');
  assert.deepEqual(restoreRun(JSON.parse(JSON.stringify(tricheur))), tricheur);
});
test('Le Magicien conserve quatre consommables sans les imposer aux autres', () => {
  let s = { ...start('MAG', 'magicien'), phase: 'shop', credits: 50 };
  for (let i = 0; i < 4; i++) {
    s = { ...s, consumableBought: false, round: i };
    const offer = consumableOffer(s);
    s = buyConsumable(s, offer.id);
    assert.equal(s.consumables.length, i + 1);
  }
  s = { ...s, consumableBought: false };
  assert.equal(buyConsumable(s, consumableOffer(s).id), s);
  const next = advance(s);
  assert.equal(next.consumables.length, 4);
});

test('trois blindes se chevauchent : chaque choix est jouable indépendamment', () => {
  const start = startInCasino('CASINO-THREE');
  const offers = casinoOffers(start);
  assert.equal(offers.length, 3);
  assert.deepEqual(offers.map(x => x.blind.kind), ['Petite blinde','Petite blinde','Petite blinde']);
  assert.deepEqual(casinoBoard(start).map(x=>x.column),[0,0,0,1,1,1,2,2,2]);
  for (const lane of [0, 1, 2]) {
    const chosen = chooseCasinoRoom(start, lane);
    assert.equal(chosen.phase, 'play');
    assert.equal(chosen.round, 0);
    assert.equal(chosen.selectedBlind.kind, offers[lane].blind.kind);
  }
  assert.equal(chooseCasinoRoom(start, 3), start);
});
test('Skip : tous les trois bonus sans choisir et sans objet consommable', () => {
  const state = startInCasino('SKIP-ALL');
  const skipped = skipCasinoRow(state);
  assert.equal(skipped.round, 0);
  assert.equal(skipped.phase, 'casino');
  assert.equal(skipped.casinoSkipSummary.length, 3);
  assert.equal(skipped.credits, state.credits + 4);
  assert.equal(skipped.freeCasinoPacks, 1);
  assert.equal(skipped.casinoTags.length, 1);
  assert.equal(skipped.casinoTags[0].kind, 'hands');
  assert.deepEqual(skipped.consumables, []);
  assert.deepEqual(skipCasinoRow(state), skipped);
  assert.equal(chooseCasinoRoom(skipped, 1).plays, 7);
  assert.deepEqual(restoreRun(JSON.parse(JSON.stringify(skipped))), skipped);
});
test('le mode infini existant accède aux trois blindes sans perte de partie', () => {
  const existing = { ...start('OLD-ENDLESS'), phase: 'shop', round: 31, endless: true,
    credits: 123, owned: [0], consumables: ['bourse'] };
  const selection = openCasino(existing);
  assert.equal(selection.phase, 'casino');
  assert.equal(selection.round, 31);
  assert.equal(selection.credits, 123);
  assert.deepEqual(selection.consumables, ['bourse']);
  const picked = chooseCasinoRoom(selection, 2);
  assert.equal(picked.round, 32);
  assert.equal(picked.selectedBlind.kind, 'Boss');
  assert.equal(skipCasinoRow(selection),selection);
});
test('les récompenses de Skip sont utilisables mais pas revendables comme consommables', () => {
  const state = skipCasinoRow(startInCasino('FREE-PACK'));
  const opened = openCasinoBonusPack(state);
  assert.equal(opened.phase, 'pack');
  assert.equal(opened.returnToCasino, true);
  assert.equal(opened.freeCasinoPacks, 0);
  const next = chooseAugure(opened, null);
  assert.equal(next.phase, 'casino');
  assert.equal(next.consumables.length, 0);
  assert.equal(openCasinoBonusPack(next), next);
});

test('déplacer un joker change les copies sans perdre les éditions', () => {
  const plan = jokers.findIndex(j => j.key === 'plan');
  const base = { ...start('ORDRE-JOKERS'), phase: 'shop',
    owned: [plan, 1, 0], negativeSlots: [0, 2], polychromeSlots: [1] };
  const next = reorderJoker(base, 0, 2);
  assert.deepEqual(next.owned, [1, 0, plan]);
  assert.deepEqual(next.negativeSlots, [2, 1]);
  assert.deepEqual(next.polychromeSlots, [0]);
  assert.deepEqual(restoreRun(JSON.parse(JSON.stringify(next))), next);
  assert.equal(reorderJoker(base, 0, 3), base);
  assert.equal(reorderJoker(base, 1, 1), base);
  assert.equal(reorderJoker({ ...base, phase: 'pack' }, 0, 1).owned[0], 1);
  assert.equal(reorderJoker({ ...base, phase: 'eclipse' }, 0, 1).owned[0], 1);
  assert.ok(evaluate([deck[0]], base.owned).mult > evaluate([deck[0]], next.owned).mult);
});
test('sauvegarde d’une nouvelle partie en casino et d’un Skip triple', () => {
  const first = startInCasino('REPRISE-CASINO');
  assert.equal(first.phase, 'casino');
  assert.equal(casinoOffers(first).length, 3);
  assert.deepEqual(restoreRun(JSON.parse(JSON.stringify(first))), first);
  const skipped = skipCasinoRow(first);
  assert.equal(skipped.casinoSkipSummary.length, 3);
  assert.deepEqual(restoreRun(JSON.parse(JSON.stringify(skipped))), skipped);
});

test('carte de neuf blindes avec trois petites à gauche, trois moyennes puis boss',()=>{
 const s=startInCasino('NEUF'), nodes=casinoBoard(s);
 assert.equal(nodes.length,9);
 assert.deepEqual(nodes.map(n=>n.blind.kind),['Petite blinde','Petite blinde','Petite blinde','Grosse blinde','Grosse blinde','Grosse blinde','Boss','Boss','Boss']);
 assert.deepEqual(nodes.filter(n=>n.reachable).map(n=>n.lane),[0,1,2]);
});
test('bifurcation vers les rangées voisines uniquement',()=>{
 const s=startInCasino('CHEMINS');
 const a=chooseCasinoRoom(s,0);
 const mid=openCasino({...a,phase:'shop'});
 assert.deepEqual(casinoOffers(mid).filter(n=>n.reachable).map(n=>n.lane),[0,1]);
 assert.equal(chooseCasinoRoom(mid,2),mid);
 const b=chooseCasinoRoom(mid,1),boss=openCasino({...b,phase:'shop'});
 assert.deepEqual(casinoOffers(boss).filter(n=>n.reachable).map(n=>n.lane),[0,1,2]);
 assert.equal(skipCasinoRow(boss),boss);
 assert.equal(chooseCasinoRoom(boss,2).selectedBlind.kind,'Boss');
});
test('Skip de colonne : exactement trois bonus, boss non skippable et sauvegarde',()=>{
 const s=startInCasino('TRIPLE'),one=skipCasinoRow(s),two=skipCasinoRow(one);
 assert.equal(one.freeCasinoPacks,1);
 assert.equal(one.credits,s.credits+4);
 assert.equal(one.casinoPath.length,1);
 assert.deepEqual(casinoOffers(one).map(n=>n.blind.kind),['Grosse blinde','Grosse blinde','Grosse blinde']);
 assert.equal(two.casinoSkipSummary.length,3);
 assert.equal(two.casinoTags.length,4);
 assert.equal(two.casinoPath.length,2);
 assert.equal(casinoOffers(two)[0].blind.kind,'Boss');
 assert.equal(skipCasinoRow(two),two);
 assert.deepEqual(restoreRun(JSON.parse(JSON.stringify(two))),two);
});


test('packs Tarot : trois tailles, prix cohérents et tirage déterministe', () => {
  const shop = { ...start('TAROTS-2026'), phase: 'shop', credits: 50 };
  assert.equal(packs.length, 3);
  for (const seed of ['TAROTS-2026', 'TAROT-LARGE', 'TAROT-GEANT']) {
    const state = { ...shop, seed };
    const index = offeredPack(state);
    const opened = openPack(state, index);
    assert.equal(opened.phase, 'pack');
    assert.equal(opened.choices.length, packs[index].count);
    assert.equal(state.credits - opened.credits, shopPrice(state, packs[index].price));
    assert.deepEqual(opened, openPack(state, index));
  }
});

test('packs Joker : achat, choix unique, refus des doublons et sauvegarde', () => {
  const shop = { ...start('JOKER-2026'), phase: 'shop', credits: 30 };
  const index = offeredJokerPack(shop);
  assert.ok(index === 0 || index === 1);
  assert.equal(jokerPacks.length, 2);
  const opened = openJokerPack(shop, index);
  assert.equal(opened.phase, 'joker-pack');
  assert.equal(opened.credits, shop.credits - shopPrice(shop, jokerPacks[index].price));
  assert.equal(opened.jokerPackChoices.length, jokerPacks[index].count);
  assert.equal(new Set(opened.jokerPackChoices).size, opened.jokerPackChoices.length);
  assert.deepEqual(openJokerPack(shop, index), opened);
  assert.deepEqual(restoreRun(JSON.parse(JSON.stringify(opened))), opened);
  assert.equal(chooseJokerPack(opened, -1), opened);
  assert.equal(chooseJokerPack(opened, 1.5), opened);
  assert.equal(chooseJokerPack(opened, 9999), opened);
  const id = opened.jokerPackChoices[0];
  const chosen = chooseJokerPack(opened, id);
  assert.deepEqual(chosen.owned, [...shop.owned, id]);
  assert.equal(chosen.phase, 'shop');
  assert.deepEqual(chosen.jokerPackChoices, []);
  assert.equal(offeredJokerPack(chosen), undefined, 'un seul pack Joker par boutique');
  assert.equal(openJokerPack(chosen, index), chosen);
  const skip = chooseJokerPack(opened, null);
  assert.equal(skip.phase, 'shop');
  assert.deepEqual(skip.owned, shop.owned);
});

test('packs Joker : trois places et personnage Négatif respectés', () => {
  const full = { ...start('PLEIN-2026'), phase: 'shop', credits: 50, owned: [0, 1, 2] };
  assert.equal(offeredJokerPack(full), undefined);
  assert.equal(openJokerPack(full, 0), full);
  const neg = { ...start('NEG-JOKER-2026', 'negatif'), phase: 'shop', credits: 50 };
  const opened = openJokerPack(neg, offeredJokerPack(neg));
  const chosen = chooseJokerPack(opened, opened.jokerPackChoices[0]);
  assert.equal(jokerSlotsUsed(chosen), 0);
  assert.deepEqual(chosen.negativeSlots, [neg.owned.length]);
});
