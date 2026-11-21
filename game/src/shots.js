// The screenshot scenes behind ?shot=cover|play|hint|clear. Each one sets the
// world to a fixed, real position — differences found by the real rules, the
// timer and score to match — so the frame is what a game really looks like
// and the same seed always gives the same frame.
import { SCREEN_PLAY } from './render.js';

/** Set `world` to the named scene and return the screen to draw over it. */
export function stageShot(name, world) {
  const s = world.state;
  world.reset();
  if (name === 'play') {
    s.sceneIndex = 1;
    s.found = new Set([1, 4]);
    s.hits = 2;
    s.score = 200;
    s.timeLeft = 125;
    s.cursor = { x: 660 + 420, y: 76 + 192 };
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'hint') {
    s.sceneIndex = 2;
    s.found = new Set([2]);
    s.hits = 1;
    s.score = 100;
    s.hints = 2;
    s.hinted = 0;
    s.hintPulse = 3;
    s.timeLeft = 98;
    s.cursor = { x: 660 + 480, y: 76 + 90 };
    s.magnifier = true;
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'clear') {
    s.sceneIndex = 3;
    s.found = new Set([0, 1, 2, 3, 4, 5, 6]);
    s.hits = 7;
    s.score = 950;
    s.timeLeft = 64;
    s.cleared = true;
    s.clearedScenes = [true, true, true, true];
    s.won = true;
    s.cursor = { x: 660 + 310, y: 76 + 288 };
    return { screen: SCREEN_PLAY, best: 950 };
  }
  // cover: the festival scene, 3 of 7 found, mid-game.
  s.sceneIndex = 0;
  s.found = new Set([0, 3, 5]);
  s.hits = 3;
  s.score = 300;
  s.timeLeft = 151;
  s.cursor = { x: 20 + 430, y: 76 + 400 };
  return { screen: SCREEN_PLAY, best: 0 };
}
