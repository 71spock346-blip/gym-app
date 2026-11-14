/* Stay Strong — planner rule tests, plain Node, no browser.
 *
 *   node tools/planner_test.js
 *
 * Loads the app's scripts into a Node `vm` context with a stub DOM (the UI code
 * at the bottom of app.js runs harmlessly against it), then replays a year of
 * weekly plans for every split, equipment mode and goal and checks the planner
 * rules described in HANDOVER.md §4. Prints PASS/FAIL per check; exit code 1 on
 * any failure. Runs in a few seconds and needs nothing installed beyond Node. */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SCRIPTS = ['exercises', 'demos', 'media', 'anims', 'videos', 'icons', 'muscles', 'app'];

/* ------------------------------ loading the app ------------------------------ */

/* Anything the UI code touches: every property, call and `new` returns the same
 * stub, and it turns into an empty string inside templates. */
function stub() {
  const fn = function () {};
  const proxy = new Proxy(fn, {
    get: (_, key) => {
      if (key === Symbol.toPrimitive) return () => '';
      if (key === Symbol.iterator) return function* () {};
      if (key === 'then') return undefined;   // not a promise
      if (key === 'length') return 0;
      return proxy;
    },
    set: () => true,
    apply: () => proxy,
    construct: () => proxy,
    has: () => true,
  });
  return proxy;
}

function loadApp() {
  const mem = new Map();
  const localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k),
    clear: () => mem.clear(),
  };
  const s = stub();
  const ctx = {
    console, localStorage, Date, Math, JSON, Promise, Map, Set, URL,
    setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
    requestAnimationFrame: () => 0,
    document: s, navigator: { userAgent: 'node' }, location: s, history: undefined,
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    indexedDB: undefined, caches: undefined, performance: { now: () => 0 },
    Element: function Element() {}, HTMLElement: function HTMLElement() {},
    addEventListener() {}, removeEventListener() {},
  };
  ctx.window = ctx;
  ctx.self = ctx;
  vm.createContext(ctx);
  for (const name of SCRIPTS) {
    const file = path.join(ROOT, 'js', name + '.js');
    vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  }
  // Top-level const/let live in the context's shared script scope, so a later
  // script can hand them back out.
  return vm.runInContext(`({
    state, PHASES, GOALS, EQUIPMENT, SPLITS, DAYS, DAYS_TWICE, EXERCISE_DB, TAG_CAP, BODY_CAP,
    ANTI_REPEAT_ANCHOR, DEMO_PHOTOS, DEMO_ILLUS, DEMO_THUMBS, DEMO_FOCUS, DEMO_ANIMS, FORM_VIDEOS,
    equipOf, allowed, isBodyPick, focusFor, matchesSlot, matchesCap, phaseForWeek, cycleForWeek,
    anchorsFor, anchorCandidates, pickExercises, schemeFor, applyVolumeCaps, evaluateAnchor, anchorStep, derivedZoneWeight,
  })`, ctx);
}

const app = loadApp();
const { state } = app;
const ALL_EX = Object.values(app.EXERCISE_DB).flat();
const byId = new Map(ALL_EX.map((ex) => [ex.id, ex]));

/* ------------------------------ building plans ------------------------------ */

const SPLIT_KEYS = Object.keys(app.SPLITS);      // twice, bodypart
const EQUIP_KEYS = Object.keys(app.EQUIPMENT);   // gym, free, body
const GOAL_KEYS = Object.keys(app.GOALS);        // build, fatloss
const WEEKS = Number(process.env.PLANNER_WEEKS) || 20;   // five 4-week cycles; replay cost grows with the square
// Fixed weeks from the anti-repeat anchor on, so the test does not depend on today's date.
const FIRST_WEEK = Math.ceil(app.ANTI_REPEAT_ANCHOR / 4) * 4;   // the first whole 4-week cycle
const weeks = Array.from({ length: WEEKS }, (_, i) => FIRST_WEEK + i);

function configure(split, equip, goal) {
  state.split = split; state.equip = equip; state.goal = goal;
}

