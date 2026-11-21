// Twin Lanterns: every tuning number and colour in one place. The playfield is a
// fixed 1280x720 logical area; the renderer scales it to the window, so no rule
// below depends on the screen size. Two picture panels sit side by side under a
// HUD bar; a strip under the panels shows the four scenes and the controls.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second. */
export const STEP = 1 / 60;

/** One picture panel, in field coordinates. */
export const PANEL = { width: 600, height: 440, gap: 40, leftX: 20, rightX: 660, y: 76 };

/** Seconds of play allowed per scene. */
export const SCENE_TIME = 180;

/** Differences in every scene, and hints per scene. */
export const DIFFS_PER_SCENE = 7;
export const HINTS_PER_SCENE = 3;

/** Points for a difference found, for clearing a scene, and the miss penalty. */
export const POINTS_FOUND = 100;
export const POINTS_CLEAR = 250;
export const POINTS_MISS = 25;

/** How fast the keyboard cursor travels, in field pixels per second. */
export const CURSOR_SPEED = 640;

/** The magnifier lens: its radius on screen and its zoom. */
export const LENS = { radius: 110, zoom: 2 };

export const PALETTE = {
  backdrop: '#14101f',
  hud: '#1e1830',
  panel: '#241d3a',
  text: '#f4efe6',
  muted: '#a89fc0',
  gold: '#f2c94c',
  red: '#e5534b',
  teal: '#4fc3f7',
  green: '#7dc383',
  line: '#3a3054',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'twin-lanterns.best';
