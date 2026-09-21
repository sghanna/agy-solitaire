/**
 * agy-solitaire: Klondike Solitaire Engine
 * Accessible, zero-frustration single-tap auto-move
 * Built for low-vision / eye-floater comfort
 */

class SolitaireGame {
  constructor() {
    this.deck = [];
    this.stock = [];
    this.waste = [];
    this.foundations = { S: [], H: [], C: [], D: [] };
    this.tableau = [[], [], [], [], [], [], []];

    this.undoStack = [];
    this.moves = 0;
    this.score = 0;
    this.startTime = null;
    this.timerInterval = null;
    this.elapsedSeconds = 0;
    this.isWon = false;
    this.autoCompleting = false;

    // Drag-and-drop state
    this.dragData = null;

    // DOM Elements
    this.boardEl = null;
    this.stockEl = null;
    this.wasteEl = null;
    this.foundationEls = {};
    this.tableauEls = [];
    this.timerEl = null;
    this.scoreEl = null;
    this.movesEl = null;
    this.undoBtn = null;
    this.hintBtn = null;
  }

  init() {
    this.boardEl = document.getElementById('game-board');
    this.stockEl = document.getElementById('slot-stock');
    this.wasteEl = document.getElementById('slot-waste');

    for (const suit of ['S', 'H', 'C', 'D']) {
      this.foundationEls[suit] = document.getElementById(`foundation-${suit}`);
    }

    for (let i = 0; i < 7; i++) {
      this.tableauEls[i] = document.getElementById(`tableau-${i}`);
    }

    this.timerEl = document.getElementById('hud-timer');
    this.scoreEl = document.getElementById('hud-score');
    this.undoBtn = document.getElementById('btn-undo');
    this.hintBtn = document.getElementById('btn-hint');

    this.setupEventListeners();
    this.startNewGame();
  }