/* One day's planned session, the same way renderDay builds it (no swaps). */
function planDay(day, weekIdx, dayIdx) {
  const phase = app.phaseForWeek(weekIdx);
  const exercises = app.pickExercises(day, weekIdx, dayIdx);
  const anchorIds = new Set(app.anchorsFor(day, weekIdx).filter((ex) => exercises.includes(ex)).map((ex) => ex.id));
  const schemes = app.applyVolumeCaps(exercises,
    exercises.map((ex, i) => app.schemeFor(ex, phase, weekIdx, i, anchorIds.has(ex.id))), day, anchorIds);
  return { day, weekIdx, dayIdx, phase, exercises, schemes, anchorIds };
}

/* Every plan for one configuration, cached: { weekIdx: [planDay × 5] }. */
const planCache = new Map();
function plansFor(split, equip, goal) {
  const key = `${split}|${equip}|${goal}`;
  if (!planCache.has(key)) {
    configure(split, equip, goal);
    const days = app.SPLITS[split].days;
    const out = {};
    for (const w of weeks) out[w] = days.map((day, i) => planDay(day, w, i));
    planCache.set(key, out);
  }
  return planCache.get(key);
}

function* configs({ splits = SPLIT_KEYS, equips = EQUIP_KEYS, goals = GOAL_KEYS } = {}) {
  for (const split of splits) for (const equip of equips) for (const goal of goals) {
    yield { split, equip, goal, plans: plansFor(split, equip, goal) };
  }
}
const where = (c, p) => `${c.split}/${c.equip}/${c.goal} week ${p.weekIdx - FIRST_WEEK} ${p.day.key}`;
const ids = (list) => list.map((ex) => ex.id).join(', ');

/* ------------------------------ the runner ------------------------------ */

const results = [];
function check(name, fn) {
  let problems;
  try { problems = fn() || []; } catch (e) { problems = [`threw: ${e && e.stack || e}`]; }
  results.push({ name, problems });
  console.log(`${problems.length ? 'FAIL' : 'PASS'} ${name}`);
  for (const p of problems.slice(0, 8)) console.log(`     ${p}`);
  if (problems.length > 8) console.log(`     … and ${problems.length - 8} more`);
}


const sameIds = (a, b) => ids(a) === ids(b);
const countTag = (list, tag) => list.filter((ex) => ex.tags.includes(tag)).length;
const fileMissing = (rel) => (fs.existsSync(path.join(ROOT, rel)) ? null : rel);

/* ------------------------------ the database ------------------------------ */

check('exercise ids are unique and carry their group prefix', () => {
  const problems = [];
  const prefix = { shoulders: 'sh-', back: 'bk-', legs: 'lg-', chest: 'ch-', arms: 'ar-', core: 'co-' };
  const seen = new Set();
  for (const ex of ALL_EX) {
    if (seen.has(ex.id)) problems.push(`duplicate id ${ex.id}`);
    seen.add(ex.id);
    if (prefix[ex.group] && !ex.id.startsWith(prefix[ex.group])) problems.push(`${ex.id} is in ${ex.group}`);
  }
  return problems;
});

check('every exercise has a muscle map and a mind–muscle cue', () => {
  const problems = [];
  for (const ex of ALL_EX) {
    const f = app.focusFor(ex);
    if (!f.primary.length) problems.push(`${ex.id}: no lit region for "${ex.muscles}"`);
    else if (!f.cue) problems.push(`${ex.id}: no cue for ${f.primary[0]}`);
  }
  return problems;
});

