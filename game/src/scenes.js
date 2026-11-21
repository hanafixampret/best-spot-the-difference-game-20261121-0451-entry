// The four pictures, drawn from scratch with canvas primitives. Every scene is
// one draw function that paints the same picture twice: variant 0 is the left
// panel, variant 1 the right panel, and the seven differences are the places
// where variant 1 diverges. Coordinates are scene coordinates, 600x440.
// A difference is { x, y, r, label }: where it is, how close a click must be,
// and what it is called on the clear screen.

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function poly(ctx, points, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function star(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const px = x + Math.cos(angle) * rr;
    const py = y + Math.sin(angle) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function sky(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, 440);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 600, 440);
}

function stars(ctx, list) {
  for (const [x, y, r] of list) star(ctx, x, y, r, '#f4efe6');
}

// Scene 1 — Lantern Festival, a night riverside: moon, paper lanterns, a
// wooden bridge over the river, a house with lit windows, a willow.
function drawFestival(ctx, v) {
  sky(ctx, '#1b1440', '#3a2560');
  stars(ctx, [[60, 50, 3], [150, 30, 2], [240, 70, 3], [330, 40, 2], [420, 28, 3], [560, 130, 2], [40, 120, 2]]);
  if (v === 0) stars(ctx, [[292, 56, 3], [308, 66, 2], [300, 76, 2]]); // star cluster, left only
  // The moon: pale gold on the left, rose on the right.
  circle(ctx, 500, 70, 34, v === 0 ? '#f6d365' : '#f78fb3');
  circle(ctx, 488, 62, 7, 'rgba(0,0,0,0.12)');
  circle(ctx, 510, 80, 5, 'rgba(0,0,0,0.12)');
  // Distant mountains.
  poly(ctx, [[0, 240], [120, 170], [240, 240]], '#2a1c4e');
  poly(ctx, [[180, 240], [330, 150], [480, 240]], '#241843');
  poly(ctx, [[420, 240], [540, 180], [600, 240]], '#2a1c4e');
  // The river.
  rect(ctx, 0, 300, 600, 140, '#2c4a6e');
  rect(ctx, 0, 300, 600, 6, '#3d6a94');
  for (let i = 0; i < 5; i += 1) {
    ctx.strokeStyle = 'rgba(246,211,101,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60 + i * 110, 340 + (i % 2) * 30);
    ctx.lineTo(120 + i * 110, 340 + (i % 2) * 30);
    ctx.stroke();
  }
  // A koi in the river, left only.
  if (v === 0) {
    ellipse(ctx, 430, 400, 26, 10, '#e8853d');
    poly(ctx, [[404, 400], [388, 388], [388, 412]], '#e8853d');
    circle(ctx, 452, 396, 2, '#1b1440');
  }
  // The house with one lit window.
  rect(ctx, 40, 240, 110, 70, '#4a2c1e');
  poly(ctx, [[30, 242], [95, 195], [160, 242]], '#33200f');
  rect(ctx, 78, 288, 22, 22, v === 0 ? '#ffd97a' : '#2a2138'); // lit window, dark on the right
  rect(ctx, 118, 288, 22, 22, '#ffd97a');
  // The wooden bridge.
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(210, 330);
  ctx.quadraticCurveTo(300, 285, 390, 330);
  ctx.stroke();
  ctx.strokeStyle = v === 0 ? '#c0392b' : '#2e8b8b'; // red rails on the left, teal on the right
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(210, 322);
  ctx.quadraticCurveTo(300, 272, 390, 322);
  ctx.stroke();
  for (let i = 0; i < 5; i += 1) {
    const x = 225 + i * 38;
    ctx.strokeStyle = '#6b4423';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, 330 - Math.sin((i / 4) * Math.PI) * 22);
    ctx.lineTo(x, 318 - Math.sin((i / 4) * Math.PI) * 22);
    ctx.stroke();
  }
  // Hanging paper lanterns.
  const lanterns = [[210, 150, '#e5534b'], [300, 120, '#f2c94c'], [390, 150, '#e5534b']];
  for (const [x, y, color] of lanterns) {
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 46);
    ctx.lineTo(x, y - 22);
    ctx.stroke();
    ellipse(ctx, x, y, 26, 30, color);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 8);
    ctx.lineTo(x + 20, y - 8);
    ctx.moveTo(x - 22, y + 8);
    ctx.lineTo(x + 22, y + 8);
    ctx.stroke();
    // The tassel of the first lantern: long on the left, short on the right.
    const len = x === 210 && v === 1 ? 10 : 26;
    ctx.strokeStyle = '#f2c94c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y + 30);
    ctx.lineTo(x, y + 30 + len);
    ctx.stroke();
  }
  // An extra small lantern, right only.
  if (v === 1) {
    ellipse(ctx, 120, 180, 16, 19, '#f2c94c');
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, 140);
    ctx.lineTo(120, 161);
    ctx.stroke();
  }
  // The willow on the right bank.
  ctx.strokeStyle = '#3d5a2e';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(545, 310);
  ctx.lineTo(545, 220);
  ctx.stroke();
  ctx.strokeStyle = '#557a3d';
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(545, 225 + i * 6);
    ctx.quadraticCurveTo(515 - i * 3, 260 + i * 10, 505, 305);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(545, 225 + i * 6);
    ctx.quadraticCurveTo(575 + i * 3, 260 + i * 10, 585, 305);
    ctx.stroke();
  }
}

