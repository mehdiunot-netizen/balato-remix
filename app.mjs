import { advance, blinds, buy, evaluate, jokers, start, useCards } from './game.mjs';

const game = document.querySelector('#game');
const wallet = document.querySelector('#wallet');
const announcement = document.querySelector('#announcement');
const storageKey = 'contre-pli-v1';
const names = { '♠': 'pique', '♥': 'cœur', '♣': 'trèfle', '♦': 'carreau' };
const faces = { 11: 'V', 12: 'D', 13: 'R', 14: 'A' };
let state = restore();
const selected = new Set();

function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.version === 1) return saved.state;
  } catch {
    // The current session remains playable when storage is unavailable.
  }
  return start();
}

function render(focus) {
  const blind = blinds[state.round];
  wallet.textContent = state.credits + ' crédits';
  const loadout = state.owned.map(id => {
    const { mark, name, text } = jokers[id];
    return '<li><strong><span aria-hidden="true">' + mark + '</span> ' + name +
      '</strong><small>' + text + '</small></li>';
  }).join('');

  let content;
  if (state.phase === 'play') {
    const cards = [...state.hand].sort((a, b) => b.rank - a.rank || a.suit.localeCompare(b.suit));
    const preview = selected.size ? evaluate(cards.filter(c => selected.has(c.id)), state.owned) : null;
    content = `
      <section class="play" aria-label="Main en cours">
        <div class="hand-info"><h3>Votre main</h3><span>${state.pile.length} en pioche</span></div>
        <div class="cards">${cards.map(card => {
          const rank = faces[card.rank] || card.rank;
          return `<button class="card ${'♥♦'.includes(card.suit) ? 'red' : ''}" data-card="${card.id}"
            aria-label="${rank} de ${names[card.suit]}" aria-pressed="${selected.has(card.id)}"
            ${selected.size === 5 && !selected.has(card.id) ? 'disabled' : ''}>
            <span class="rank" aria-hidden="true">${rank}</span>
            <span class="suit" aria-hidden="true">${card.suit}</span>
          </button>`;
        }).join('')}</div>
        <div class="preview" aria-live="polite">${preview ?
          `<strong>${preview.name}</strong><span>${preview.chips} jetons × ${preview.mult} = <b>${preview.total}</b></span>` :
          '<span>Sélectionnez de 1 à 5 cartes.</span>'}</div>
        <div class="actions">
          <button class="primary" data-action="play" ${selected.size ? '' : 'disabled'}>Jouer <small>${state.plays} mains</small></button>
          <button data-action="discard" ${selected.size && state.discards ? '' : 'disabled'}>Défausser <small>${state.discards} restantes</small></button>
        </div>
      </section>`;
  } else if (state.phase === 'shop') {
    content = `
      <section class="shop">
        <h3 tabindex="-1">Boutique</h3>
        <p>Blinde franchie · +${state.reward} crédits</p>
        <ul class="offers">${state.offers.map(id => {
          const joker = jokers[id];
          const full = state.owned.length === 3;
          return `<li><span class="mark" aria-hidden="true">${joker.mark}</span>
          <div><strong>${joker.name}</strong><small>${joker.text}</small></div>
          <button data-buy="${id}" aria-label="Acheter ${joker.name} pour ${joker.price} crédits"
          ${full || state.credits < joker.price ? 'disabled' : ''}>${joker.price} cr.</button></li>`;
        }).join('')}</ul>
        ${state.owned.length === 3 ? '<p>Vos trois emplacements sont occupés.</p>' : ''}
        <button class="primary" data-action="advance">Blinde suivante</button>
      </section>`;
  } else {
    content = `
      <section class="finish">
        <h3 tabindex="-1">${state.phase === 'win' ? 'Victoire !' : 'Fin de partie'}</h3>
        <p>${state.phase === 'win' ? 'Vous avez franchi les six blindes.' : 'Vous avez épuisé vos mains avant d’atteindre l’objectif.'}</p>
        <button class="primary" data-action="restart">Nouvelle partie</button>
      </section>`;
  }

  game.innerHTML = `
    <section class="blind" aria-labelledby="blind-name">
      <span class="eyebrow">Blinde ${state.round + 1} / ${blinds.length}</span>
      <h2 id="blind-name" tabindex="-1">${blind.name}</h2>
      <div class="score"><strong>${state.score}</strong><span>/ ${blind.target} points</span></div>
      <progress aria-label="Progression vers l’objectif" value="${Math.min(state.score, blind.target)}" max="${blind.target}"></progress>
      ${state.last ? `<p>Dernière main · ${state.last.name} · +${state.last.total}</p>` : ''}
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

  let next = state;
  if (target.dataset.buy !== undefined) next = buy(state, Number(target.dataset.buy));
  else if (action === 'advance') next = advance(state);
  else if (action === 'restart') next = start();
  else if (action === 'play' || action === 'discard') next = useCards(state, [...selected], action);
  if (next === state) return;
  state = next;
  selected.clear();
  try {
    localStorage.setItem(storageKey, JSON.stringify({ version: 1, state }));
  } catch {
    // Storage failures do not interrupt play.
  }
  render(state.phase === 'play' ? '#blind-name' : 'h3[tabindex="-1"]');
  if (action === 'play') announcement.textContent = state.last.name + ', +' + state.last.total + ' points.';
  else if (action === 'discard') announcement.textContent = 'Cartes remplacées.';
  else if (target.dataset.buy !== undefined) announcement.textContent = 'Joker équipé.';
});

render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
