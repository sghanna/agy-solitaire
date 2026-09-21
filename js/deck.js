/**
 * agy-solitaire: Vector Deck & Card Renderer
 * Option 1: Max-Fill Banner (Jumbo readable typography)
 * Style 5 slender suits + Style 4 concave Diamond
 * Option 4A: Crimson Double Happiness (囍) card back
 */

const SUITS = {
  S: { name: 'spades', color: 'black', symbol: '♠', label: 'Spade' },
  H: { name: 'hearts', color: 'red', symbol: '♥', label: 'Heart' },
  C: { name: 'clubs', color: 'black', symbol: '♣', label: 'Club' },
  D: { name: 'diamonds', color: 'red', symbol: '♦', label: 'Diamond' }
};

const RANKS = [
  { value: 1, label: 'A', name: 'Ace' },
  { value: 2, label: '2', name: '2' },
  { value: 3, label: '3', name: '3' },
  { value: 4, label: '4', name: '4' },
  { value: 5, label: '5', name: '5' },
  { value: 6, label: '6', name: '6' },
  { value: 7, label: '7', name: '7' },
  { value: 8, label: '8', name: '8' },
  { value: 9, label: '9', name: '9' },
  { value: 10, label: '10', name: '10' },
  { value: 11, label: 'J', name: 'Jack', court: true },
  { value: 12, label: 'Q', name: 'Queen', court: true },
  { value: 13, label: 'K', name: 'King', court: true }
];

// Slender Style 5 Suit SVG Paths + Concave Diamond
const SUIT_SVGS = {
  S: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M 50,10 C 46,24 37,38 28,49 C 20,58 16,66 16,73 C 16,81 21,86 28,86 C 35,86 40,82 46,75 L 45,95 L 55,95 L 54,75 C 60,82 65,86 72,86 C 79,86 84,81 84,73 C 84,66 80,58 72,49 C 63,38 54,24 50,10 Z"/></svg>`,
  H: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M 50,88 C 29,64 16,46 16,30 C 16,17 25,10 36,10 C 42,10 47,13 50,18 C 53,13 58,10 64,10 C 75,10 84,17 84,30 C 84,46 71,64 50,88 Z"/></svg>`,
  C: `<svg viewBox="0 0 100 100" fill="currentColor"><circle cx="50" cy="28" r="16"/><circle cx="30" cy="56" r="16"/><circle cx="70" cy="56" r="16"/><path d="M 47,56 L 46,95 L 54,95 L 53,56 Z"/></svg>`,
  D: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M 50,5 Q 55,48 90,50 Q 55,52 50,95 Q 45,52 10,50 Q 45,48 50,5 Z"/></svg>`
};

// Simplified Crown & Monogram icons for court cards (no floater-triggering decorative clutter)
const COURT_ICONS = {
  J: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M 20,75 L 80,75 L 75,85 L 25,85 Z M 20,70 L 28,35 L 42,55 L 50,25 L 58,55 L 72,35 L 80,70 Z"/><circle cx="28" cy="28" r="4"/><circle cx="50" cy="18" r="4"/><circle cx="72" cy="28" r="4"/></svg>`,
  Q: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M 22,75 L 78,75 L 74,84 L 26,84 Z M 22,70 L 30,42 L 40,58 L 50,30 L 60,58 L 70,42 L 78,70 Z"/><circle cx="30" cy="35" r="3.5"/><circle cx="50" cy="22" r="4.5"/><circle cx="70" cy="35" r="3.5"/></svg>`,
  K: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M 18,74 L 82,74 L 78,85 L 22,85 Z M 18,68 L 26,30 L 40,52 L 50,20 L 60,52 L 74,30 L 82,68 Z"/><circle cx="26" cy="22" r="4"/><circle cx="50" cy="12" r="5"/><circle cx="74" cy="22" r="4"/></svg>`
};

/**
 * Creates full 52-card standard deck
 */
function createStandardDeck() {
  const deck = [];
  let id = 1;
  for (const suitKey in SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `card-${id++}`,
        suit: suitKey,
        rank: rank.value,
        rankLabel: rank.label,
        color: SUITS[suitKey].color,
        faceUp: false
      });
    }
  }
  return deck;
}

/**
 * Renders HTML for a face-up card (Option 1 Max-Fill Banner)
 */
function renderFaceUpCard(card) {
  const isRed = card.color === 'red';
  const suitSvg = SUIT_SVGS[card.suit];
  const rank = card.rank;
  const isCourt = rank >= 11;
  const courtIcon = isCourt ? COURT_ICONS[card.rankLabel] : '';

  return `
    <div class="card-face card-${card.color}">
      <!-- Top Max-Fill Banner -->
      <div class="card-banner">
        <span class="card-rank">${card.rankLabel}</span>
        <div class="card-banner-suit">${suitSvg}</div>
      </div>

      <!-- Clean, Floater-Safe Center Area -->
      <div class="card-center">
        ${isCourt ? `
          <div class="court-graphic">
            <div class="court-icon">${courtIcon}</div>
            <div class="court-letter">${card.rankLabel}</div>
            <div class="court-suit-small">${suitSvg}</div>
          </div>
        ` : `
          <div class="card-main-suit ${rank === 1 ? 'ace-emblem' : ''}">
            ${suitSvg}
          </div>
        `}
      </div>

      <!-- Bottom Mini Index (Subtle) -->
      <div class="card-footer">
        <span class="card-rank-sub">${card.rankLabel}</span>
        <div class="card-footer-suit">${suitSvg}</div>
      </div>
    </div>
  `;
}

/**
 * Renders HTML for face-down card (Option 4A Double Happiness Back)
 */
function renderCardBack() {
  return `
    <div class="card-back double-happiness-back">
      <div class="back-inner-border">
        <div class="back-seal">
          <div class="back-seal-inner">
            <span class="back-seal-glyph">囍</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Creates DOM element for a card
 */
function createCardElement(card) {
  const el = document.createElement('div');
  el.className = `solitaire-card ${card.faceUp ? 'face-up' : 'face-down'}`;
  el.id = card.id;
  el.dataset.id = card.id;
  el.dataset.suit = card.suit;
  el.dataset.rank = card.rank;
  el.dataset.color = card.color;

  el.innerHTML = card.faceUp ? renderFaceUpCard(card) : renderCardBack();
  return el;
}

window.SolitaireDeck = {
  SUITS,
  RANKS,
  SUIT_SVGS,
  createStandardDeck,
  renderFaceUpCard,
  renderCardBack,
  createCardElement
};