// Scene 2 — Koi Pond, a bright garden: a pond, lily pads, koi, bamboo,
// a stone lantern, flowers on the right bank.
function drawPond(ctx, v) {
  sky(ctx, '#bfe3f0', '#e8f6e8');
  circle(ctx, 520, 60, 30, '#fff3b0');
  // Grass banks.
  rect(ctx, 0, 0, 600, 60, '#8fbf6f');
  rect(ctx, 0, 380, 600, 60, '#7fb069');
  // The pond.
  ellipse(ctx, 300, 250, 260, 130, '#4a90c2');
  ellipse(ctx, 300, 250, 240, 115, '#5aa3d6');
  // Lily pads.
  ellipse(ctx, 180, 220, 46, 16, '#4e9a51');
  ellipse(ctx, 420, 200, 52, 18, '#4e9a51');
  ellipse(ctx, 350, 320, 44, 15, '#57a75a');
  ellipse(ctx, 230, 300, 40, 14, '#4e9a51');
  // A lotus flower on the middle pad, left only.
  if (v === 0) {
    for (let i = 0; i < 6; i += 1) {
      const a = (i * Math.PI) / 3;
      ellipse(ctx, 420 + Math.cos(a) * 12, 192 + Math.sin(a) * 7, 9, 5, '#f2a7c3');
    }
    circle(ctx, 420, 192, 6, '#f2c94c');
  }
  // Koi: orange on the left, white on the right.
  const koi = v === 0 ? '#e8853d' : '#f4f1e8';
  ellipse(ctx, 280, 260, 30, 11, koi);
  poly(ctx, [[250, 260], [232, 248], [232, 272]], koi);
  circle(ctx, 304, 256, 2, '#1b1440');
  ellipse(ctx, 380, 290, 24, 9, '#e8853d');
  poly(ctx, [[356, 290], [342, 280], [342, 300]], '#e8853d');
  // Ripples: three rings on the left, two on the right.
  ctx.strokeStyle = 'rgba(244,239,230,0.6)';
  ctx.lineWidth = 2;
  for (let i = 0; i < (v === 0 ? 3 : 2); i += 1) {
    ctx.beginPath();
    ctx.ellipse(350, 320, 14 + i * 10, 6 + i * 4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Stones on the bank: an extra one on the right.
  ellipse(ctx, 90, 350, 30, 16, '#9a9a92');
  ellipse(ctx, 130, 360, 22, 12, '#8a8a82');
  if (v === 1) ellipse(ctx, 150, 330, 18, 10, '#9a9a92');
  ellipse(ctx, 500, 350, 26, 14, '#9a9a92');
  // A frog on the right stone, right only.
  if (v === 1) {
    ellipse(ctx, 520, 340, 16, 11, '#5da24a');
    circle(ctx, 512, 330, 5, '#5da24a');
    circle(ctx, 528, 330, 5, '#5da24a');
  }
  // Bamboo on the left: one leaf turns yellow on the right.
  ctx.strokeStyle = '#3f7a37';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(80, 380);
  ctx.lineTo(80, 90);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(105, 380);
  ctx.lineTo(105, 130);
  ctx.stroke();
  ellipse(ctx, 70, 120, 22, 7, v === 0 ? '#5da24a' : '#d9c25a');
  ellipse(ctx, 95, 100, 20, 6, '#5da24a');
  ellipse(ctx, 115, 160, 20, 6, '#5da24a');
  // A dragonfly, left only.
  if (v === 0) {
    ctx.strokeStyle = '#7fb3d5';
    ctx.lineWidth = 2;
    ellipse(ctx, 472, 116, 14, 5, 'rgba(127,179,213,0.7)');
    ellipse(ctx, 488, 116, 14, 5, 'rgba(127,179,213,0.7)');
    ctx.strokeStyle = '#2e5a74';
    ctx.beginPath();
    ctx.moveTo(480, 108);
    ctx.lineTo(480, 128);
    ctx.stroke();
  }
  // Flowers on the right bank.
  for (const [x, y, c] of [[540, 400, '#e5534b'], [570, 410, '#f2a7c3'], [510, 415, '#f2c94c']]) {
    circle(ctx, x, y, 6, c);
    ctx.strokeStyle = '#3f7a37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + 6);
    ctx.lineTo(x, y + 20);
    ctx.stroke();
  }
}

// Scene 3 — Desert Caravan, a sunset crossing: dunes, a camel line, a tent
// with a flag, an oasis palm, birds over the sun.
function drawDesert(ctx, v) {
  sky(ctx, '#f7b267', '#e07a4a');
  // The sun: big on the left, small on the right.
  circle(ctx, 480, 90, v === 0 ? 46 : 28, '#ffd97a');
  circle(ctx, 480, 90, v === 0 ? 34 : 20, '#ffe9a8');
  // Birds: one fewer on the right.
  ctx.strokeStyle = '#5a3a28';
  ctx.lineWidth = 3;
  for (const [x, y] of [[300, 80], [340, 60]]) {
    if (x === 300 && v === 1) continue;
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.quadraticCurveTo(x, y - 8, x + 10, y);
    ctx.stroke();
  }
  // Dunes.
  poly(ctx, [[0, 440], [0, 330], [180, 280], [360, 340], [600, 300], [600, 440]], '#d9a05b');
  poly(ctx, [[0, 440], [0, 380], [240, 340], [420, 390], [600, 360], [600, 440]], '#c98f4e');
  // An extra dune hump, right only.
  if (v === 1) ellipse(ctx, 350, 360, 60, 18, '#d9a05b');
  // The oasis pool: blue on the left, green on the right.
  ellipse(ctx, 470, 370, 55, 16, v === 0 ? '#4a90c2' : '#5da24a');
  // The palm by the pool, left only.
  if (v === 0) {
    ctx.strokeStyle = '#6b4423';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(520, 360);
    ctx.quadraticCurveTo(525, 320, 520, 280);
    ctx.stroke();
    ctx.strokeStyle = '#3f7a37';
    ctx.lineWidth = 4;
    for (let i = 0; i < 5; i += 1) {
      const a = -Math.PI / 2 + (i - 2) * 0.5;
      ctx.beginPath();
      ctx.moveTo(520, 280);
      ctx.quadraticCurveTo(520 + Math.cos(a) * 30, 280 + Math.sin(a) * 30 - 10, 520 + Math.cos(a) * 48, 280 + Math.sin(a) * 48);
      ctx.stroke();
    }
  }
  // The tent with its flag: red on the left, blue on the right.
  poly(ctx, [[70, 330], [120, 240], [170, 330]], '#e8dcc3');
  poly(ctx, [[120, 240], [120, 180], [150, 192]], v === 0 ? '#c0392b' : '#2e6fc2');
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(120, 240);
  ctx.lineTo(120, 180);
  ctx.stroke();
  rect(ctx, 108, 300, 24, 30, '#5a3a28');
  // Camels: three on the left, four on the right.
  const camels = [[230, 300], [300, 310], [370, 300]];
  if (v === 1) camels.push([200, 300]);
  for (const [x, y] of camels) {
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 14, y + 8);
    ctx.lineTo(x - 14, y + 30);
    ctx.moveTo(x + 14, y + 8);
    ctx.lineTo(x + 14, y + 30);
    ctx.stroke();
    ellipse(ctx, x, y, 26, 14, '#b5773a');
    circle(ctx, x - 26, y - 6, 8, '#b5773a');
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 10);
    ctx.quadraticCurveTo(x - 4, y - 26, x + 4, y - 12);
    ctx.stroke();
    ellipse(ctx, x, y - 12, 10, 7, '#a06a32');
  }
}

