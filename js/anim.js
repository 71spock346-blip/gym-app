/* Stay Strong — offline exercise animations.
 * A data-driven stick-figure engine: each archetype describes a base pose and
 * which joints swing between which angles; a rAF loop drives SVG transform
 * attributes (no CSS transform-origin pitfalls, works everywhere, and ships
 * with the app so it needs no internet — built for basement gyms).
 *
 * Angle convention: positive = forward swing (the figure faces right) or, in
 * front view, outward away from the body. Limbs are drawn hanging down from
 * their pivot, the torso is drawn upward from the hip.
 */

'use strict';

const ANIM_NS = 'http://www.w3.org/2000/svg';

function animEl(name, attrs, ...children) {
  const el = document.createElementNS(ANIM_NS, name);
  for (const [k, v] of Object.entries(attrs || {})) el.setAttribute(k, v);
  for (const c of children) el.appendChild(c);
  return el;
}

const limb = (len) => animEl('line', { x1: 0, y1: 0, x2: 0, y2: len });
const pivot = (x, y, rotG) => animEl('g', { transform: `translate(${x},${y})` }, rotG);
const rotor = (...children) => animEl('g', {}, ...children);
const bell = (y) => animEl('line', { x1: -4, y1: y, x2: 4, y2: y, 'stroke-width': 5, class: 'anim-weight' });

/* -------------------------- archetype library -------------------------- */
/* pose: static angles; anim: [from, to] per joint; dur in ms.
 * Side-view joints: torso, up (upper arm), fore, thighA/shinA (near leg),
 * thighB/shinB (far leg), rootY (whole-body vertical), lift (shoulder shrug).
 * Front-view joints: arms (mirrored pair), fores, legs (mirrored pair). */
