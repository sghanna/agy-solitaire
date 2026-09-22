/**
 * agy-solitaire: Web Audio API Synthesizer
 * Gentle, crisp audio feedback for low-vision reinforcement
 * Zero external asset dependencies
 */

class SolitaireAudio {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('agy_solitaire_muted') === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('agy_solitaire_muted', this.muted);
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Soft felt card snap / placement
  playCardPlace() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.06);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  // Pleasant card flip
  playCardFlip() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(580, t + 0.07);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Cheerful foundation chime (rising pitch based on card rank 1-13)
  playFoundation(rank = 1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const baseFreq = 392; // G4
    const scaleSteps = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21];
    const semitones = scaleSteps[(rank - 1) % scaleSteps.length];
    const freq = baseFreq * Math.pow(2, semitones / 12);

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  // Sparkling ascending chime for Ace landing in foundation
  playAceCelebration() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [783.99, 1046.50, 1318.51, 1567.98]; // G5, C6, E6, G6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + i * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.24, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.48);
    });
  }

  // Soft Stock draw sound
  playStockDraw() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.05);

    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Subtle reverse swoosh for Undo
  playUndo() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(210, t + 0.09);

    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Crisp card select tick
  playCardSelect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.04);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Gentle soft thud for invalid destination
  playInvalidMove() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  // Grand celebratory arpeggio for game victory
  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Major pentatonic victory fanfare: C5, E5, G5, C6, E6, G6
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    const startTime = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const t = startTime + (i * 0.12);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i === notes.length - 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const duration = i === notes.length - 1 ? 0.8 : 0.22;
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + duration + 0.05);
    });
  }
}

const SOUND_ICONS = {
  1: {
    name: 'Antique Brass Horn',
    unmuted: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#d4af37" fill-opacity="0.25"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>`,
    muted: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#d4af37" fill-opacity="0.25"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>`
  },
  2: {
    name: 'Gramophone Flare',
    unmuted: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M 3,10 L 7,10 L 12,6 L 12,18 L 7,14 L 3,14 Z" fill="#bca55c"/>
                <path d="M 12,9 Q 15,9 16,7 Q 17,5 17,3" stroke="#fef08a"/>
                <path d="M 16,10 A 4,4 0 0 1 16,14" stroke="#fef08a"/>
                <path d="M 19,7 A 8,8 0 0 1 19,17" stroke="#fef08a"/>
              </svg>`,
    muted: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M 3,10 L 7,10 L 12,6 L 12,18 L 7,14 L 3,14 Z" fill="#bca55c"/>
              <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" stroke-width="2"/>
            </svg>`
  },
  3: {
    name: 'Pure Geometric Line',
    unmuted: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>`,
    muted: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 5L6 9H2v6h4l5 4V5z"/>
              <line x1="23" y1="1" x2="1" y2="23"/>
            </svg>`
  },
  4: {
    name: 'Musical Note & Wave',
    unmuted: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13" fill="none"/>
                <circle cx="6" cy="18" r="3" fill="#d4af37"/>
                <circle cx="18" cy="16" r="3" fill="#d4af37"/>
              </svg>`,
    muted: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13" fill="none" opacity="0.4"/>
              <circle cx="6" cy="18" r="3" fill="#d4af37" opacity="0.4"/>
              <circle cx="18" cy="16" r="3" fill="#d4af37" opacity="0.4"/>
              <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" stroke-width="2.2"/>
            </svg>`
  },
  5: {
    name: 'Acoustic Chime Bell',
    unmuted: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="#d4af37" fill-opacity="0.25"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>`,
    muted: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="#d4af37" fill-opacity="0.15"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              <line x1="2" y1="2" x2="22" y2="22" stroke="#ef4444" stroke-width="2.2"/>
            </svg>`
  }
};

function getSoundIconSVG(isMuted, style) {
  let chosen = style;
  if (!chosen) {
    try {
      chosen = localStorage.getItem('agy-sound-icon-style') || '1';
    } catch (e) {
      chosen = '1';
    }
  }
  const entry = SOUND_ICONS[chosen] || SOUND_ICONS['1'];
  return isMuted ? entry.muted : entry.unmuted;
}

window.SOUND_ICONS = SOUND_ICONS;
window.getSoundIconSVG = getSoundIconSVG;
window.solitaireAudio = new SolitaireAudio();
