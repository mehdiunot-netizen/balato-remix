import { advance, augures, blindFor, buy, chooseAugure, chooseEclipse, continueRun, deckFor, ECLIPSE_PRICE, eclipseOffer, jokers, jokerSlotsUsed, offeredPack, openEclipse, openPack, packs, previewHand, pruneDeck, removableCount, restoreRun, sellJoker, start, useCards } from './game.mjs?v=14';

const game = document.querySelector('#game');
const announcement = document.querySelector('#announcement');
const storageKey = 'contre-pli-v1';
const names = { '♠': 'pique', '♥': 'cœur', '♣': 'trèfle', '♦': 'carreau' };
const scoreFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 3 });
const faces = { 11: 'V', 12: 'D', 13: 'R', 14: 'A' };
let state = restore();
const selected = new Set();
const table = document.querySelector('.table');
const lobby = document.querySelector('.lobby');
const enter = document.querySelector('#enter');
const rules = document.querySelector('#rules');
const scoreDialog = document.querySelector('#score-dialog');
const seedDialog = document.querySelector('#seed-dialog');
const seedInput = document.querySelector('#seed input');
if (state) enter.textContent = 'Reprendre';

function showTable() {
  enter.textContent = "Reprendre";
  persist();
  lobby.hidden = true;
  table.hidden = false;
  render('#blind-name');
}

document.querySelector('#new-run').addEventListener('click', () => seedDialog.showModal());
document.querySelector('#cancel-seed').addEventListener('click', () => seedDialog.close());
document.querySelector('#seed-form').addEventListener('submit', event => {
  event.preventDefault();
  state = start(seedInput.value.trim() || undefined);
  seedDialog.close();
  showTable();
});
enter.addEventListener('click', () => {
  state ??= start();
  showTable();
});

const court = { 11: 'Valet', 12: 'Dame', 13: 'Roi' };
const pipPositions = {
  2: [2, 14], 3: [2, 8, 14], 4: [1, 3, 13, 15], 5: [1, 3, 8, 13, 15],
  6: [1, 3, 7, 9, 13, 15], 7: [1, 3, 5, 7, 9, 13, 15],
  8: [1, 3, 5, 7, 9, 11, 13, 15], 9: [1, 3, 4, 6, 8, 10, 12, 13, 15],
  10: [1, 3, 4, 5, 6, 10, 11, 12, 13, 15],
};

function cardArt(card) {
  if (court[card.rank]) return '<span class="court court-' + card.rank + '"></span>';
  const positions = pipPositions[card.rank];
  if (!positions) return '<span class="suit ace-pip">' + card.suit + '</span>';
  return '<span class="pips">' + positions.map(place => '<span style="grid-area:' +
    (1 + Math.floor((place - 1) / 3)) + '/' + (1 + (place - 1) % 3) + '">' + card.suit + '</span>').join('') + '</span>';
}

function emblem(index, mark) {
  return '<span class="card-emblem emblem-' + index + '" aria-hidden="true"><span>' + mark + '</span></span>';
}

function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.version === 1 && saved.state?.hand && blindFor({
      ...saved.state, legacy: saved.state.legacy ?? !saved.state.seed,
    })) {
      return restoreRun(saved.state);
    }
  } catch {
    // The current session remains playable when storage is unavailable.
  }
  return null;
}

function save(value) {
  localStorage.setItem(storageKey, JSON.stringify({ version: 1, state: value }));
}

function persist() {
  try {
    save(state);
  } catch {
    // Storage failures do not interrupt play.
  }
}