// Scene 4 — Snowy Cabin, a winter night: a cabin, chimney smoke, pines,
// a snowman, a full moon over the snow.
function drawCabin(ctx, v) {
  sky(ctx, '#101a33', '#2a3a5e');
  stars(ctx, [[60, 50, 3], [150, 30, 2], [240, 70, 3], [330, 40, 2], [420, 28, 3], [560, 130, 2], [40, 120, 2]]);
  // The moon: full on the left, crescent on the right.
  circle(ctx, 520, 70, 30, '#f4f1e8');
  if (v === 1) circle(ctx, 532, 64, 26, '#2a3a5e');
  // Snowy ground.
  rect(ctx, 0, 320, 600, 120, '#e8eef7');
  ellipse(ctx, 120, 340, 90, 18, '#f4f8ff');
  ellipse(ctx, 480, 350, 100, 20, '#f4f8ff');
  // Footprints in the snow, left only.
  if (v === 0) {
    ctx.fillStyle = '#b9c4d6';
    for (let i = 0; i < 5; i += 1) ellipse(ctx, 230 + i * 18, 398 - (i % 2) * 8, 7, 4, '#b9c4d6');
  }
  // Pines.
  for (const [x, h] of [[90, 150], [150, 110], [540, 130]]) {
    poly(ctx, [[x - 34, 320], [x, 320 - h], [x + 34, 320]], '#2e5a3d');
    poly(ctx, [[x - 26, 290], [x, 290 - h * 0.7], [x + 26, 290]], '#3a6b4a');
    rect(ctx, x - 5, 320, 10, 14, '#5a3a28');
  }
  // A star on the first pine, right only.
  if (v === 1) star(ctx, 90, 162, 10, '#f2c94c');
  // The cabin.
  rect(ctx, 240, 220, 140, 100, '#6b4423');
  poly(ctx, [[228, 222], [310, 168], [392, 222]], '#8a5a2b');
  // Snow on the roof: deep on the left, thin on the right.
  ctx.fillStyle = '#f4f8ff';
  ctx.beginPath();
  ctx.moveTo(228, 222);
  ctx.lineTo(310, 168);
  ctx.lineTo(392, 222);
  ctx.lineTo(392, 222 - (v === 0 ? 16 : 6));
  ctx.lineTo(310, 168 - (v === 0 ? 16 : 6));
  ctx.lineTo(228, 222 - (v === 0 ? 16 : 6));
  ctx.closePath();
  ctx.fill();
  // Chimney and smoke, left only.
  rect(ctx, 350, 180, 20, 40, '#5a3a28');
  if (v === 0) {
    circle(ctx, 362, 168, 10, 'rgba(244,248,255,0.85)');
    circle(ctx, 370, 150, 13, 'rgba(244,248,255,0.7)');
    circle(ctx, 380, 130, 16, 'rgba(244,248,255,0.55)');
  }
  // The door with a wreath, right only.
  rect(ctx, 296, 270, 28, 50, '#3d2a1a');
  if (v === 1) {
    ctx.strokeStyle = '#3f7a37';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(310, 288, 10, 0, Math.PI * 2);
    ctx.stroke();
    circle(ctx, 310, 298, 3, '#c0392b');
  }
  // Lit windows.
  rect(ctx, 252, 250, 24, 24, '#ffd97a');
  rect(ctx, 344, 250, 24, 24, '#ffd97a');
  // The snowman.
  circle(ctx, 420, 360, 26, '#f4f8ff');
  circle(ctx, 420, 318, 19, '#f4f8ff');
  circle(ctx, 420, 286, 14, '#f4f8ff');
  circle(ctx, 414, 282, 2, '#1b1440');
  circle(ctx, 426, 282, 2, '#1b1440');
  // The carrot nose, left only.
  if (v === 0) poly(ctx, [[420, 288], [438, 292], [420, 296]], '#e8853d');
  rect(ctx, 404, 268, 32, 4, '#1b1440');
  rect(ctx, 412, 258, 16, 10, '#1b1440');
  ctx.strokeStyle = '#1b1440';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(396, 318);
  ctx.lineTo(382, 304);
  ctx.moveTo(444, 318);
  ctx.lineTo(458, 304);
  ctx.stroke();
}

