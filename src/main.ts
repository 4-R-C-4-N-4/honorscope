import './style.css';
import { SolarSystemRenderer } from './renderer';
import { UIController } from './ui';
import { getPlanetaryPositions } from './astronomy';

function init(): void {
  const container = document.getElementById('canvas-container');
  if (!container) {
    console.error('Canvas container not found');
    return;
  }

  const renderer = new SolarSystemRenderer(container);

  let lastOrbitDate: Date | null = null;

  function onDateChange(date: Date): void {
    if (!lastOrbitDate || Math.abs(date.getTime() - lastOrbitDate.getTime()) > 30 * 24 * 60 * 60 * 1000) {
      renderer.createOrbitPaths(date);
      lastOrbitDate = date;
    }
  }

  const ui = new UIController(onDateChange);

  // Handle observer/vantage point changes
  ui.setObserverChangeCallback((_observer: string) => {
    // Force an immediate update when observer changes
    const date = ui.getCurrentDate();
    const positions = getPlanetaryPositions(date, _observer);
    renderer.updatePlanetPositions(positions);
    ui.updateZodiacPanel(positions);
  });

  // Initial setup
  const initialDate = ui.getCurrentDate();
  const initialPositions = getPlanetaryPositions(initialDate, ui.observer);
  renderer.updatePlanetPositions(initialPositions);
  renderer.createOrbitPaths(initialDate);
  lastOrbitDate = initialDate;
  ui.updateZodiacPanel(initialPositions);

  let frameCount = 0;
  const PANEL_UPDATE_INTERVAL = 10;

  function animate(): void {
    requestAnimationFrame(animate);

    const currentDate = ui.tick();
    const positions = getPlanetaryPositions(currentDate, ui.observer);

    renderer.updatePlanetPositions(positions);

    frameCount++;
    if (frameCount % PANEL_UPDATE_INTERVAL === 0) {
      ui.updateZodiacPanel(positions);
    }

    if (lastOrbitDate && Math.abs(currentDate.getTime() - lastOrbitDate.getTime()) > 365 * 24 * 60 * 60 * 1000) {
      renderer.createOrbitPaths(currentDate);
      lastOrbitDate = currentDate;
    }

    renderer.render();
  }

  animate();
  console.log('✦ Honorscope initialized — Real-time Celestial Position Tracker');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