function render(focus, scored = false) {
  const blind = blindFor(state);
  const activations = state.last?.steps?.filter(step => step.id !== undefined) ?? [];
  const loadout = state.owned.map((id, index) => {
    const { mark, name, text } = jokers[id];
    const activation = activations.findIndex(step => step.slot === undefined ? step.id === id : step.slot === index);
    const pulse = scored && activation >= 0;
    const negative = state.negativeSlots?.includes(index);
    return `<li class="${pulse ? 'triggered' : ''}${negative ? ' negative-joker' : ''}${state.phase === 'shop' ? ' draggable-joker' : ''}" data-joker-slot="${index}"${pulse ? ' style="--activation:' + activation + '"' : ''}><details><summary><strong>${emblem(id, mark)}
      ${name}${negative ? ' · Négatif' : ''}</strong>${state.phase === 'shop' ? '<span class="drag-hint" aria-hidden="true">⇢ Glisser</span>' : ''}</summary><small>${text}</small>${state.phase === "shop" ? `<button type="button" class="sell-joker" data-sell="${index}" aria-label="Vendre ${name} pour ${Math.max(1, Math.floor(jokers[id].price / 2))} crédits">Vendre · +${Math.max(1, Math.floor(jokers[id].price / 2))} cr.</button>` : ""}</details></li>`;
  }).join('');

  let content;
  if (state.phase === 'play') {
    const cards = [...state.hand].sort((a, b) => b.rank - a.rank || a.suit.localeCompare(b.suit));
    const preview = selected.size ? previewHand(state, cards.filter(c => selected.has(c.id))) : null;
    content = `
      <section class="play" aria-label="Main en cours">
        <div class="hand-info"><h3>Votre main</h3><span class="pile"><i aria-hidden="true"></i>${state.pile.length} en pioche</span></div>
        <div class="cards">${cards.map((card, i) => {
          const rank = faces[card.rank] || card.rank;
          return `<button class="card ${'♥♦'.includes(card.suit) ? 'red' : ''} ${card.augure || ''}" data-card="${card.id}" style="--tilt:${(i - 3.5) * 2.6}deg;--arc:${Math.abs(i - 3.5) * 3}px"
            aria-label="${court[card.rank] || (card.rank === 14 ? 'As' : rank)} de ${names[card.suit]}${card.augure ? ' · ' + augures[card.augure].name : ''}" aria-pressed="${selected.has(card.id)}"
            ${selected.size === 5 && !selected.has(card.id) ? 'disabled' : ''}>
            <span class="rank" aria-hidden="true">${rank}<small>${card.suit}</small></span>
            <span class="card-art" aria-hidden="true">${cardArt(card)}</span>
            ${card.augure ? `<span class="augure-mark" aria-hidden="true">${augures[card.augure].mark}</span>` : ''}
            <span class="rank opposite" aria-hidden="true">${rank}<small>${card.suit}</small></span>
          </button>`;
        }).join('')}</div>
        <div class="preview" aria-live="polite">${preview ?
          `<strong>${preview.name}</strong><span class="equation"><span class="chips">${preview.chips} jetons</span> × <span class="mult">${scoreFormat.format(preview.mult)}</span> ${Number.isInteger(preview.mult) ? '=' : '≈'} <b>${preview.total}</b></span>` :
          '<span>Sélectionnez de 1 à 5 cartes.</span>'}</div>
        <div class="actions">
          <button class="primary" data-action="play" ${selected.size ? '' : 'disabled'}>Jouer <small>${state.plays} mains</small></button>
          <button data-action="discard" ${selected.size && state.discards ? '' : 'disabled'}>Défausser <small>${state.discards} restantes</small></button>
        </div>
      </section>`;
  } else if (state.phase === 'eclipse') {
    content = `
      <section class="shop">
        <header class="shop-header"><div><h3 tabindex="-1">Éclipses</h3><p>Choisis un effet.</p></div>
          <button data-action="skip-eclipse">Passer</button></header>
        <ul class="offers eclipse-options">${Object.entries(state.eclipse).map(([effect, index]) => {
          if (index === null) return '';
          const joker = jokers[state.owned[index]];
          const title = effect === 'negative' ? 'Halo noir' : 'Reflet';
          const text = effect === 'negative' ? 'Ce joker libère son emplacement.' : 'Ajoute une copie normale. Tous tes jokers restent équipés.';
          return `<li>${emblem(effect === 'negative' ? 14 : 15, effect === 'negative' ? '◐' : '◫')}<strong>${title} · ${joker.name}</strong><small>${text}</small>
            <button class="primary" data-eclipse="${effect}">Appliquer</button></li>`;
        }).join('')}</ul>
      </section>`;
  } else if (state.phase === 'prune') {
    const limit = removableCount(state);
    content = `
      <section class="shop prune-shop">
        <header class="shop-header"><div><h3 tabindex="-1">Fil coupé</h3><p>Sélectionne de 1 à ${limit} cartes.</p></div>
          <button data-action="back-prune">Retour</button>
          <button class="primary" data-action="confirm-prune" ${selected.size ? '' : 'disabled'}>Retirer (${selected.size})</button></header>
        <div class="prune-cards" aria-label="Cartes du paquet">${deckFor(state).map(card => `
          <button data-prune="${card.id}" aria-label="${faces[card.rank] || card.rank} de ${names[card.suit]}"
            aria-pressed="${selected.has(card.id)}">${faces[card.rank] || card.rank}${card.suit}</button>
        `).join('')}</div>
      </section>`;
  } else if (state.phase === 'pack') {
    content = `
      <section class="shop">
        <header class="shop-header"><div><h3 tabindex="-1">Augures</h3><p>Améliore une carte de ton paquet.</p></div>
          <button data-action="skip-pack">Passer</button></header>
        <ul class="offers augure-options">${state.choices.map(card => {
          const augure = augures[card.augure];
          return `<li><span class="augure-emblem augure-${card.augure}" aria-hidden="true"><span>${augure.mark}</span></span><strong>${card.suit ? (faces[card.rank] || card.rank) + card.suit + ' · ' : ''}${augure.name}</strong>
            <small>${augure.text}</small><button class="primary" data-augure="${card.id}">Choisir</button></li>`;
        }).join('')}</ul>
      </section>`;
  } else if (state.phase === 'shop') {
    const packId = offeredPack(state);
    const pack = packs[packId];
    const eclipse = eclipseOffer(state);
    content = `
      <section class="shop">
        <header class="shop-header ${scored ? 'blind-cleared' : ''}">
          <div><h3 tabindex="-1">Boutique</h3><p>Blinde franchie · +${state.reward} crédits${state.goldReward ? ' (dont ' + state.goldReward + ' Ducat)' : ''}</p></div>
          <button class="primary" data-action="advance">Blinde suivante</button>
        </header>
        ${pack || eclipse ? `<div class="pack-shelf" aria-label="Pochettes">
          ${pack ? `<button data-pack="${packId}" ${state.credits < pack.price ? 'disabled' : ''}>
            ${pack.name} · ${pack.price} cr.</button>` : ''}
          ${eclipse ? `<button data-action="open-eclipse" ${state.credits < ECLIPSE_PRICE ? 'disabled' : ''}>
            Pack des Éclipses · ${ECLIPSE_PRICE} cr.</button>` : ''}</div>` : ''}
        <ul class="offers">${state.offers.map(id => {
          const joker = jokers[id];
          const full = jokerSlotsUsed(state) >= 3;
          return `<li>${emblem(id, joker.mark)}
          <div><strong>${joker.name}</strong><small>${joker.text}</small></div>
          <button data-buy="${id}" aria-label="Acheter ${joker.name} pour ${joker.price} crédits"
          ${full || state.credits < joker.price ? 'disabled' : ''}>${joker.price} cr.</button></li>`;
        }).join('')}</ul>
        ${jokerSlotsUsed(state) >= 3 ? '<p>Vos trois emplacements sont occupés.</p>' : ''}
      </section>`;
  } else {
    content = `
      <section class="finish ${scored && state.phase === 'win' ? 'blind-cleared' : ''}">
        <h3 tabindex="-1">${state.phase === 'win' ? 'Victoire !' : 'Fin de partie'}</h3>
        <p>${state.phase === 'win' ? (state.legacy ? 'Vous avez franchi les six blindes.' : 'Vous avez terminé la huitième mise.') : 'Vous avez épuisé vos mains ou vos cartes avant d’atteindre l’objectif.'}</p>
        ${state.phase === 'win' && !state.legacy ?
          '<button class="primary" data-action="endless">Continuer en mode infini</button>' : ''}
        <button data-action="restart">Nouvelle partie</button>
      </section>`;
  }

  game.innerHTML = `
    <section class="blind" aria-labelledby="blind-name">
      <span class="eyebrow">${state.legacy ? 'Blinde ' + (state.round + 1) + ' / 6' : state.endless ? 'Infini · Mise ' + blind.ante : 'Mise ' + blind.ante + ' / 8' }</span>
      <h2 id="blind-name" tabindex="-1">${blind.name}</h2>
      ${blind.rule ? `<p class="boss-rule">Boss · ${blind.rule}</p>` : ''}
      <div class="score ${scored ? 'scored' : ''}"><strong>${state.score}</strong><span>/ ${blind.target} points</span></div>
      <progress aria-label="Progression vers l’objectif" value="${Math.min(state.score, blind.target)}" max="${blind.target}"></progress>
      ${state.last ? `<p>Dernière main · ${state.last.name} · +${state.last.total}</p>` : ''}
      <div class="side-controls">
        <span class="wallet">${state.credits} crédits</span>
        <button type="button" data-action="rules">Règles</button>
        ${state.last?.steps ? '<button type="button" data-action="score-detail">Détail du score</button>' : ''}
      </div>
    </section>
    ${content}
    <section class="loadout"><h3>Jokers <span>${jokerSlotsUsed(state)}/3</span></h3>
      ${loadout ? '<ul>' + loadout + '</ul>' : '<p>Aucun joker équipé.</p>'}</section>`;
  if (focus) game.querySelector(focus)?.focus();
}


