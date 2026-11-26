import { advance, applyAugure, augures, blindFor, buy, buyConsumable, cancelAugureTarget, casinoBoard, casinoOffers, characterFor, characters, chooseAugure, chooseCasinoRoom, chooseEclipse, consumableOffer, consumables, consumableSlotsFor, continueRun, deckFor, ECLIPSE_PRICE, eclipseOffer, jokers, jokerSlotsUsed, offeredPack, openCasino, openCasinoBonusPack, openEclipse, openJokerPack, openPack, jokerPacks, offeredJokerPack, chooseJokerPack, packs, previewHand, pruneDeck, removableCount, restoreRun, reorderConsumable, reorderJoker, sellJoker, shopPrice, skipCasinoRow, start, startInCasino, useCards, useConsumable } from './game.mjs?v=28';
import { jokerArtwork } from './joker-art.mjs?v=2';

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
const consumableDialog = document.querySelector('#consumable-dialog');
const consumableDialogUse = document.querySelector('#consumable-dialog-use');
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


// Original 50×75 pixel-art card illustrations (no Balatro assets).
// IDs remain stable so existing runs and seeds preserve their Joker identities.
function jokerPortrait(id, mark) {
  return jokerArtwork(jokers[id] ?? { mark }, id);
}

// Tiny illustrated faces for the three original Contre-Pli consumables.
// Pure presentation: the existing tarot/booster mechanics remain unchanged.
const consumableArtwork = {
  bourse: '<svg viewBox="0 0 80 88" aria-hidden="true"><defs><linearGradient id="coins-bag" x2="1" y2="1"><stop stop-color="#fbe48f"/><stop offset="1" stop-color="#ab6424"/></linearGradient></defs><path d="M29 12L52 12 46 26 55 39Q67 57 55 75L24 75Q11 58 25 39L34 26Z" fill="url(#coins-bag)" stroke="#573520" stroke-width="3"/><path d="M30 28Q40 33 50 28" fill="none" stroke="#5a2b33" stroke-width="5"/><circle cx="40" cy="51" r="13" fill="#ffeaa5" stroke="#885523" stroke-width="3"/><path d="M35 51H45M40 43V60" stroke="#966225" stroke-width="3"/><circle cx="16" cy="68" r="6" fill="#ffdf75" stroke="#905c25" stroke-width="2"/><circle cx="64" cy="66" r="6" fill="#ffdf75" stroke="#905c25" stroke-width="2"/></svg>',
  relance: '<svg viewBox="0 0 80 88" aria-hidden="true"><rect x="17" y="29" width="33" height="45" rx="4" fill="#e6dbbf" stroke="#334259" stroke-width="3" transform="rotate(-13 35 51)"/><rect x="30" y="20" width="34" height="46" rx="4" fill="#fff4d6" stroke="#34435d" stroke-width="3" transform="rotate(9 45 44)"/><path d="M41 8C63 5 77 21 71 38" stroke="#9ce7f0" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M64 33L70 44 78 34" fill="#c3f3fd"/><path d="M29 78C10 72 5 54 13 41" stroke="#6ce1fa" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M7 47L12 37 20 47" fill="#9ee9fb"/><path d="M39 39L53 44 43 55Z" fill="#418db3"/></svg>',
  souffle: '<svg viewBox="0 0 80 88" aria-hidden="true"><path d="M7 34Q23 17 41 28T67 17" fill="none" stroke="#defeff" stroke-width="7" stroke-linecap="round"/><path d="M12 47Q36 43 48 53T70 46" fill="none" stroke="#76dbf6" stroke-width="6" stroke-linecap="round"/><path d="M16 59Q29 71 46 65" fill="none" stroke="#c8a8ff" stroke-width="5" stroke-linecap="round"/><path d="M52 14L55 7 58 14 66 17 58 20 55 28 52 20 44 17Z" fill="#fbeaa0"/><path d="M32 46L34 41 36 46 42 48 36 50 34 56 32 50 26 48Z" fill="#faf1ae"/><circle cx="66" cy="64" r="3" fill="#fff3ba"/><circle cx="13" cy="19" r="2" fill="#fff3ba"/></svg>',
};
function consumablePortrait(id) {
  return '<span class="consumable-card-picture consumable-picture-' + id +
    '" aria-hidden="true">' + (consumableArtwork[id] ?? '') + '</span>';
}

