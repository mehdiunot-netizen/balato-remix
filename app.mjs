import { advance, applyAugure, augures, blindFor, buy, buyConsumable, cancelAugureTarget, casinoOffers, characterFor, characters, chooseAugure, chooseCasinoRoom, chooseEclipse, consumableOffer, consumables, consumableSlotsFor, continueRun, deckFor, ECLIPSE_PRICE, eclipseOffer, jokers, jokerSlotsUsed, offeredPack, openCasino, openCasinoBonusPack, openEclipse, openPack, packs, previewHand, pruneDeck, removableCount, restoreRun, sellJoker, shopPrice, skipCasinoRow, start, startInCasino, useCards, useConsumable } from './game.mjs?v=20';

const game = document.querySelector('#game');
const announcement = document.querySelector('#announcement');
const storageKey = 'contre-pli-v1';
const names = { '♠': 'pique', '♥': 'cœur', '♣': 'trèfle', '♦': 'carreau' };
const scoreFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 3 });
const faces = { 11: 'V', 12: 'D', 13: 'R', 14: 'A' };
let state = restore();
const selected = new Set();
let saleNotice = null;
const table = document.querySelector('.table');
const lobby = document.querySelector('.lobby');
const enter = document.querySelector('#enter');
const rules = document.querySelector('#rules');
const scoreDialog = document.querySelector('#score-dialog');
const jokerDialog = document.querySelector('#joker-dialog');
const jokerDialogSell = document.querySelector('#joker-dialog-sell');
const seedDialog = document.querySelector('#seed-dialog');
const seedInput = document.querySelector('#seed input');
const characterSelect = document.querySelector('#character-select');
const characterName = document.querySelector('#character-name');
const characterDescription = document.querySelector('#character-description');
const characterMedallion = document.querySelector('#character-medallion');
for (const character of characters) {
  const option = document.createElement('option');
  option.value = character.id;
  option.textContent = character.mark + ' ' + character.name;
  characterSelect.append(option);
}
function updateCharacterPreview() {
  const chosen = characters.find(c => c.id === characterSelect.value) ?? characters[0];
  characterName.textContent = chosen.name;
  characterDescription.textContent = chosen.text;
  characterMedallion.textContent = chosen.mark;
}
characterSelect.addEventListener('change', updateCharacterPreview);
function openCharacterPicker() {
  characterSelect.value = state?.character ?? 'classique';
  updateCharacterPreview();
  seedDialog.showModal();
}
updateCharacterPreview();
if (state) enter.textContent = 'Reprendre';

function showTable() {
  enter.textContent = "Reprendre";
  persist();
  lobby.hidden = true;
  table.hidden = false;
  render('#blind-name');
}