export const SCENES = [
  {
    id: 'festival',
    name: 'Lantern Festival',
    draw: drawFestival,
    diffs: [
      { x: 500, y: 70, r: 30, label: 'Moon colour' },
      { x: 120, y: 180, r: 22, label: 'Extra lantern' },
      { x: 300, y: 64, r: 20, label: 'Missing stars' },
      { x: 300, y: 315, r: 24, label: 'Bridge rail colour' },
      { x: 430, y: 400, r: 20, label: 'Koi in the river' },
      { x: 210, y: 210, r: 18, label: 'Lantern tassel' },
      { x: 89, y: 299, r: 20, label: 'Dark window' },
    ],
  },
  {
    id: 'pond',
    name: 'Koi Pond',
    draw: drawPond,
    diffs: [
      { x: 280, y: 260, r: 24, label: 'Koi colour' },
      { x: 420, y: 192, r: 20, label: 'Lotus flower' },
      { x: 150, y: 330, r: 18, label: 'Extra stone' },
      { x: 480, y: 118, r: 18, label: 'Dragonfly' },
      { x: 350, y: 320, r: 20, label: 'Ripple rings' },
      { x: 70, y: 120, r: 18, label: 'Bamboo leaf' },
      { x: 520, y: 340, r: 20, label: 'Frog on the stone' },
    ],
  },
  {
    id: 'desert',
    name: 'Desert Caravan',
    draw: drawDesert,
    diffs: [
      { x: 480, y: 90, r: 30, label: 'Sun size' },
      { x: 200, y: 300, r: 24, label: 'Extra camel' },
      { x: 132, y: 188, r: 18, label: 'Tent flag colour' },
      { x: 520, y: 300, r: 24, label: 'Palm tree' },
      { x: 350, y: 360, r: 24, label: 'Extra dune' },
      { x: 300, y: 80, r: 16, label: 'Bird in the sky' },
      { x: 470, y: 370, r: 20, label: 'Pool colour' },
    ],
  },
  {
    id: 'cabin',
    name: 'Snowy Cabin',
    draw: drawCabin,
    diffs: [
      { x: 368, y: 150, r: 22, label: 'Chimney smoke' },
      { x: 428, y: 292, r: 16, label: 'Carrot nose' },
      { x: 310, y: 288, r: 18, label: 'Wreath on the door' },
      { x: 90, y: 162, r: 16, label: 'Star on the pine' },
      { x: 310, y: 180, r: 24, label: 'Snow on the roof' },
      { x: 520, y: 70, r: 22, label: 'Moon phase' },
      { x: 266, y: 398, r: 20, label: 'Footprints' },
    ],
  },
];