/* Drag-to-sell on touch and mouse: never sell unless released in the box. */
let jokerDrag = null;
let suppressDragClick = false;

function dragOverSellZone(zone, x, y) {
  const rect = zone.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function cleanupJokerDrag(pointerId, x, y, cancelled = false) {
  if (!jokerDrag || jokerDrag.pointerId !== pointerId) return;
  const drag = jokerDrag;
  jokerDrag = null;
  const shouldSell = !cancelled && drag.started && dragOverSellZone(drag.zone, x, y) &&
    state?.phase === 'shop' && state.owned[drag.slot] === drag.id;
  if (drag.card.hasPointerCapture?.(pointerId)) drag.card.releasePointerCapture(pointerId);
  drag.ghost?.remove();
  drag.zone?.remove();
  if (!drag.started) return;

  // Suppress the synthetic click on <summary> that can follow a touch drag.
  suppressDragClick = true;
  window.setTimeout(() => { suppressDragClick = false; }, 0);
  if (!shouldSell) return;
  const next = sellJoker(state, drag.slot);
  if (next === state) return;
  state = next;
  selected.clear();
  persist();
  render('h3[tabindex="-1"]');
  announcement.textContent = jokers[drag.id].name + ' vendu pour ' + drag.price + ' crédits.';
}

game.addEventListener('click', event => {
  if (!suppressDragClick) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  suppressDragClick = false;
}, true);

game.addEventListener('pointerdown', event => {
  if (state?.phase !== 'shop' || jokerDrag ||
      event.target.closest('button') ||
      (event.pointerType === 'mouse' && event.button !== 0)) return;
  const card = event.target.closest('.draggable-joker');
  if (!card) return;
  const slot = Number(card.dataset.jokerSlot);
  if (!Number.isInteger(slot) || slot < 0 || slot >= state.owned.length) return;
  const id = state.owned[slot];
  jokerDrag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY,
    slot, id, price: Math.max(1, Math.floor(jokers[id].price / 2)),
    card, started: false, zone: null, ghost: null };
  try { card.setPointerCapture(event.pointerId); } catch { /* Pointer capture unavailable. */ }
});