document.querySelector('#new-run').addEventListener('click', openCharacterPicker);
document.querySelector('#cancel-seed').addEventListener('click', () => seedDialog.close());
document.querySelector('#seed-form').addEventListener('submit', event => {
  event.preventDefault();
  state = startInCasino(seedInput.value.trim() || undefined, characterSelect.value);
  saleNotice = null;
  seedDialog.close();
  showTable();
});
enter.addEventListener('click', () => {
  if (!state) return openCharacterPicker();
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
  const casinoChoices = state.phase === 'casino' ? casinoOffers(state) : [];
  const blind = state.phase === 'casino' ? casinoChoices[0]?.blind : blindFor(state);
  const activations = state.last?.steps?.filter(step => step.id !== undefined) ?? [];
  const loadout = state.owned.map((id, index) => {
    const { mark, name } = jokers[id];
    const activation = activations.findIndex(step => step.slot === undefined ? step.id === id : step.slot === index);
    const pulse = scored && activation >= 0;
    const negative = state.negativeSlots?.includes(index);
    const polychrome = state.polychromeSlots?.includes(index);
    return `<li class="joker-stack-card${pulse ? ' triggered' : ''}${negative ? ' negative-joker' : ''}${polychrome ? ' polychrome-joker' : ''}${state.phase === 'shop' ? ' draggable-joker' : ''}" data-joker-slot="${index}" style="--joker-order:${index}">
      <button type="button" class="joker-card-face" data-joker-info="${index}"
        aria-label="${name}${negative ? ', négatif' : ''}${polychrome ? ', polychrome' : ''} : voir les détails${state.phase === 'shop' ? ' ou faire glisser pour vendre' : ''}">
        <span class="joker-card-top" aria-hidden="true">✦ <span>${index + 1}</span></span>
        ${emblem(id, mark)}
        <span class="joker-card-name">${name}</span>
        ${negative ? '<span class="joker-card-edition" aria-hidden="true">NÉG.</span>' : ''}
        ${polychrome ? '<span class="joker-card-edition rainbow" aria-hidden="true">POLY.</span>' : ''}
      </button>
    </li>`;
  }).join('');

  const inventory = state.consumables ?? [];
  const activeCharacter = characterFor(state);
  const capacity = consumableSlotsFor(state);
  const consumableSlots = Array.from({ length: capacity }, (_, index) => {
    const item = consumables.find(value => value.id === inventory[index]);
    if (!item) return '<span class="consumable-empty" aria-label="Emplacement de consommable vide">+</span>';
    const usable = item.id === 'bourse' || state.phase === 'play';
    const allowed = usable && (state.phase === 'play' || state.phase === 'shop');
    return `<button type="button" class="consumable-item" data-use-consumable="${index}"
      title="${item.text}" aria-label="Utiliser ${item.name} : ${item.text}" ${allowed ? '' : 'disabled'}>
      <strong>${item.mark} ${item.name}</strong><small>${allowed ? 'Utiliser' : 'Prochaine blinde'}</small></button>`;
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
  } else if (state.phase === 'casino') {
    const skipped = state.casinoSkipSummary ?? [];
    content = `
      <section class="casino-board" aria-label="Choix des trois blindes">
        <header class="casino-heading"><h3 tabindex="-1">Choisis ta prochaine blinde</h3>
        <p>Joue une des trois blindes, ou passe pour recevoir leurs trois bonus.</p></header>
        <div class="casino-blind-fan">
          ${casinoChoices.map(({ lane, blind: choice, reward }) => `
            <button type="button" class="casino-blind-card casino-blind-${lane}"
              data-casino-lane="${lane}" style="--casino-order:${lane}"
              aria-label="Jouer ${choice.name}, objectif ${choice.target} points. Skip : ${reward.info}">
              <span class="casino-blind-icon" aria-hidden="true">${['♠','♜','★'][lane]}</span>
              <strong>${choice.name}</strong>
              <span class="casino-blind-target">${scoreFormat.format(choice.target)} pts</span>
              ${choice.rule ? `<small class="casino-rule">${choice.rule}</small>` : ''}
              <span class="casino-blind-tag"><b>Bonus de Skip</b><small>${reward.info}</small></span>
              <span class="casino-blind-choose">Jouer</span>
            </button>`).join('')}
        </div>
        <div class="casino-commands">
          <button type="button" class="primary casino-skip-all" data-action="casino-skip">
            Skip · récupérer les 3 bonus</button>
          ${(state.freeCasinoPacks ?? 0) > 0 ? `<button data-action="casino-bonus-pack">
            ✧ Pochette offerte (${state.freeCasinoPacks})</button>` : ''}
        </div>
        ${skipped.length ? `<p class="casino-skip-summary" role="status">3 bonus récupérés : ${skipped.join(' · ')}</p>` : ''}
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
  } else if (state.phase === 'augure-target') {
    const effect = augures[state.pendingAugure];
    const eligible = deckFor(state).filter(card => !state.enhancements?.[card.id]);
    content = `
      <section class="shop augure-target-shop">
        <header class="shop-header"><div><h3 tabindex="-1">Choisis ta carte</h3>
          <p>${effect.name} · ${effect.text}</p></div>
          <button data-action="back-augure-target">Retour</button></header>
        <div class="prune-cards target-cards" aria-label="Cartes à améliorer">${eligible.map(card => `
          <button data-augure-target="${card.id}" aria-label="Améliorer ${faces[card.rank] || card.rank} de ${names[card.suit]} avec ${effect.name}">
            ${faces[card.rank] || card.rank}${card.suit}</button>`).join('')}</div>
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
          return `<li><span class="augure-emblem augure-${card.augure}" aria-hidden="true"><span>${augure.mark}</span></span><strong>${augure.name}</strong>
            <small>${augure.text}</small><button class="primary" data-augure="${card.id}">${card.augure === 'prune' ? 'Choisir' : 'Choisir l’effet'}</button></li>`;
        }).join('')}</ul>
      </section>`;
  } else if (state.phase === 'shop') {
    const packId = offeredPack(state);
    const pack = packs[packId];
    const eclipse = eclipseOffer(state);
    const consumable = consumableOffer(state);
    content = `
      <section class="shop">
        <header class="shop-header ${scored ? 'blind-cleared' : ''}">
          <div><h3 tabindex="-1">Boutique</h3><p>Blinde franchie · +${state.reward} crédits${state.goldReward ? ' (dont ' + state.goldReward + ' Ducat)' : ''}</p></div>
          <button class="primary" data-action="advance">Blinde suivante</button>
        </header>
        ${pack || eclipse || consumable ? `<div class="pack-shelf" aria-label="Pochettes et consommables">
          ${pack ? `<button data-pack="${packId}" ${state.credits < shopPrice(state, pack.price) ? 'disabled' : ''}>
            ${pack.name} · ${shopPrice(state, pack.price)} cr.</button>` : ''}
          ${eclipse ? `<button data-action="open-eclipse" ${state.credits < shopPrice(state, ECLIPSE_PRICE) ? 'disabled' : ''}>
            Pack des Éclipses · ${shopPrice(state, ECLIPSE_PRICE)} cr.</button>` : ''}
          ${consumable ? `<button data-buy-consumable="${consumable.id}"
            ${state.credits < shopPrice(state, consumable.price) || (state.consumables ?? []).length >= capacity ? 'disabled' : ''}
            aria-label="Acheter ${consumable.name} pour ${shopPrice(state, consumable.price)} crédits">${consumable.mark} ${consumable.name} · ${shopPrice(state, consumable.price)} cr.</button>` : ''}</div>` : ''}
        <ul class="offers">${state.offers.map(id => {
          const joker = jokers[id];
          const full = state.character !== 'negatif' && jokerSlotsUsed(state) >= 3;
          return `<li>${emblem(id, joker.mark)}
          <div><strong>${joker.name}</strong><small>${joker.text}</small></div>
          <button data-buy="${id}" aria-label="Acheter ${joker.name} pour ${joker.price} crédits"
          ${full || state.credits < shopPrice(state, joker.price) ? 'disabled' : ''}>${shopPrice(state, joker.price)} cr.</button></li>`;
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

  const tokenLabels = [
    ...(state.casinoTags ?? []).map(tag => tag.label + (tag.remaining !== null && tag.remaining !== undefined ? ' · ' + tag.remaining + ' blinde(s)' : '')),
    ...Array.from({ length: state.freeCasinoPacks ?? 0 }, () => 'Pochette offerte · à ouvrir au choix de blinde'),
  ];
  game.innerHTML = `
    <section class="blind" aria-labelledby="blind-name">
      <span class="eyebrow">${state.legacy ? 'Blinde ' + (state.round + 1) + ' / 6' : state.endless ? 'Infini · Mise ' + blind.ante : 'Mise ' + blind.ante + ' / 8' }</span>
      <h2 id="blind-name" tabindex="-1">${state.phase === 'casino' ? 'Sélection des blindes' : blind.name}</h2>
      ${activeCharacter.id !== 'classique' ? `<p class="character-status" title="${activeCharacter.text}"><span aria-hidden="true">${activeCharacter.mark}</span> ${activeCharacter.name}</p>` : ''}
      ${state.phase !== 'casino' && blind.rule ? `<p class="boss-rule">Boss · ${blind.rule}</p>` : ''}
      <div class="score ${scored ? 'scored' : ''}"><strong>${state.score}</strong><span>/ ${blind.target} points</span></div>
      ${state.phase !== 'casino' ? `<progress aria-label="Progression vers l’objectif" value="${Math.min(state.score, blind.target)}" max="${blind.target}"></progress>` : '<p class="casino-panel-note">Trois blindes au choix · Skip = trois bonus</p>'}
      ${state.last ? `<p>Dernière main · ${state.last.name} · +${state.last.total}</p>` : ''}
      <div class="side-controls">
        <span class="wallet">${state.credits} crédits${saleNotice ? `<strong class="wallet-gain">${saleNotice}</strong>` : ""}</span>
        <button type="button" data-action="rules">Règles</button>
        ${state.last?.steps ? '<button type="button" data-action="score-detail">Détail du score</button>' : ''}
      </div>
    </section>
    ${content}
    <section class="loadout ${state.character === 'magicien' ? 'character-magicien' : ''}" aria-label="Inventaire">
      <div class="joker-collection"><h3>Jokers <span>${state.character === 'negatif' ? state.owned.length + ' · ∞' : jokerSlotsUsed(state) + '/3'}</span></h3>
        ${loadout ? '<ul class="joker-fan" aria-label="Jokers équipés, toucher pour voir les détails">' + loadout + '</ul>' : '<p>Aucun joker équipé.</p>'}
        ${tokenLabels.length ? `<div class="casino-tokens" aria-label="Bonus de Skip en attente">${tokenLabels.map(label => `<span class="casino-token" title="${label}">✦ ${label}</span>`).join('')}</div>` : ''}</div>
      <div class="consumables"><h3>Consommables <span>${inventory.length}/${capacity}</span></h3>
        <div class="consumable-slots">${consumableSlots}</div></div>
    </section>`;
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
  const earned = next.credits - state.credits;
  saleNotice = '+' + earned + ' crédits';
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
      (event.target.closest('button') && !event.target.closest('.joker-card-face')) ||
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


/* On iOS keep the viewport fixed; only panels with their own scrollbar pan. */
document.addEventListener('touchmove', event => {
  if (!event.cancelable) return;
  const scrollArea = event.target.closest?.('.shop .offers, .prune-cards, .loadout, .blind, .finish, dialog.rules');
  if (jokerDrag || !scrollArea) event.preventDefault();
}, { passive: false });

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
  if (target.dataset.jokerInfo !== undefined) {
    const slot = Number(target.dataset.jokerInfo);
    if (!Number.isInteger(slot) || slot < 0 || slot >= state.owned.length) return;
    const joker = jokers[state.owned[slot]];
    document.querySelector('#joker-dialog-title').textContent = joker.name;
    document.querySelector('#joker-dialog-text').textContent = joker.text;
    const editions = [
      state.negativeSlots?.includes(slot) ? 'Négatif : aucune place utilisée' : '',
      state.polychromeSlots?.includes(slot) ? 'Polychrome : ×1,5 au multiplicateur final' : '',
    ].filter(Boolean);
    document.querySelector('#joker-dialog-editions').textContent = editions.join(' · ');
    jokerDialogSell.dataset.sellSlot = String(slot);
    jokerDialogSell.textContent = 'Vendre · +' + Math.max(1, Math.floor(joker.price / 2)) + ' crédits';
    jokerDialogSell.hidden = state.phase !== 'shop';
    jokerDialog.showModal();
    return;
  }
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
  else if (target.dataset.useConsumable !== undefined) next = useConsumable(state, Number(target.dataset.useConsumable));
  else if (target.dataset.buyConsumable !== undefined) next = buyConsumable(state, target.dataset.buyConsumable);
  else if (target.dataset.augureTarget !== undefined) next = applyAugure(state, target.dataset.augureTarget);
  else if (action === 'back-augure-target') next = cancelAugureTarget(state);
  else if (target.dataset.buy !== undefined) next = buy(state, Number(target.dataset.buy));
  else if (target.dataset.pack !== undefined) next = openPack(state, Number(target.dataset.pack));
  else if (target.dataset.augure !== undefined) next = chooseAugure(state, target.dataset.augure);
  else if (action === 'skip-pack') next = chooseAugure(state, null);
  else if (action === 'back-prune') next = pruneDeck(state, null);
  else if (action === 'confirm-prune') next = pruneDeck(state, [...selected]);
  else if (action === 'open-eclipse') next = openEclipse(state);
  else if (action === 'skip-eclipse') next = chooseEclipse(state, null);
  else if (target.dataset.eclipse !== undefined) next = chooseEclipse(state, target.dataset.eclipse);
  else if (target.dataset.casinoLane !== undefined) next = chooseCasinoRoom(state, Number(target.dataset.casinoLane));
  else if (action === 'casino-skip') next = skipCasinoRow(state);
  else if (action === 'casino-bonus-pack') next = openCasinoBonusPack(state);
  else if (action === 'advance') next = state.legacy ? advance(state) : openCasino(state);
  else if (action === 'endless') next = continueRun(state);
  else if (action === 'restart') {
    selected.clear();
    lobby.hidden = false;
    table.hidden = true;
    seedInput.value = '';
    openCharacterPicker();
    return;
  }
  else if (action === 'play' || action === 'discard') next = useCards(state, [...selected], action);
  if (next === state) return;
  const earned = next.credits - state.credits;
  saleNotice = target.dataset.sell !== undefined ? '+' + earned + ' crédits' : null;
  state = next;
  selected.clear();
  persist();
  render(state.phase === 'play' ? '#blind-name' : 'h3[tabindex="-1"]', action === 'play');
  if (action === 'play') announcement.textContent = state.last.name + ', +' + state.last.total + ' points.';
  else if (action === 'discard') announcement.textContent = 'Cartes remplacées.';
  else if (target.dataset.buy !== undefined) announcement.textContent = 'Joker équipé.';
  else if (target.dataset.sell !== undefined) announcement.textContent = 'Joker vendu : ' + saleNotice + '.';
  else if (target.dataset.useConsumable !== undefined) announcement.textContent = 'Consommable utilisé.';
  else if (target.dataset.buyConsumable !== undefined) announcement.textContent = 'Consommable rangé dans l’inventaire.';
  else if (target.dataset.augureTarget !== undefined) announcement.textContent = 'Carte améliorée.';
  else if (action === 'casino-skip') announcement.textContent = 'Blinde passée : trois bonus récupérés.';
  else if (target.dataset.casinoLane !== undefined) announcement.textContent = 'Blinde choisie.';
});

jokerDialogSell.addEventListener('click', () => {
  const slot = Number(jokerDialogSell.dataset.sellSlot);
  const previous = state;
  const next = sellJoker(state, slot);
  if (next === previous) return;
  const earned = next.credits - previous.credits;
  state = next;
  saleNotice = '+' + earned + ' crédits';
  selected.clear();
  persist();
  jokerDialog.close();
  render('h3[tabindex="-1"]');
  announcement.textContent = 'Joker vendu pour ' + earned + ' crédits.';
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