function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.version === 1 && Array.isArray(saved.state?.hand) &&
        ((saved.state.phase === 'casino' && casinoOffers(saved.state).length === 3) || blindFor({
          ...saved.state, legacy: saved.state.legacy ?? !saved.state.seed,
        }))) {
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

/* Keep the chosen visual order even when cards are selected or replaced. */
function displayedHand(run) {
  const sorted = [...run.hand].sort((a, b) => b.rank - a.rank || a.suit.localeCompare(b.suit));
  const lookup = new Map(sorted.map(card => [card.id, card]));
  const order = (run.handOrder ?? []).filter(id => lookup.has(id));
  for (const card of sorted) if (!order.includes(card.id)) order.push(card.id);
  return order.map(id => lookup.get(id));
}

function moveHandCard(run, sourceId, targetId) {
  if (run.phase !== 'play' || sourceId === targetId) return run;
  const ids = displayedHand(run).map(card => card.id);
  const from = ids.indexOf(sourceId);
  const to = ids.indexOf(targetId);
  if (from < 0 || to < 0) return run;
  ids.splice(from, 1);
  ids.splice(to, 0, sourceId);
  return { ...run, handOrder: ids };
}

function render(focus, scored = false) {
  const casinoChoices = state.phase === 'casino' ? casinoOffers(state) : [];
  const casinoTiles = state.phase === 'casino' ? casinoBoard(state) : [];
  const playCards = state.phase === 'play' ? displayedHand(state) : [];
  const playPreview = state.phase === 'play' && selected.size
    ? previewHand(state, playCards.filter(card => selected.has(card.id))) : null;
  const blind = state.phase === 'casino' ? casinoChoices[0]?.blind : blindFor(state);
  const activations = state.last?.steps?.filter(step => step.id !== undefined) ?? [];
  const loadout = state.owned.map((id, index) => {
    const { mark, name } = jokers[id];
    const activation = activations.findIndex(step => step.slot === undefined ? step.id === id : step.slot === index);
    const pulse = scored && activation >= 0;
    const negative = state.negativeSlots?.includes(index);
    const polychrome = state.polychromeSlots?.includes(index);
    return `<li class="joker-stack-card${pulse ? ' triggered' : ''}${negative ? ' negative-joker' : ''}${polychrome ? ' polychrome-joker' : ''} reorderable-joker${state.phase === 'shop' ? ' draggable-joker' : ''}" data-joker-slot="${index}" style="--joker-order:${index}">
      <button type="button" class="joker-card-face illustrated-joker" data-joker-info="${index}"
        aria-label="${name}${negative ? ', négatif' : ''}${polychrome ? ', polychrome' : ''} : voir les détails${state.phase === 'shop' ? ' ou faire glisser pour vendre' : ''}">
        <span class="joker-card-top" aria-hidden="true">✦ <span>${index + 1}</span></span>
        ${jokerPortrait(id, mark)}
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
    const allowed = (item.id === 'bourse' && (state.phase === 'play' || state.phase === 'shop')) ||
      (item.id !== 'bourse' && state.phase === 'play');
    return `<button type="button" class="consumable-item consumable-card${allowed ? '' : ' consumable-card-inactive'}"
      data-consumable-slot="${index}" aria-haspopup="dialog"
      title="${item.name} · ${item.text}"
      aria-label="${item.name} : voir les détails ; glisser pour changer l’ordre">
      ${consumablePortrait(item.id)}
      <strong class="consumable-card-name">${item.name}</strong></button>`;
  }).join('');

  let content;
  if (state.phase === 'play') {
    const cards = playCards;
    content = `
      <section class="play" aria-label="Main en cours">
        <div class="hand-info"><h3>Votre main</h3></div>
        <div class="cards" style="--adaptive-card-width:calc(${(100 / cards.length).toFixed(4)}% + ${((cards.length - 1) / cards.length * 10).toFixed(3)}px)">${cards.map((card, i) => {
          const rank = faces[card.rank] || card.rank;
          return `<button class="card ${'♥♦'.includes(card.suit) ? 'red' : ''} ${card.augure || ''}" data-card="${card.id}" style="--tilt:${(i - 3.5) * 2.6}deg;--arc:${Math.abs(i - 3.5) * 3}px"
            aria-label="${court[card.rank] || (card.rank === 14 ? 'As' : rank)} de ${names[card.suit]}${card.augure ? ' · ' + augures[card.augure].name : ''}" aria-pressed="${selected.has(card.id)}"
            aria-disabled="${selected.size === 5 && !selected.has(card.id)}">
            <span class="rank" aria-hidden="true">${rank}<small>${card.suit}</small></span>
            <span class="card-art" aria-hidden="true">${cardArt(card)}</span>
            ${card.augure ? `<span class="augure-mark" aria-hidden="true">${augures[card.augure].mark}</span>` : ''}
            <span class="rank opposite" aria-hidden="true">${rank}<small>${card.suit}</small></span>
          </button>`;
        }).join('')}</div>
        <div class="preview" aria-label="${cards.length} cartes en main">${cards.length}/${blind.size ?? 8}</div>
        <div class="actions" aria-label="Commandes de la main">
          <button class="hand-action discard-action" data-action="discard" ${selected.size && state.discards ? '' : 'disabled'}>Défausser</button>
          <div class="sort-hand" aria-label="Trier la main"><span>Trier la main</span>
            <div><button type="button" data-action="sort-value">Valeur</button>
            <button type="button" data-action="sort-suit">Couleur</button></div>
          </div>
          <button class="primary hand-action play-action" data-action="play" ${selected.size ? '' : 'disabled'}>Jouer la main</button>
          <button type="button" class="deck-counter" data-action="deck-view"
            aria-label="Voir les ${deckFor(state).length} cartes de ton paquet, dont ${state.pile.length} dans la pioche">
            <span class="deck-back" aria-hidden="true">✦</span>
            <small>${state.pile.length}/${deckFor(state).length}</small>
          </button>
        </div>
      </section>`;
  } else if (state.phase === 'casino') {
    const skipped = state.casinoSkipSummary ?? [];
    const col = (state.round + 1) % 3;
    const columns = ['Petites blindes','Blindes moyennes','Boss blindes'];
    const links = [0,1].flatMap(c => [0,1,2].flatMap(y =>
      [0,1,2].filter(v => Math.abs(y-v) <= 1).map(v =>
        `<line x1="${c===0?295:595}" y1="${50+y*100}"
          x2="${c===0?305:605}" y2="${50+v*100}"/>`))).join('');
    content = `
      <section class="casino-board" aria-label="Carte des neuf blindes">
        <header class="casino-heading"><h3 tabindex="-1">Parcours des blindes</h3>
          <p>Gauche → droite · ${columns[col]} · suis les chemins lumineux</p></header>
        <div class="casino-map" role="group" aria-label="Trois petites, trois moyennes et trois boss">
          <svg class="casino-path-links" viewBox="0 0 900 300" preserveAspectRatio="none" aria-hidden="true">${links}</svg>
          ${casinoTiles.map(({ column,lane,blind:choice,reward,active,reachable,visited,skipped:wasSkipped }) => `
            <button type="button" class="casino-node casino-${['small','medium','boss'][column]}${active?' is-current':''}${reachable?' is-reachable':''}${visited?' is-visited':''}${wasSkipped?' is-skipped':''}"
              style="grid-column:${column+1};grid-row:${lane+1}"
              ${reachable?'data-casino-lane="'+lane+'"':'disabled'}
              aria-label="${choice.name}, objectif ${scoreFormat.format(choice.target)} points. ${column===2?choice.rule:'Bonus Skip : '+reward.info}. ${reachable?'Jouer':'Inaccessible'}">
              <span class="casino-node-top"><span class="casino-node-type">${['PETITE','MOYENNE','BOSS'][column]}</span>
                <span class="casino-node-rank">${['I','II','III'][lane]}</span></span>
              <span class="casino-node-center"><span class="casino-node-medal" aria-hidden="true">${['♠','◆','✦'][column]}</span>
                <strong>${scoreFormat.format(choice.target)}</strong></span>
              <span class="casino-node-footer">${column===2?choice.rule:reward.info}</span>
            </button>`).join('')}
        </div>
        <div class="casino-commands">
          ${col < 2 ? `<button class="primary casino-skip-all" data-action="casino-skip">SKIP ${columns[col]} · récupérer 3 bonus</button>` :
            '<span class="casino-boss-hint">✦ Boss obligatoire · choisis une blinde</span>'}
          ${(state.freeCasinoPacks??0)>0?`<button data-action="casino-bonus-pack">✧ Pochette offerte (${state.freeCasinoPacks})</button>`:''}
        </div>
        ${skipped.length?`<p class="casino-skip-summary" role="status">3 bonus gagnés : ${skipped.join(' · ')}</p>`:''}
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
        <header class="shop-header"><div><h3 tabindex="-1">Tarots</h3><p>Choisis un Tarot, puis une carte à améliorer.</p></div>
          <button data-action="skip-pack">Passer</button></header>
        <ul class="offers augure-options">${state.choices.map(card => {
          const augure = augures[card.augure];
          return `<li><span class="augure-emblem augure-${card.augure}" aria-hidden="true"><span>${augure.mark}</span></span><strong>${augure.name}</strong>
            <small>${augure.text}</small><button class="primary" data-augure="${card.id}">${card.augure === 'prune' ? 'Choisir' : 'Choisir l’effet'}</button></li>`;
        }).join('')}</ul>
      </section>`;
  } else if (state.phase === 'joker-pack') {
    content = `
      <section class="shop">
        <header class="shop-header"><div><h3 tabindex="-1">Pack Joker</h3>
          <p>Choisis un joker à équiper parmi ceux proposés.</p></div>
          <button data-action="skip-joker-pack">Passer</button></header>
        <ul class="offers joker-pack-options">${(state.jokerPackChoices ?? []).map(id => {
          const joker = jokers[id];
          return `<li>${jokerPortrait(id, joker.mark)}
            <strong>${joker.name}</strong><small>${joker.text}</small>
            <button class="primary" data-joker-pack-choice="${id}">Choisir</button></li>`;
        }).join('')}</ul>
      </section>`;
  } else if (state.phase === 'shop') {
    const packId = offeredPack(state);
    const pack = packs[packId];
    const jokerPackId = offeredJokerPack(state);
    const jokerPack = jokerPacks[jokerPackId];
    const eclipse = eclipseOffer(state);
    const consumable = consumableOffer(state);
    content = `
      <section class="shop">
        <header class="shop-header ${scored ? 'blind-cleared' : ''}">
          <div><h3 tabindex="-1">Boutique</h3><p>Blinde franchie · +${state.reward} crédits${state.goldReward ? ' (dont ' + state.goldReward + ' Ducat)' : ''}</p></div>
          <div class="sell-drop-zone"><strong>Vendre</strong><small>Glisse un joker ici</small></div>
          <button class="primary" data-action="advance">Blinde suivante</button>
        </header>
        ${pack || jokerPack || eclipse || consumable ? `<div class="pack-shelf" aria-label="Pochettes et consommables">
          ${pack ? `<button data-pack="${packId}" ${state.credits < shopPrice(state, pack.price) ? 'disabled' : ''}>
            ${pack.name} · ${shopPrice(state, pack.price)} cr.</button>` : ''}
          ${jokerPack ? `<button data-joker-pack="${jokerPackId}"
            ${state.credits < shopPrice(state, jokerPack.price) ? 'disabled' : ''}
            aria-label="Ouvrir ${jokerPack.name}, choisir un joker sur ${jokerPack.count} pour ${shopPrice(state, jokerPack.price)} crédits">
            ${jokerPack.name} · ${shopPrice(state, jokerPack.price)} cr.</button>` : ''}
          ${eclipse ? `<button data-action="open-eclipse" ${state.credits < shopPrice(state, ECLIPSE_PRICE) ? 'disabled' : ''}>
            Pack des Éclipses · ${shopPrice(state, ECLIPSE_PRICE)} cr.</button>` : ''}
          ${consumable ? `<button data-buy-consumable="${consumable.id}"
            ${state.credits < shopPrice(state, consumable.price) || (state.consumables ?? []).length >= capacity ? 'disabled' : ''}
            aria-label="Acheter ${consumable.name} pour ${shopPrice(state, consumable.price)} crédits">${consumable.mark} ${consumable.name} · ${shopPrice(state, consumable.price)} cr.</button>` : ''}</div>` : ''}
        <ul class="offers">${state.offers.map(id => {
          const joker = jokers[id];
          const full = state.character !== 'negatif' && jokerSlotsUsed(state) >= 3;
          return `<li>${jokerPortrait(id, joker.mark)}
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
      <h2 id="blind-name" tabindex="-1">${state.phase === 'casino' ? 'Carte des 9 blindes' : blind.name}</h2>
      ${state.phase === 'play' ? `<div class="bl-goal" aria-label="Objectif de la blinde">
        <div class="bl-goal-medal">${blind.kind === 'Boss' ? 'BOSS' : blind.kind === 'Petite blinde' ? 'PETITE BLINDE' : 'GROSSE BLINDE'}</div>
        <div class="bl-goal-text"><span>Faire un score d’au moins</span>
          <strong>✺ ${scoreFormat.format(blind.target)}</strong>
          <small>Récompense : 4 cr. + mains restantes</small></div>
      </div>` : ''}
      ${activeCharacter.id !== 'classique' ? `<p class="character-status" title="${activeCharacter.text}"><span aria-hidden="true">${activeCharacter.mark}</span> ${activeCharacter.name}</p>` : ''}
      ${state.phase !== 'casino' && blind.rule ? `<p class="boss-rule">Boss · ${blind.rule}</p>` : ''}
      ${state.phase !== 'casino' ? `
        <div class="score ${scored ? 'scored' : ''}">
          <span>Manche score</span><strong>${scoreFormat.format(state.score)}</strong><small>/ ${scoreFormat.format(blind.target)}</small>
        </div>
        <div class="bl-calculation" aria-live="polite" aria-label="Calcul de la main">
          <div class="bl-hand-name">${playPreview?.name ?? (state.phase === 'play' ? 'Choisis tes cartes' : (state.last?.name ?? 'Main'))}</div>
          <div class="bl-chip-mult">
            <span class="bl-chips" aria-label="${playPreview?.chips ?? 0} jetons">${scoreFormat.format(playPreview?.chips ?? 0)}</span>
            <span class="bl-times" aria-hidden="true">×</span>
            <span class="bl-mult" aria-label="multiplicateur ${playPreview?.mult ?? 0}">${scoreFormat.format(playPreview?.mult ?? 0)}</span>
          </div>
        </div>
        <div class="bl-metrics">
          <div><span>Mains</span><strong>${state.plays ?? 0}</strong></div>
          <div><span>Défausses</span><strong>${state.discards ?? 0}</strong></div>
        </div>
        ` : '<p class="casino-panel-note">3 petites → 3 moyennes → 3 boss · progression horizontale</p>'}
      <div class="side-controls">
        <span class="wallet">&#36;${state.credits}${saleNotice ? `<strong class="wallet-gain">${saleNotice}</strong>` : ""}</span>
        <button type="button" data-action="game-info">Partie Infos</button>
        <button type="button" data-action="rules">Options</button>
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
let cardDrag = null;
let consumableDrag = null;
let suppressDragClick = false;

function dragOverSellZone(zone, x, y) {
  const rect = zone.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function cleanupJokerDrag(pointerId, x, y, cancelled = false) {
  if (!jokerDrag || jokerDrag.pointerId !== pointerId) return;
  const drag = jokerDrag;
  jokerDrag = null;
  const shouldSell = !cancelled && drag.started && drag.zone &&
    dragOverSellZone(drag.zone, x, y) &&
    state?.phase === 'shop' && state.owned[drag.slot] === drag.id;
  const target = !cancelled && drag.started && !shouldSell
    ? document.elementFromPoint(x, y)?.closest('.reorderable-joker') : null;
  const destination = target ? Number(target.dataset.jokerSlot) : null;
  game.querySelector('.joker-reorder-target')?.classList.remove('joker-reorder-target');
  if (drag.card.hasPointerCapture?.(pointerId)) drag.card.releasePointerCapture(pointerId);
  drag.ghost?.remove();
  drag.card.classList.remove('drag-source');
  if (drag.zone) {
    drag.zone.classList.remove('is-over');
    drag.zone.querySelector('small').textContent = 'Glisse un joker ici';
  }
  if (!drag.started) return;

  // Suppress the synthetic click following a touch drag.
  suppressDragClick = true;
  window.setTimeout(() => { suppressDragClick = false; }, 0);
  if (shouldSell) {
    const next = sellJoker(state, drag.slot);
    if (next === state) return;
    const earned = next.credits - state.credits;
    saleNotice = '+' + earned + ' crédits';
    state = next;
    selected.clear();
    persist();
    render('h3[tabindex="-1"]');
    announcement.textContent = jokers[drag.id].name + ' vendu pour ' + earned + ' crédits.';
    return;
  }
  if (destination !== null && Number.isInteger(destination)) {
    const next = reorderJoker(state, drag.slot, destination);
    if (next === state) return;
    state = next;
    saleNotice = null;
    selected.clear();
    persist();
    render('h3[tabindex="-1"]');
    announcement.textContent = 'Ordre des jokers modifié.';
  }
}

game.addEventListener('click', event => {
  if (!suppressDragClick) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  suppressDragClick = false;
}, true);

game.addEventListener('pointerdown', event => {
  if (!state || jokerDrag || cardDrag ||
      (event.target.closest('button') && !event.target.closest('.joker-card-face')) ||
      (event.pointerType === 'mouse' && event.button !== 0)) return;
  const card = event.target.closest('.reorderable-joker');
  if (!card) return;
  const slot = Number(card.dataset.jokerSlot);
  if (!Number.isInteger(slot) || slot < 0 || slot >= state.owned.length) return;
  const id = state.owned[slot];
  jokerDrag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY,
    slot, id, price: Math.max(1, Math.floor(jokers[id].price / 2)),
    card, started: false, zone: null, ghost: null };
  try { card.setPointerCapture(event.pointerId); } catch { /* Pointer capture unavailable. */ }
});


/* Playing cards also follow the finger; a drag changes their order, a tap selects. */
function cleanupCardDrag(pointerId, x, y, cancelled = false) {
  if (!cardDrag || cardDrag.pointerId !== pointerId) return;
  const drag = cardDrag;
  cardDrag = null;
  const target = !cancelled && drag.started
    ? document.elementFromPoint(x, y)?.closest('.cards [data-card]') : null;
  game.querySelector('.hand-drop-target')?.classList.remove('hand-drop-target');
  if (drag.card.hasPointerCapture?.(pointerId)) drag.card.releasePointerCapture(pointerId);
  drag.card.classList.remove('hand-drag-source');
  drag.ghost?.remove();
  if (!drag.started) return;
  suppressDragClick = true;
  window.setTimeout(() => { suppressDragClick = false; }, 120);
  if (!target) return;
  const next = moveHandCard(state, drag.id, target.dataset.card);
  if (next === state) return;
  state = next;
  persist();
  render('[data-card="' + drag.id + '"]');
  announcement.textContent = 'Ordre des cartes modifié.';
}

game.addEventListener('pointerdown', event => {
  if (state?.phase !== 'play' || jokerDrag || cardDrag ||
      (event.pointerType === 'mouse' && event.button !== 0)) return;
  const card = event.target.closest('.cards [data-card]');
  if (!card) return;
  cardDrag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY,
    card, id: card.dataset.card, started: false, ghost: null };
  try { card.setPointerCapture(event.pointerId); } catch { /* Not all browsers support capture. */ }
});

/* Consumables behave like real cards: drag changes order, tap opens details.
   Neither gesture consumes an item until the explicit Use button is pressed. */
function cleanupConsumableDrag(pointerId, x, y, cancelled = false) {
  if (!consumableDrag || consumableDrag.pointerId !== pointerId) return;
  const drag = consumableDrag;
  consumableDrag = null;
  const target = !cancelled && drag.started
    ? document.elementFromPoint(x, y)?.closest('.consumable-slots [data-consumable-slot]') : null;
  const destination = target ? Number(target.dataset.consumableSlot) : null;
  game.querySelector('.consumable-drop-target')?.classList.remove('consumable-drop-target');
  if (drag.card.hasPointerCapture?.(pointerId)) drag.card.releasePointerCapture(pointerId);
  drag.card.classList.remove('consumable-drag-source');
  drag.ghost?.remove();
  if (!drag.started) return;
  suppressDragClick = true;
  window.setTimeout(() => { suppressDragClick = false; }, 120);
  if (destination === null || !Number.isInteger(destination)) return;
  const next = reorderConsumable(state, drag.slot, destination);
  if (next === state) return;
  state = next;
  persist();
  render('[data-consumable-slot="' + destination + '"]');
  announcement.textContent = 'Ordre des consommables modifié.';
}

game.addEventListener('pointerdown', event => {
  if (!state || jokerDrag || cardDrag || consumableDrag ||
      (event.pointerType === 'mouse' && event.button !== 0)) return;
  const card = event.target.closest('.consumable-slots [data-consumable-slot]');
  if (!card) return;
  const slot = Number(card.dataset.consumableSlot);
  if (!Number.isInteger(slot) || !state.consumables?.[slot]) return;
  consumableDrag = { pointerId: event.pointerId, x: event.clientX, y: event.clientY,
    slot, card, started: false, ghost: null };
  try { card.setPointerCapture(event.pointerId); } catch { /* Not supported. */ }
});

/* On iOS keep the viewport fixed; only panels with their own scrollbar pan. */
document.addEventListener('touchmove', event => {
  if (!event.cancelable) return;
  const scrollArea = event.target.closest?.('.shop .offers, .prune-cards, .loadout, .blind, .finish, dialog.rules');
  if (jokerDrag || cardDrag || consumableDrag || !scrollArea) event.preventDefault();
}, { passive: false });

document.addEventListener('pointermove', event => {
  const drag = jokerDrag;
  if (!drag || event.pointerId !== drag.pointerId) return;
  const { clientX: x, clientY: y } = event;
  if (!drag.started && Math.hypot(x - drag.x, y - drag.y) > 9) {
    drag.started = true;
    if (state.phase === 'shop') {
      drag.zone = game.querySelector('.sell-drop-zone');
      if (drag.zone) drag.zone.querySelector('small').textContent = '+' + drag.price + ' crédits';
    }
    const ghost = drag.card.querySelector('.joker-card-face').cloneNode(true);
    const rect = drag.card.getBoundingClientRect();
    ghost.removeAttribute('data-joker-info');
    ghost.classList.add('joker-card-ghost');
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
    document.body.append(ghost);
    drag.card.classList.add('drag-source');
    drag.ghost = ghost;
  }
  if (!drag.started) return;
  event.preventDefault();
  drag.ghost.style.left = x + 'px';
  drag.ghost.style.top = y + 'px';
  drag.zone?.classList.toggle('is-over', dragOverSellZone(drag.zone, x, y));
  game.querySelector('.joker-reorder-target')?.classList.remove('joker-reorder-target');
  if (!drag.zone || !dragOverSellZone(drag.zone, x, y)) {
    const over = document.elementFromPoint(x, y)?.closest('.reorderable-joker');
    if (over && over !== drag.card) over.classList.add('joker-reorder-target');
  }
}, { passive: false });

document.addEventListener('pointermove', event => {
  const drag = cardDrag;
  if (!drag || event.pointerId !== drag.pointerId) return;
  const { clientX: x, clientY: y } = event;
  if (!drag.started && Math.hypot(x - drag.x, y - drag.y) > 8) {
    drag.started = true;
    const rect = drag.card.getBoundingClientRect();
    const ghost = drag.card.cloneNode(true);
    ghost.classList.add('hand-drag-ghost');
    ghost.removeAttribute('data-card');
    ghost.removeAttribute('aria-pressed');
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
    ghost.disabled = true;
    document.body.append(ghost);
    drag.card.classList.add('hand-drag-source');
    drag.ghost = ghost;
  }
  if (!drag.started) return;
  event.preventDefault();
  drag.ghost.style.left = x + 'px';
  drag.ghost.style.top = y + 'px';
  game.querySelector('.hand-drop-target')?.classList.remove('hand-drop-target');
  const over = document.elementFromPoint(x, y)?.closest('.cards [data-card]');
  if (over && over !== drag.card) over.classList.add('hand-drop-target');
}, { passive: false });

document.addEventListener('pointermove', event => {
  const drag = consumableDrag;
  if (!drag || event.pointerId !== drag.pointerId) return;
  const { clientX: x, clientY: y } = event;
  if (!drag.started && Math.hypot(x - drag.x, y - drag.y) > 8) {
    drag.started = true;
    const rect = drag.card.getBoundingClientRect();
    const ghost = drag.card.cloneNode(true);
    ghost.classList.add('consumable-drag-ghost');
    ghost.removeAttribute('data-consumable-slot');
    ghost.removeAttribute('aria-haspopup');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.style.width = rect.width + 'px';
    ghost.style.height = rect.height + 'px';
    ghost.disabled = true;
    document.body.append(ghost);
    drag.card.classList.add('consumable-drag-source');
    drag.ghost = ghost;
  }
  if (!drag.started) return;
  event.preventDefault();
  drag.ghost.style.left = x + 'px';
  drag.ghost.style.top = y + 'px';
  game.querySelector('.consumable-drop-target')?.classList.remove('consumable-drop-target');
  const over = document.elementFromPoint(x, y)?.closest('.consumable-slots [data-consumable-slot]');
  if (over && over !== drag.card) over.classList.add('consumable-drop-target');
}, { passive: false });

document.addEventListener('pointerup', event => {
  cleanupJokerDrag(event.pointerId, event.clientX, event.clientY);
  cleanupCardDrag(event.pointerId, event.clientX, event.clientY);
  cleanupConsumableDrag(event.pointerId, event.clientX, event.clientY);
});
document.addEventListener('pointercancel', event => {
  cleanupJokerDrag(event.pointerId, event.clientX, event.clientY, true);
  cleanupCardDrag(event.pointerId, event.clientX, event.clientY, true);
  cleanupConsumableDrag(event.pointerId, event.clientX, event.clientY, true);
});

game.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target) return;
  const { card, action } = target.dataset;
  if (target.dataset.consumableSlot !== undefined) {
    const slot = Number(target.dataset.consumableSlot);
    const item = consumables.find(value => value.id === state.consumables?.[slot]);
    if (!item) return;
    const allowed = (item.id === 'bourse' && ['play', 'shop'].includes(state.phase)) ||
      (item.id !== 'bourse' && state.phase === 'play');
    consumableDialog.dataset.slot = String(slot);
    consumableDialog.dataset.consumableId = item.id;
    consumableDialog.querySelector('#consumable-dialog-title').textContent = item.name;
    consumableDialog.querySelector('#consumable-dialog-text').textContent = item.text;
    consumableDialog.querySelector('#consumable-dialog-art').innerHTML = consumablePortrait(item.id);
    consumableDialogUse.disabled = !allowed;
    consumableDialogUse.textContent = allowed ? 'Utiliser cette carte' : 'Disponible pendant une blinde';
    consumableDialog.showModal();
    return;
  }
  if (target.dataset.jokerInfo !== undefined) {
    const slot = Number(target.dataset.jokerInfo);
    if (!Number.isInteger(slot) || slot < 0 || slot >= state.owned.length) return;
    const id = state.owned[slot];
    const joker = jokers[id];
    document.querySelector('#joker-dialog-art').innerHTML = jokerPortrait(id, joker.mark);
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

  if (action === 'deck-view') {
    const fullDeck = deckFor(state);
    const inHand = new Set((state.hand ?? []).map(card => card.id));
    const inDraw = new Set((state.pile ?? []).map(card => card.id));
    const augmented = state.enhancements ?? {};
    const deckDialog = document.querySelector('#deck-dialog');
    const deckList = deckDialog.querySelector('#deck-card-list');
    const cardsBySuit = [...fullDeck].sort((a, b) =>
      ['♠', '♥', '♣', '♦'].indexOf(a.suit) - ['♠', '♥', '♣', '♦'].indexOf(b.suit)
      || b.rank - a.rank);
    deckDialog.querySelector('#deck-summary').textContent =
      fullDeck.length + ' cartes · ' + inHand.size + ' en main · '
      + inDraw.size + ' dans la pioche · '
      + Math.max(0, fullDeck.length - inHand.size - inDraw.size) + ' déjà jouées ou défaussées';
    deckList.replaceChildren(...cardsBySuit.map(card => {
      const button = document.createElement('li');
      button.className = 'deck-mini-card' + ('♥♦'.includes(card.suit) ? ' red' : '');
      const augure = card.augure ?? augmented[card.id];
      const status = inHand.has(card.id) ? 'En main' :
        inDraw.has(card.id) ? 'En pioche' : 'Jouée / défaussée';
      const face = faces[card.rank] || String(card.rank);
      const rank = document.createElement('strong');
      rank.textContent = face + card.suit;
      button.append(rank);
      if (augure && augures[augure]) {
        const effect = document.createElement('span');
        effect.className = 'deck-mini-augure';
        effect.textContent = augures[augure].mark + ' ' + augures[augure].name;
        button.append(effect);
      }
      const note = document.createElement('small');
      note.textContent = status;
      button.append(note);
      button.title = (court[card.rank] || (card.rank === 14 ? 'As' : face))
        + ' de ' + names[card.suit] + ' · ' + status;
      return button;
    }));
    deckDialog.showModal();
    return;
  }

  if (action === 'rules') {
    document.querySelector('#current-seed').textContent = state.seed;
    rules.showModal();
    return;
  }

  if (action === 'sort-value' || action === 'sort-suit') {
    if (state.phase !== 'play') return;
    const suits = ['♠', '♥', '♣', '♦'];
    const ordered = [...state.hand].sort((a, b) => action === 'sort-value'
      ? b.rank - a.rank || suits.indexOf(a.suit) - suits.indexOf(b.suit)
      : suits.indexOf(a.suit) - suits.indexOf(b.suit) || b.rank - a.rank);
    state = { ...state, handOrder: ordered.map(card => card.id) };
    persist();
    render();
    return;
  }

  if (action === 'game-info') {
    const history = state.handHistory ?? [];
    const dialog = document.querySelector('#game-info-dialog');
    dialog.querySelector('#game-info-summary').textContent =
      history.length + ' mains jouées · ' + (state.round >= 0 ? 'Mise ' + (Math.floor(state.round / 3) + 1) : 'Début de partie');
    dialog.querySelector('#game-info-list').replaceChildren(...history.slice().reverse().map((entry, i) => {
      const item = document.createElement('li');
      item.textContent = 'Main ' + (history.length - i) + ' · ' + entry.name +
        ' · ' + scoreFormat.format(entry.chips) + ' × ' +
        scoreFormat.format(entry.mult) + ' = ' + scoreFormat.format(entry.total);
      return item;
    }));
    dialog.showModal();
    return;
  }

  let next = state;
  if (target.dataset.sell !== undefined) next = sellJoker(state, Number(target.dataset.sell));
  else if (target.dataset.buyConsumable !== undefined) next = buyConsumable(state, target.dataset.buyConsumable);
  else if (target.dataset.augureTarget !== undefined) next = applyAugure(state, target.dataset.augureTarget);
  else if (action === 'back-augure-target') next = cancelAugureTarget(state);
  else if (target.dataset.buy !== undefined) next = buy(state, Number(target.dataset.buy));
  else if (target.dataset.pack !== undefined) next = openPack(state, Number(target.dataset.pack));
  else if (target.dataset.jokerPack !== undefined) next = openJokerPack(state, Number(target.dataset.jokerPack));
  else if (target.dataset.jokerPackChoice !== undefined) next = chooseJokerPack(state, Number(target.dataset.jokerPackChoice));
  else if (action === 'skip-joker-pack') next = chooseJokerPack(state, null);
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
  else if (target.dataset.buy !== undefined || target.dataset.jokerPackChoice !== undefined) announcement.textContent = 'Joker équipé.';
  else if (target.dataset.sell !== undefined) announcement.textContent = 'Joker vendu : ' + saleNotice + '.';
  else if (target.dataset.buyConsumable !== undefined) announcement.textContent = 'Consommable rangé dans l’inventaire.';
  else if (target.dataset.augureTarget !== undefined) announcement.textContent = 'Carte améliorée.';
  else if (action === 'casino-skip') announcement.textContent = 'Colonne passée : trois bonus récupérés.';
  else if (target.dataset.casinoLane !== undefined) announcement.textContent = 'Blinde choisie.';
});

consumableDialogUse.addEventListener('click', () => {
  const slot = Number(consumableDialog.dataset.slot);
  if (!state || !Number.isInteger(slot) ||
      state.consumables?.[slot] !== consumableDialog.dataset.consumableId) {
    consumableDialog.close();
    return;
  }
  const item = consumables.find(value => value.id === state.consumables[slot]);
  const next = useConsumable(state, slot);
  if (next === state) return;
  state = next;
  selected.clear();
  persist();
  consumableDialog.close();
  render('h3[tabindex="-1"]');
  announcement.textContent = (item?.name ?? 'Consommable') + ' utilisé.';
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