document.addEventListener('pointermove', event => {
  const drag = jokerDrag;
  if (!drag || event.pointerId !== drag.pointerId) return;
  const { clientX: x, clientY: y } = event;
  if (!drag.started && Math.hypot(x - drag.x, y - drag.y) > 9) {
    drag.started = true;
    const zone = document.createElement('div');
    zone.className = 'sell-drop-zone';
    zone.setAttribute('aria-hidden', 'true');
    zone.innerHTML = '<strong>VENDRE</strong><small>+' + drag.price + ' crédits · déposer ici</small>';
    document.body.append(zone);
    drag.zone = zone;
    const ghost = document.createElement('div');
    ghost.className = 'joker-drag-ghost';
    const mark = document.createElement('span');
    mark.className = 'joker-drag-mark';
    mark.textContent = jokers[drag.id].mark;
    ghost.append(mark, document.createTextNode(jokers[drag.id].name));
    document.body.append(ghost);
    drag.ghost = ghost;
  }
  if (!drag.started) return;
  event.preventDefault();
  drag.ghost.style.left = x + 'px';
  drag.ghost.style.top = y + 'px';
  drag.zone.classList.toggle('is-over', dragOverSellZone(drag.zone, x, y));
}, { passive: false });

document.addEventListener('pointerup', event => {
  cleanupJokerDrag(event.pointerId, event.clientX, event.clientY);
});
document.addEventListener('pointercancel', event => {
  cleanupJokerDrag(event.pointerId, event.clientX, event.clientY, true);
});