const ARCHETYPES = {
  /* presses & raises */
  overheadPress: { view: 'front', weight: 'hands',
    pose: {}, anim: { arms: [100, 168], fores: [62, 6] }, dur: 1800 },
  lateralRaise: { view: 'front', weight: 'hands',
    pose: { fores: 8 }, anim: { arms: [8, 90] }, dur: 1700 },
  frontRaise: { view: 'side', weight: 'hand',
    pose: { torso: 2 }, anim: { up: [8, 95] }, dur: 1700 },
  rearFly: { view: 'side',
    pose: { torso: 25, fore: 12 }, anim: { up: [95, 20] }, dur: 1800 },
  facePull: { view: 'side',
    pose: { torso: 4, up: 85 }, anim: { fore: [0, 112] }, dur: 1600 },
  shrug: { view: 'front', weight: 'hands',
    pose: { arms: 4 }, anim: { lift: [0, -4] }, dur: 1300 },

  /* pulls */
  pulldown: { view: 'front', weight: 'hands',
    pose: {}, anim: { arms: [158, 68], fores: [6, 58] }, dur: 1900 },
  pullup: { view: 'front', bar: true,
    pose: { arms: 165 }, anim: { rootY: [12, -2], fores: [8, 55] }, dur: 2000 },
  row: { view: 'side', seated: true,
    pose: { torso: -4, thighA: 70, shinA: -40, thighB: 70, shinB: -40 },
    anim: { up: [80, 8], fore: [12, 88] }, dur: 1800 },
  bentRow: { view: 'side', weight: 'hand',
    pose: { torso: 55, thighA: 12, shinA: -10, thighB: 12, shinB: -10 },
    anim: { up: [-55, -100], fore: [5, 70] }, dur: 1700 },
  pullover: { view: 'side',
    pose: { torso: 8 }, anim: { up: [162, 32] }, dur: 2100 },
  hinge: { view: 'side', weight: 'hand',
    pose: {}, anim: { torso: [5, 78], up: [-5, -78], thighA: [0, -16], shinA: [0, 10], thighB: [0, -16], shinB: [0, 10] }, dur: 2300 },

  /* legs */
  squat: { view: 'side',
    pose: { up: 68, fore: 42 },
    anim: { thighA: [5, 80], shinA: [-5, -72], thighB: [5, 80], shinB: [-5, -72], torso: [8, 36], rootY: [0, 13] }, dur: 2100 },
  lunge: { view: 'side', weight: 'hand',
    pose: { up: 4 },
    anim: { rootY: [2, 11], thighA: [40, 66], shinA: [-40, -78], thighB: [-30, -42], shinB: [-14, -38], torso: [4, 9] }, dur: 1900 },
  legPress: { view: 'side', seated: true, recline: true,
    pose: { torso: -38, up: 25, fore: 12, thighB: 60, shinB: -55 },
    anim: { thighA: [58, 95], shinA: [-55, -12] }, dur: 1900 },
  legExt: { view: 'side', seated: true,
    pose: { torso: 2, up: 12, thighA: 88, thighB: 88, shinB: 8 },
    anim: { shinA: [6, 86] }, dur: 1700 },
  legCurl: { view: 'side', seated: true,
    pose: { torso: 2, up: 12, thighA: 88, thighB: 88, shinB: 60 },
    anim: { shinA: [86, 8] }, dur: 1700 },
  calfRaise: { view: 'side',
    pose: { up: 6 }, anim: { rootY: [3, -5] }, dur: 1300 },
  hipThrust: { view: 'side', bench: true,
    pose: { thighA: 62, shinA: -75, thighB: 62, shinB: -75, up: -25, fore: -10 },
    anim: { torso: [-55, -86], rootY: [7, 0] }, dur: 1800 },
  adduction: { view: 'front', seated: true,
    pose: { arms: 10 }, anim: { legs: [24, 4] }, dur: 1600 },

  /* chest */
  chestPress: { view: 'side', seated: true,
    pose: { thighA: 70, shinA: -40, thighB: 70, shinB: -40 },
    anim: { up: [58, 86], fore: [80, 4] }, dur: 1800 },
  fly: { view: 'front', weight: 'hands',
    pose: { fores: 55 }, anim: { arms: [88, 26] }, dur: 1900 },
  dip: { view: 'side', bars: true,
    pose: {}, anim: { rootY: [0, 9], up: [-18, -38], fore: [-8, -65] }, dur: 1800 },
  pushup: { view: 'side', plank: true,
    pose: { torso: 80, thighA: -96, shinA: 0, thighB: -96, shinB: 0, up: -78 },
    anim: { fore: [4, 55], rootY: [0, 7] }, dur: 1700 },

  /* arms */
  curl: { view: 'side', weight: 'hand',
    pose: { torso: 2, up: 3 }, anim: { fore: [6, 122] }, dur: 1500 },
  pushdown: { view: 'side',
    pose: { torso: 4, up: 14 }, anim: { fore: [98, 6] }, dur: 1500 },
  overheadExt: { view: 'side', weight: 'hand',
    pose: { torso: 2, up: 168 }, anim: { fore: [-8, -112] }, dur: 1600 },
  kickback: { view: 'side', weight: 'hand',
    pose: { torso: 55, up: -62 }, anim: { fore: [82, 3] }, dur: 1500 },
};

