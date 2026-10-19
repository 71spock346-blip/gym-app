/* Stay Strong — muscle focus map.
 *
 * A stylised front/back figure where every muscle group is its own shape. For
 * each exercise the target muscles light up gold (primary) and dim gold
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

/* The figure: front view on the left, back view on the right. */
function bodyMapSVG(primary, secondary, cls) {
  const P = new Set(primary), S = new Set(secondary);
  const state = (r) => (P.has(r) ? ' m-primary' : S.has(r) ? ' m-secondary' : '');
  const one = (d) => `<path d="${d}"/>`;
  const sym = (d) => one(d) + `<path d="${d}" transform="translate(100,0) scale(-1,1)"/>`;
  const region = (r, parts) => `<g class="m${state(r)}" data-m="${r}">${parts}</g>`;
  const silhouette = `<g class="m-sil">
    <circle cx="50" cy="12" r="9"/>
    <path d="M45,20 L55,20 L56,30 L44,30 Z"/>
    <path d="M30,30 L70,30 L72,52 L66,92 L34,92 L28,52 Z"/>
    ${sym('M20,33 Q26,30 32,33 L32,70 L20,71 Z')}
    ${sym('M18,71 L29,70 L28,98 Q23,103 19,98 Z')}
    ${sym('M34,92 L49,92 L49,140 Q42,144 35,140 Z')}
    ${sym('M36,140 L48,140 L47,186 L37,186 Z')}
    ${sym('M33,186 L50,186 L50,192 L31,192 Z')}
  </g>`;
  const front = `<g class="m-view">${silhouette}
    ${region('front-delts', sym('M33,31 Q41,30 43,36 Q41,42 35,42 Q31,38 33,31 Z'))}
    ${region('side-delts', sym('M24,35 Q27,30 33,31 Q31,38 35,42 Q28,46 24,41 Z'))}
    ${region('chest', sym('M36,43 Q50,40 50,43 L50,57 Q44,61 38,57 Q33,50 36,43 Z'))}
    ${region('biceps', sym('M22,45 Q31,43 32,49 L31,68 Q27,71 23,67 Z'))}
    ${region('forearms', sym('M20,72 Q28,71 29,75 L27,96 Q23,99 19,95 Z'))}
    ${region('obliques', sym('M37,60 L43,60 L44,90 L39,88 Q35,75 37,60 Z'))}
    ${region('abs', one('M43,60 L57,60 L56,90 L44,90 Z') + '<path class="m-lines" d="M44,68 L56,68 M44,76 L56,76 M44,84 L56,84 M50,60 L50,90"/>')}
    ${region('adductors', sym('M44,96 Q50,94 50,96 L50,118 Q47,120 45,116 Z'))}
    ${region('quads', sym('M35,95 Q48,93 49,99 L48,136 Q42,141 37,137 Q33,116 35,95 Z'))}
  </g>`;
  const back = `<g class="m-view" transform="translate(100,0)">${silhouette}
    ${region('traps', sym('M50,22 L36,34 L50,54 Z'))}
    ${region('rear-delts', sym('M25,33 Q31,29 35,33 Q35,42 30,44 Q24,41 25,33 Z'))}
    ${region('lats', sym('M34,46 Q32,64 40,86 L50,86 L50,71 L40,69 Q36,58 36,46 Z'))}
    ${region('upper-back', sym('M38,38 L50,54 L50,70 L41,68 Q37,52 38,38 Z'))}
    ${region('lower-back', one('M44,72 L56,72 L55,92 L45,92 Z'))}
    ${region('triceps', sym('M22,45 Q31,43 32,49 L31,68 Q27,71 23,67 Z'))}
    ${region('forearms', sym('M20,72 Q28,71 29,75 L27,96 Q23,99 19,95 Z'))}
    ${region('glutes', sym('M35,94 Q50,92 50,113 Q42,118 35,109 Z'))}
    ${region('hamstrings', sym('M36,115 Q49,113 49,120 L48,148 Q42,153 37,149 Q34,130 36,115 Z'))}
    ${region('calves', sym('M37,152 Q48,150 48,157 L46,182 Q41,186 38,181 Q34,166 37,152 Z'))}
  </g>`;
  return `<svg class="body-map ${cls || ''}" viewBox="0 0 200 200" aria-hidden="true">${front}${back}</svg>`;
}

/* The "Focus" row on a card, or the larger "Where to feel it" block in the guide. */
function focusBlock(ex, big) {
  const f = focusFor(ex);
  if (!f.primary.length && !f.secondary.length) return '';
  const names = (list) => list.map((r) => MUSCLE_LABELS[r]).join(', ');
  const aria = `Target muscles: ${names(f.primary)}${f.secondary.length ? `; also ${names(f.secondary)}` : ''}`;
  const also = f.also.length ? `<span class="focus-also">· also ${f.also.join(', ')}</span>` : '';
  if (big) return `
    <h4>Where to feel it</h4>
    <div class="focus-big" role="img" aria-label="${aria}">
      ${bodyMapSVG(f.primary, f.secondary, 'body-map-big')}
      <div class="focus-text">
        <div class="focus-label">${f.label} ${also}</div>
        <div class="focus-cue">${f.cue}</div>
        <div class="focus-legend"><span><i class="k-primary"></i>focus</span><span><i class="k-secondary"></i>also working</span></div>
      </div>
    </div>`;
  return `
    <div class="focus-row" role="img" aria-label="${aria}">
      ${bodyMapSVG(f.primary, f.secondary)}
      <div class="focus-text">
        <div class="focus-label"><span class="focus-k">Focus</span>${f.label} ${also}</div>
        <div class="focus-cue">${f.cue}</div>
      </div>
    </div>`;
}
