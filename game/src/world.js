// The game state and its rules: four scenes, seven differences each, a timer
// per scene, hints, a score with an accuracy, and a cursor that can mark a
// difference on either panel. Pure logic, no drawing.
import { DIFFS_PER_SCENE, HINTS_PER_SCENE, PANEL, POINTS_CLEAR, POINTS_FOUND, POINTS_MISS, SCENE_TIME } from './config.js';
import { SCENES } from './scenes.js';

export const EVENT_NONE = 0;
export const EVENT_FOUND = 1;
export const EVENT_MISS = 2;
export const EVENT_CLEAR = 4;
export const EVENT_OVER = 8;
export const EVENT_HINT = 16;

export function createWorld() {
  const state = {
    sceneIndex: 0,
    found: new Set(),
    hinted: -1,
    hintPulse: 0,
    score: 0,
    hits: 0,
    misses: 0,
    hints: HINTS_PER_SCENE,
    timeLeft: SCENE_TIME,
    cursor: { x: PANEL.leftX + PANEL.width / 2, y: PANEL.y + PANEL.height / 2 },
    magnifier: false,
    message: '',
    messageKind: '',
    messageT: 0,
    cleared: false,
    clearedScenes: [false, false, false, false],
    won: false,
    over: false,
  };

  function scene() {
    return SCENES[state.sceneIndex];
  }

  function showMessage(text, kind) {
    state.message = text;
    state.messageKind = kind;
    state.messageT = 2.2;
  }

  function resetScene() {
    state.found = new Set();
    state.hinted = -1;
    state.hintPulse = 0;
    state.hints = HINTS_PER_SCENE;
    state.timeLeft = SCENE_TIME;
    state.cleared = false;
  }

  function reset() {
    state.sceneIndex = 0;
    state.score = 0;
    state.hits = 0;
    state.misses = 0;
    state.won = false;
    state.over = false;
    state.clearedScenes = [false, false, false, false];
    resetScene();
  }

  /** Which panel a field point is on, and its scene coordinates; null outside. */
  function toScene(fieldX, fieldY) {
    if (fieldY < PANEL.y || fieldY > PANEL.y + PANEL.height) return null;
    if (fieldX >= PANEL.leftX && fieldX <= PANEL.leftX + PANEL.width) {
      return { x: fieldX - PANEL.leftX, y: fieldY - PANEL.y, panel: 0 };
    }
    if (fieldX >= PANEL.rightX && fieldX <= PANEL.rightX + PANEL.width) {
      return { x: fieldX - PANEL.rightX, y: fieldY - PANEL.y, panel: 1 };
    }
    return null;
  }

  function mark(fieldX, fieldY) {
    const at = toScene(fieldX, fieldY);
    if (!at || state.cleared || state.over || state.won) return EVENT_NONE;
    const diffs = scene().diffs;
    for (let i = 0; i < diffs.length; i += 1) {
      if (state.found.has(i)) continue;
      const d = diffs[i];
      const dx = at.x - d.x;
      const dy = at.y - d.y;
      if (dx * dx + dy * dy <= d.r * d.r) {
        state.found.add(i);
        state.hits += 1;
        state.score += POINTS_FOUND;
        if (state.hinted === i) state.hinted = -1;
        if (state.found.size === DIFFS_PER_SCENE) {
          state.cleared = true;
          state.clearedScenes[state.sceneIndex] = true;
          state.score += POINTS_CLEAR + Math.round(state.timeLeft);
          showMessage(`Scene clear! ${scene().name} — all 7 found.`, 'good');
          if (state.sceneIndex === SCENES.length - 1) state.won = true;
          return EVENT_FOUND | EVENT_CLEAR;
        }
        showMessage(`Found: ${d.label} — ${state.found.size} of 7.`, 'good');
        return EVENT_FOUND;
      }
    }
    state.misses += 1;
    state.score = Math.max(0, state.score - POINTS_MISS);
    showMessage('Not a difference. −25.', 'bad');
    return EVENT_MISS;
  }

  function useHint() {
    if (state.cleared || state.over || state.won) return EVENT_NONE;
    if (state.hints <= 0) {
      showMessage('No hints left in this scene.', 'bad');
      return EVENT_NONE;
    }
    const diffs = scene().diffs;
    for (let i = 0; i < diffs.length; i += 1) {
      if (!state.found.has(i)) {
        state.hints -= 1;
        state.hinted = i;
        state.hintPulse = 3;
        showMessage(`Hint: look near “${diffs[i].label}”.`, 'good');
        return EVENT_HINT;
      }
    }
    return EVENT_NONE;
  }

  function nextScene() {
    if (!state.cleared || state.won) return;
    if (state.sceneIndex < SCENES.length - 1) {
      state.sceneIndex += 1;
      resetScene();
    }
  }

  function step(dt) {
    if (state.messageT > 0) state.messageT -= dt;
    if (state.hintPulse > 0) state.hintPulse -= dt;
    if (state.cleared || state.over || state.won) return EVENT_NONE;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.over = true;
      showMessage('Time up!', 'bad');
      return EVENT_OVER;
    }
    return EVENT_NONE;
  }

  function accuracy() {
    const total = state.hits + state.misses;
    return total === 0 ? 100 : Math.round((state.hits / total) * 100);
  }

  return { state, scene, reset, resetScene, mark, useHint, nextScene, step, accuracy, toScene };
}
