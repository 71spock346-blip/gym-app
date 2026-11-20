/* Stay Strong — muscle focus map.
 *
 * A stylised front/back figure where every muscle group is its own shape. For
 * each exercise the target muscles light up bright (primary) and dimmer
 * (secondary), with a one-line mind–muscle cue for the primary muscle. The
 * regions are read from the exercise's `muscles` text, so every exercise gets a
 * map without hand-tagging; the cue comes from the first primary region. */

const MUSCLE_LABELS = {
  traps: 'Traps', 'front-delts': 'Front delts', 'side-delts': 'Side delts', 'rear-delts': 'Rear delts',
  chest: 'Chest', biceps: 'Biceps', triceps: 'Triceps', forearms: 'Forearms',
  abs: 'Abs', obliques: 'Obliques', lats: 'Lats', 'upper-back': 'Upper back', 'lower-back': 'Lower back',
  glutes: 'Glutes', quads: 'Quads', hamstrings: 'Hamstrings', adductors: 'Inner thighs', calves: 'Calves',
};

/* Phrase → regions. Every rule that matches a phrase contributes, so
 * "Front & side delts" lights both heads and "Whole back" lights three areas. */
const MUSCLE_WORDS = [
  [/whole back/i, ['lats', 'upper-back', 'lower-back']],
  [/all three delt/i, ['front-delts', 'side-delts', 'rear-delts']],
  [/^(shoulders|delts?)\b/i, ['front-delts', 'side-delts']],
  [/front( &| and)? (side )?delt|^front\b/i, ['front-delts']],
  [/side delt|& side|and side|lateral delt/i, ['side-delts']],
  [/rear delt|posterior delt/i, ['rear-delts']],
  [/chest|pecs?\b/i, ['chest']],
  [/\blats?\b|latissimus/i, ['lats']],
  [/upper back|mid[- ]back|rhomboid/i, ['upper-back']],
  [/lower back|erector/i, ['lower-back']],
  [/traps?\b|trapezius/i, ['traps']],
  [/biceps|brachialis/i, ['biceps']],
  [/triceps/i, ['triceps']],
  [/forearm|grip/i, ['forearms']],
  [/\babs\b|core|rectus/i, ['abs']],
  [/core|oblique/i, ['obliques']],
  [/quads?\b|^legs\b/i, ['quads']],
  [/hamstring/i, ['hamstrings']],
  [/glute|hips\b/i, ['glutes']],
  [/inner thigh|adductor/i, ['adductors']],
  [/calves|calf/i, ['calves']],
];

/* Mind–muscle cue for the primary region: what to feel, in one line. */
const FOCUS_CUES = {
  quads: 'Push the floor away and feel the front of your thighs take the load.',
  hamstrings: 'Hinge at the hips; feel the back of your thighs stretch, then pull you back up.',
  glutes: 'Squeeze your glutes hard at the top of every rep — they finish the move.',
  calves: 'Rise onto the balls of your feet, pause at the top, lower slowly.',
  adductors: 'Press the knees inward against the resistance and control the return.',
  chest: 'Think of squeezing your elbows together — the chest moves the weight, not the arms.',
  'front-delts': 'Lead with the elbows and keep your traps relaxed.',
  'side-delts': 'Lead with the elbows to shoulder height, thumbs level — never tipped down — and don’t shrug.',
  'rear-delts': 'Pull the elbows out and back; feel the back of the shoulders, not the arms.',
  traps: 'Shrug straight up toward your ears; pause, then lower slowly.',
  lats: 'Pull with your elbows, not your hands — drive them down toward your back pockets.',
  'upper-back': 'Squeeze your shoulder blades together at the end of every pull.',
  'lower-back': 'Keep a flat back; feel the muscles beside your spine hold the position.',
  biceps: 'Pin your elbows to your sides; curl, then squeeze hard at the top.',
  triceps: 'Lock the elbows in place; only the forearm moves. Squeeze at full extension.',
  forearms: 'Grip hard the whole set and move slowly through the wrists.',
  abs: 'Brace as if about to be hit; curl the ribs toward the hips.',
  obliques: 'Twist from the waist, not the arms; keep the hips still.',
};

const regionsOf = (phrase) => {
  const out = [];
  for (const [re, regions] of MUSCLE_WORDS) if (re.test(phrase)) for (const r of regions) if (!out.includes(r)) out.push(r);
  return out;
};

/* { primary: [...regions], secondary: [...regions], label, also, cue } for an exercise. */
function focusFor(ex) {
  const parts = String(ex.muscles || '').split(',').map((s) => s.trim()).filter(Boolean);
  const head = parts[0] || '';
  const primary = regionsOf(head);
  const secondary = [];
  for (const p of parts.slice(1)) for (const r of regionsOf(p)) if (!primary.includes(r) && !secondary.includes(r)) secondary.push(r);
  const first = primary[0] || secondary[0];
  const label = head.replace(/\s*\(.*?\)\s*/g, ' ').trim();
  const also = parts.slice(1).map((p) => p.replace(/\s*\(.*?\)\s*/g, ' ').trim().toLowerCase())
    .filter((p) => !/balance|power|heart rate|stabiliser|hip flexor|rotator cuff|one side|each side/.test(p));
  return { primary, secondary, label, also, cue: (first && FOCUS_CUES[first]) || '' };
}

