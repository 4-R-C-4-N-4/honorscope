import { SPEED_OPTIONS, PLANETS, PLANET_SIGN_MEANINGS } from './types';
import type { SimulationState, PlanetPosition } from './types';
import { getAvailableBodies } from './astronomy';

export class UIController {
  private state: SimulationState;
  private onDateChange: (date: Date) => void;
  private lastRealTime: number;
  private _observer: string = 'Earth';
  private onObserverChange: ((observer: string) => void) | null = null;

  // DOM elements
  private dateDisplay: HTMLElement;
  private datePicker: HTMLInputElement;
  private playPauseBtn: HTMLElement;
  private speedButtons: HTMLElement;
  private planetList: HTMLElement;
  private vantageSelect: HTMLSelectElement;
  private observerLabel: HTMLElement;

  constructor(onDateChange: (date: Date) => void) {
    this.onDateChange = onDateChange;
    this.lastRealTime = Date.now();

    this.state = {
      currentDate: new Date(),
      isPlaying: false,
      speedMultiplier: 1,
      isReverse: false,
    };

    // Get DOM elements
    this.dateDisplay = document.getElementById('current-date')!;
    this.datePicker = document.getElementById('date-picker') as HTMLInputElement;
    this.playPauseBtn = document.getElementById('play-pause-btn')!;
    this.speedButtons = document.getElementById('speed-buttons')!;
    this.planetList = document.getElementById('planet-list')!;
    this.vantageSelect = document.getElementById('vantage-select') as HTMLSelectElement;
    this.observerLabel = document.getElementById('observer-label')!;

    this.setupControls();
    this.populateVantageSelect();
    this.updateDateDisplay();
  }

  private setupControls(): void {
    // Play/Pause
    this.playPauseBtn.addEventListener('click', () => {
      this.state.isPlaying = !this.state.isPlaying;
      this.lastRealTime = Date.now();
      this.playPauseBtn.textContent = this.state.isPlaying ? '⏸' : '▶';
    });

    // Now button
    document.getElementById('now-btn')!.addEventListener('click', () => {
      this.state.currentDate = new Date();
      this.state.isPlaying = false;
      this.playPauseBtn.textContent = '▶';
      this.lastRealTime = Date.now();
      this.updateDateDisplay();
      this.onDateChange(this.state.currentDate);
    });

    // Reverse
    document.getElementById('reverse-btn')!.addEventListener('click', () => {
      this.state.isReverse = true;
      if (!this.state.isPlaying) {
        this.state.isPlaying = true;
        this.lastRealTime = Date.now();
        this.playPauseBtn.textContent = '⏸';
      }
    });

    // Forward
    document.getElementById('forward-btn')!.addEventListener('click', () => {
      this.state.isReverse = false;
      if (!this.state.isPlaying) {
        this.state.isPlaying = true;
        this.lastRealTime = Date.now();
        this.playPauseBtn.textContent = '⏸';
      }
    });

    // Date picker
    this.datePicker.addEventListener('change', () => {
      const val = this.datePicker.value;
      if (val) {
        this.state.currentDate = new Date(val);
        this.state.isPlaying = false;
        this.playPauseBtn.textContent = '▶';
        this.lastRealTime = Date.now();
        this.updateDateDisplay();
        this.onDateChange(this.state.currentDate);
      }
    });

    // Vantage point selector
    this.vantageSelect.addEventListener('change', () => {
      this._observer = this.vantageSelect.value;
      this.observerLabel.textContent = 'from ' + this._observer;
      if (this.onObserverChange) {
        this.onObserverChange(this._observer);
      }
    });

    // Speed buttons
    this.createSpeedButtons();
  }

  private populateVantageSelect(): void {
    const bodies = getAvailableBodies();
    this.vantageSelect.innerHTML = '';

    const bodyEmojis: Record<string, string> = {
      Earth: '🌍', Sun: '☀️', Mercury: '☿', Venus: '♀',
      Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '⛢',
      Neptune: '♆', Pluto: '♇', Ceres: '⚳', Eris: '⚷',
      Haumea: '🪐', Makemake: '🪐',
    };

    for (const body of bodies) {
      const option = document.createElement('option');
      option.value = body;
      const emoji = bodyEmojis[body] || '•';
      option.textContent = emoji + ' ' + body;
      if (body === 'Earth') option.selected = true;
      this.vantageSelect.appendChild(option);
    }
  }

  setObserverChangeCallback(callback: (observer: string) => void): void {
    this.onObserverChange = callback;
  }

  private createSpeedButtons(): void {
    this.speedButtons.innerHTML = '';
    for (const option of SPEED_OPTIONS) {
      const btn = document.createElement('button');
      btn.className = 'speed-btn' + (option.value === this.state.speedMultiplier ? ' active' : '');
      btn.textContent = option.label;
      btn.addEventListener('click', () => {
        this.state.speedMultiplier = option.value;
        this.speedButtons.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      this.speedButtons.appendChild(btn);
    }
  }

  private updateDateDisplay(): void {
    const d = this.state.currentDate;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate().toString().padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    this.dateDisplay.textContent = `${day} ${month} ${year}  ${hours}:${minutes}`;

    const isoStr = d.toISOString().slice(0, 16);
    this.datePicker.value = isoStr;
  }

  tick(): Date {
    if (this.state.isPlaying) {
      const now = Date.now();
      const realDeltaMs = now - this.lastRealTime;
      this.lastRealTime = now;

      const simulatedDays = (realDeltaMs / 1000) * this.state.speedMultiplier;
      const simulatedMs = simulatedDays * 24 * 60 * 60 * 1000;

      if (this.state.isReverse) {
        this.state.currentDate = new Date(this.state.currentDate.getTime() - simulatedMs);
      } else {
        this.state.currentDate = new Date(this.state.currentDate.getTime() + simulatedMs);
      }

      this.updateDateDisplay();
    }

    return this.state.currentDate;
  }

  updateZodiacPanel(positions: PlanetPosition[]): void {
    const planetColorMap: Record<string, string> = {};
    for (const p of PLANETS) {
      planetColorMap[p.name] = p.color;
    }
    // Also add Sun color
    planetColorMap['Sun'] = '#ffcc44';

    let html = '';
    for (const pos of positions) {
      const color = planetColorMap[pos.name] || '#ffffff';
      const meaning = PLANET_SIGN_MEANINGS[pos.name]?.[pos.zodiacSign.name] || '';

      html += `
        <div class="planet-entry">
          <div class="planet-header">
            <div class="planet-dot" style="color: ${color}; background-color: ${color};"></div>
            <span class="planet-name">${pos.name}</span>
            <span class="planet-sign">
              <span class="zodiac-symbol" style="color: ${pos.zodiacSign.color}">${pos.zodiacSign.symbol}</span>
              ${pos.zodiacSign.name}
            </span>
          </div>
          <div class="planet-details">
            <span class="planet-degree">${pos.formattedPosition}</span>
          </div>
          ${meaning ? `<div class="planet-meaning">${meaning}</div>` : ''}
        </div>
      `;
    }

    this.planetList.innerHTML = html;
  }

  getCurrentDate(): Date {
    return this.state.currentDate;
  }

  get observer(): string {
    return this._observer;
  }
}