check('bundled pictures and clips exist for every manifest entry', () => {
  const problems = [];
  const known = (id, where) => { if (!byId.has(id)) problems.push(`${where} lists unknown exercise ${id}`); };
  for (const id of Object.keys(app.DEMO_PHOTOS)) {
    known(id, 'DEMO_PHOTOS');
    problems.push(fileMissing(`img/demo/${id}-0.jpg`), fileMissing(`img/demo/${id}-1.jpg`));
  }
  for (const id of Object.keys(app.DEMO_ILLUS)) { known(id, 'DEMO_ILLUS'); problems.push(fileMissing(`img/illus/${id}.jpg`)); }
  for (const id of Object.keys(app.DEMO_THUMBS)) { known(id, 'DEMO_THUMBS'); problems.push(fileMissing(`img/thumb/${id}.jpg`)); }
  for (const [id, a] of Object.entries(app.DEMO_FOCUS)) { known(id, 'DEMO_FOCUS'); problems.push(fileMissing(`img/focus/${id}.${a.ext || 'webp'}`)); }
  for (const id of Object.keys(app.DEMO_ANIMS)) {
    known(id, 'DEMO_ANIMS');
    for (const ext of ['webm', 'mp4', 'jpg']) problems.push(fileMissing(`img/anim/${id}.${ext}`));
  }
  return problems.filter(Boolean).map((p) => (p.startsWith('img/') ? `missing ${p}` : p));
});

check('form videos belong to real exercises and no video is used twice', () => {
  const problems = [];
  const seen = new Map();
  for (const [id, v] of Object.entries(app.FORM_VIDEOS)) {
    if (!byId.has(id)) problems.push(`FORM_VIDEOS lists unknown exercise ${id}`);
    if (seen.has(v.id)) problems.push(`video ${v.id} used by both ${seen.get(v.id)} and ${id}`);
    seen.set(v.id, id);
  }
  return problems;
});

/* ------------------------------ every plan ------------------------------ */

check('plans are deterministic: the same week always gives the same session', () => {
  const problems = [];
  for (const c of configs()) {
    configure(c.split, c.equip, c.goal);
    for (const w of [weeks[0], weeks[weeks.length - 1]]) {
      app.SPLITS[c.split].days.forEach((day, i) => {
        const again = planDay(day, w, i);
        const p = c.plans[w][i];
        if (!sameIds(again.exercises, p.exercises)) problems.push(`${where(c, p)}: ${ids(p.exercises)} then ${ids(again.exercises)}`);
      });
    }
  }
  return problems;
});

check('every session has its full size, no duplicates, and only kit the equipment mode has', () => {
  const problems = [];
  for (const c of configs()) {
    const kinds = app.EQUIPMENT[c.equip].allow;
    for (const w of weeks) for (const p of c.plans[w]) {
      if (p.exercises.length !== p.day.picks) problems.push(`${where(c, p)}: ${p.exercises.length} of ${p.day.picks} exercises`);
      if (new Set(p.exercises.map((ex) => ex.id)).size !== p.exercises.length) problems.push(`${where(c, p)}: duplicate in ${ids(p.exercises)}`);
      for (const ex of p.exercises) if (!kinds.includes(app.equipOf(ex))) problems.push(`${where(c, p)}: ${ex.id} needs ${app.equipOf(ex)} kit`);
    }
  }
  return problems;
});

check('every required slot is filled (Build muscle, weights available)', () => {
  const problems = [];
  for (const c of configs({ equips: ['gym', 'free'], goals: ['build'] })) {
    for (const w of weeks) for (const p of c.plans[w]) {
      for (const slot of p.day.slots) {
        const n = p.exercises.filter((ex) => app.matchesSlot(ex, slot)).length;
        if (n < slot.count) problems.push(`${where(c, p)}: ${n}/${slot.count} ${slot.tag}${slot.from ? ' from ' + slot.from : ''}`);
      }
    }
  }
  return problems;
});

