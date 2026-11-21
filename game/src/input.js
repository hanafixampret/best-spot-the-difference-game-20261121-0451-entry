// Keyboard and pointer input. The mouse moves the cursor and clicks to mark;
// arrow keys or WASD steer the cursor, Enter or Space marks where it is, H
// spends a hint, M toggles the magnifier, P pauses, N goes to the next scene
// once the current one is cleared. One-shot presses are queued as bit flags
// and taken once by the loop, so a press between two frames is never lost.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_MAGNIFY = 8;
export const ACTION_NEXT = 16;

const LEFT = new Set(['ArrowLeft', 'KeyA']);
const RIGHT = new Set(['ArrowRight', 'KeyD']);
const UP = new Set(['ArrowUp', 'KeyW']);
const DOWN = new Set(['ArrowDown', 'KeyS']);
const CONFIRM = new Set(['Space', 'Enter']);
const PAUSE = new Set(['KeyP', 'Escape']);
const HINT = new Set(['KeyH']);
const MAGNIFY = new Set(['KeyM']);
const NEXT = new Set(['KeyN']);

export function createInput(canvas) {
  let left = false;
  let right = false;
  let up = false;
  let down = false;
  let actions = 0;
  let click = null;
  let mouse = null;

  function toField(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 720,
    };
  }

  window.addEventListener('keydown', (event) => {
    if (LEFT.has(event.code)) left = true;
    else if (RIGHT.has(event.code)) right = true;
    else if (UP.has(event.code)) up = true;
    else if (DOWN.has(event.code)) down = true;
    else if (CONFIRM.has(event.code)) {
      if (!event.repeat) actions |= ACTION_CONFIRM;
    } else if (PAUSE.has(event.code)) {
      if (!event.repeat) actions |= ACTION_PAUSE;
    } else if (HINT.has(event.code)) {
      if (!event.repeat) actions |= ACTION_HINT;
    } else if (MAGNIFY.has(event.code)) {
      if (!event.repeat) actions |= ACTION_MAGNIFY;
    } else if (NEXT.has(event.code)) {
      if (!event.repeat) actions |= ACTION_NEXT;
    } else return;
    event.preventDefault();
  });
  window.addEventListener('keyup', (event) => {
    if (LEFT.has(event.code)) left = false;
    else if (RIGHT.has(event.code)) right = false;
    else if (UP.has(event.code)) up = false;
    else if (DOWN.has(event.code)) down = false;
  });
  window.addEventListener('blur', () => {
    left = false;
    right = false;
    up = false;
    down = false;
  });
  canvas.addEventListener('pointermove', (event) => {
    mouse = toField(event);
  });
  canvas.addEventListener('pointerdown', (event) => {
    click = toField(event);
  });

  return {
    /** -1, 0 or 1 on each axis, from the held movement keys. */
    steer() {
      return { x: (right ? 1 : 0) - (left ? 1 : 0), y: (down ? 1 : 0) - (up ? 1 : 0) };
    },
    /** The one-shot presses since the last call, as ACTION_* flags. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** The click since the last call, in field coordinates, or null. */
    takeClick() {
      const taken = click;
      click = null;
      return taken;
    },
    /** The mouse position since the last call, in field coordinates, or null. */
    takeMouse() {
      const taken = mouse;
      mouse = null;
      return taken;
    },
  };
}