/* The figure: front view on the left, back view on the right (or one of them). */
function bodyMapSVG(primary, secondary, cls, side) {
  const P = new Set(primary), S = new Set(secondary);
  const state = (r) => (P.has(r) ? ' m-primary' : S.has(r) ? ' m-secondary' : '');
  const one = (d) => `<path d="${d}"/>`;
  const sym = (d) => one(d) + `<path d="${d}" transform="translate(100,0) scale(-1,1)"/>`;
  const region = (r, parts) => `<g class="m${state(r)}" data-m="${r}">${parts}</g>`;
  // v75: smoother, more anatomical outline; regions keep their names and the 100 × 200 box per view
  const silhouette = `<g class="m-sil">
    <ellipse cx="50" cy="12.5" rx="7.2" ry="9.2"/>
    <path d="M45,19 C45.5,24 44.5,26.5 41,28.5 L59,28.5 C55.5,26.5 54.5,24 55,19 Z"/>
    <path d="M35,27.5 L65,27.5 C70.5,28.2 73,31 72.5,36 L67,55 C67.5,65 66.5,75 64.5,85 L35.5,85 C33.5,75 32.5,65 33,55 L27.5,36 C27,31 29.5,28.2 35,27.5 Z"/>
    ${sym('M23,35 C24.5,31 28.5,29.5 31.5,32 L31.5,64 C29,66.5 24,66.5 21.8,64 C21.5,54 21.8,44 23,35 Z')}
    ${sym('M20.5,63 L30.5,64.5 C29.5,73 27.8,81 26.6,89.5 L20.6,89.5 C19.4,80 19.4,71 20.5,63 Z')}
    ${sym('M20.2,89 L26.8,89 C27.8,93 26.8,97.5 24.6,100 C22.4,100.5 20.4,98.5 19.6,94.5 Z')}
    ${sym('M35.5,82 L50,85 L50,129 C46,134.5 40.5,134.5 37.2,131 C34.2,116 33.4,97 35.5,82 Z')}
    ${sym('M37.2,129.5 L47.4,129.5 C47.6,145 46.4,161 44.6,177 L39.4,177 C37.4,161 36.4,145 37.2,129.5 Z')}
    ${sym('M38.6,176 L45.2,176 C46.4,180 46.6,184 45,186.5 L36.4,186.5 C35.6,183 36.4,179 38.6,176 Z')}
  </g>`;
  const front = `<g class="m-view">${silhouette}
    ${region('side-delts', sym('M31,29.6 C26,30.4 22.6,35 23.2,43.6 C25.4,44.8 27.4,44.2 29,43 C28,37.8 29.6,32.8 33.2,29.8 Z'))}
    ${region('front-delts', sym('M33.6,29.8 C30.2,32.8 28.6,37.8 29.6,43 C32.4,44 35.2,43 37,40.8 C37.8,36.6 37.8,32.8 36,30 Z'))}
    ${region('chest', sym('M37,30.6 C42,29.8 46.8,30.6 49.4,31.8 L49.4,46 C46,49.4 40.2,49.4 36.6,46.2 C34.6,42.6 34.8,37.4 37,32.6 Z'))}
    ${region('biceps', sym('M23.4,46 C26,44.2 29.4,44.4 30.6,47.4 C31.4,53 30.6,59.6 28.6,63.6 C26.6,65 24.2,64.6 23,62.4 C22.2,57 22.4,50.4 23.4,46 Z'))}
    ${region('forearms', sym('M21.4,66 C24.6,64.8 28.2,65.6 29.2,67.6 C28.8,75 27,81.6 26,88 L21,88 C20.2,80.8 20.2,72.6 21.4,66 Z'))}
    ${region('obliques', sym('M36.2,48.6 C38.4,50.2 40.8,50.4 42.6,50.4 L42.6,80.4 C40.2,78.4 38.2,74.4 37.2,70 C36,62.6 35.4,55.4 36.2,48.6 Z'))}
    ${region('abs', one('M43.4,49.4 L56.6,49.4 L56.6,80 C55,85 52.4,88 50,88 C47.6,88 45,85 43.4,80 Z') + '<path class="m-lines" d="M43.4,57 L56.6,57 M43.4,64.4 L56.6,64.4 M43.4,71.8 L56.6,71.8 M50,49.4 L50,88"/>')}
    ${region('quads', sym('M36.6,85 C41,88.4 45.6,91.8 47.6,96 C48.6,106 47.8,118 45.8,127.6 C43,130.6 40,130.6 38,128 C35,117 34.2,98 36.6,85 Z'))}
    ${region('adductors', sym('M46.4,90.4 C48.4,92.4 49.6,94.4 49.6,96.4 L49.6,114 C48.2,116 46.8,114.6 46.6,112.4 C47.6,106 47.6,99 46.4,90.4 Z'))}
    ${region('calves', sym('M38.2,135.6 C41.2,134.6 44.2,135.6 45.2,138 C46,148 45,159.6 43.2,169.6 L40.2,169.6 C38.4,159.6 37.4,148 38.2,135.6 Z'))}
  </g>`;
  const back = `<g class="m-view" transform="translate(100,0)">${silhouette}
    ${region('traps', sym('M50,19.6 C47.6,24 42.6,27 36.2,28.8 C40.6,33.2 45.6,41 50,52.4 Z'))}
    ${region('rear-delts', sym('M29.4,29.8 C25,30.8 22.4,36 23.2,44 C27.2,44 31.2,41 34.2,36.2 C34.4,33 32.4,30.6 29.4,29.8 Z'))}
    ${region('lats', sym('M34.6,43 C37,55 42.4,63.6 49.6,66.4 L49.6,72 C45,76.6 41,79.4 38.6,80.2 C35.6,69.6 33.8,57 34.6,43 Z'))}
    ${region('upper-back', sym('M37.2,31.6 C41.4,36 46,44.4 49.6,54.4 L49.6,63.8 C45,62.6 41,60 38.2,55.6 C36.4,47.6 36.2,39.6 37.2,31.6 Z'))}
    ${region('lower-back', one('M43.4,67.6 C46.4,69.8 53.6,69.8 56.6,67.6 L57.4,83.6 C54,87 46,87 42.6,83.6 Z'))}
    ${region('triceps', sym('M23.4,46 C26,44.2 29.4,44.4 30.6,47.4 C31.4,53 30.6,59.6 28.6,63.6 C26.6,65 24.2,64.6 23,62.4 C22.2,57 22.4,50.4 23.4,46 Z'))}
    ${region('forearms', sym('M21.4,66 C24.6,64.8 28.2,65.6 29.2,67.6 C28.8,75 27,81.6 26,88 L21,88 C20.2,80.8 20.2,72.6 21.4,66 Z'))}
    ${region('glutes', sym('M36.4,86 C41.4,84.4 47,86.4 49.6,90.4 L49.6,104 C45.4,108.4 39.4,107.4 36.4,102.4 C34.6,96.4 34.6,90.4 36.4,86 Z'))}
    ${region('hamstrings', sym('M36.4,106.4 C40.4,109.2 45.4,109.2 48.2,107.2 C49,116 48,124 46,130 C43.2,132 40.2,132 38.2,130 C36.2,122 35.4,114 36.4,106.4 Z'))}
    ${region('calves', sym('M37.6,134.4 C41.2,132.4 45,133.4 46.2,137.2 C47,146 46.2,154 44.4,160.4 C42.4,162.4 40.2,162.4 39,160.4 C37.2,152 36.6,142 37.6,134.4 Z'))}
  </g>`;
  // side 'front' or 'back' crops to one view (the library's muscle picker)
  const box = side === 'front' ? '0 0 100 200' : side === 'back' ? '100 0 100 200' : '0 0 200 200';
  return `<svg class="body-map ${cls || ''}" viewBox="${box}" aria-hidden="true">${side === 'back' ? '' : front}${side === 'front' ? '' : back}</svg>`;
}