check('anchor lifts hold for the whole 4-week cycle, go first, and anchor one day only', () => {
  const problems = [];
  for (const c of configs()) {
    const avoid = new Set(app.GOALS[c.goal].avoid || []);
    for (const w of weeks) {
      const cycleStart = w - (w % 4);
      const anchorOwner = new Map();
      for (const p of c.plans[w]) {
        configure(c.split, c.equip, c.goal);
        const anchors = app.anchorsFor(p.day, w);
        const first = app.anchorsFor(p.day, Math.max(cycleStart, weeks[0]));
        if (!sameIds(anchors, first)) problems.push(`${where(c, p)}: anchors ${ids(anchors)}, cycle began with ${ids(first)}`);
        // A slot with no loaded candidate in this kit (no loaded vertical pull with free weights) has no anchor.
        const wanted = (p.day.anchors || []).reduce((n, s) => n + Math.min(s.count, app.anchorCandidates(p.day, s).length), 0);
        if (anchors.length !== wanted) problems.push(`${where(c, p)}: ${anchors.length} of ${wanted} anchors`);
        for (const ex of anchors) {
          if (anchorOwner.has(ex.id)) problems.push(`${where(c, p)}: ${ex.id} also anchors ${anchorOwner.get(ex.id)}`);
          anchorOwner.set(ex.id, p.day.key);
          if (c.equip !== 'body' && app.isBodyPick(ex)) problems.push(`${where(c, p)}: bodyweight anchor ${ex.id}`);
        }
        const expected = anchors.filter((ex) => !avoid.has(ex.id));
        const lead = p.exercises.slice(0, expected.length);
        const sorted = (list) => list.map((ex) => ex.id).sort().join(', ');
        if (sorted(lead) !== sorted(expected)) problems.push(`${where(c, p)}: session starts ${ids(lead)}, anchors are ${ids(expected)}`);
      }
    }
  }
  return problems;
});

check('anchor lifts rotate to a fresh lift each new cycle when the pool allows', () => {
  const problems = [];
  for (const c of configs({ equips: ['gym'], goals: ['build'] })) {
    configure(c.split, c.equip, c.goal);
    app.SPLITS[c.split].days.forEach((day) => {
      for (let w = weeks[0] + 4; w <= weeks[weeks.length - 1]; w += 4) {
        const prev = app.anchorsFor(day, w - 4).map((ex) => ex.id);
        const now = app.anchorsFor(day, w);
        const kept = now.filter((ex) => prev.includes(ex.id));
        if (kept.length) problems.push(`${c.split} cycle ${(w - weeks[0]) / 4} ${day.key}: ${ids(kept)} anchors two cycles running`);
      }
    });
  }
  return problems;
});

/* The anti-repeat rule sends recent picks to the back of the queue; it can only
 * keep them out when the pool has enough alternatives. A full gym always does
 * (the HIIT goal's one-muscle chest day aside, which avoids most chest lifts);
 * free weights and calisthenics have too few rows, calf raises and chest moves,
 * so their plans repeat by design. A two-week gap is the aim but not always
 * possible either: Friday's second ham curl can run out of options. */
check('accessories rotate: in a full gym nothing comes back the very next week', () => {
  const problems = [];
  const gym = [...configs({ equips: ['gym'], goals: ['build'] }), ...configs({ splits: ['twice'], equips: ['gym'], goals: ['fatloss'] })];
  for (const c of gym) {
    for (const w of weeks.slice(1)) c.plans[w].forEach((p, i) => {
      const last = new Set(c.plans[w - 1][i].exercises.map((ex) => ex.id));
      const back = p.exercises.filter((ex) => !p.anchorIds.has(ex.id) && !ex.tags.includes('core') && last.has(ex.id));
      if (back.length) problems.push(`${where(c, p)}: ${ids(back)} two weeks running`);
    });
  }
  return problems;
});

check('twice a week: every muscle group is trained on at least two days', () => {
  const problems = [];
  for (const c of configs({ splits: ['twice'], goals: ['build'] })) {
    for (const w of weeks) {
      for (const group of ['chest', 'back', 'shoulders', 'legs', 'arms']) {
        const days = c.plans[w].filter((p) => p.exercises.some((ex) => ex.group === group || (ex.also || []).includes(group)));
        if (days.length < 2) problems.push(`${c.split}/${c.equip}/${c.goal} week ${w - FIRST_WEEK}: ${group} on ${days.map((p) => p.day.key).join(', ') || 'no day'}`);
      }
    }
  }
  return problems;
});

