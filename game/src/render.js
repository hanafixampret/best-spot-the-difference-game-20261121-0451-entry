// Drawing only: the world's state and the current screen in, pixels out. The
// 1280x720 playfield is scaled to fit the window and centred. Two picture
// panels sit side by side; found differences wear gold rings on both panels,
// a hinted one pulses, the cursor is a crosshair, and M opens a magnifier
// lens that zooms the picture under the cursor.
import { FIELD, FONT, LENS, PALETTE, PANEL } from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';
export const SCREEN_WON = 'won';

const PANEL_FRAME = 4;

function cachedLabel(prefix) {
  let value = -1;
  let text = '';
  return function label(next) {
    if (next !== value) {
      value = next;
      text = prefix + next;
    }
    return text;
  };
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  const view = { scale: 1, x: 0, y: 0 };
  const lensCanvas = document.createElement('canvas');
  lensCanvas.width = PANEL.width;
  lensCanvas.height = PANEL.height;
  const lensCtx = lensCanvas.getContext('2d');
  const scoreLabel = cachedLabel('Score ');
  const bestLabel = cachedLabel('Best ');
  const finalLabel = cachedLabel('Score ');
  const accLabel = cachedLabel('Accuracy ');

  const fonts = new Map();
  function text(value, x, y, size, color, align, baseline) {
    if (!fonts.has(size)) fonts.set(size, `bold ${size}px ${FONT}`);
    context.font = fonts.get(size);
    context.fillStyle = color;
    context.textAlign = align;
    context.textBaseline = baseline || 'alphabetic';
    context.fillText(value, x, y);
  }

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.round(window.innerWidth * ratio);
    const height = Math.round(window.innerHeight * ratio);
    canvas.width = width;
    canvas.height = height;
    view.scale = Math.min(width / FIELD.width, height / FIELD.height);
    view.x = (width - FIELD.width * view.scale) / 2;
    view.y = (height - FIELD.height * view.scale) / 2;
  }

  function drawPanels(state) {
    const scene = SCENES[state.sceneIndex];
    const panels = [
      { x: PANEL.leftX, variant: 0 },
      { x: PANEL.rightX, variant: 1 },
    ];
    for (const panel of panels) {
      context.save();
      context.beginPath();
      context.rect(panel.x, PANEL.y, PANEL.width, PANEL.height);
      context.clip();
      context.translate(panel.x, PANEL.y);
      scene.draw(context, panel.variant);
      context.restore();
      context.strokeStyle = PALETTE.line;
      context.lineWidth = PANEL_FRAME;
      context.strokeRect(panel.x, PANEL.y, PANEL.width, PANEL.height);
      text(panel.variant === 0 ? 'A' : 'B', panel.x + 16, PANEL.y + 30, 24, PALETTE.text, 'left', 'top');
    }
    // Gold rings on every difference found, on both panels.
    for (const index of state.found) {
      const d = scene.diffs[index];
      for (const panel of panels) {
        context.strokeStyle = PALETTE.gold;
        context.lineWidth = 4;
        context.beginPath();
        context.arc(panel.x + d.x, PANEL.y + d.y, d.r + 6, 0, Math.PI * 2);
        context.stroke();
      }
    }
    // The hinted difference pulses on both panels.
    if (state.hinted >= 0 && state.hintPulse > 0) {
      const d = scene.diffs[state.hinted];
      const pulse = 6 + Math.sin(state.hintPulse * 6) * 3;
      for (const panel of panels) {
        context.strokeStyle = PALETTE.teal;
        context.lineWidth = 3;
        context.beginPath();
        context.arc(panel.x + d.x, PANEL.y + d.y, d.r + pulse, 0, Math.PI * 2);
        context.stroke();
      }
    }
  }

  function drawHud(state) {
    context.fillStyle = PALETTE.hud;
    context.fillRect(0, 0, FIELD.width, 64);
    const scene = SCENES[state.sceneIndex];
    text('Twin Lanterns', 20, 40, 30, PALETTE.gold, 'left', 'middle');
    text(scene.name, 330, 40, 24, PALETTE.text, 'left', 'middle');
    text(`${state.found.size} / 7 found`, 620, 40, 24, PALETTE.text, 'center', 'middle');
    const timeColor = state.timeLeft <= 30 ? PALETTE.red : PALETTE.text;
    text(formatTime(state.timeLeft), 820, 40, 24, timeColor, 'center', 'middle');
    text(scoreLabel(state.score), 960, 40, 24, PALETTE.text, 'center', 'middle');
    text(`Hints ${state.hints}`, 1150, 40, 24, PALETTE.muted, 'center', 'middle');
    if (state.messageT > 0) {
      const color = state.messageKind === 'bad' ? PALETTE.red : PALETTE.gold;
      text(state.message, FIELD.width / 2, 596, 22, color, 'center', 'middle');
    }
  }

  function drawStrip(state) {
    context.fillStyle = PALETTE.hud;
    context.fillRect(0, 620, FIELD.width, 100);
    for (let i = 0; i < SCENES.length; i += 1) {
      const x = 20 + i * 300;
      const done = state.clearedScenes[i];
      const current = i === state.sceneIndex;
      context.fillStyle = current ? PALETTE.panel : '#1a1428';
      context.fillRect(x, 636, 280, 68);
      context.strokeStyle = done ? PALETTE.gold : PALETTE.line;
      context.lineWidth = 2;
      context.strokeRect(x, 636, 280, 68);
      text(`${i + 1}. ${SCENES[i].name}`, x + 14, 664, 20, done ? PALETTE.gold : PALETTE.text, 'left', 'middle');
      text(done ? 'Cleared ✓' : current ? 'Playing…' : '7 differences', x + 14, 690, 16, PALETTE.muted, 'left', 'middle');
    }
    text('Click a difference · Arrows/WASD move · Enter mark · H hint · M magnifier · P pause', FIELD.width / 2, 556, 18, PALETTE.muted, 'center', 'middle');
  }

  function drawCursor(state, toScene) {
    const c = state.cursor;
    const at = toScene(c.x, c.y);
    if (!at) return;
    const panelX = at.panel === 0 ? PANEL.leftX : PANEL.rightX;
    if (state.magnifier) {
      const scene = SCENES[state.sceneIndex];
      lensCtx.save();
      lensCtx.clearRect(0, 0, PANEL.width, PANEL.height);
      scene.draw(lensCtx, at.panel);
      lensCtx.restore();
      const srcSize = (LENS.radius * 2) / LENS.zoom;
      const sx = Math.min(Math.max(at.x - srcSize / 2, 0), PANEL.width - srcSize);
      const sy = Math.min(Math.max(at.y - srcSize / 2, 0), PANEL.height - srcSize);
      context.save();
      context.beginPath();
      context.arc(c.x, c.y, LENS.radius, 0, Math.PI * 2);
      context.clip();
      context.drawImage(lensCanvas, sx, sy, srcSize, srcSize, c.x - LENS.radius, c.y - LENS.radius, LENS.radius * 2, LENS.radius * 2);
      context.restore();
      context.strokeStyle = PALETTE.gold;
      context.lineWidth = 3;
      context.beginPath();
      context.arc(c.x, c.y, LENS.radius, 0, Math.PI * 2);
      context.stroke();
      return;
    }
    context.strokeStyle = PALETTE.gold;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(c.x - 14, c.y);
    context.lineTo(c.x + 14, c.y);
    context.moveTo(c.x, c.y - 14);
    context.lineTo(c.x, c.y + 14);
    context.stroke();
    context.beginPath();
    context.arc(c.x, c.y, 10, 0, Math.PI * 2);
    context.stroke();
  }

  function drawPanel(title, lines, prompt) {
    const width = 640;
    const height = 120 + lines.length * 36 + 70;
    const x = (FIELD.width - width) / 2;
    const y = (FIELD.height - height) / 2;
    context.fillStyle = 'rgba(20,16,31,0.92)';
    context.fillRect(x, y, width, height);
    context.strokeStyle = PALETTE.gold;
    context.lineWidth = 2;
    context.strokeRect(x, y, width, height);
    text(title, FIELD.width / 2, y + 62, 44, PALETTE.gold, 'center', 'middle');
    for (let i = 0; i < lines.length; i += 1) {
      text(lines[i], FIELD.width / 2, y + 118 + i * 36, 21, PALETTE.text, 'center', 'middle');
    }
    text(prompt, FIELD.width / 2, y + height - 36, 22, PALETTE.teal, 'center', 'middle');
  }

  function draw(state, screen, best, toScene, accuracy) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.fillStyle = PALETTE.backdrop;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.setTransform(view.scale, 0, 0, view.scale, view.x, view.y);
    drawPanels(state);
    drawHud(state);
    drawStrip(state);
    if (screen === SCREEN_PLAY) {
      drawCursor(state, toScene);
      if (state.cleared && !state.won) {
        drawPanel('Scene clear!', [`${SCENES[state.sceneIndex].name} — all 7 differences found.`, `Time bonus banked. Score ${state.score}.`], 'Press N for the next scene');
      }
      return;
    }
    if (screen === SCREEN_TITLE) {
      drawPanel('Twin Lanterns', [
        'Find the 7 differences in each of 4 pictures.',
        'Click them, or steer with arrows and press Enter.',
        'H spends a hint, M opens the magnifier, P pauses.',
        bestLabel(best),
      ], 'Press Space or click to play');
      return;
    }
    if (screen === SCREEN_PAUSED) {
      drawPanel('Paused', ['The lanterns will wait for you.'], 'Press P to resume');
      return;
    }
    if (screen === SCREEN_WON) {
      drawPanel('All lanterns lit!', [
        finalLabel(state.score),
        accLabel(`${accuracy}%`),
        bestLabel(best),
      ], 'Press Space to play again');
      return;
    }
    drawPanel('Time up', [
      `${SCENES[state.sceneIndex].name} — ${state.found.size} of 7 found.`,
      finalLabel(state.score),
      accLabel(`${accuracy}%`),
    ], 'Press Space to try again');
  }

  resize();
  window.addEventListener('resize', resize);
  return { draw };
}