/* The "Focus" row on a card, or the larger "Where to feel it" block in the guide. */
function focusBlock(ex, big) {
  const f = focusFor(ex);
  if (!f.primary.length && !f.secondary.length) return '';
  const names = (list) => list.map((r) => MUSCLE_LABELS[r]).join(', ');
  const aria = `Target muscles: ${names(f.primary)}${f.secondary.length ? `; also ${names(f.secondary)}` : ''}`;
  const also = f.also.length ? `<span class="focus-also">· also ${f.also.join(', ')}</span>` : '';
  // your own front/back figure stands in for the drawn body map: one added on
  // this phone (Settings → Your images) first, then a bundled img/focus/<id>.webp
  const onPhone = (typeof ownMediaUrl === 'function') ? ownMediaUrl('focus', ex.id) : null;
  const own = onPhone || (((typeof DEMO_FOCUS !== 'undefined') && DEMO_FOCUS[ex.id]) ? focusUrl(ex.id) : null);
  const map = (cls) => own
    ? `<img class="body-map body-map-photo ${cls || ''}" src="${own}" alt="" loading="lazy" />`
    : bodyMapSVG(f.primary, f.secondary, cls);
  if (big) return `
    <h4>Where to feel it</h4>
    <div class="focus-big" role="img" aria-label="${aria}">
      ${map('body-map-big')}
      <div class="focus-text">
        <div class="focus-label">${f.label} ${also}</div>
        <div class="focus-cue">${f.cue}</div>
        ${own ? '' : '<div class="focus-legend"><span><i class="k-primary"></i>focus</span><span><i class="k-secondary"></i>also working</span></div>'}
      </div>
    </div>`;
  return `
    <div class="focus-row" role="img" aria-label="${aria}">
      ${map()}
      <div class="focus-text">
        <div class="focus-label"><span class="focus-k">Focus</span>${f.label} ${also}</div>
        <div class="focus-cue">${f.cue}</div>
      </div>
    </div>`;
}