  setupEventListeners() {
    // Stock click
    if (this.stockEl) {
      this.stockEl.addEventListener('click', () => this.handleStockClick());
    }

    // Undo button
    if (this.undoBtn) {
      this.undoBtn.addEventListener('click', () => this.undo());
    }

    // Hint button
    if (this.hintBtn) {
      this.hintBtn.addEventListener('click', () => this.provideHint());
    }

    // New Game button
    const newGameBtn = document.getElementById('btn-new-game');
    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        if (confirm('Start a new deal?')) {
          this.startNewGame();
        }
      });
    }

    // Audio toggle button
    const audioBtn = document.getElementById('btn-audio-toggle');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isMuted = window.solitaireAudio.toggleMute();
        audioBtn.textContent = isMuted ? '🔇 Sound' : '🔊 Sound';
      });
    }

    // Developer & Testing shortcut: Press 'W' to test alternating victory celebration, 'A' to auto-finish
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'w' || e.key === 'W') {
        const stats = {
          time: this.formatTime(this.elapsedSeconds),
          moves: this.moves || 42,
          score: this.score || 7450
        };
        if (window.solitaireCelebration) {
          window.solitaireCelebration.celebrate(stats, () => this.startNewGame());
        }
      } else if (e.key === 'a' || e.key === 'A') {
        this.autoComplete();
      }
    });

    // Global touch/click delegation for cards
    document.addEventListener('click', (e) => {
      const cardEl = e.target.closest('.solitaire-card');
      if (cardEl && !this.isWon && !this.autoCompleting) {
        this.handleCardClick(cardEl);
      }
    });

    // Window resize handler for celebration canvas
    window.addEventListener('resize', () => {
      if (window.solitaireCelebration) {
        window.solitaireCelebration.resizeCanvas();
      }
    });
  }

  startNewGame() {
    this.isWon = false;
    this.autoCompleting = false;
    this.undoStack = [];
    this.moves = 0;
    this.score = 0;
    this.elapsedSeconds = 0;

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      this.updateTimerDisplay();
    }, 1000);

    if (window.solitaireCelebration) {
      window.solitaireCelebration.stop();
    }

    const autoFinishBar = document.getElementById('auto-finish-banner');
    if (autoFinishBar) autoFinishBar.style.display = 'none';

    // 1. Create fresh standard 52-card deck
    this.deck = window.SolitaireDeck.createStandardDeck();

    // 2. Fisher-Yates Shuffle
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }

    // 3. Clear all piles
    this.stock = [];
    this.waste = [];
    this.foundations = { S: [], H: [], C: [], D: [] };
    this.tableau = [[], [], [], [], [], [], []];

    // 4. Deal into Tableau columns (col 0: 1 card, col 1: 2 cards ... col 6: 7 cards)
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = this.deck.pop();
        // Top card of each column is face-up
        card.faceUp = (row === col);
        this.tableau[col].push(card);
      }
    }

    // 5. Remaining 24 cards go to Stock (face down)
    while (this.deck.length > 0) {
      const card = this.deck.pop();
      card.faceUp = false;
      this.stock.push(card);
    }

    if (window.solitaireAudio) {
      window.solitaireAudio.playCardPlace();
    }

    this.render();
    this.updateHUD();
  }

  // =========================================================================
  // USER ACTIONS
  // =========================================================================

  handleStockClick() {
    if (this.isWon || this.autoCompleting) return;

    if (this.stock.length > 0) {
      // Draw 1 card from Stock to Waste
      const card = this.stock.pop();
      card.faceUp = true;
      this.waste.push(card);

      this.recordMove({
        type: 'draw',
        card: card
      });

      if (window.solitaireAudio) window.solitaireAudio.playStockDraw();
      this.moves++;
      this.render();
      this.updateHUD();
    } else if (this.waste.length > 0) {
      // Recycle Waste back to Stock
      const recycledCards = [...this.waste];
      this.waste = [];

      // When recycling, reverse waste back into stock so order is maintained
      while (recycledCards.length > 0) {
        const card = recycledCards.pop();
        card.faceUp = false;
        this.stock.push(card);
      }

      this.recordMove({
        type: 'recycle',
        count: this.stock.length
      });

      if (window.solitaireAudio) window.solitaireAudio.playStockDraw();
      this.moves++;
      this.render();
      this.updateHUD();
    }
  }

  /**
   * PRIMARY LOW-VISION INTERACTION: Single-Tap Auto-Move
   */
  handleCardClick(cardEl) {
    const cardId = cardEl.dataset.id;
    const location = this.findCardLocation(cardId);
    if (!location) return;

    const { pile, colIndex, cardIndex, card } = location;

    // 1. If face-down card in tableau is at the top of its column, flip it!
    if (pile === 'tableau' && !card.faceUp && cardIndex === this.tableau[colIndex].length - 1) {
      card.faceUp = true;
      this.score += 5;
      this.moves++;
      this.recordMove({
        type: 'flip',
        colIndex: colIndex,
        cardIndex: cardIndex
      });
      if (window.solitaireAudio) window.solitaireAudio.playCardFlip();
      this.render();
      this.updateHUD();
      this.checkAutoCompletionReadiness();
      return;
    }

    // Ignore face-down cards not at the top
    if (!card.faceUp) return;

    // 2. Try moving single card to Foundation first (highest priority)
    if (pile === 'waste' || (pile === 'tableau' && cardIndex === this.tableau[colIndex].length - 1)) {
      if (this.tryMoveToFoundation(card, location)) {
        return;
      }
    }

    // 3. Try moving card or stack to Tableau
    if (pile === 'waste' || pile === 'tableau' || pile === 'foundation') {
      if (this.tryMoveToTableau(card, location)) {
        return;
      }
    }

    // If no move found, trigger soft visual shake to communicate no legal move
    cardEl.classList.add('no-move-shake');
    setTimeout(() => cardEl.classList.remove('no-move-shake'), 300);
  }

  /**
   * Attempts to move a card to its corresponding Foundation
   */
  tryMoveToFoundation(card, location) {
    const suit = card.suit;
    const fStack = this.foundations[suit];
    const topRank = fStack.length === 0 ? 0 : fStack[fStack.length - 1].rank;

    // Can only move if card is Ace (rank 1) or next ascending rank (e.g. 5 on 4)
    if (card.rank === topRank + 1) {
      let previousCardFlipped = false;

      // Execute move
      if (location.pile === 'waste') {
        this.waste.pop();
      } else if (location.pile === 'tableau') {
        this.tableau[location.colIndex].pop();
        // Check if previously hidden card is now exposed
        const col = this.tableau[location.colIndex];
        if (col.length > 0 && !col[col.length - 1].faceUp) {
          col[col.length - 1].faceUp = true;
          previousCardFlipped = true;
          this.score += 5;
        }
      }

      this.foundations[suit].push(card);
      this.score += 10;
      this.moves++;

      this.recordMove({
        type: 'to_foundation',
        source: location.pile,
        colIndex: location.colIndex,
        card: card,
        suit: suit,
        flippedColCard: previousCardFlipped
      });

      if (window.solitaireAudio) window.solitaireAudio.playFoundation(card.rank);
      this.render();
      this.updateHUD();
      this.checkWinCondition();
      return true;
    }
    return false;
  }

  /**
   * Attempts to move a card or stack to a legal Tableau column
   */
  tryMoveToTableau(card, location) {
    // 1. Look for matching non-empty column (opposite color, rank + 1)
    for (let targetCol = 0; targetCol < 7; targetCol++) {
      if (location.pile === 'tableau' && location.colIndex === targetCol) continue;

      const col = this.tableau[targetCol];
      if (col.length > 0) {
        const targetTop = col[col.length - 1];
        if (targetTop.faceUp && targetTop.color !== card.color && targetTop.rank === card.rank + 1) {
          this.executeMoveToTableau(location, targetCol);
          return true;
        }
      }
    }

    // 2. If moving a King (rank 13), look for an empty column
    if (card.rank === 13) {
      // Don't move King if already at the bottom of an empty-bottomed column
      if (location.pile === 'tableau' && location.cardIndex === 0) {
        return false;
      }

      for (let targetCol = 0; targetCol < 7; targetCol++) {
        if (this.tableau[targetCol].length === 0) {
          this.executeMoveToTableau(location, targetCol);
          return true;
        }
      }
    }

    return false;
  }

  executeMoveToTableau(location, targetCol) {
    let movingCards = [];
    let previousCardFlipped = false;

    if (location.pile === 'waste') {
      movingCards = [this.waste.pop()];
    } else if (location.pile === 'foundation') {
      movingCards = [this.foundations[location.suit].pop()];
      this.score = Math.max(0, this.score - 10);
    } else if (location.pile === 'tableau') {
      const sourceCol = this.tableau[location.colIndex];
      movingCards = sourceCol.splice(location.cardIndex);

      // Auto-flip exposed card beneath
      if (sourceCol.length > 0 && !sourceCol[sourceCol.length - 1].faceUp) {
        sourceCol[sourceCol.length - 1].faceUp = true;
        previousCardFlipped = true;
        this.score += 5;
      }
    }

    this.tableau[targetCol].push(...movingCards);
    this.score += 5;
    this.moves++;

    this.recordMove({
      type: 'to_tableau',
      source: location.pile,
      sourceColIndex: location.colIndex,
      sourceCardIndex: location.cardIndex,
      sourceSuit: location.suit,
      targetColIndex: targetCol,
      cards: movingCards,
      flippedColCard: previousCardFlipped
    });

    if (window.solitaireAudio) window.solitaireAudio.playCardPlace();
    this.render();
    this.updateHUD();
    this.checkAutoCompletionReadiness();
  }

  // =========================================================================
  // UNDO ENGINE (UNLIMITED, ZERO PENALTY)
  // =========================================================================

  recordMove(action) {
    this.undoStack.push(action);
  }

  undo() {
    if (this.undoStack.length === 0 || this.isWon || this.autoCompleting) return;

    const action = this.undoStack.pop();

    if (action.type === 'draw') {
      const card = this.waste.pop();
      card.faceUp = false;
      this.stock.push(card);
    } else if (action.type === 'recycle') {
      while (this.stock.length > 0) {
        const card = this.stock.pop();
        card.faceUp = true;
        this.waste.push(card);
      }
    } else if (action.type === 'flip') {
      this.tableau[action.colIndex][action.cardIndex].faceUp = false;
      this.score = Math.max(0, this.score - 5);
    } else if (action.type === 'to_foundation') {
      const card = this.foundations[action.suit].pop();
      this.score = Math.max(0, this.score - 10);

      if (action.flippedColCard) {
        const col = this.tableau[action.colIndex];
        if (col.length > 0) {
          col[col.length - 1].faceUp = false;
          this.score = Math.max(0, this.score - 5);
        }
      }

      if (action.source === 'waste') {
        this.waste.push(card);
      } else if (action.source === 'tableau') {
        this.tableau[action.colIndex].push(card);
      }
    } else if (action.type === 'to_tableau') {
      const count = action.cards.length;
      const returnedCards = this.tableau[action.targetColIndex].splice(-count);
      this.score = Math.max(0, this.score - 5);

      if (action.flippedColCard) {
        const srcCol = this.tableau[action.sourceColIndex];
        if (srcCol.length > 0) {
          srcCol[srcCol.length - 1].faceUp = false;
          this.score = Math.max(0, this.score - 5);
        }
      }

      if (action.source === 'waste') {
        this.waste.push(returnedCards[0]);
      } else if (action.source === 'foundation') {
        this.foundations[action.sourceSuit].push(returnedCards[0]);
        this.score += 10;
      } else if (action.source === 'tableau') {
        this.tableau[action.sourceColIndex].push(...returnedCards);
      }
    }

    if (window.solitaireAudio) window.solitaireAudio.playUndo();
    this.render();
    this.updateHUD();
    this.checkAutoCompletionReadiness();
  }

  // =========================================================================
  // ACCESSIBLE HINT SYSTEM
  // =========================================================================

  provideHint() {
    if (this.isWon || this.autoCompleting) return;

    // Clear previous hints
    document.querySelectorAll('.hint-active').forEach(el => el.classList.remove('hint-active'));

    // 1. Check if any card can go to Foundation
    // Check Waste top card
    if (this.waste.length > 0) {
      const wCard = this.waste[this.waste.length - 1];
      const fStack = this.foundations[wCard.suit];
      const topRank = fStack.length === 0 ? 0 : fStack[fStack.length - 1].rank;
      if (wCard.rank === topRank + 1) {
        this.highlightCard(wCard.id);
        return;
      }
    }

    // Check Tableau top cards
    for (let c = 0; c < 7; c++) {
      const col = this.tableau[c];
      if (col.length > 0) {
        const tCard = col[col.length - 1];
        if (tCard.faceUp) {
          const fStack = this.foundations[tCard.suit];
          const topRank = fStack.length === 0 ? 0 : fStack[fStack.length - 1].rank;
          if (tCard.rank === topRank + 1) {
            this.highlightCard(tCard.id);
            return;
          }
        }
      }
    }

    // 2. Check if moving any Tableau stack reveals a hidden card
    for (let c = 0; c < 7; c++) {
      const col = this.tableau[c];
      for (let r = 0; r < col.length; r++) {
        const card = col[r];
        if (card.faceUp) {
          // If there's a face-down card below this one, moving it is high value!
          const revealsCard = (r > 0 && !col[r - 1].faceUp);

          for (let targetCol = 0; targetCol < 7; targetCol++) {
            if (c === targetCol) continue;
            const tCol = this.tableau[targetCol];
            if (tCol.length > 0) {
              const targetTop = tCol[tCol.length - 1];
              if (targetTop.faceUp && targetTop.color !== card.color && targetTop.rank === card.rank + 1) {
                this.highlightCard(card.id);
                this.highlightCard(targetTop.id);
                return;
              }
            } else if (card.rank === 13 && revealsCard) {
              this.highlightCard(card.id);
              return;
            }
          }
        }
      }
    }

    // 3. Check if Waste card can move to Tableau
    if (this.waste.length > 0) {
      const wCard = this.waste[this.waste.length - 1];
      for (let targetCol = 0; targetCol < 7; targetCol++) {
        const tCol = this.tableau[targetCol];
        if (tCol.length > 0) {
          const targetTop = tCol[tCol.length - 1];
          if (targetTop.faceUp && targetTop.color !== wCard.color && targetTop.rank === wCard.rank + 1) {
            this.highlightCard(wCard.id);
            this.highlightCard(targetTop.id);
            return;
          }
        } else if (wCard.rank === 13) {
          this.highlightCard(wCard.id);
          return;
        }
      }
    }

    // 4. If nothing else, highlight Stock to draw
    if (this.stock.length > 0 || this.waste.length > 0) {
      const stockCardEl = this.stockEl.querySelector('.solitaire-card') || this.stockEl;
      stockCardEl.classList.add('hint-active');
      setTimeout(() => stockCardEl.classList.remove('hint-active'), 2500);
    }
  }

  highlightCard(cardId) {
    const el = document.getElementById(cardId);
    if (el) {
      el.classList.add('hint-active');
      setTimeout(() => el.classList.remove('hint-active'), 2500);
    }
  }

  // =========================================================================
  // WIN CONDITION & AUTO-COMPLETE
  // =========================================================================

  checkAutoCompletionReadiness() {
    // If all cards in the tableau are face-up, and stock + waste are empty,
    // the game is 100% won! Display Auto-Finish button.
    if (this.stock.length === 0 && this.waste.length === 0) {
      let allFaceUp = true;
      for (let c = 0; c < 7; c++) {
        for (const card of this.tableau[c]) {
          if (!card.faceUp) {
            allFaceUp = false;
            break;
          }
        }
      }

      const autoFinishBar = document.getElementById('auto-finish-banner');
      if (allFaceUp && autoFinishBar && !this.isWon) {
        autoFinishBar.style.display = 'flex';
      }
    }
  }

  autoComplete() {
    if (this.autoCompleting || this.isWon) return;
    this.autoCompleting = true;

    const step = () => {
      let moved = false;
      for (let c = 0; c < 7; c++) {
        const col = this.tableau[c];
        if (col.length > 0) {
          const card = col[col.length - 1];
          const fStack = this.foundations[card.suit];
          const topRank = fStack.length === 0 ? 0 : fStack[fStack.length - 1].rank;
          if (card.rank === topRank + 1) {
            col.pop();
            fStack.push(card);
            this.score += 10;
            this.moves++;
            if (window.solitaireAudio) window.solitaireAudio.playFoundation(card.rank);
            this.render();
            this.updateHUD();
            moved = true;
            break;
          }
        }
      }

      if (moved && !this.isWon) {
        this.checkWinCondition();
        if (!this.isWon) {
          setTimeout(step, 80);
        }
      } else {
        this.autoCompleting = false;
      }
    };
    step();
  }

  checkWinCondition() {
    let totalInFoundations = 0;
    for (const suit in this.foundations) {
      totalInFoundations += this.foundations[suit].length;
    }

    if (totalInFoundations === 52 && !this.isWon) {
      this.isWon = true;
      if (this.timerInterval) clearInterval(this.timerInterval);

      const stats = {
        time: this.formatTime(this.elapsedSeconds),
        moves: this.moves,
        score: this.score
      };

      if (window.solitaireCelebration) {
        window.solitaireCelebration.celebrate(stats, () => this.startNewGame());
      }
    }
  }

  // =========================================================================
  // RENDERING & HELPERS
  // =========================================================================

  render() {
    // Render Stock
    this.stockEl.innerHTML = '';
    if (this.stock.length > 0) {
      const topStock = this.stock[this.stock.length - 1];
      const cardEl = window.SolitaireDeck.createCardElement(topStock);
      this.stockEl.appendChild(cardEl);
      this.stockEl.classList.remove('empty-stock');
    } else {
      this.stockEl.classList.add('empty-stock');
      this.stockEl.innerHTML = `<div class="recycle-symbol">&#x21BB;</div>`;
    }

    // Render Waste
    this.wasteEl.innerHTML = '';
    if (this.waste.length > 0) {
      const topWaste = this.waste[this.waste.length - 1];
      const cardEl = window.SolitaireDeck.createCardElement(topWaste);
      this.wasteEl.appendChild(cardEl);
    }

    // Render 4 Foundations
    for (const suit of ['S', 'H', 'C', 'D']) {
      const fEl = this.foundationEls[suit];
      fEl.innerHTML = '';
      const stack = this.foundations[suit];

      if (stack.length > 0) {
        const topCard = stack[stack.length - 1];
        const cardEl = window.SolitaireDeck.createCardElement(topCard);
        fEl.appendChild(cardEl);
      } else {
        // Empty Foundation Slot Icon
        fEl.innerHTML = `
          <div class="foundation-empty-glyph ${SUITS[suit].color}">
            ${window.SolitaireDeck.SUIT_SVGS[suit]}
          </div>
        `;
      }
    }

    // Render 7 Tableau Columns
    for (let c = 0; c < 7; c++) {
      const colEl = this.tableauEls[c];
      colEl.innerHTML = '';
      const cards = this.tableau[c];

      let currentTopOffset = 0;
      cards.forEach((card, index) => {
        const cardEl = window.SolitaireDeck.createCardElement(card);
        cardEl.style.top = `${currentTopOffset}px`;

        // Generous vertical exposure: 24-26px for face-up cards, 12px for face-down
        if (card.faceUp) {
          currentTopOffset += 26;
        } else {
          currentTopOffset += 12;
        }

        colEl.appendChild(cardEl);
      });
    }
  }

  updateHUD() {
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.movesEl) this.movesEl.textContent = this.moves;
    if (this.undoBtn) {
      this.undoBtn.style.opacity = this.undoStack.length > 0 ? '1' : '0.45';
    }
  }

  updateTimerDisplay() {
    if (this.timerEl) {
      this.timerEl.textContent = this.formatTime(this.elapsedSeconds);
    }
  }

  formatTime(totalSec) {
    const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const secs = (totalSec % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  findCardLocation(cardId) {
    // Check Waste
    for (let i = 0; i < this.waste.length; i++) {
      if (this.waste[i].id === cardId) {
        return { pile: 'waste', cardIndex: i, card: this.waste[i] };
      }
    }

    // Check Foundations
    for (const suit in this.foundations) {
      const stack = this.foundations[suit];
      for (let i = 0; i < stack.length; i++) {
        if (stack[i].id === cardId) {
          return { pile: 'foundation', suit: suit, cardIndex: i, card: stack[i] };
        }
      }
    }

    // Check Tableau
    for (let c = 0; c < 7; c++) {
      const col = this.tableau[c];
      for (let r = 0; r < col.length; r++) {
        if (col[r].id === cardId) {
          return { pile: 'tableau', colIndex: c, cardIndex: r, card: col[r] };
        }
      }
    }

    return null;
  }
}

window.solitaireGame = new SolitaireGame();