/* ------------------------ exercise → archetype map ------------------------ */
const ANIM_MAP = {
  'sh-press-machine': 'overheadPress', 'sh-db-press': 'overheadPress',
  'sh-smith-press': 'overheadPress', 'sh-arnold-press': 'overheadPress',
  'sh-bb-press': 'overheadPress',
  'sh-lat-raise-machine': 'lateralRaise', 'sh-db-lat-raise': 'lateralRaise',
  'sh-cable-lat-raise': 'lateralRaise', 'sh-lean-raise': 'lateralRaise',
  'sh-reverse-pec-deck': 'rearFly', 'sh-cross-cable-rear': 'rearFly',
  'sh-face-pull': 'facePull',
  'sh-front-raise': 'frontRaise', 'sh-plate-raise': 'frontRaise',

  'bk-lat-pulldown': 'pulldown', 'bk-close-pulldown': 'pulldown',
  'bk-machine-highrow': 'pulldown',
  'bk-assisted-pullup': 'pullup',
  'bk-seated-row': 'row', 'bk-chest-row': 'row', 'bk-single-cable-row': 'row',
  'bk-db-row': 'bentRow', 'bk-tbar-row': 'bentRow', 'bk-bb-row': 'bentRow',
  'bk-straight-arm': 'pullover',
  'bk-back-ext': 'hinge',
  'bk-shrug': 'shrug',

  'lg-leg-press': 'legPress', 'lg-legpress-calf': 'legPress',
  'lg-hack-squat': 'squat', 'lg-smith-squat': 'squat', 'lg-goblet-squat': 'squat',
  'lg-leg-ext': 'legExt',
  'lg-leg-curl': 'legCurl', 'lg-lying-curl': 'legCurl',
  'lg-rdl': 'hinge',
  'lg-lunges': 'lunge', 'lg-bulgarian': 'lunge',
  'lg-seated-calf': 'calfRaise', 'lg-standing-calf': 'calfRaise',
  'lg-adductor': 'adduction',
  'lg-hip-thrust': 'hipThrust',

  'ch-press-machine': 'chestPress', 'ch-bench-press': 'chestPress',
  'ch-incline-db': 'chestPress', 'ch-smith-incline': 'chestPress',
  'ch-flat-db-press': 'chestPress', 'ch-smith-flat': 'chestPress',
  'ch-pec-deck': 'fly', 'ch-cable-cross': 'fly', 'ch-flat-fly': 'fly',
  'ch-low-cable-fly': 'fly',
  'ch-dips': 'dip',
  'ch-pushup': 'pushup',

  'ar-ez-curl': 'curl', 'ar-preacher': 'curl', 'ar-hammer': 'curl',
  'ar-cable-curl': 'curl', 'ar-incline-curl': 'curl',
  'ar-concentration': 'curl', 'ar-spider-curl': 'curl',
  'ar-pushdown': 'pushdown', 'ar-dip-machine': 'pushdown',
  'ar-overhead-ext': 'overheadExt', 'ar-skull': 'overheadExt',
  'ar-db-overhead': 'overheadExt',
  'ar-cgbp': 'chestPress',
  'ar-bench-dip': 'dip',
  'ar-kickback': 'kickback',
};

function resolveArchetype(exId) {
  return ARCHETYPES[ANIM_MAP[exId]] || ARCHETYPES.curl;
}