game.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target) return;
  const { card, action } = target.dataset;
  if (target.dataset.prune) {
    const id = target.dataset.prune;
    if (selected.has(id)) selected.delete(id);
    else if (selected.size < removableCount(state)) selected.add(id);
    const list = target.closest('.prune-cards');
    const scroll = list.scrollTop;
    render('[data-prune="' + id + '"]');
    game.querySelector('.prune-cards').scrollTop = scroll;
    return;
  }
  if (card) {
    if (selected.has(card)) selected.delete(card);
    else if (selected.size < 5) selected.add(card);
    render('[data-card="' + card + '"]');
    return;
  }

  if (action === 'score-detail') {
    const { name, steps, chips, mult, total } = state.last;
    scoreDialog.querySelector('#score-detail-name').textContent = name;
    const lines = steps.map(step => {
      if (step.type === 'base') return step.chips + ' jetons de la main + ' + step.cardChips +
        ' des cartes · multiplicateur de base ' + step.mult;
      const bonus = step.factor ? '×' + scoreFormat.format(step.factor) :
        [step.chips ? '+' + step.chips + ' jetons' : '', step.mult ? '+' + step.mult + ' au multiplicateur' : ''].filter(Boolean).join(' · ');
      return (step.name ?? jokers[step.id].name) + ' · ' + bonus;
    });
    scoreDialog.querySelector('ol').replaceChildren(...lines.map(line => {
      const item = document.createElement('li');
      item.textContent = line;
      return item;
    }));
    scoreDialog.querySelector('#score-detail-total').textContent = chips + ' × ' + scoreFormat.format(mult) +
      (Number.isInteger(mult) ? ' = ' : ' ≈ ') + total + ' points';
    scoreDialog.showModal();
    return;
  }

  if (action === 'rules') {
    document.querySelector('#current-seed').textContent = state.seed;
    rules.showModal();
    return;
  }

  let next = state;
  if (target.dataset.sell !== undefined) next = sellJoker(state, Number(target.dataset.sell));
  else if (target.dataset.buy !== undefined) next = buy(state, Number(target.dataset.buy));
  else if (target.dataset.pack !== undefined) next = openPack(state, Number(target.dataset.pack));
  else if (target.dataset.augure !== undefined) next = chooseAugure(state, target.dataset.augure);
  else if (action === 'skip-pack') next = chooseAugure(state, null);
  else if (action === 'back-prune') next = pruneDeck(state, null);
  else if (action === 'confirm-prune') next = pruneDeck(state, [...selected]);
  else if (action === 'open-eclipse') next = openEclipse(state);
  else if (action === 'skip-eclipse') next = chooseEclipse(state, null);
  else if (target.dataset.eclipse !== undefined) next = chooseEclipse(state, target.dataset.eclipse);
  else if (action === 'advance') next = advance(state);
  else if (action === 'endless') next = continueRun(state);
  else if (action === 'restart') {
    selected.clear();
    lobby.hidden = false;
    table.hidden = true;
    seedInput.value = '';
    seedDialog.showModal();
    return;
  }
  else if (action === 'play' || action === 'discard') next = useCards(state, [...selected], action);
  if (next === state) return;
  state = next;
  selected.clear();
  persist();
  render(state.phase === 'play' ? '#blind-name' : 'h3[tabindex="-1"]', action === 'play');
  if (action === 'play') announcement.textContent = state.last.name + ', +' + state.last.total + ' points.';
  else if (action === 'discard') announcement.textContent = 'Cartes remplacées.';
  else if (target.dataset.buy !== undefined) announcement.textContent = 'Joker équipé.';
  else if (target.dataset.sell !== undefined) announcement.textContent = 'Joker vendu.';
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
