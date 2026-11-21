// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps, and the renderer paints what is there. The game moves
// between five screens: title, play, paused, time up and all lit (won).
//
// ?seed=N fixes the run. ?shot=cover|play|hint|clear (with &seed=N) stages
// that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, CURSOR_SPEED, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_CLEAR, EVENT_FOUND, EVENT_MISS, EVENT_OVER } from './world.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_MAGNIFY, ACTION_NEXT, ACTION_PAUSE, createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WON } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, world.toScene, world.accuracy());
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  // Screen readers (and anyone watching the page's text) hear the screen changes and each find.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Find 7 differences in the Lantern Festival.');
  }

  function endGame(won) {
    screen = won ? SCREEN_WON : SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(won ? `All lanterns lit. Score ${world.state.score}.` : `Time up. Score ${world.state.score}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_WON)) startGame();
    else if (actions & ACTION_CONFIRM && screen === SCREEN_PLAY) {
      const c = world.state.cursor;
      const events = world.mark(c.x, c.y);
      if (events & EVENT_FOUND) announce(world.state.message);
      else if (events & EVENT_MISS) announce(world.state.message);
      if (events & EVENT_CLEAR && world.state.won) endGame(true);
    } else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      world.useHint();
      announce(world.state.message);
    }
    if (actions & ACTION_MAGNIFY && screen === SCREEN_PLAY) {
      world.state.magnifier = !world.state.magnifier;
      announce(world.state.magnifier ? 'Magnifier on.' : 'Magnifier off.');
    }
    if (actions & ACTION_NEXT && screen === SCREEN_PLAY && world.state.cleared && !world.state.won) {
      world.nextScene();
      announce(`Scene ${world.state.sceneIndex + 1}. Find 7 differences.`);
    }
  }

  function step(dt) {
    const mouse = input.takeMouse();
    if (mouse) {
      world.state.cursor.x = mouse.x;
      world.state.cursor.y = mouse.y;
    }
    const steer = input.steer();
    if (steer.x !== 0 || steer.y !== 0) {
      world.state.cursor.x = Math.min(1280, Math.max(0, world.state.cursor.x + steer.x * CURSOR_SPEED * dt));
      world.state.cursor.y = Math.min(720, Math.max(0, world.state.cursor.y + steer.y * CURSOR_SPEED * dt));
    }
    const click = input.takeClick();
    if (click) {
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER || screen === SCREEN_WON) startGame();
      else if (screen === SCREEN_PLAY) {
        world.state.cursor.x = click.x;
        world.state.cursor.y = click.y;
        const events = world.mark(click.x, click.y);
        if (events & EVENT_FOUND) announce(world.state.message);
        else if (events & EVENT_MISS) announce(world.state.message);
        if (events & EVENT_CLEAR && world.state.won) endGame(true);
      }
    }
    if (screen === SCREEN_PLAY) {
      const events = world.step(dt);
      if (events & EVENT_OVER) endGame(false);
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step(STEP);
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, world.toScene, world.accuracy());
  }

  // Leaving the tab pauses a running game rather than letting the timer run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Twin Lanterns. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