/* ------------------------------ figure build ------------------------------ */
function buildFigure(arch) {
  const svg = animEl('svg', { viewBox: '0 0 120 120', class: 'anim-svg', 'aria-hidden': 'true' });
  svg.appendChild(animEl('line', { x1: 8, y1: 112, x2: 112, y2: 112, class: 'anim-ground' }));

  const joints = {};                       // name → { g, base }
  const reg = (name, g, base, sign) => { joints[name] = { g, base: base || 0, sign: sign || 1 }; return g; };

  const root = animEl('g', {});
  reg('rootY', root, 0);
  svg.appendChild(root);

  if (arch.view === 'front') {
    const hip = { x: 60, y: 76 };
    if (arch.seated) root.appendChild(animEl('rect', { x: 42, y: hip.y + 2, width: 36, height: 4, rx: 2, class: 'anim-gear' }));
    if (arch.bar) svg.appendChild(animEl('line', { x1: 30, y1: 22, x2: 90, y2: 22, class: 'anim-gear' }));
    // legs (mirrored pair)
    for (const m of [-1, 1]) {
      const rot = reg('legs' + (m === 1 ? '' : 'L'), rotor(limb(34)), 0, 0);
      const g = pivot(hip.x + m * 3, hip.y, rot);
      root.appendChild(g);
      joints['legs' + (m === 1 ? '' : 'L')].mirror = m;
    }
    // lift group carries torso + head + arms (for shrugs)
    const liftRot = rotor();
    reg('lift', liftRot, 0);
    root.appendChild(pivot(0, 0, liftRot));
    liftRot.appendChild(animEl('line', { x1: 60, y1: hip.y, x2: 60, y2: 52 }));
    liftRot.appendChild(animEl('line', { x1: 51, y1: 53, x2: 69, y2: 53 }));     // shoulders
    liftRot.appendChild(animEl('circle', { cx: 60, cy: 43, r: 6, fill: 'none' }));
    for (const m of [-1, 1]) {
      const suffix = m === 1 ? '' : 'L';
      const foreRot = rotor(limb(13));
      if (arch.weight === 'hands') foreRot.appendChild(bell(13));
      reg('fores' + suffix, foreRot);
      joints['fores' + suffix].mirror = m;
      const armRot = rotor(limb(15), pivot(0, 15, foreRot));
      reg('arms' + suffix, armRot);
      joints['arms' + suffix].mirror = m;
      liftRot.appendChild(pivot(60 + m * 8, 53, armRot));
    }
  } else {
    const hip = arch.plank ? { x: 42, y: 92 } : arch.seated ? { x: 50, y: 80 } : { x: 56, y: 74 };
    if (arch.seated && !arch.recline) root.appendChild(animEl('rect', { x: hip.x - 12, y: hip.y + 2, width: 22, height: 4, rx: 2, class: 'anim-gear' }));
    if (arch.recline) root.appendChild(animEl('line', { x1: hip.x - 16, y1: hip.y + 14, x2: hip.x + 2, y2: hip.y - 12, class: 'anim-gear' }));
    if (arch.bench) root.appendChild(animEl('rect', { x: hip.x - 36, y: hip.y - 4, width: 16, height: 4, rx: 2, class: 'anim-gear' }));
    if (arch.bars) {
      svg.appendChild(animEl('line', { x1: 34, y1: 48, x2: 34, y2: 112, class: 'anim-gear' }));
      svg.appendChild(animEl('line', { x1: 34, y1: 48, x2: 52, y2: 48, class: 'anim-gear' }));
    }
    // legs: far (B, faded) then near (A)
    for (const leg of ['B', 'A']) {
      const shinRot = rotor(limb(18), animEl('line', { x1: 0, y1: 18, x2: 6, y2: 18 }));
      reg('shin' + leg, shinRot, 0, -1);
      const thighRot = rotor(limb(20), pivot(0, 20, shinRot));
      reg('thigh' + leg, thighRot, 0, -1);
      const g = pivot(hip.x - (leg === 'B' ? 3 : 0), hip.y, thighRot);
      if (leg === 'B') g.setAttribute('class', 'anim-far');
      root.appendChild(g);
    }
    // torso (drawn upward), head, one arm
    const foreRot = rotor(limb(13));
    if (arch.weight === 'hand') foreRot.appendChild(bell(13));
    reg('fore', foreRot, 0, -1);
    const upRot = rotor(limb(15), pivot(0, 15, foreRot));
    reg('up', upRot, 0, -1);
    const torsoRot = rotor(
      animEl('line', { x1: 0, y1: 0, x2: 0, y2: -24 }),
      animEl('circle', { cx: 0, cy: -31, r: 6, fill: 'none' }),
      pivot(0, -22, upRot),
    );
    reg('torso', torsoRot, 0, 1);
    root.appendChild(pivot(hip.x, hip.y, torsoRot));
  }
  return { svg, joints };
}

/* ------------------------------ animation loop ------------------------------ */
function applyJoint(joints, name, value) {
  const targets = name === 'arms' || name === 'fores' || name === 'legs'
    ? [joints[name], joints[name + 'L']] : [joints[name]];
  for (const j of targets) {
    if (!j) continue;
    if (name === 'rootY' || name === 'lift') {
      j.g.setAttribute('transform', `translate(0,${value})`);
    } else {
      const mirror = j.mirror || 1;
      const sign = j.sign !== undefined && !j.mirror ? j.sign : -mirror;
      j.g.setAttribute('transform', `rotate(${value * sign})`);
    }
  }
}

/* opts.phase (0..1) renders a frozen frame instead of looping — used by tests. */
function mountAnim(container, exId, opts = {}) {
  const arch = resolveArchetype(exId);
  const { svg, joints } = buildFigure(arch);
  container.textContent = '';
  container.appendChild(svg);

  for (const [name, angle] of Object.entries(arch.pose || {})) applyJoint(joints, name, angle);

  const animated = Object.entries(arch.anim || {});
  const frame = (p) => {
    for (const [name, [a, b]] of animated) applyJoint(joints, name, a + (b - a) * p);
  };
  if (opts.phase !== undefined) { frame(opts.phase); return svg; }

  const start = performance.now();
  let raf;
  const tick = (now) => {
    if (!svg.isConnected) return;          // card re-rendered — let the loop die
    frame((1 - Math.cos(((now - start) / arch.dur) * Math.PI)) / 2);   // 0→1→0 ease, loops
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  container._stopAnim = () => cancelAnimationFrame(raf);
  return svg;
}

function unmountAnim(container) {
  if (container._stopAnim) { container._stopAnim(); delete container._stopAnim; }
  container.textContent = '';
}
