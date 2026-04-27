// ═══════════════════════════════════════════════
// ClawDroid — Main Entry Point
// ═══════════════════════════════════════════════
import { App } from './app.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