/* Free weights have only two calf raises, so Friday may repeat Tuesday's there. */
check('twice a week: push and pull never repeat Upper, Friday legs never repeats Lower (full gym)', () => {
  const problems = [];
  for (const c of configs({ splits: ['twice'], equips: ['gym'] })) {
    for (const w of weeks) {
      const byKey = Object.fromEntries(c.plans[w].map((p) => [p.day.key, p]));
      for (const p of c.plans[w]) {
        if (!p.day.exclude) continue;
        const base = new Set(byKey[p.day.exclude].exercises.map((ex) => ex.id));
        const again = p.exercises.filter((ex) => base.has(ex.id) && !ex.tags.includes('core'));
        if (again.length) problems.push(`${where(c, p)}: ${ids(again)} also on ${p.day.exclude}`);
      }
    }
  }
  return problems;
});

check('volume caps: hard sets per muscle stay under each cap, never trimming an anchor or below 2 sets', () => {
  const problems = [];
  for (const c of configs()) {
    for (const w of weeks) for (const p of c.plans[w]) {
      p.schemes.forEach((s, i) => {
        if (s.capped && p.anchorIds.has(p.exercises[i].id)) problems.push(`${where(c, p)}: anchor ${p.exercises[i].id} was trimmed`);
        if (s.capped && s.sets < 2) problems.push(`${where(c, p)}: ${p.exercises[i].id} trimmed to ${s.sets} set`);
      });
      for (const cap of p.day.caps || []) {
        const idx = p.exercises.map((ex, i) => i).filter((i) => app.matchesCap(p.exercises[i], cap));
        const total = idx.reduce((n, i) => n + p.schemes[i].sets, 0);
        const trimmable = idx.some((i) => !p.anchorIds.has(p.exercises[i].id) && p.schemes[i].sets > 2);
        if (total > cap.cap && trimmable) problems.push(`${where(c, p)}: ${total} sets for ${cap.group || cap.tag}, cap ${cap.cap}`);
      }
    }
  }
  return problems;
});

check('never more than one calf raise in a session', () => {
  const problems = [];
  for (const c of configs()) {
    for (const w of weeks) for (const p of c.plans[w]) {
      const calves = p.exercises.filter((ex) => ex.tags.includes('calf'));
      const asked = Math.max(0, ...p.day.slots.filter((s) => s.tag === 'calf').map((s) => s.count));
      if (calves.length > Math.max(1, asked)) problems.push(`${where(c, p)}: ${ids(calves)}`);
    }
  }
  return problems;
});

check('bodyweight limits: none in a full gym, at most one with free weights, only bodyweight in calisthenics', () => {
  const problems = [];
  for (const c of configs()) {
    for (const w of weeks) for (const p of c.plans[w]) {
      const body = p.exercises.filter(app.isBodyPick);
      if (c.equip === 'gym' && c.goal === 'build' && body.length) problems.push(`${where(c, p)}: ${ids(body)}`);
      if (c.equip === 'free' && c.goal === 'build' && body.length > app.BODY_CAP.free) problems.push(`${where(c, p)}: ${ids(body)}`);
      if (c.equip === 'body') {
        const loaded = p.exercises.filter((ex) => app.equipOf(ex) !== 'body');
        if (loaded.length) problems.push(`${where(c, p)}: ${ids(loaded)}`);
      }
    }
  }
  return problems;
});

check('HIIT goal: no avoided lifts, and its core and glute slots are always there', () => {
  const problems = [];
  const goal = app.GOALS.fatloss;
  const avoid = new Set(goal.avoid);
  for (const c of configs({ goals: ['fatloss'] })) {
    for (const w of weeks) for (const p of c.plans[w]) {
      const bad = p.exercises.filter((ex) => avoid.has(ex.id));
      if (bad.length) problems.push(`${where(c, p)}: ${ids(bad)}`);
      for (const slot of goal.extraSlots[p.day.key] || []) {
        const n = countTag(p.exercises, slot.tag);
        if (n < slot.count) problems.push(`${where(c, p)}: ${n}/${slot.count} ${slot.tag}`);
      }
    }
  }
  return problems;
});

/* ------------------------------ double progression ------------------------------ */

