import { advance, blindFor, buy, continueRun, jokers, previewHand, restoreRun, start, useCards } from './game.mjs?v=8';

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

const court = { 11: ['◆', 'Valet'], 12: ['✦', 'Dame'], 13: ['♜', 'Roi'] };
function cardArt(card) {
  if (court[card.rank]) {
    return '<span class="court"><span>' + court[card.rank][0] + '</span></span>';
  }
  return '<span class="suit">' + card.suit + '</span>';
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
  const activations = state.last?.steps?.filter(step => step.type !== 'base') ?? [];
  const loadout = state.owned.map(id => {
    const { mark, name, text, theme } = jokers[id];
    const activation = activations.findIndex(step => step.id === id);
    const pulse = scored && activation >= 0;
    return `<li class="${theme || ''}${pulse ? ' triggered' : ''}"${pulse ? ' style="--activation:' + activation + '"' : ''}><details><summary><strong><span class="joker-icon" aria-hidden="true">${mark}</span>
      ${name}</strong></summary><small>${text}</small></details></li>`;
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
          return `<button class="card ${'♥♦'.includes(card.suit) ? 'red' : ''}" data-card="${card.id}" style="--tilt:${(i - 3.5) * 2.6}deg;--arc:${Math.abs(i - 3.5) * 3}px"
            aria-label="${court[card.rank]?.[1] || (card.rank === 14 ? 'As' : rank)} de ${names[card.suit]}" aria-pressed="${selected.has(card.id)}"
            ${selected.size === 5 && !selected.has(card.id) ? 'disabled' : ''}>
            <span class="rank" aria-hidden="true">${rank}<small>${card.suit}</small></span>
            <span class="card-art" aria-hidden="true">${cardArt(card)}</span>
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
  } else if (state.phase === 'shop') {
    content = `
      <section class="shop">
        <header class="shop-header">
          <div><h3 tabindex="-1">Boutique</h3><p>Blinde franchie · +${state.reward} crédits</p></div>
          <button class="primary" data-action="advance">Blinde suivante</button>
        </header>
        <ul class="offers">${state.offers.map(id => {
          const joker = jokers[id];
          const full = state.owned.length === 3;
          return `<li class="${joker.theme || ''}"><span class="mark" aria-hidden="true">${joker.mark}</span>
          <div><strong>${joker.name}</strong><small>${joker.text}</small></div>
          <button data-buy="${id}" aria-label="Acheter ${joker.name} pour ${joker.price} crédits"
          ${full || state.credits < joker.price ? 'disabled' : ''}>${joker.price} cr.</button></li>`;
        }).join('')}</ul>
        ${state.owned.length === 3 ? '<p>Vos trois emplacements sont occupés.</p>' : ''}
      </section>`;
  } else {
    content = `
      <section class="finish">
        <h3 tabindex="-1">${state.phase === 'win' ? 'Victoire !' : 'Fin de partie'}</h3>
        <p>${state.phase === 'win' ? (state.legacy ? 'Vous avez franchi les six blindes.' : 'Vous avez terminé la huitième mise.') : 'Vous avez épuisé vos mains avant d’atteindre l’objectif.'}</p>
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
    <section class="loadout"><h3>Jokers <span>${state.owned.length}/3</span></h3>
      ${loadout ? '<ul>' + loadout + '</ul>' : '<p>Aucun joker équipé.</p>'}</section>`;
  if (focus) game.querySelector(focus)?.focus();
}

game.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target) return;
  const { card, action } = target.dataset;
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
      const bonus = step.type === 'factor' ? '×' + scoreFormat.format(step.factor) :
        [step.chips ? '+' + step.chips + ' jetons' : '', step.mult ? '+' + step.mult + ' au multiplicateur' : ''].filter(Boolean).join(' · ');
      return jokers[step.id].name + ' · ' + bonus;
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
  if (target.dataset.buy !== undefined) next = buy(state, Number(target.dataset.buy));
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
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