check('double progression: top reps on every set adds weight, anything less holds, undo takes it back', () => {
  const problems = [];
  const expect = (what, got, want) => { if (got !== want) problems.push(`${what}: got ${got}, want ${want}`); };
  configure('twice', 'gym', 'build');
  const hyper = app.PHASES.find((p) => p.key === 'hypertrophy');
  const deload = app.PHASES.find((p) => p.key === 'deload');
  const scheme = { sets: 4, repsLo: 8, repsHi: 12 };
  const upper = ALL_EX.find((ex) => ex.group === 'chest' && ex.tags.includes('compound') && app.equipOf(ex) === 'free');
  const lower = ALL_EX.find((ex) => ex.group === 'legs' && ex.tags.includes('quad') && ex.tags.includes('compound') && app.equipOf(ex) !== 'body');
  const body = ALL_EX.find((ex) => app.isBodyPick(ex));
  const reset = () => { state.anchors = {}; state.done = {}; state.reps = {}; state.baselines = {}; };
  const log = (date, ex, sets, reps) => {
    (state.done[date] = state.done[date] || {})[ex.id] = sets;
    (state.reps[date] = state.reps[date] || {})[ex.id] = reps;
  };
  const zoneW = (ex) => state.anchors[ex.id] && state.anchors[ex.id].zones.hypertrophy && state.anchors[ex.id].zones.hypertrophy.w;

  reset();
  state.baselines[upper.id] = { w: 60 };
  const start = app.derivedZoneWeight(upper, 'hypertrophy');
  log('2026-03-02', upper, 4, [12, 12, 12, 12]);
  expect(`${upper.id} all sets at 12`, app.evaluateAnchor('2026-03-02', upper, scheme, hyper), 'up');
  expect(`${upper.id} weight after a top session`, zoneW(upper), start + 2.5);
  expect('re-evaluating the same day changes nothing', (app.evaluateAnchor('2026-03-02', upper, scheme, hyper), zoneW(upper)), start + 2.5);
  log('2026-03-02', upper, 4, [12, 12, 11, 12]);
  expect('one set short of the top', app.evaluateAnchor('2026-03-02', upper, scheme, hyper), 'hold');
  expect('weight after editing a set down (bump taken back)', zoneW(upper), start);
  log('2026-03-02', upper, 3, [12, 12, 12]);
  expect('only 3 of 4 sets done', app.evaluateAnchor('2026-03-02', upper, scheme, hyper), 'pending');
  expect('weight while unfinished', zoneW(upper), start);
  log('2026-03-02', upper, 4, [12, 12, 12, 12]);
  app.evaluateAnchor('2026-03-02', upper, scheme, hyper);
  log('2026-03-30', upper, 4, [12, 12, 12, 12]);
  app.evaluateAnchor('2026-03-30', upper, scheme, hyper);
  expect('two top sessions a cycle apart', zoneW(upper), start + 5);

  reset();
  state.baselines[lower.id] = { w: 100 };
  log('2026-03-03', lower, 4, [12, 12, 12, 12]);
  app.evaluateAnchor('2026-03-03', lower, scheme, hyper);
  expect(`${lower.id} (legs) steps by 5 kg`, zoneW(lower), app.derivedZoneWeight(lower, 'hypertrophy') + 5);

  reset();
  state.baselines[upper.id] = { w: 8, plates: true };
  log('2026-03-02', upper, 4, [12, 12, 12, 12]);
  app.evaluateAnchor('2026-03-02', upper, scheme, hyper);
  expect('plate-loaded machines step by one plate', zoneW(upper), app.derivedZoneWeight(upper, 'hypertrophy') + 1);

  reset();
  state.baselines[upper.id] = { w: 60 };
  log('2026-03-23', upper, 4, [12, 12, 12, 12]);
  expect('deload weeks never progress', app.evaluateAnchor('2026-03-23', upper, scheme, deload), null);
  log('2026-03-02', body, 4, [12, 12, 12, 12]);
  expect('bodyweight anchors progress by reps, not weight', app.evaluateAnchor('2026-03-02', body, scheme, hyper), null);
  reset();
  return problems;
});

/* ------------------------------ summary ------------------------------ */

const failed = results.filter((r) => r.problems.length);
console.log(`\n${results.length - failed.length} of ${results.length} planner checks passed` +
  ` (${planCache.size} configurations × ${WEEKS} weeks).`);
process.exitCode = failed.length ? 1 : 0;
