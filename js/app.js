/* Stay Strong — weekly plan generator + UI.
 * Every calendar week gets a deterministic seed, so the plan is stable within
 * a week but different from every other week: new exercise combos, new
 * set/rep schemes (4-week phase cycle) and adjusted weight suggestions.
 */

'use strict';

const APP_VERSION = 36;  // keep in step with VERSION in sw.js and ?v= in index.html

/* ------------------------------ training phases ------------------------------ */
/* 4-week cycle. pct scales the user's saved working weight (a comfortable
 * ~10-rep load). Isolation moves never drop below 8 reps, even in strength week. */
const PHASES = [
  {
    key: 'hypertrophy', name: 'Hypertrophy', icon: 'dumbbell',
    desc: 'Muscle-building week: moderate weight, controlled 2–3 second negatives.',
    sets: [3, 4], reps: [[8, 12], [10, 12]], rest: '60–90 s',
    tempo: '1 s up · squeeze · 2–3 s down', restSec: 75,
    pct: 1.0, isoPct: 1.0, isoReps: [[10, 12], [12, 15]],
  },
  {
    key: 'strength', name: 'Strength', icon: 'bolt',
    desc: 'Heavy week: bigger loads, fewer reps, full rests between sets.',
    sets: [4, 5], reps: [[4, 6], [5, 6]], rest: '2–3 min',
    tempo: 'drive up hard · 2 s down', restSec: 150,
    pct: 1.15, isoPct: 1.05, isoReps: [[8, 10], [8, 12]],
  },
  {
    key: 'volume', name: 'Volume', icon: 'flame',
    desc: 'Pump week: lighter weight, high reps, short rests. Chase the burn.',
    sets: [3, 3], reps: [[12, 15], [15, 20]], rest: '45–60 s',
    tempo: 'steady rhythm · 1–2 s each way', restSec: 50,
    pct: 0.85, isoPct: 0.85, isoReps: [[15, 20], [12, 15]],
  },
  {
    key: 'deload', name: 'Deload', icon: 'moon',
    desc: 'Recovery week: light and easy on purpose. Perfect form, leave energy in the tank — you grow while you recover.',
    sets: [2, 3], reps: [[10, 12], [10, 12]], rest: '60 s',
    tempo: 'slow & perfect · 3 s down', restSec: 60,
    pct: 0.6, isoPct: 0.6, isoReps: [[10, 12], [12, 15]],
  },
];

/* ------------------------------ training goals ------------------------------ */
/* Two people can share the same link and the same workout day: the exercise
 * selection comes from the calendar week (identical on every phone), while
 * the goal chosen on each device adjusts reps, rests and weight suggestions. */
const GOALS = {
  build: {
    key: 'build', name: 'Build muscle', icon: 'dumbbell',
    short: 'Strength & size',
    desc: 'Full rests and progressive overload — maximum strength and size.',
    repsDelta: 0, restMult: 1, pctMult: 1, finisher: false,
  },
  fatloss: {
    key: 'fatloss', name: 'HIIT · Lean & toned', icon: 'flame',
    short: 'HIIT, core & glutes',
    desc: 'Same training days as your partner, but higher reps, supersets and short rests to keep the heart rate up, core work on push and arm days, glute focus on leg day, and a HIIT finisher. No chest-building or heavy arm-isolation lifts.',
    repsDelta: 3, restMult: 0.6, restMin: 30, pctMult: 0.85, finisher: true, supersets: true,
    // Never scheduled in this mode (chest growth / heavy arm isolation / traps).
    avoid: [
      'ch-bench-press', 'ch-smith-flat', 'ch-smith-incline', 'ch-pec-deck', 'ch-cable-cross',
      'ch-flat-fly', 'ch-low-cable-fly', 'ch-flat-db-press', 'ch-floor-press',
      'ar-concentration', 'ar-skull', 'ar-spider-curl', 'ar-cgbp', 'ar-preacher', 'ar-db-skull',
      'bk-shrug',
      'ch-incline-bb', 'ch-decline-db', 'ch-incline-fly', 'ch-incline-machine', 'ch-cable-press', 'ch-squeeze-press', 'ar-decline-skull', 'ar-db-preacher',
    ],
    // Guaranteed per day on top of the shared plan.
    extraSlots: {
      shoulders: [{ tag: 'core', count: 1 }],
      legs: [{ tag: 'glute', count: 2 }],
      chest: [{ tag: 'core', count: 2 }],
      arms: [{ tag: 'core', count: 1 }],
      // the twice-a-week split
      upper: [{ tag: 'core', count: 1 }],
      lower: [{ tag: 'glute', count: 2 }],
      push: [{ tag: 'core', count: 2 }],
      pull: [{ tag: 'core', count: 1 }],
      legs2: [{ tag: 'glute', count: 2 }],
    },
  },
};

/* ------------------------------ equipment profiles ------------------------------ */
const EQUIPMENT = {
  gym:  { key: 'gym',  name: 'Full gym',      icon: 'machine', allow: ['machine', 'free', 'body'],
          desc: 'Machines, cables, racks and free weights — everything.' },
  free: { key: 'free', name: 'Free weights',  icon: 'dumbbell', allow: ['free', 'body'],
          desc: 'Dumbbells, a barbell and a bench — home or garage gym.' },
  body: { key: 'body', name: 'Calisthenics',  icon: 'pullupBar', allow: ['body'],
          desc: 'Bodyweight only — a pull-up bar and a bench or box.' },
};

function dayName(day) { return currentGoal().supersets && day.hiitName ? day.hiitName : day.name; }

const FINISHERS = [
  { name: 'Incline Treadmill Walk', time: '12 min',
    how: 'Speed 5.5–6.5 km/h, incline 10–12%. Steady pace — you should just about be able to talk.' },
  { name: 'Bike Intervals', time: '10 min',
    how: '30 s fast pedalling, 60 s easy — repeat 7 rounds, then 1 min easy spin to finish.' },
  { name: 'Rowing Machine', time: '8 min',
    how: 'Smooth steady strokes: push with the legs, then lean back, then pull the arms. Aim for a pace you can hold the full 8 minutes.' },
  { name: 'Stair Climber', time: '10 min',
    how: 'Steady climb, hands resting lightly — no locking your arms on the rails and hanging.' },
  { name: 'Elliptical Push', time: '12 min',
    how: 'Alternate 2 min moderate and 1 min hard resistance. Full strides, tall posture.' },
  { name: 'Fast Flat Walk', time: '15 min',
    how: 'Brisk treadmill walk straight after the weights — easy on the joints and great for fat burn.' },
];

/* HIIT finishers for the lean-and-toned goal (deload weeks fall back to the
 * steady list above). video = curated YouTube id where useful. */
const HIIT_FINISHERS = [
  { name: 'Bike Sprints', time: '8 min',
    how: '8 rounds: 20 s all-out sprint, 40 s easy spin. The last two rounds should feel almost impossible.' },
  { name: 'Rower Intervals', time: '10 min',
    how: '10 rounds: 30 s hard (drive with the legs), 30 s easy. Try to hold the same split every round.' },
  { name: 'Treadmill Hill Sprints', time: '9 min',
    how: '6 rounds: 30 s fast on an 8–10% incline, 60 s walking. Hands off the rails.' },
  { name: 'Kettlebell Swing EMOM', time: '10 min', video: 'B_x0tp3HIbk',
    how: 'Every minute on the minute: 15 swings, rest the remainder of the minute. Hinge at the hips and snap them forward — it is not a squat.' },
  { name: 'Bodyweight Circuit', time: '12 min',
    how: '4 rounds: 12 squat jumps, 20 mountain climbers, 8 burpees, 30 s plank. Rest 45 s between rounds.' },
  { name: 'Stair Climber Intervals', time: '10 min',
    how: '8 rounds: 45 s fast, 45 s easy. No leaning on the rails.' },
];

function currentGoal() { return GOALS[state.goal] || GOALS.build; }
function currentEquip() { return EQUIPMENT[state.equip] || EQUIPMENT.gym; }

/* ------------------------------ training splits ------------------------------ */
/* Which five days make up the week. The twice-a-week layout is the default
 * for new users: the research on training frequency favours hitting each
 * muscle twice a week over once. The body-part split stays for those who
 * prefer it (or whose partner is on it). */
const SPLITS = {
  twice: {
    key: 'twice', name: 'Upper · Lower · Push · Pull · Legs', badge: '2×', days: DAYS_TWICE,
    short: 'Every muscle twice a week — recommended',
    desc: 'Mon upper body, Tue lower, Wed push, Thu pull, Fri legs. Each muscle is trained twice a week, which the research on training frequency favours for growth.',
  },
  bodypart: {
    key: 'bodypart', name: 'One muscle group a day', badge: '1×', days: DAYS,
    short: 'Shoulders · Back · Legs · Chest · Arms',
    desc: 'The classic body-part split: one muscle group per day, once a week. Simple, and the easiest to share with a partner.',
  },
};
function currentSplit() { return SPLITS[state.split] || SPLITS.bodypart; }
function currentDays() { return currentSplit().days; }
/* The five-day list a day object belongs to (either split can be planned). */
function daysOf(day) { return Object.values(SPLITS).map((s) => s.days).find((d) => d.includes(day)) || currentDays(); }
/* What the current equipment profile may schedule. With weights available,
 * bodyweight moves are limited to the gym staples (pull-ups, chin-ups, dips,
 * Nordic curls, push-up and bench-dip finishers…) plus core work; the
 * calisthenics fillers only appear in Calisthenics mode. */
function allowed(ex) {
  const eq = currentEquip();
  const kind = equipOf(ex);
  if (!eq.allow.includes(kind)) return false;
  if (kind === 'body' && eq.key !== 'body') {
    // Core work is allowed everywhere (the HIIT goal needs it). Otherwise a
    // full gym never schedules bodyweight; free weights may use a staple.
    if (ex.tags.includes('core')) return true;
    return eq.key === 'free' && !!ex.staple;
  }
  return true;
}
/* And even staples are capped: at most one bodyweight exercise (core aside)
 * per day when weights are available, so a Build muscle day stays loaded.
 * The cap lifts only when a day cannot otherwise be filled (e.g. the HIIT
 * goal's push day, which avoids nearly every loaded chest lift). */
const BODY_CAP = { gym: 0, free: 1 };   // per equipment mode; calisthenics is uncapped
const isBodyPick = (ex) => equipOf(ex) === 'body' && !ex.tags.includes('core');
function bodyCapped(list) {
  const cap = BODY_CAP[currentEquip().key];
  return cap !== undefined && list.filter(isBodyPick).length >= cap;
}
/* Equipment physically available, ignoring the staple rule — the fallback pool.
 * A full gym still never falls back to bodyweight for Build muscle; the HIIT
 * goal may (its push day avoids nearly every loaded chest lift on purpose). */
function baseAllowed(ex) {
  const eq = currentEquip();
  if (!eq.allow.includes(equipOf(ex))) return false;
  return !(eq.key === 'gym' && isBodyPick(ex) && currentGoal().key !== 'fatloss');
}

const KG_PER_LB = 0.45359237;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
// A Monday long before any user data, so week indices are stable positive ints.
const WEEK_EPOCH = Date.UTC(2001, 0, 1);

/* ------------------------------ storage ------------------------------ */
const store = {
  read(key, fallback) {
    try {
      // NOTE: the 'ironweek.' storage prefix predates the Stay Strong rename;
      // it stays so nobody loses their saved weights and progress.
      const raw = localStorage.getItem('ironweek.' + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  },
  write(key, value) {
    try { localStorage.setItem('ironweek.' + key, JSON.stringify(value)); } catch { /* private mode */ }
  },
};

const state = {
  view: 'workout',                                 // 'workout' | 'history' | 'settings'
  weekOffset: 0,                                   // 0 = current week
  selectedDay: defaultDayIndex(),
  unit: store.read('unit', 'kg'),                  // 'kg' | 'lb'
  goal: store.read('goal', null),                  // 'build' | 'fatloss'
  equip: store.read('equip', 'gym'),               // 'gym' | 'free' | 'body'
  profile: store.read('profile', null),            // { name, onboarded }
  baselines: store.read('baselines', {}),          // { exId: { w: kg, c: cycleWhenSet, plates } }
  done: store.read('done', {}),                    // { 'YYYY-MM-DD': { exId: completedSets } }
  swaps: store.read('swaps', {}),                  // { 'YYYY-MM-DD': { plannedExId: swappedInExId } } — "machine busy" swaps
  sessions: store.read('sessions', {}),            // { 'YYYY-MM-DD': { day, name, sets, total, completed, ex } }
  prs: store.read('prs', []),                      // [{ id, name, w, plates, date }]
  split: store.read('split', 'bodypart'),          // 'twice' | 'bodypart' — which five-day layout
  reps: store.read('reps', {}),                    // { 'YYYY-MM-DD': { exId: [reps per set] } }
  anchors: store.read('anchors', {}),              // { exId: { zones: { hypertrophy|strength|volume: { w } }, applied: { date: { zone, outcome, step, at } } } }
  editSet: null,                                   // { date, ex, set } — the done set whose reps are being adjusted
  ob: { goal: 'build', equip: 'gym', split: 'twice' },   // onboarding choices in progress
};
// Phones that picked a goal before onboarding existed skip straight in.
if (!state.profile && state.goal) { state.profile = { name: '', onboarded: true }; store.write('profile', state.profile); }

/* ------------------------------ date helpers ------------------------------ */
function startOfWeekUTC(date) {
  const d = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dow = (new Date(d).getUTCDay() + 6) % 7;   // Mon=0 … Sun=6
  return d - dow * MS_PER_DAY;
}

function currentWeekIndex() {
  return Math.floor((startOfWeekUTC(new Date()) - WEEK_EPOCH) / MS_PER_WEEK);
}

function weekIndexOfISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const utc = Date.UTC(y, m - 1, d);
  const dow = (new Date(utc).getUTCDay() + 6) % 7;
  return Math.floor((utc - dow * MS_PER_DAY - WEEK_EPOCH) / MS_PER_WEEK);
}

function displayedWeekIndex() { return currentWeekIndex() + state.weekOffset; }

function displayedWeekMonday() {
  return new Date(WEEK_EPOCH + displayedWeekIndex() * MS_PER_WEEK);
}

function isoWeekNumber(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7));   // nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function dayDateISO(dayIdx) {
  const d = new Date(displayedWeekMonday().getTime() + dayIdx * MS_PER_DAY);
  return d.toISOString().slice(0, 10);
}

function todayISO() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

function defaultDayIndex() {
  const dow = (new Date().getDay() + 6) % 7;       // Mon=0 … Sun=6
  return dow <= 4 ? dow : 0;                       // weekend → show Monday
}

/* ------------------------------ seeded randomness ------------------------------ */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ------------------------------ plan generation ------------------------------ */
function phaseForWeek(weekIdx) { return PHASES[((weekIdx % 4) + 4) % 4]; }
function cycleForWeek(weekIdx) { return Math.floor(weekIdx / 4); }

/* Pick this week's exercises for a day, with two guarantees on top of the
 * weekly shuffle:
 *  - ANTI-REPEAT: exercises used last week go to the back of the queue, so
 *    every slot rotates through its alternatives instead of re-picking
 *    favourites. The week-by-week chain is anchored at a fixed calendar
 *    week, so every phone replays the identical history.
 *  - WEEK FLAVOUR: strength weeks prefer big compound lifts, volume weeks
 *    prefer isolation/cable pump work — each type of week feels different.
 * Selection never depends on the device's goal, so two people training
 * together (with the same equipment) still see the same exercises. */
const ANTI_REPEAT_ANCHOR = Math.floor((Date.UTC(2026, 0, 5) - WEEK_EPOCH) / MS_PER_WEEK);

/* Slots can pin a tag to one pool (`from`), e.g. a chest press on upper day. */
const matchesSlot = (ex, slot) => ex.tags.includes(slot.tag) && (!slot.from || ex.group === slot.from);
const slotKey = (slot) => slot.tag + (slot.from ? '@' + slot.from : '');

/* ANCHOR LIFTS: each day's main movement(s) are fixed for a whole 4-week cycle
 * so they can be practised and progressed (double progression, see the reps
 * section), then rotated to a fresh candidate next cycle. Chosen with a
 * cycle-level replay so every phone agrees, with last cycle's anchors sent to
 * the back of the queue and no exercise anchoring two days of one split.
 * Outside calisthenics mode an anchor is always a loaded lift. */
const ANCHOR_CYCLE_START = Math.floor(ANTI_REPEAT_ANCHOR / 4);
const anchorCache = new Map();
function anchorCandidates(day, spec) {
  const loadedOnly = currentEquip().key !== 'body';
  return dayPool(day).filter((ex) => allowed(ex) && matchesSlot(ex, spec) &&
    !ex.tags.includes('core') && !ex.tags.includes('finisher') &&
    (spec.iso || ex.tags.includes('compound')) && !(loadedOnly && isBodyPick(ex)));
}
function cycleAnchors(days, cycleIdx) {
  const key = `${state.equip}|${days[0].key}|${cycleIdx}`;
  if (anchorCache.has(key)) return anchorCache.get(key);
  const last = {};   // exercise id -> last cycle it anchored
  const stale = (id, c) => Math.min(2, c - (id in last ? last[id] : -99));
  let result = new Map();
  for (let c = Math.min(cycleIdx, ANCHOR_CYCLE_START); c <= cycleIdx; c++) {
    result = new Map();
    const taken = new Set();
    days.forEach((day, dayIdx) => {
      const rng = mulberry32(c * 2797 + dayIdx * 431 + 3);
      const picks = [];
      for (const spec of day.anchors || []) {
        const cands = seededShuffle(anchorCandidates(day, spec), rng)
          .map((ex, i) => ({ ex, i }))
          .sort((a, b) => (stale(b.ex.id, c) - stale(a.ex.id, c)) || (a.i - b.i))
          .map((o) => o.ex);
        let n = spec.count;
        for (const ex of cands) {
          if (n <= 0) break;
          if (!taken.has(ex.id)) { picks.push(ex); taken.add(ex.id); n--; }
        }
      }
      picks.forEach((ex) => { last[ex.id] = c; });
      result.set(day.key, picks);
    });
  }
  anchorCache.set(key, result);
  return result;
}
function anchorsFor(day, weekIdx) {
  return cycleAnchors(daysOf(day), cycleForWeek(weekIdx)).get(day.key) || [];
}

/* VOLUME CAP: around 12 hard sets per muscle per session is where the research
 * shows returns flattening, so once the week's schemes are drawn, sets are
 * trimmed from the last accessories (never below 2, never from an anchor)
 * until each of the day's muscle groups is under its cap. */
const matchesCap = (ex, cap) => (cap.group && ex.group === cap.group) || (cap.tag && ex.tags.includes(cap.tag));
function applyVolumeCaps(exercises, schemes, day, anchorIds) {
  for (const cap of day.caps || []) {
    const idx = exercises.map((ex, i) => i).filter((i) => matchesCap(exercises[i], cap));
    const total = () => idx.reduce((n, i) => n + schemes[i].sets, 0);
    for (let guard = 0; guard < 40 && total() > cap.cap; guard++) {
      const i = idx.slice().reverse().find((j) => !anchorIds.has(exercises[j].id) && schemes[j].sets > 2);
      if (i === undefined) break;
      schemes[i] = { ...schemes[i], sets: schemes[i].sets - 1, capped: true };
    }
  }
  return schemes;
}

function pickExercises(day, weekIdx, dayIdx) {
  const days = daysOf(day);
  // Some days avoid repeating an earlier day's picks in the same week (push and
  // pull after upper, the second leg day after the first).
  const base = day.exclude ? days.find((d) => d.key === day.exclude) : null;
  const baseIdx = base ? days.indexOf(base) : -1;
  const lastUsed = {};   // exercise id -> last week it was in the shared plan
  const lastMine = {};   // same for the goal-adjusted plan
  const baseUsed = {}, baseMine = {};
  let mine = null;
  for (let w = Math.min(weekIdx, ANTI_REPEAT_ANCHOR); w <= weekIdx; w++) {
    let exclude = null;
    if (base) {   // the paired day's plan this week, shared and goal-adjusted alike
      const bp = pickWeek(base, w, baseIdx, baseUsed);
      bp.forEach((ex) => { baseUsed[ex.id] = w; });
      const bm = applyGoal(bp, base, w, baseIdx, baseMine);
      bm.forEach((ex) => { baseMine[ex.id] = w; });
      exclude = new Set(bp.concat(bm).map((ex) => ex.id));
    }
    const picks = pickWeek(day, w, dayIdx, lastUsed, exclude);
    picks.forEach((ex) => { lastUsed[ex.id] = w; });
    mine = applyGoal(picks, day, w, dayIdx, lastMine, exclude);
    mine.forEach((ex) => { lastMine[ex.id] = w; });
  }
  return mine;
}

/* How long ago an exercise was last scheduled, capped at 3: anything unused
 * for three weeks or more counts the same, so the weekly flavour (compounds
 * on strength weeks, pump work on volume weeks) still decides among them. */
function staleness(lastWeek, weekIdx, id) {
  return Math.min(3, weekIdx - (id in lastWeek ? lastWeek[id] : -99));
}

/* Goal-specific adjustments on top of the shared plan: drop anything the
 * goal avoids, guarantee its extra slots (core / glute work), and refill from
 * the same day's pool — with last week's substitutions sent to the back of
 * the queue so they rotate too. Everything not touched stays identical to the
 * partner's plan, so most of the session is still shared. */
/* The exercises a training day can draw from: its own pool, plus moves from
 * other pools that list it under `also` (e.g. chin-ups and dips double as arm
 * work). Borrowed moves come after the day's own, so they only get picked when
 * the native pool runs short — which is exactly the calisthenics case. */
function poolsOf(dayOrKey) { return typeof dayOrKey === 'string' ? [dayOrKey] : (dayOrKey.pools || [dayOrKey.key]); }
function dayPool(dayOrKey) {
  const pools = poolsOf(dayOrKey);
  const own = pools.flatMap((k) => EXERCISE_DB[k] || []);
  const seen = new Set(own.map((ex) => ex.id));
  const borrowed = Object.values(EXERCISE_DB).flat()
    .filter((ex) => !seen.has(ex.id) && ex.also && ex.also.some((k) => pools.includes(k)));
  return own.concat(borrowed);
}
function isBorrowed(ex, dayOrKey) { return !poolsOf(dayOrKey).includes(ex.group); }

function applyGoal(picks, day, weekIdx, dayIdx, lastMine, exclude) {
  const goal = currentGoal();
  if (!goal.avoid) return picks;
  const avoid = new Set(goal.avoid);
  const rng = mulberry32(weekIdx * 4241 + dayIdx * 613 + 7);
  // Another day's anchors and a paired day's picks go to the back of the refill queue.
  const others = new Set();
  for (const [k, list] of cycleAnchors(daysOf(day), cycleForWeek(weekIdx))) if (k !== day.key) list.forEach((ex) => others.add(ex.id));
  const excluded = (ex) => ((exclude && exclude.has(ex.id)) || others.has(ex.id) ? 1 : 0);
  const pool = seededShuffle(dayPool(day).concat(EXERCISE_DB.core), rng)
    .map((ex, i) => ({ ex, i }))
    .sort((a, b) =>
      (excluded(a.ex) - excluded(b.ex)) ||
      (staleness(lastMine, weekIdx, b.ex.id) - staleness(lastMine, weekIdx, a.ex.id)) ||
      (isBorrowed(a.ex, day) - isBorrowed(b.ex, day)) ||
      (a.i - b.i))
    .map((o) => o.ex)
    .filter((ex) => !avoid.has(ex.id) && allowed(ex));
  const out = picks.filter((ex) => !avoid.has(ex.id));
  const taken = new Set(out.map((ex) => ex.id));
  const has = (ex, tag) => ex.tags.includes(tag);
  const count = (tag) => out.filter((ex) => has(ex, tag)).length;
  const add = (pred, n) => {
    for (const ex of pool) {
      if (n <= 0) break;
      if (!taken.has(ex.id) && pred(ex) && !(isBodyPick(ex) && bodyCapped(out))) { out.push(ex); taken.add(ex.id); n--; }
    }
  };
  const extras = goal.extraSlots[day.key] || [];
  for (const slot of extras) add((ex) => has(ex, slot.tag), slot.count - count(slot.tag));
  add((ex) => !has(ex, 'core'), day.picks - out.length);
  if (out.length < day.picks) {   // thin pool for this goal + equipment: fill from anything the kit allows, cap lifted
    const relaxed = seededShuffle(dayPool(day), mulberry32(weekIdx * 4241 + dayIdx * 613 + 11))
      .filter((ex) => !avoid.has(ex.id) && baseAllowed(ex) && !has(ex, 'core'));
    for (const ex of relaxed) {
      if (out.length >= day.picks) break;
      if (!taken.has(ex.id)) { out.push(ex); taken.add(ex.id); }
    }
  }

  // Trim back to the day's size without breaking any slot rule (shared or
  // extra): drop isolation work first, compounds second, never core.
  const slots = day.slots.concat(extras);
  const anchorIds = new Set(anchorsFor(day, weekIdx).map((ex) => ex.id));
  const countSlot = (s) => out.filter((ex) => matchesSlot(ex, s)).length;
  const removable = (i) => !has(out[i], 'core') && !anchorIds.has(out[i].id) &&
    slots.every((s) => !matchesSlot(out[i], s) || countSlot(s) - 1 >= s.count);
  while (out.length > day.picks) {
    let idx = -1;
    for (let i = out.length - 1; i >= 0 && idx < 0; i--) if (removable(i) && !has(out[i], 'compound')) idx = i;
    for (let i = out.length - 1; i >= 0 && idx < 0; i--) if (removable(i)) idx = i;
    out.splice(idx < 0 ? out.length - 1 : idx, 1);
  }
  // Same ordering as the shared plan: anchors, then compounds, finishers late, core last.
  out.sort((a, b) => (anchorIds.has(b.id) - anchorIds.has(a.id)) || (has(a, 'core') - has(b, 'core')) ||
    (has(a, 'finisher') - has(b, 'finisher')) || (has(b, 'compound') - has(a, 'compound')));
  return out;
}

function pickWeek(day, weekIdx, dayIdx, lastUsed, exclude) {
  const rng = mulberry32(weekIdx * 7919 + dayIdx * 104729 + 17);
  const phase = phaseForWeek(weekIdx);
  // With weights available, loaded exercises come before bodyweight ones.
  const loadedLast = (ex) => (currentEquip().key !== 'body' && equipOf(ex) === 'body') ? 1 : 0;
  const flavour = (ex) => {
    if (phase.key === 'strength') return ex.tags.includes('compound') ? 0 : 1;
    if (phase.key === 'volume') return ex.tags.includes('compound') ? 1 : 0;
    return 0;
  };
  // Anchors first: they hold their slots for the whole cycle. Another day's
  // anchors, and anything already used this week on a paired day, go to the
  // back of the accessory queue.
  const anchors = anchorsFor(day, weekIdx);
  const others = new Set();
  for (const [k, list] of cycleAnchors(daysOf(day), cycleForWeek(weekIdx))) if (k !== day.key) list.forEach((ex) => others.add(ex.id));
  const excluded = (ex) => ((exclude && exclude.has(ex.id)) || others.has(ex.id) ? 1 : 0);
  const sorted = seededShuffle(dayPool(day), rng)
    .map((ex, i) => ({ ex, i }))
    .sort((a, b) =>
      (excluded(a.ex) - excluded(b.ex)) ||
      (staleness(lastUsed, weekIdx, b.ex.id) - staleness(lastUsed, weekIdx, a.ex.id)) ||
      (isBorrowed(a.ex, day) - isBorrowed(b.ex, day)) ||
      (loadedLast(a.ex) - loadedLast(b.ex)) ||
      (flavour(a.ex) - flavour(b.ex)) ||
      (a.i - b.i))
    .map((o) => o.ex);
  const pool = sorted.filter(allowed);

  const chosen = anchors.slice();
  const taken = new Set(anchors.map((ex) => ex.id));
  const need = {};
  for (const slot of day.slots) need[slotKey(slot)] = slot.count;
  for (const ex of anchors) {
    const slot = day.slots.find((s) => need[slotKey(s)] > 0 && matchesSlot(ex, s));
    if (slot) need[slotKey(slot)]--;
  }
  const fill = (from, ok) => {
    for (const slot of day.slots) {
      for (const ex of from) {
        if (need[slotKey(slot)] <= 0) break;
        if (ok(ex) && matchesSlot(ex, slot)) { chosen.push(ex); taken.add(ex.id); need[slotKey(slot)]--; }
      }
    }
    for (const ex of from) {
      if (chosen.length >= day.picks) break;
      if (ok(ex)) { chosen.push(ex); taken.add(ex.id); }
    }
  };
  fill(pool, (ex) => !taken.has(ex.id) && !(isBodyPick(ex) && bodyCapped(chosen)));
  // Thin pool for this mode? Fill the rest from anything the equipment allows, cap lifted.
  if (chosen.length < day.picks || Object.values(need).some((n) => n > 0)) {
    fill(sorted.filter(baseAllowed), (ex) => !taken.has(ex.id));
  }

  const isAnchor = (ex) => anchors.includes(ex);
  const isCompound = (ex) => ex.tags.includes('compound');
  const isFinisher = (ex) => ex.tags.includes('finisher');
  chosen.sort((a, b) =>
    (isAnchor(b) - isAnchor(a)) || (isFinisher(a) - isFinisher(b)) || (isCompound(b) - isCompound(a)));
  return chosen.slice(0, day.picks);
}

/* Per-exercise scheme for the week: sets/reps drawn from the phase's options
 * with a seeded per-exercise variation, so schemes differ between exercises
 * and between weeks. */
function schemeFor(ex, phase, weekIdx, exOrdinal, isAnchor) {
  const rng = mulberry32(weekIdx * 31337 + exOrdinal * 977 + hashId(ex.id));
  const iso = !ex.tags.includes('compound');
  const goal = currentGoal();
  const repsOptions = iso ? phase.isoReps : phase.reps;
  // Anchors keep one fixed range and the fuller set count per phase, so double
  // progression compares like with like from cycle to cycle.
  let [lo, hi] = isAnchor ? repsOptions[0] : repsOptions[Math.floor(rng() * repsOptions.length)];
  lo = Math.min(lo + goal.repsDelta, 18);
  hi = Math.min(hi + goal.repsDelta, 22);
  const sets = isAnchor ? phase.sets[phase.sets.length - 1] : phase.sets[Math.floor(rng() * phase.sets.length)];
  const restSec = Math.max(goal.restMin || 40, Math.round((phase.restSec * goal.restMult) / 5) * 5);
  return {
    sets, repsLo: lo, repsHi: hi,
    restSec, rest: formatRest(restSec),
    pct: (iso ? phase.isoPct : phase.pct) * goal.pctMult,
  };
}

function formatRest(sec) {
  return sec >= 90 ? `${Math.round(sec / 30) / 2} min` : `${sec} s`;
}

function hashId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) | 0;
  return h;
}

/* A same-muscle stand-in for when the machine is taken. Prefers exercises
 * sharing a specific tag (quad, press, biceps, …) that aren't already in
 * today's plan; deterministic per week so it doesn't jump around. */
const GENERIC_TAGS = new Set(['compound', 'isolation', 'finisher']);
function specificTags(ex) { return ex.tags.filter((t) => !GENERIC_TAGS.has(t)); }

/* "Machine busy?" — another exercise for the same muscles, from the equipment
 * you have, that isn't already in today's plan. Stable for the week. */
function swapSuggestion(ex, day, chosenIds, weekIdx) {
  const avoid = new Set(currentGoal().avoid || []);
  const pool = (ex.tags.includes('core') ? EXERCISE_DB.core : dayPool(day)).filter(allowed);
  const specific = specificTags(ex);
  const c = pool.filter((e) => e.id !== ex.id && !chosenIds.has(e.id) && !avoid.has(e.id) &&
    e.tags.some((t) => specific.includes(t)));
  if (!c.length) return null;
  const rng = mulberry32(weekIdx * 52711 + hashId(ex.id));
  return c[Math.floor(rng() * c.length)];
}

/* The same movement for another equipment profile ("no machine? do this"). */
function altForEquip(ex, day, equipKey, weekIdx, chosenIds) {
  const pool = ex.tags.includes('core') ? EXERCISE_DB.core : dayPool(day);
  const specific = specificTags(ex);
  const avoid = new Set(currentGoal().avoid || []);
  const c = pool.filter((e) => e.id !== ex.id && equipOf(e) === equipKey && !avoid.has(e.id) &&
    !(chosenIds && chosenIds.has(e.id)) && e.tags.some((t) => specific.includes(t)));
  if (!c.length) return null;
  const rng = mulberry32(weekIdx * 7331 + hashId(ex.id) + equipKey.length);
  return c[Math.floor(rng() * c.length)];
}

/* Swap a planned exercise for one of its alternatives, for one day only.
 * The plan for the week is untouched; the card just becomes the other move. */
function swapExercise(dateISO, plannedId, altId) {
  if (!state.swaps[dateISO]) state.swaps[dateISO] = {};
  if (altId) state.swaps[dateISO][plannedId] = altId;
  else delete state.swaps[dateISO][plannedId];
  if (!Object.keys(state.swaps[dateISO]).length) delete state.swaps[dateISO];
  const keys = Object.keys(state.swaps).sort();
  while (keys.length > 60) delete state.swaps[keys.shift()];
  store.write('swaps', state.swaps);
}
function swappedFor(dateISO, plannedId) {
  const id = state.swaps[dateISO] && state.swaps[dateISO][plannedId];
  return id ? findExercise(id) : null;
}

/* Exact video per exercise (deep link → plays from YouTube app downloads
 * offline); falls back to a search if an exercise has no curated video. */
function videoUrl(ex) {
  const v = FORM_VIDEOS[ex.id];
  return v ? `https://www.youtube.com/watch?v=${v.id}` : videoSearchUrl(ex);
}
function videoSearchUrl(ex) {
  return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(ex.video || ex.name + ' proper form');
}
function playlistUrl(ids) {
  return 'https://www.youtube.com/watch_videos?video_ids=' + ids.join(',');
}

/* ------------------------------ weights ------------------------------ */
function suggestedWeightKg(ex, scheme, weekIdx) {
  const base = state.baselines[ex.id];
  if (!base || !base.w) return null;
  // +2.5% per completed 4-week cycle since the baseline was saved: steady
  // progressive overload without the user touching anything.
  const cyclesElapsed = Math.max(0, cycleForWeek(weekIdx) - (base.c ?? cycleForWeek(weekIdx)));
  const progress = 1 + 0.025 * cyclesElapsed;
  return base.w * scheme.pct * progress;
}

function formatWeight(kg) {
  if (kg == null) return null;
  if (state.unit === 'lb') {
    const lb = Math.round(kg / KG_PER_LB / 5) * 5;
    return `${Math.max(lb, 5)} lb`;
  }
  const rounded = Math.round(kg / 2.5) * 2.5;
  return `${Math.max(rounded, 2.5)} kg`;
}

function formatPlates(n) {
  if (n == null) return null;
  const plates = Math.max(1, Math.round(n));
  return `${plates} plate${plates === 1 ? '' : 's'}`;
}

function parseWeightInput(text) {
  const n = parseFloat(String(text).replace(',', '.'));
  if (!isFinite(n) || n <= 0) return null;
  return state.unit === 'lb' ? n * KG_PER_LB : n;
}

/* ------------------------------ set tracking & sessions ------------------------------ */
let currentPlan = null;   // { dateISO, dayIdx, exercises, schemes, sets: { exId: n } }

function doneCount(dateISO, exId) {
  return (state.done[dateISO] && state.done[dateISO][exId]) || 0;
}

function setDoneCount(dateISO, exId, count) {
  if (!state.done[dateISO]) state.done[dateISO] = {};
  state.done[dateISO][exId] = count;
  pruneDone();
  store.write('done', state.done);
  logSession(dateISO);
}

function pruneDone() {
  const keys = Object.keys(state.done).sort();
  while (keys.length > 60) delete state.done[keys.shift()];
}

/* ------------------------------ reps & double progression ------------------------------ */
/* Every ticked set logs its reps (the top of the range until you adjust it). */
function repsFor(dateISO, exId) { return (state.reps[dateISO] && state.reps[dateISO][exId]) || []; }
function setReps(dateISO, exId, setIdx, value) {
  if (!state.reps[dateISO]) state.reps[dateISO] = {};
  const arr = (state.reps[dateISO][exId] || []).slice();
  arr[setIdx] = value;
  state.reps[dateISO][exId] = arr;
  const keys = Object.keys(state.reps).sort();
  while (keys.length > 60) delete state.reps[keys.shift()];
  store.write('reps', state.reps);
}

/* Which working zone a week belongs to; the deload has none (60% of hypertrophy). */
const zoneOf = (phase) => (phase.key === 'deload' ? null : phase.key);
const anchorRec = (exId) => state.anchors[exId] || (state.anchors[exId] = { zones: {}, applied: {} });
function derivedZoneWeight(ex, zone) {
  const base = state.baselines[ex.id];
  if (!base || !base.w) return null;
  const phase = PHASES.find((p) => p.key === zone);
  return base.w * (ex.tags.includes('compound') ? phase.pct : phase.isoPct) * currentGoal().pctMult;
}
/* The weight an anchor is worked at: the zone's stored weight (typed in, or
 * raised by double progression), else derived from the saved ~10-rep load.
 * On a date already evaluated, the weight it was actually done at. */
function anchorWorkingWeight(ex, phase, dateISO) {
  const rec = state.anchors[ex.id];
  const ap = rec && rec.applied && dateISO && rec.applied[dateISO];
  if (ap && ap.at) return ap.at;
  const zone = zoneOf(phase) || 'hypertrophy';
  const z = rec && rec.zones && rec.zones[zone];
  const w = (z && z.w) || derivedZoneWeight(ex, zone);
  if (!w) return null;
  return zoneOf(phase) ? w : w * 0.6;
}
const anchorStep = (ex, plates) => (plates ? 1 : ['quad', 'ham', 'glute'].some((t) => ex.tags.includes(t)) ? 5 : 2.5);
const anchorEvents = [];   // outcomes that just changed, for a toast

/* DOUBLE PROGRESSION on anchor lifts: hit the top of the rep range on every
 * set and that zone's weight goes up for next cycle; otherwise hold the weight
 * and chase the reps. Idempotent: re-ticking, editing reps or undoing a set on
 * the same date re-evaluates and corrects the zone weight. */
function evaluateAnchor(dateISO, ex, scheme, phase) {
  const zone = zoneOf(phase);
  if (!zone || equipOf(ex) === 'body') return null;
  const done = doneCount(dateISO, ex.id);
  const reps = repsFor(dateISO, ex.id);
  const complete = done >= scheme.sets;
  const allTop = complete && Array.from({ length: scheme.sets }, (_, i) => reps[i] ?? scheme.repsHi).every((r) => r >= scheme.repsHi);
  const outcome = !complete ? 'pending' : allTop ? 'up' : 'hold';
  const prev = state.anchors[ex.id] && state.anchors[ex.id].applied && state.anchors[ex.id].applied[dateISO];
  if ((prev ? prev.outcome : 'pending') === outcome && (!prev || prev.zone === zone)) return outcome;
  const rec = anchorRec(ex.id);
  const plates = !!(state.baselines[ex.id] && state.baselines[ex.id].plates);
  const step = anchorStep(ex, plates);
  if (!rec.zones[zone] || !rec.zones[zone].w) { const d = derivedZoneWeight(ex, zone); if (d) rec.zones[zone] = { w: d }; }
  if (prev && prev.outcome === 'up' && rec.zones[prev.zone]) rec.zones[prev.zone].w -= prev.step;   // take back an earlier bump
  const at = rec.zones[zone] ? rec.zones[zone].w : null;
  if (outcome === 'up' && rec.zones[zone]) rec.zones[zone].w += step;
  if (outcome === 'pending') delete rec.applied[dateISO];
  else rec.applied[dateISO] = { zone, outcome, step, at };
  const keys = Object.keys(rec.applied).sort();
  while (keys.length > 12) delete rec.applied[keys.shift()];
  store.write('anchors', state.anchors);
  if (outcome !== 'pending') anchorEvents.push({ ex, outcome, at, step, plates, zone, hi: scheme.repsHi });
  return outcome;
}

/* The double-progression line under an anchor's set bubbles. */
function progressNote(ex, scheme, phase, dateISO) {
  const zone = zoneOf(phase);
  if (equipOf(ex) === 'body') return `<p class="prog-note">${ico('target')} Anchor lift — progress by reps: hit ${scheme.repsHi} on every set, then make the move harder.</p>`;
  if (!zone) return `<p class="prog-note">${ico('moon')} Anchor lift — deload: 60% of your hypertrophy weight, perfect form.</p>`;
  const rec = state.anchors[ex.id];
  const ap = rec && rec.applied && rec.applied[dateISO];
  const plates = !!(state.baselines[ex.id] && state.baselines[ex.id].plates);
  const fmt = (w) => (plates ? formatPlates(w) : formatWeight(w));
  const step = anchorStep(ex, plates);
  const week = `${phase.name.toLowerCase()} week`;
  if (ap && ap.outcome === 'up') {
    return ap.at
      ? `<p class="prog-note up">${ico('check')} ${scheme.repsHi} reps on every set at ${fmt(ap.at)} — next ${week}: <strong>${fmt(ap.at + step)}</strong></p>`
      : `<p class="prog-note up">${ico('check')} ${scheme.repsHi} reps on every set — enter your weight and it goes up next ${week}.</p>`;
  }
  if (ap && ap.outcome === 'hold') {
    return `<p class="prog-note hold">${ico('target')} ${ap.at ? `Hold ${fmt(ap.at)} next ${week}` : `Same weight next ${week}`} — chase ${scheme.repsHi} reps on all ${scheme.sets} sets, then it goes up.</p>`;
  }
  const w = anchorWorkingWeight(ex, phase, dateISO);
  return `<p class="prog-note">${ico('target')} Anchor lift — double progression: ${scheme.repsHi} reps on all ${scheme.sets} sets${w ? ` at ${fmt(w)}` : ''} → +${plates ? '1 plate' : formatWeight(step)} next ${week}.</p>`;
}

/* Set bubbles, plus the reps stepper for the done set being adjusted and, on
 * an anchor lift, the double-progression note. Re-rendered in place on every tick. */
function setsBlock(ex, scheme, dateISO, phase, isAnchor) {
  const completed = doneCount(dateISO, ex.id);
  const reps = repsFor(dateISO, ex.id);
  const edit = state.editSet && state.editSet.date === dateISO && state.editSet.ex === ex.id ? state.editSet.set : 0;
  const bubbles = Array.from({ length: scheme.sets }, (_, s) => `
    <button class="set-bubble ${s < completed ? 'done' : ''} ${edit === s + 1 ? 'editing' : ''}" type="button"
      data-ex="${ex.id}" data-set="${s + 1}" data-date="${dateISO}" data-rest="${scheme.restSec}"
      aria-label="${s < completed ? `Set ${s + 1}: ${reps[s] ?? scheme.repsHi} reps — tap to adjust` : `Mark set ${s + 1} done`}"><span class="sb-num">${s + 1}</span>${s < completed ? `<span class="sb-reps">${reps[s] ?? scheme.repsHi}</span>` : ''}</button>`).join('');
  const stepper = edit && edit <= completed ? `
    <div class="reps-row">
      <span class="reps-label">Set ${edit}</span>
      <button class="reps-btn" type="button" data-reps="-1" data-ex="${ex.id}" data-set="${edit}" data-date="${dateISO}" aria-label="One rep fewer">−</button>
      <span class="reps-val">${reps[edit - 1] ?? scheme.repsHi}<small>reps</small></span>
      <button class="reps-btn" type="button" data-reps="1" data-ex="${ex.id}" data-set="${edit}" data-date="${dateISO}" aria-label="One rep more">+</button>
      <button class="reps-undo" type="button" data-ex="${ex.id}" data-set="${edit}" data-date="${dateISO}">${ico('undo')} Undo set</button>
    </div>` : '';
  return `<div class="sets-row">${bubbles}</div>${stepper}${isAnchor ? progressNote(ex, scheme, phase, dateISO) : ''}`;
}

/* Keep a compact record of every session touched, for History. */
function logSession(dateISO) {
  if (!currentPlan || currentPlan.dateISO !== dateISO) return;
  const day = currentDays()[currentPlan.dayIdx];
  const total = Object.values(currentPlan.sets).reduce((a, b) => a + b, 0);
  const sets = currentPlan.exercises.reduce((n, ex) => n + Math.min(doneCount(dateISO, ex.id), currentPlan.sets[ex.id]), 0);
  if (sets === 0) { delete state.sessions[dateISO]; }
  else {
    state.sessions[dateISO] = {
      day: day.key, name: dayName(day), emoji: day.emoji, sets, total,
      completed: total > 0 && sets >= total,
      ex: currentPlan.exercises.map((ex) => ex.name),
    };
  }
  const keys = Object.keys(state.sessions).sort();
  while (keys.length > 200) delete state.sessions[keys.shift()];
  store.write('sessions', state.sessions);
}

function sessionsInWeek(weekIdx) {
  return Object.keys(state.sessions).filter((d) => weekIndexOfISO(d) === weekIdx).length;
}

/* Consecutive weeks (ending now, or last week if this week hasn't started)
 * with at least two sessions each. */
function weekStreak() {
  let w = currentWeekIndex();
  if (sessionsInWeek(w) < 2) w--;
  let streak = 0;
  while (sessionsInWeek(w) >= 2) { streak++; w--; }
  return streak;
}

function recordPR(ex, value, plates) {
  state.prs.unshift({ id: ex.id, name: ex.name, w: value, plates, date: todayISO() });
  state.prs = state.prs.slice(0, 100);
  store.write('prs', state.prs);
  const shown = plates ? formatPlates(value) : formatWeight(value);
  showToast(`New personal best — ${shown} on ${ex.name}!`, 'trophy');
}

function findExercise(id) {
  for (const list of Object.values(EXERCISE_DB)) {
    const hit = list.find((ex) => ex.id === id);
    if (hit) return hit;
  }
  return null;
}

/* ------------------------------ rendering ------------------------------ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ------------------------------ motion ------------------------------ */
/* Transform and opacity only; enters ease out, exits are quick; and all of it
 * is skipped for people who asked their phone for reduced motion. */
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_IN = 'cubic-bezier(0.4, 0, 1, 1)';
const reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const canAnimate = () => !reducedMotion() && typeof Element.prototype.animate === 'function';
// iOS only applies :active to touches once something on the page listens for touchstart.
document.addEventListener('touchstart', () => {}, { passive: true });

/* Play an element's exit animation (a CSS class) and then run `done`.
 * Showing the element again before that cancels the pending hide. */
function dismiss(el, cls, done) {
  if (el.hidden) return;
  const token = (el._dismiss = {});
  const finish = () => { if (el._dismiss !== token) return; el._dismiss = null; el.classList.remove(cls); done(); };
  if (!canAnimate()) { finish(); return; }
  el.classList.add(cls);
  el.addEventListener('animationend', (e) => { if (e.target === el) finish(); }, { once: true });
  setTimeout(finish, 320);   // safety net if the animation never reports back
}
function cancelDismiss(el, cls) { el._dismiss = null; el.classList.remove(cls); }

/* The form guide opens like a sheet: height and opacity ease out; the close is
 * quicker. The <details> open flag flips at the start of an open and the end of
 * a close, so the clip play/pause toggle listener keeps working unchanged. */
function toggleGuide(guide) {
  const body = guide.querySelector('.howto-body');
  if (!body || !canAnimate()) { guide.open = !guide.open; return; }
  const closing = guide.classList.contains('closing');
  const cur = body.getBoundingClientRect().height;   // read before cancelling: mid-animation height if there is one
  if (guide._anim) guide._anim.cancel();
  guide.classList.remove('closing');
  body.style.overflow = 'hidden';
  const finish = () => { body.style.overflow = ''; guide._anim = null; };
  if (!guide.open || closing) {
    guide.open = true;
    const full = body.offsetHeight;
    guide._anim = body.animate(
      [{ height: `${closing ? cur : 0}px`, opacity: closing ? 1 : 0, transform: closing ? 'none' : 'translateY(-6px)' },
       { height: `${full}px`, opacity: 1, transform: 'none' }],
      { duration: 300, easing: EASE_OUT });
    guide._anim.onfinish = finish;
  } else {
    guide.classList.add('closing');
    guide._anim = body.animate(
      [{ height: `${cur}px`, opacity: 1 }, { height: '0px', opacity: 0 }],
      { duration: 180, easing: EASE_IN });
    guide._anim.onfinish = () => { guide.classList.remove('closing'); guide.open = false; finish(); };
  }
}

/* Swap a container's content with a cross-fade: a ghost of the old content fades
 * out over the new, which slides in from the side the user is heading to. */
function crossFade(el, rerender, dir) {
  if (!canAnimate()) { rerender(); return; }
  const ghost = el.cloneNode(true);
  ghost.removeAttribute('id');
  ghost.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  ghost.querySelectorAll('video source').forEach((s) => s.remove());   // the ghost must not start loading clips
  ghost.className = 'content content-ghost';
  ghost.style.top = `${el.offsetTop}px`;
  ghost.style.height = `${el.offsetHeight}px`;
  ghost.setAttribute('aria-hidden', 'true');
  el.parentElement.appendChild(ghost);
  rerender();
  const out = ghost.animate(
    [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-12 * dir}px)` }],
    { duration: 160, easing: EASE_IN, fill: 'forwards' });
  out.onfinish = () => ghost.remove();
  setTimeout(() => ghost.remove(), 500);
  el.animate(
    [{ opacity: 0, transform: `translateX(${16 * dir}px)` }, { opacity: 1, transform: 'none' }],
    { duration: 260, easing: EASE_OUT });
}

/* The progress ring counts up (or down) from what it last showed, so a ticked
 * set is seen to move the number rather than the number just changing. */
let ringShown = 0, ringRun = 0;
function animateRing(from) {
  const hero = $('.hero');
  if (!hero) return;
  const to = Number(hero.dataset.pct) || 0;
  const fg = hero.querySelector('.ring-fg'), label = hero.querySelector('.ring-label');
  const c = Number(fg.getAttribute('stroke-dasharray'));
  const complete = hero.classList.contains('complete');
  const run = ++ringRun;
  ringShown = to;
  if (!canAnimate() || from === to) return;
  const start = performance.now(), dur = 600;
  const step = (now) => {
    if (run !== ringRun) return;   // a newer render took over
    const t = Math.min(1, (now - start) / dur);
    const v = from + (to - from) * (1 - Math.pow(1 - t, 3));   // ease-out cubic
    fg.setAttribute('stroke-dashoffset', c * (1 - v / 100));
    if (!complete) label.textContent = `${Math.round(v)}%`;
    if (t < 1) requestAnimationFrame(step);
  };
  fg.setAttribute('stroke-dashoffset', c * (1 - from / 100));
  requestAnimationFrame(step);
}

function render() {
  const onboarded = state.profile && state.profile.onboarded;
  document.body.classList.toggle('onboarding', !onboarded);
  document.body.classList.toggle('view-workout', onboarded && state.view === 'workout');
  for (const v of ['onboarding', 'workout', 'history', 'settings']) {
    const el = $('#view-' + v);
    el.hidden = onboarded ? v !== state.view : v !== 'onboarding';
  }
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === state.view));
  renderHeader();
  if (!onboarded) { renderOnboarding(); return; }
  if (state.view === 'workout') { renderPhaseBanner(); renderTabs(); renderDay(); }
  else if (state.view === 'history') renderHistory();
  else renderSettings();
}

function renderHeader() {
  const monday = displayedWeekMonday();
  const friday = new Date(monday.getTime() + 4 * MS_PER_DAY);
  const fmt = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const offsetNote = state.weekOffset === 0 ? '' :
    state.weekOffset > 0 ? ` · in ${state.weekOffset} wk` : ` · ${-state.weekOffset} wk ago`;
  $('#weekTitle').textContent = `Week ${isoWeekNumber(monday)}${offsetNote}`;
  $('#weekDates').textContent = `${fmt(monday)} – ${fmt(friday)}`;
  $('#unitToggle').textContent = state.unit;
  $('#appVersion').textContent = `Stay Strong v${APP_VERSION}`;
}

/* ------------------------------ onboarding ------------------------------ */
function choiceCards(cls, options, selectedKey, dataKey) {
  return options.map((o) => `
    <button class="choice ${cls} ${o.key === selectedKey ? 'active' : ''}" type="button" data-${dataKey}="${o.key}">
      <span class="choice-emoji">${o.badge ? `<span class="choice-badge">${o.badge}</span>` : ico(o.icon)}</span>
      <span class="choice-text"><strong>${o.name}</strong><small>${o.short || o.desc}</small></span>
    </button>`).join('');
}

function renderOnboarding() {
  $('#view-onboarding').innerHTML = `
    <div class="ob">
      <div class="ob-hero">
        <img class="ob-logo" src="icons/icon-192.png" alt="" />
        <h1>Stay Strong</h1>
        <p>A plan that changes every week, real-photo form guides, a rest timer that chimes —
        and it all works with no signal.</p>
      </div>
      <label class="ob-field">What should we call you?
        <input id="obName" type="text" maxlength="24" placeholder="Your first name" autocomplete="given-name" value="${esc(state.ob.name || '')}" />
      </label>
      <h3 class="ob-h">Your goal</h3>
      <div class="choice-grid">${choiceCards('ob-goal', Object.values(GOALS), state.ob.goal, 'goal')}</div>
      <h3 class="ob-h">Your equipment</h3>
      <div class="choice-grid">${choiceCards('ob-equip', Object.values(EQUIPMENT), state.ob.equip, 'equip')}</div>
      <h3 class="ob-h">Your week</h3>
      <div class="choice-grid">${choiceCards('ob-split', Object.values(SPLITS), state.ob.split, 'split')}</div>
      <button id="obStart" class="primary-btn" type="button">Let's go ${ico('arrowRight')}</button>
      <p class="ob-note">Training with a partner? Pick the same week layout and each phone keeps its own goal and
      equipment — you'll still get the same muscles on the same day.</p>
    </div>`;
}

function finishOnboarding() {
  const name = ($('#obName').value || '').trim();
  state.profile = { name, onboarded: true };
  state.goal = state.ob.goal;
  state.equip = state.ob.equip;
  state.split = state.ob.split || 'twice';
  store.write('profile', state.profile);
  store.write('goal', state.goal);
  store.write('equip', state.equip);
  store.write('split', state.split);
  state.view = 'workout';
  render();
  window.scrollTo(0, 0);   // the Start button sits at the bottom of the form; land on the hero, not mid-plan
  showToast(name ? `Welcome, ${name} — let's build.` : 'Welcome — let’s build.', 'dumbbell');
}

/* ------------------------------ workout view ------------------------------ */
function renderPhaseBanner() {
  const weekIdx = displayedWeekIndex();
  const phase = phaseForWeek(weekIdx);
  const goal = currentGoal();
  $('#phaseBanner').innerHTML = `
    <div class="phase-head">
      <span class="phase-badge">${ico(phase.icon)}</span>
      <span class="phase-name phase-${phase.key}">${phase.name} week</span>
    </div>
    <p class="phase-desc">${phase.desc} <span class="phase-week">Week ${(((weekIdx % 4) + 4) % 4) + 1} of 4 —
      anchor lifts stay fixed all cycle.</span></p>
    <button id="goalPill" class="goal-pill" type="button"
      title="Tap to switch goal">${ico(goal.icon)} ${goal.name} ${ico('swap')}</button>`;
}

function renderTabs() {
  const tabs = currentDays().map((day, i) => {
    const iso = dayDateISO(i);
    const s = state.sessions[iso];
    const mark = s ? (s.completed ? '✓' : '·') : '';
    return `
    <button class="day-tab ${i === state.selectedDay ? 'active' : ''} ${s && s.completed ? 'done' : ''}" data-day="${i}" type="button">
      <span class="day-tab-dow">${day.label} <span class="day-tab-mark">${mark}</span></span>
      <span class="day-tab-name">${dayName(day)}</span>
    </button>`;
  }).join('');
  $('#dayTabs').innerHTML = tabs;
}

function renderDay() {
  const weekIdx = displayedWeekIndex();
  const phase = phaseForWeek(weekIdx);
  const dayIdx = state.selectedDay;
  const day = currentDays()[dayIdx];
  const dateISO = dayDateISO(dayIdx);
  // Today's "machine busy" swaps replace the planned move in place.
  const planned = pickExercises(day, weekIdx, dayIdx);
  const exercises = planned.map((ex) => swappedFor(dateISO, ex.id) || ex);
  const swappedFrom = planned.map((ex, i) => (exercises[i] === ex ? null : ex));
  const isToday = dateISO === todayISO();
  const dow = (new Date().getDay() + 6) % 7;
  const weekendNote = (state.weekOffset === 0 && dow > 4)
    ? `<div class="note-card">${ico('moon')} It’s the weekend — rest up! Here’s Monday’s ${dayName(day)} session.</div>` : '';

  // Supersets (HIIT goal): exercises are paired A, B, C… — do both back to back, then rest.
  const supersets = currentGoal().supersets;
  const paired = supersets ? Math.floor(exercises.length / 2) * 2 : 0;
  const supersetLabel = (i) => (i < paired ? 'ABC'[Math.floor(i / 2)] : null);
  const hiitNote = supersets ? `
    <div class="note-card hiit-note">${ico('link')} <strong>Supersets:</strong> exercises marked A, B, C are pairs —
      do both back to back with no rest, then rest once. Keeps the heart rate up and the session short.</div>` : '';

  // An anchor keeps its status only while it is the planned lift (a swapped-in stand-in is an accessory).
  const anchorIds = new Set(anchorsFor(day, weekIdx).filter((ex) => exercises.includes(ex)).map((ex) => ex.id));
  const schemes = applyVolumeCaps(exercises, exercises.map((ex, i) => schemeFor(ex, phase, weekIdx, i, anchorIds.has(ex.id))), day, anchorIds);
  currentPlan = { dateISO, dayIdx, exercises, schemes, phase, anchorIds, isToday, sets: Object.fromEntries(exercises.map((ex, i) => [ex.id, schemes[i].sets])) };
  exercises.forEach((ex, i) => { if (anchorIds.has(ex.id)) evaluateAnchor(dateISO, ex, schemes[i], phase); });
  anchorEvents.length = 0;   // a render is not a tap: nothing to announce

  const chosenIds = new Set(exercises.map((ex) => ex.id));
  const cards = exercises.map((ex, i) => exerciseCard(ex, i, phase, weekIdx, dateISO, day, chosenIds, supersetLabel(i), schemes[i], swappedFrom[i], anchorIds.has(ex.id))).join('');

  const equipNote = currentEquip().key !== 'gym' ? `
    <div class="note-card equip-note">${ico(currentEquip().icon)} <strong>${currentEquip().name} mode</strong> —
      every exercise below needs only ${currentEquip().key === 'body' ? 'your bodyweight' : 'free weights'}. Change it in Settings.</div>` : '';

  $('#content').innerHTML = `
    ${heroCard(day, exercises, schemes, dateISO, isToday)}
    ${weekendNote}
    ${equipNote}
    <div class="warmup-card">
      <strong>${ico('flame')} Warm-up first</strong>
      <ol class="warmup-list">${day.warmup.map((s) => `<li>${s}</li>`).join('')}</ol>
    </div>
    ${hiitNote}
    ${cards}
    ${finisherCard(weekIdx, dayIdx, phase)}`;
  animateRing(ringShown);
}

/* After a set is ticked: update bubbles, card state, hero and tabs in place —
 * no full re-render, so an open how-to guide stays open and the page doesn't jump. */
function refreshProgress() {
  if (!currentPlan) return;
  const { dateISO, dayIdx, exercises, schemes, isToday } = currentPlan;
  $$('.exercise-card[data-ex]').forEach((card) => {
    const id = card.dataset.ex;
    const i = exercises.findIndex((ex) => ex.id === id);
    if (i < 0) return;
    const sets = currentPlan.sets[id] || 0;
    const done = doneCount(dateISO, id);
    card.classList.toggle('card-done', sets > 0 && done >= sets);
    const isAnchor = currentPlan.anchorIds.has(id);
    if (isAnchor) evaluateAnchor(dateISO, exercises[i], schemes[i], currentPlan.phase);
    const block = card.querySelector('.sets-block');
    if (block) block.innerHTML = setsBlock(exercises[i], schemes[i], dateISO, currentPlan.phase, isAnchor);
  });
  const hero = $('.hero');
  if (hero) { hero.outerHTML = heroCard(currentDays()[dayIdx], exercises, schemes, dateISO, isToday); animateRing(ringShown); }
  renderTabs();
}

/* The big card at the top of the workout: greeting, progress ring, streak. */
function heroCard(day, exercises, schemes, dateISO, isToday) {
  const total = schemes.reduce((n, s) => n + s.sets, 0);
  const done = exercises.reduce((n, ex, i) => n + Math.min(doneCount(dateISO, ex.id), schemes[i].sets), 0);
  const pct = total ? Math.round((100 * done) / total) : 0;
  const complete = total > 0 && done >= total;
  const name = state.profile && state.profile.name;
  const dateText = new Date(dateISO + 'T00:00:00Z').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' });
  const greeting = isToday
    ? `${name ? `Hey, ${esc(name)}` : 'Today’s session'}`
    : dateText;
  const streak = weekStreak();
  const thisWeek = sessionsInWeek(currentWeekIndex());
  const r = 26, c = 2 * Math.PI * r;
  const burst = complete ? `<div class="burst" aria-hidden="true">${Array.from({ length: 8 }, (_, i) => `<span style="--i:${i}">${ico(i % 2 ? 'star' : 'dot')}</span>`).join('')}</div>` : '';
  return `
  <section class="hero ${complete ? 'complete' : ''}" data-pct="${pct}">
    <div class="hero-ghost" aria-hidden="true">${dayName(day)}</div>
    ${burst}
    <div class="hero-main">
      <div class="hero-text">
        <div class="hero-greeting">${greeting}</div>
        <div class="hero-title">${dayName(day)}</div>
        <div class="hero-sub">${complete ? 'Session complete — great work!' :
          done ? `${done} of ${total} sets done — keep going` : `${exercises.length} exercises · ${total} sets`}</div>
      </div>
      <div class="ring" role="img" aria-label="${pct}% of sets done">
        <svg viewBox="0 0 64 64"><circle class="ring-bg" cx="32" cy="32" r="${r}"/>
          <circle class="ring-fg" cx="32" cy="32" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct / 100)}"/></svg>
        <div class="ring-label">${complete ? '✓' : pct + '%'}</div>
      </div>
    </div>
    <div class="hero-stats">
      <span>${ico('flame')} ${streak} wk streak</span>
      <span>${ico('calendar')} ${thisWeek}/5 this week</span>
      <span>${ico('trophy')} ${state.prs.length} PR${state.prs.length === 1 ? '' : 's'}</span>
    </div>
  </section>`;
}

/* The lean-and-toned goal ends every session with a rotating HIIT finisher
 * (a gentle steady one on deload weeks). */
function finisherCard(weekIdx, dayIdx, phase) {
  if (!currentGoal().finisher) return '';
  const rng = mulberry32(weekIdx * 6011 + dayIdx * 389);
  const hiit = phase.key !== 'deload';
  const pool = hiit ? HIIT_FINISHERS : FINISHERS;
  const fin = pool[Math.floor(rng() * pool.length)];
  const video = fin.video
    ? `<a class="video-link" href="https://www.youtube.com/watch?v=${fin.video}" target="_blank" rel="noopener">${ico('play')} Form video</a>` : '';
  return `
  <article class="exercise-card finisher-card">
    <div class="exercise-top">
      <div class="exercise-icon finisher-icon">${ico(hiit ? 'bolt' : 'activity')}</div>
      <div class="exercise-info">
        <h3 class="exercise-name">${hiit ? 'HIIT finisher' : 'Easy finisher'}: ${fin.name}</h3>
        <div class="exercise-meta">
          <span class="chip chip-gear">${fin.time}</span>
          <span class="chip chip-muscle">${hiit ? 'Intervals · fat burn' : 'Recovery week'}</span>
        </div>
      </div>
    </div>
    <p class="finisher-how">${fin.how}</p>
    ${video}
    <p class="finisher-note">Straight after your last set, while your heart rate is already up.
    And remember: fat loss is won mostly in the kitchen — this builds the shape underneath.</p>
  </article>`;
}

/* The weight line: a suggestion plus the box you type into. For accessories the
 * box holds your ~10-rep load and the suggestion scales it by phase; for anchor
 * lifts the box IS this zone's working weight (double progression moves it). */
function weightLine(ex, scheme, phase, dateISO, isAnchor, weekIdx) {
  if (equipOf(ex) === 'body') return `<div class="weight-line"><span class="weight-suggest">Bodyweight — go to near-failure</span></div>`;
  const base = state.baselines[ex.id];
  const plates = !!(base && base.plates);   // plate mode: for stacks with unmarked plates, the number IS the plate count
  const zone = isAnchor ? zoneOf(phase) : null;
  const suggested = isAnchor ? anchorWorkingWeight(ex, phase, dateISO) : suggestedWeightKg(ex, scheme, weekIdx);
  const weightText = plates ? formatPlates(suggested) : formatWeight(suggested);
  const typed = isAnchor ? (zone ? suggested : null) : (base && base.w ? base.w : null);
  const typedText = typed
    ? (plates ? Math.round(typed * 10) / 10 : state.unit === 'lb' ? Math.round(typed / KG_PER_LB) : Math.round(typed * 10) / 10)
    : '';
  const label = isAnchor
    ? (weightText
      ? `${ico('target')} ${zone ? 'Work at' : 'Deload at'}: <strong>${weightText}</strong>`
      : `Enter your ${zone ? phase.name.toLowerCase() + ' ' : ''}working weight →`)
    : (weightText
      ? `${ico('target')} Suggested: <strong>${weightText}</strong>`
      : plates ? `Enter how many plates you use →` : `Set your weight to get weekly suggestions →`);
  return `<div class="weight-line">
        <span class="weight-suggest">${label}</span>
        <span class="weight-input-wrap">
          <input class="weight-input" type="number" inputmode="decimal" min="1" step="0.5"
            placeholder="${plates ? 'no.' : 'wt'}" value="${typedText}" data-ex="${ex.id}" data-date="${dateISO}"${zone ? ` data-zone="${zone}"` : ''}
            aria-label="${plates ? 'Number of plates' : 'Your working weight'}" />
          <button class="weight-unit weight-mode" type="button" data-ex="${ex.id}"
            title="Tap to switch between weight and plate count">${plates ? 'plates' : state.unit}</button>
        </span>
      </div>`;
}

function exerciseCard(ex, i, phase, weekIdx, dateISO, day, chosenIds, supersetLabel, scheme, swappedFrom, isAnchor) {
  const completed = doneCount(dateISO, ex.id);
  const equipTag = { machine: `${ico('machine')} machine`, free: `${ico('dumbbell')} free weights`, body: `${ico('pullupBar')} bodyweight` }[equipOf(ex)];
  const weightBlock = weightLine(ex, scheme, phase, dateISO, isAnchor, weekIdx);

  const swapNote = swappedFrom ? `
    <div class="swap-note"><span>${ico('swap')} Swapped in for <strong>${swappedFrom.name}</strong></span>
      <button class="unswap-btn" type="button" data-ex="${swappedFrom.id}" data-date="${dateISO}">${ico('undo')} Undo</button></div>` : '';

  return `
  <article class="exercise-card ${completed >= scheme.sets ? 'card-done' : ''} ${swappedFrom ? 'swapped' : ''}" data-ex="${ex.id}">
    <div class="card-ghost" aria-hidden="true">${i + 1}</div>
    ${swapNote}
    <div class="exercise-top">
      <div class="exercise-icon">${ICONS[ex.icon] || ICONS.dumbbell}</div>
      <div class="exercise-info">
        <h3 class="exercise-name"><span class="ex-num">${String(i + 1).padStart(2, '0')}</span>${ex.name}</h3>
        <div class="exercise-meta">
          <span class="chip chip-gear">${ex.gear}</span>
          <span class="chip chip-muscle">${ex.muscles}</span>
          <span class="chip chip-equip">${equipTag}</span>
          <a class="chip chip-video" href="${videoUrl(ex)}" target="_blank" rel="noopener">${ico('play')} Video</a>
          ${isAnchor ? `<span class="chip chip-anchor" title="Fixed for this 4-week cycle and progressed by double progression">${ico('target')} Anchor lift</span>` : ''}
          ${supersetLabel ? `<span class="chip chip-superset">${ico('link')} Superset ${supersetLabel}</span>` : ''}
        </div>
      </div>
    </div>
    <div class="scheme-row">
      <span class="scheme-pill">${scheme.sets} × ${scheme.repsLo}–${scheme.repsHi} reps</span>
      <span class="scheme-rest">rest ${scheme.rest}</span>
      ${scheme.capped ? `<span class="scheme-cap" title="A set trimmed so this muscle stays near 12 hard sets this session">· volume cap</span>` : ''}
    </div>
    <div class="tempo-line">⏱ ${phase.tempo}</div>
    ${focusBlock(ex)}
    ${weightBlock}
    <div class="sets-block">${setsBlock(ex, scheme, dateISO, phase, isAnchor)}</div>
    ${altChips(ex, day, chosenIds, weekIdx, dateISO, swappedFrom)}
    <details class="howto">
      <summary>${ico('book')} How to do it</summary>
      <div class="howto-body">
        ${photoDemo(ex)}
        ${focusBlock(ex, true)}
        <h4>Set-up</h4>
        <ol>${ex.setup.map((s) => `<li>${s}</li>`).join('')}</ol>
        <h4>Doing the exercise</h4>
        <ol>${ex.execution.map((s) => `<li>${s}</li>`).join('')}</ol>
        <h4>Tips</h4>
        <ul>${ex.tips.map((s) => `<li>${s}</li>`).join('')}</ul>
        ${ex.mistakes ? `<h4>Common mistakes</h4>
        <ul class="mistakes">${ex.mistakes.map((s) => `<li>${s}</li>`).join('')}</ul>` : ''}
        <div class="video-box">
          <h4>Watch before your session</h4>
          <a class="video-link" href="${videoUrl(ex)}" target="_blank" rel="noopener">
            ${ico('play')} ${FORM_VIDEOS[ex.id] ? `Form video: ${FORM_VIDEOS[ex.id].title}` : 'Watch form videos on YouTube'}
          </a>
          <small class="video-sub">Between sets, the photos and cues above are your reference — the video is for learning
            the move at home. Plays offline if downloaded in YouTube (Premium) ·
            <a class="video-more" href="${videoSearchUrl(ex)}" target="_blank" rel="noopener">more videos</a></small>
        </div>
      </div>
    </details>
  </article>`;
}

/* Real start/finish photographs (public domain, bundled with the app so they
 * work with no signal). The two frames cross-fade to show the movement;
 * tap to hold them side by side. */
/* Animated loop where one exists (img/anim), otherwise real start/finish
 * photographs (public domain, bundled so they work with no signal). The two
 * photo frames cross-fade to show the movement; tap to hold them side by side.
 * Clips don't autoplay: the guide's toggle handler starts them when opened. */
function photoDemo(ex) {
  const anim = (typeof DEMO_ANIMS !== 'undefined') && DEMO_ANIMS[ex.id];
  if (anim) return `
    <div class="anim-demo" data-ex="${ex.id}">
      <video class="anim-video" muted loop playsinline preload="metadata" poster="${animUrl(ex.id, 'jpg')}"
        aria-label="${ex.name} — animated demonstration">
        <source src="${animUrl(ex.id, 'webm')}" type="video/webm" />
        <source src="${animUrl(ex.id, 'mp4')}" type="video/mp4" />
      </video>
      <span class="anim-tag">${ico('play')} ${anim.muscle || ex.muscles} working</span>
      <span class="photo-hint">${ico('camera')} Works offline · tap to pause</span>
    </div>`;
  if (!DEMO_PHOTOS[ex.id]) return '';
  return `
    <div class="photo-demo" data-ex="${ex.id}">
      <img class="photo-frame photo-start" src="img/demo/${ex.id}-0.jpg" alt="${ex.name} — start position" loading="lazy" />
      <img class="photo-frame photo-end" src="img/demo/${ex.id}-1.jpg" alt="${ex.name} — finish position" loading="lazy" />
      <span class="photo-tag photo-tag-start">Start</span>
      <span class="photo-tag photo-tag-end">Finish</span>
      <span class="photo-hint">${ico('camera')} Works offline · tap to compare</span>
    </div>`;
}

/* "Machine busy?" chips: tap one and the card becomes that exercise for today,
 * with its own photos and how-to. Offers a same-equipment alternative, a
 * free-weight version (for machine moves) and a bodyweight version. */
function altChips(ex, day, chosenIds, weekIdx, dateISO, swappedFrom) {
  // The exercise this card was swapped from counts as taken, so it isn't offered again.
  const taken = new Set(chosenIds);
  if (swappedFrom) taken.add(swappedFrom.id);
  const mine = equipOf(ex);
  const opts = [];
  const add = (alt, icon, why) => {
    if (alt && !opts.some((o) => o.alt.id === alt.id)) opts.push({ alt, icon, why });
  };
  add(swapSuggestion(ex, day, taken, weekIdx), 'swap', 'same kit');
  if (mine === 'machine') add(altForEquip(ex, day, 'free', weekIdx, taken), 'dumbbell', 'free weights');
  if (mine !== 'body' && currentEquip().key !== 'gym') add(altForEquip(ex, day, 'body', weekIdx, taken), 'pullupBar', 'bodyweight');
  if (!opts.length) return '';
  const plannedId = swappedFrom ? swappedFrom.id : ex.id;
  return `
    <div class="alts-row">
      <span class="alts-label">${mine === 'body' ? 'Busy or too hard?' : 'Machine busy?'} Tap to swap:</span>
      ${opts.map((o) => `
        <button class="alt-btn" type="button" data-ex="${plannedId}" data-alt="${o.alt.id}" data-date="${dateISO}"
          title="${o.why}">${ico(o.icon)} ${o.alt.name}</button>`).join('')}
    </div>`;
}

/* ------------------------------ history view ------------------------------ */
function renderHistory() {
  const sessions = Object.entries(state.sessions).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  const completed = sessions.filter(([, s]) => s.completed).length;
  const totalSets = sessions.reduce((n, [, s]) => n + s.sets, 0);
  const streak = weekStreak();

  // The last four weeks, Monday to Sunday, ending with this week.
  const today = todayISO();
  const cells = [];
  const thisMonday = WEEK_EPOCH + currentWeekIndex() * MS_PER_WEEK;
  for (let w = 3; w >= 0; w--) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(thisMonday - w * MS_PER_WEEK + d * MS_PER_DAY);
      const iso = date.toISOString().slice(0, 10);
      const s = state.sessions[iso];
      const cls = s ? (s.completed ? 'full' : 'part') : (iso > today ? 'future' : '');
      cells.push(`<div class="cal-cell ${cls} ${iso === today ? 'today' : ''}" title="${iso}${s ? ` · ${s.name} ${s.sets}/${s.total}` : ''}"><span>${date.getUTCDate()}</span></div>`);
    }
  }
  const calHead = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => `<div class="cal-head">${d}</div>`).join('');

  const list = sessions.slice(0, 40).map(([iso, s]) => `
    <div class="hist-row ${s.completed ? 'full' : ''}">
      <div class="hist-date">${new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</div>
      <div class="hist-main"><strong>${s.name}</strong><small>${s.ex.slice(0, 4).join(' · ')}${s.ex.length > 4 ? ' …' : ''}</small></div>
      <div class="hist-sets">${s.completed ? '✓' : ''} ${s.sets}/${s.total}</div>
    </div>`).join('');

  // Anchor lifts: the working weight per zone, and how the last session went.
  const anchorRows = Object.entries(state.anchors).map(([id, rec]) => {
    const ex = findExercise(id);
    const zones = ['hypertrophy', 'strength', 'volume'].filter((z) => rec.zones && rec.zones[z] && rec.zones[z].w);
    if (!ex || !zones.length) return '';
    const plates = !!(state.baselines[id] && state.baselines[id].plates);
    const fmt = (w) => (plates ? formatPlates(w) : formatWeight(w));
    const lastDate = Object.keys(rec.applied || {}).sort().pop();
    const last = lastDate && rec.applied[lastDate];
    const when = lastDate ? new Date(lastDate + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : '';
    return `
    <div class="pr-row anchor-row"><span>${ico('target')} ${ex.name}</span>
      <strong>${zones.map((z) => `<em>${z[0].toUpperCase()}</em>${fmt(rec.zones[z].w)}`).join(' · ')}</strong>
      <small>${last ? `${last.outcome === 'up' ? '↑ went up' : 'held'} · ${when}` : 'no session yet'}</small></div>`;
  }).join('');

  const prs = state.prs.slice(0, 12).map((p) => `
    <div class="pr-row"><span>${ico('trophy')} ${p.name}</span><strong>${p.plates ? formatPlates(p.w) : formatWeight(p.w)}</strong>
      <small>${new Date(p.date + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</small></div>`).join('');

  $('#view-history').innerHTML = `
    <div class="stats-grid">
      <div class="stat"><div class="stat-num">${streak}</div><div class="stat-label">week streak</div></div>
      <div class="stat"><div class="stat-num">${completed}</div><div class="stat-label">sessions completed</div></div>
      <div class="stat"><div class="stat-num">${totalSets}</div><div class="stat-label">sets logged</div></div>
      <div class="stat"><div class="stat-num">${state.prs.length}</div><div class="stat-label">personal bests</div></div>
    </div>
    <h2 class="section-title">Last 4 weeks</h2>
    <div class="cal">${calHead}${cells.join('')}</div>
    <p class="cal-key"><span class="key full"></span> completed <span class="key part"></span> partial</p>
    <h2 class="section-title">Anchor lifts</h2>
    ${anchorRows || '<p class="empty">Your main lifts and their working weight per zone (H hypertrophy · S strength · V volume) land here once you log a session.</p>'}
    <h2 class="section-title">Personal bests</h2>
    ${prs || '<p class="empty">Raise a saved weight on any exercise and it lands here.</p>'}
    <h2 class="section-title">Sessions</h2>
    ${list || '<p class="empty">Tick off your first set and your history starts here.</p>'}`;
}

/* ------------------------------ settings view ------------------------------ */
function renderSettings() {
  const name = (state.profile && state.profile.name) || '';
  $('#settingsBody').innerHTML = `
    <h2 class="section-title">Profile</h2>
    <label class="ob-field">Name
      <input id="setName" type="text" maxlength="24" placeholder="Your first name" value="${esc(name)}" />
    </label>
    <h2 class="section-title">Goal</h2>
    <div class="choice-grid">${choiceCards('set-goal', Object.values(GOALS), currentGoal().key, 'goal')}</div>
    <p class="hint">${currentGoal().desc}</p>
    <h2 class="section-title">Equipment</h2>
    <div class="choice-grid">${choiceCards('set-equip', Object.values(EQUIPMENT), currentEquip().key, 'equip')}</div>
    <p class="hint">${currentEquip().desc} Every day's plan is rebuilt from exercises that fit.</p>
    <h2 class="section-title">Training split</h2>
    <div class="choice-grid">${choiceCards('set-split', Object.values(SPLITS), currentSplit().key, 'split')}</div>
    <p class="hint">${currentSplit().desc} Training with a partner? Pick the same split and you share the same days.</p>
    <h2 class="section-title">Units</h2>
    <div class="choice-grid two">
      <button class="choice set-unit ${state.unit === 'kg' ? 'active' : ''}" type="button" data-unit="kg"><span class="choice-emoji"><span class="choice-badge">kg</span></span><span class="choice-text"><strong>Kilograms</strong><small>kg, 2.5 kg steps</small></span></button>
      <button class="choice set-unit ${state.unit === 'lb' ? 'active' : ''}" type="button" data-unit="lb"><span class="choice-emoji"><span class="choice-badge">lb</span></span><span class="choice-text"><strong>Pounds</strong><small>lb, 5 lb steps</small></span></button>
    </div>`;
}

/* ------------------------------ toast ------------------------------ */
let toastTimer = null;
function showToast(msg, icon) {
  const el = $('#toast');
  el.innerHTML = (icon ? ico(icon) + ' ' : '') + esc(msg);
  cancelDismiss(el, 'leaving');
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => dismiss(el, 'leaving', () => { el.hidden = true; }), 3500);
}

/* ------------------------------ rest timer ------------------------------ */
/* Starts automatically when a set is checked off; chimes + vibrates at zero.
 * Uses a wall-clock end time so it stays accurate even if the browser
 * throttles timers, and a screen wake lock (where supported) so the phone
 * doesn't sleep mid-rest. */
const rest = { endAt: 0, totalMs: 0, tick: null, hideTimer: null, running: false, wakeLock: null };
let audioCtx = null;

function ensureAudio() {
  // Must be called from a user tap — that unlocks audio playback on phones.
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch { /* no audio support — timer still works visually */ }
}

function chime() {
  if (!audioCtx) return;
  try {
    // Two rounds of a rising three-note bell: E5 → G5 → C6.
    const notes = [659.25, 783.99, 1046.5];
    for (let round = 0; round < 2; round++) {
      notes.forEach((freq, i) => {
        const t = audioCtx.currentTime + round * 0.85 + i * 0.18;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.5);
      });
    }
  } catch { /* ignore */ }
  try { navigator.vibrate && navigator.vibrate([250, 120, 250, 120, 400]); } catch { /* ignore */ }
}

async function holdWakeLock() {
  try { rest.wakeLock = await navigator.wakeLock?.request('screen'); } catch { rest.wakeLock = null; }
}
function releaseWakeLock() {
  try { rest.wakeLock?.release(); } catch { /* ignore */ }
  rest.wakeLock = null;
}

function startRestTimer(seconds, label) {
  clearTimeout(rest.hideTimer);
  clearInterval(rest.tick);
  rest.endAt = Date.now() + seconds * 1000;
  rest.totalMs = seconds * 1000;
  rest.running = true;
  const el = $('#restTimer');
  cancelDismiss(el, 'leaving');
  if (!el.hidden) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }   // restart = a small pop
  el.hidden = false;
  el.classList.remove('done');
  document.body.classList.add('timer-on');
  $('#restEmoji').innerHTML = ico('hourglass');
  $('#restLabel').textContent = label;
  updateRestTimer();
  rest.tick = setInterval(updateRestTimer, 250);
  holdWakeLock();
}

function updateRestTimer() {
  const remaining = rest.endAt - Date.now();
  if (remaining <= 0) { finishRestTimer(); return; }
  const secs = Math.ceil(remaining / 1000);
  $('#restTime').textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
  $('#restFill').style.width = `${Math.min(100, 100 * (1 - remaining / rest.totalMs))}%`;
}

function finishRestTimer() {
  if (!rest.running) return;
  rest.running = false;
  clearInterval(rest.tick);
  chime();
  const el = $('#restTimer');
  el.classList.add('done');
  $('#restEmoji').innerHTML = ico('bell');
  $('#restTime').textContent = '0:00';
  $('#restLabel').textContent = 'GO — start your next set!';
  $('#restFill').style.width = '100%';
  releaseWakeLock();
  rest.hideTimer = setTimeout(stopRestTimer, 8000);
}

function stopRestTimer() {
  rest.running = false;
  clearInterval(rest.tick);
  clearTimeout(rest.hideTimer);
  releaseWakeLock();
  const el = $('#restTimer');
  el.classList.remove('bump');
  dismiss(el, 'leaving', () => { el.hidden = true; el.classList.remove('done'); document.body.classList.remove('timer-on'); });
}
$('#restTimer').addEventListener('animationend', (e) => { if (e.animationName === 'timer-bump') e.target.classList.remove('bump'); });

// If the phone was locked or the browser tabbed away past the end time,
// fire the finish state (and chime) the moment the app is visible again.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && rest.running) updateRestTimer();
});

$('#restSkip').addEventListener('click', stopRestTimer);
$('#restPlus').addEventListener('click', () => {
  if (!rest.running) return;
  rest.endAt += 30 * 1000;
  rest.totalMs += 30 * 1000;
  updateRestTimer();
});

/* ------------------------------ events ------------------------------ */
document.addEventListener('click', (e) => {
  const summary = e.target.closest('.howto summary');
  if (summary) { e.preventDefault(); toggleGuide(summary.parentElement); return; }

  const nav = e.target.closest('.nav-btn');
  if (nav) { state.view = nav.dataset.view; render(); window.scrollTo(0, 0); return; }

  // onboarding
  const obGoal = e.target.closest('.ob-goal');
  if (obGoal) { state.ob.goal = obGoal.dataset.goal; state.ob.name = $('#obName').value; renderOnboarding(); return; }
  const obEquip = e.target.closest('.ob-equip');
  if (obEquip) { state.ob.equip = obEquip.dataset.equip; state.ob.name = $('#obName').value; renderOnboarding(); return; }
  const obSplit = e.target.closest('.ob-split');
  if (obSplit) { state.ob.split = obSplit.dataset.split; state.ob.name = $('#obName').value; renderOnboarding(); return; }
  if (e.target.closest('#obStart')) { finishOnboarding(); return; }

  // settings
  const setGoal = e.target.closest('.set-goal');
  if (setGoal) { state.goal = setGoal.dataset.goal; store.write('goal', state.goal); render(); return; }
  const setEquip = e.target.closest('.set-equip');
  if (setEquip) { state.equip = setEquip.dataset.equip; store.write('equip', state.equip); render(); return; }
  const setSplit = e.target.closest('.set-split');
  if (setSplit) { state.split = setSplit.dataset.split; store.write('split', state.split); render(); return; }
  const setUnit = e.target.closest('.set-unit');
  if (setUnit) { state.unit = setUnit.dataset.unit; store.write('unit', state.unit); render(); return; }

  if (e.target.closest('#goalPill')) {
    state.goal = currentGoal().key === 'build' ? 'fatloss' : 'build';
    store.write('goal', state.goal);
    render();
    return;
  }
  const demo = e.target.closest('.photo-demo');
  if (demo) { demo.classList.toggle('compare'); return; }
  const modeBtn = e.target.closest('.weight-mode');
  if (modeBtn) {
    const exId = modeBtn.dataset.ex;
    const wasPlates = !!(state.baselines[exId] && state.baselines[exId].plates);
    // A kg figure means nothing as a plate count (and vice versa) — start fresh.
    state.baselines[exId] = { w: null, plates: !wasPlates };
    if (!state.baselines[exId].plates) delete state.baselines[exId];
    store.write('baselines', state.baselines);
    if (state.anchors[exId]) { state.anchors[exId].zones = {}; store.write('anchors', state.anchors); }   // kg and plate counts don't mix
    renderDay();
    return;
  }
  const altBtn = e.target.closest('.alt-btn');
  if (altBtn) {
    const { ex, alt, date } = altBtn.dataset;
    const target = findExercise(alt);
    if (!target) return;
    swapExercise(date, ex, alt);
    renderDay(); renderTabs(); logSession(date);
    // Land on the new card with its how-to open, so the photos and set-up are right there.
    const card = $(`.exercise-card[data-ex="${alt}"]`);
    if (card) {
      const guide = card.querySelector('.howto');
      if (guide) guide.open = true;
      card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    showToast(`Swapped to ${target.name} — tap Undo to go back`, 'swap');
    return;
  }
  const unswap = e.target.closest('.unswap-btn');
  if (unswap) {
    const { ex, date } = unswap.dataset;
    swapExercise(date, ex, null);
    renderDay(); renderTabs(); logSession(date);
    const card = $(`.exercise-card[data-ex="${ex}"]`);
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  const tab = e.target.closest('.day-tab');
  if (tab) {
    const next = Number(tab.dataset.day);
    if (next === state.selectedDay) return;
    const dir = next > state.selectedDay ? 1 : -1;   // slide in from the side we're heading to
    state.selectedDay = next;
    renderTabs();
    crossFade($('#content'), renderDay, dir);
    return;
  }
  const vid = e.target.closest('video.anim-video');
  if (vid) {
    if (vid.paused) { const p = vid.play(); if (p && p.catch) p.catch(() => {}); } else vid.pause();
    return;
  }
  const repsBtn = e.target.closest('.reps-btn');
  if (repsBtn) {
    const { ex, set, date } = repsBtn.dataset;
    const i = Number(set) - 1;
    const cur = repsFor(date, ex)[i] ?? planScheme(ex).repsHi;
    setReps(date, ex, i, Math.max(1, Math.min(50, cur + Number(repsBtn.dataset.reps))));
    refreshProgress(); announceAnchor();
    return;
  }
  const undoSet = e.target.closest('.reps-undo');
  if (undoSet) {
    const { ex, set, date } = undoSet.dataset;
    setDoneCount(date, ex, Number(set) - 1);
    state.editSet = null;
    refreshProgress(); announceAnchor();
    return;
  }
  const bubble = e.target.closest('.set-bubble');
  if (bubble) {
    const { ex, set, date } = bubble.dataset;
    const setNum = Number(set);
    const current = doneCount(date, ex);
    if (setNum <= current) {
      // Already done: open (or close) its reps stepper.
      const open = state.editSet && state.editSet.date === date && state.editSet.ex === ex && state.editSet.set === setNum;
      state.editSet = open ? null : { date, ex, set: setNum };
      refreshProgress();
      return;
    }
    // Complete up to here; each newly done set is logged at the top of its range until adjusted.
    for (let s = current; s < setNum; s++) setReps(date, ex, s, planScheme(ex).repsHi);
    setDoneCount(date, ex, setNum);
    state.editSet = null;
    ensureAudio();   // user tap = the moment we're allowed to unlock sound
    const restSec = Number(bubble.dataset.rest) || 60;
    const exercise = findExercise(ex);
    startRestTimer(restSec, `Rest — ${exercise ? exercise.name : 'set'} · set ${setNum} done`);
    refreshProgress(); announceAnchor();
  }
});

/* This exercise's scheme in the plan on screen (a sane default if it isn't there). */
function planScheme(exId) {
  const i = currentPlan ? currentPlan.exercises.findIndex((x) => x.id === exId) : -1;
  return i >= 0 ? currentPlan.schemes[i] : { repsHi: 10, sets: 3 };
}
/* After a tap changed an anchor's outcome, say so. */
function announceAnchor() {
  const ev = anchorEvents.pop();
  anchorEvents.length = 0;
  if (!ev) return;
  const fmt = (w) => (ev.plates ? formatPlates(w) : formatWeight(w));
  const week = `${ev.zone} week`;
  if (ev.outcome === 'up') showToast(ev.at ? `${ev.ex.name}: ${ev.hi} reps on every set — ${fmt(ev.at + ev.step)} next ${week}` : `${ev.ex.name}: ${ev.hi} reps on every set — it goes up next ${week}`, 'trophy');
  else showToast(ev.at ? `${ev.ex.name}: hold ${fmt(ev.at)} next ${week} and chase the reps` : `${ev.ex.name}: same weight next ${week} — chase the reps`, 'target');
}

/* Animated demos play only while their guide is open (battery), and a tap pauses/resumes. */
document.addEventListener('toggle', (e) => {
  const guide = e.target.closest && e.target.closest('.howto');
  if (!guide) return;
  guide.querySelectorAll('video.anim-video').forEach((v) => {
    if (guide.open) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    else v.pause();
  });
}, true);

document.addEventListener('change', (e) => {
  const nameInput = e.target.closest('#setName');
  if (nameInput) {
    state.profile = { ...(state.profile || {}), name: nameInput.value.trim(), onboarded: true };
    store.write('profile', state.profile);
    showToast('Saved', 'check');
    return;
  }
  const input = e.target.closest('.weight-input');
  if (!input) return;
  const exId = input.dataset.ex;
  const prev = state.baselines[exId];
  const plates = !!(prev && prev.plates);
  const raw = parseFloat(String(input.value).replace(',', '.'));
  const value = plates ? (isFinite(raw) && raw > 0 ? raw : null) : parseWeightInput(input.value);
  const zone = input.dataset.zone;
  if (zone) {   // anchor lift: this is the zone's working weight; the ~10-rep baseline follows from it
    const ex = findExercise(exId);
    const rec = anchorRec(exId);
    const before = rec.zones[zone] && rec.zones[zone].w;
    if (value) {
      rec.zones[zone] = { w: value };
      if (ex && (!prev || !prev.w)) {
        const ph = PHASES.find((p) => p.key === zone);
        const pct = (ex.tags.includes('compound') ? ph.pct : ph.isoPct) * currentGoal().pctMult;
        state.baselines[exId] = { w: value / pct, c: cycleForWeek(currentWeekIndex()), plates };
      }
      if (ex && before && value > before) recordPR(ex, value, plates);
    } else delete rec.zones[zone];
    delete rec.applied[input.dataset.date];   // re-evaluate this date against the new weight
    store.write('anchors', state.anchors);
    store.write('baselines', state.baselines);
    renderDay();
    return;
  }
  if (value) {
    state.baselines[exId] = { w: value, c: cycleForWeek(currentWeekIndex()), plates };
    // Beating a previously saved weight is a personal best.
    if (prev && prev.w && value > prev.w) { const ex = findExercise(exId); if (ex) recordPR(ex, value, plates); }
  } else if (plates) {
    state.baselines[exId] = { w: null, plates: true };   // keep the mode, drop the number
  } else {
    delete state.baselines[exId];
  }
  store.write('baselines', state.baselines);
  renderDay();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.id === 'obName') finishOnboarding();
});

$('#prevWeek').addEventListener('click', () => { state.weekOffset--; render(); });
$('#nextWeek').addEventListener('click', () => { state.weekOffset++; render(); });

$('#unitToggle').addEventListener('click', () => {
  state.unit = state.unit === 'kg' ? 'lb' : 'kg';
  store.write('unit', state.unit);
  render();
});

/* ------------------------------ video library ------------------------------ */
/* One-time YouTube Premium setup: each training day opens as a playlist of its
 * form videos; save + download it in YouTube and every ▶ Video button in the
 * app then plays with no signal. */
function renderVideoLibrary() {
  const el = $('#videoLibraryBody');
  if (!el) return;
  const groups = DAYS.concat([{ key: 'core', label: 'Core', name: 'Core moves (HIIT mode)' }]);
  const days = groups.map((day) => {
    const items = (day.key === 'core' ? EXERCISE_DB.core : dayPool(day.key)).filter((ex) => FORM_VIDEOS[ex.id]);
    const ids = items.map((ex) => FORM_VIDEOS[ex.id].id);
    return `
      <div class="vl-day">
        <a class="vl-playlist" href="${playlistUrl(ids)}" target="_blank" rel="noopener">
          ${ico('play')} ${day.label} · ${day.name} — open as playlist (${ids.length} videos)
        </a>
        <details class="vl-list">
          <summary>Individual videos</summary>
          <ul>${items.map((ex) => `<li><a href="${videoUrl(ex)}" target="_blank" rel="noopener">${ex.name}</a></li>`).join('')}</ul>
        </details>
      </div>`;
  }).join('');
  el.innerHTML = `
    <p class="vl-intro"><strong>One-time setup with YouTube Premium (needs signal, WiFi is best):</strong></p>
    <ol class="vl-steps">
      <li>Tap a day below — it opens YouTube with that day's form videos as a playlist.</li>
      <li>In YouTube tap <strong>⋮ → Save playlist</strong> (easiest in a laptop browser, then it appears in the app on your phone).</li>
      <li>Open the saved playlist in the YouTube app and tap <strong>Download</strong>.</li>
    </ol>
    <p class="vl-note">After that, every <strong>Video</strong> button in this app opens the downloaded video — no signal needed.
    If "Save playlist" isn't offered on your phone, use "Individual videos" and download each with ⋮ → Download.</p>
    ${days}`;
}

/* ------------------------------ offline photos ------------------------------ */
/* Save every demo photo into the persistent photo cache in the background —
 * resumable (skips what's already there), a few at a time, with a status line
 * so you know when it's safe to head underground. */
const PHOTO_CACHE = 'staystrong-photos';

async function prefetchPhotos() {
  const status = $('#offlineStatus');
  if (!('caches' in window) || !navigator.onLine) return;
  try {
    const cache = await caches.open(PHOTO_CACHE);
    const wanted = Object.keys(DEMO_PHOTOS).flatMap((id) => [`img/demo/${id}-0.jpg`, `img/demo/${id}-1.jpg`])
      .concat(Object.keys(DEMO_ANIMS).flatMap((id) => ['jpg', 'webm', 'mp4'].map((ext) => animUrl(id, ext))));
    const base = new URL('.', location.href).pathname;
    const keys = await cache.keys();
    const have = new Set(keys.map((req) => req.url.slice(new URL(req.url).origin.length)));
    const wantedSet = new Set(wanted.map((p) => base + p));
    // old revisions of re-rendered clips are no longer wanted: drop them
    await Promise.all(keys.filter((req) => req.url.includes('/img/anim/') && !wantedSet.has(req.url.slice(new URL(req.url).origin.length))).map((req) => cache.delete(req)));
    const missing = wanted.filter((p) => !have.has(base + p));
    let done = wanted.length - missing.length;
    const total = wanted.length;
    const show = () => {
      status.classList.toggle('done', done === total);
      status.innerHTML = ico('camera') + (done === total
        ? ' All demo photos and clips saved — the app works fully offline ✓'
        : ` Saving demo photos and clips for offline use… ${done}/${total}`);
    };
    show();
    const queue = missing.slice();
    const worker = async () => {
      while (queue.length) {
        const p = queue.shift();
        try { await cache.add(p); done++; show(); } catch { /* retry next open */ }
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    if (done < total) status.innerHTML = ico('camera') + ` ${done}/${total} demo files saved — reopen with signal to finish`;
  } catch { /* storage unavailable (private mode) — photos still load live */ }
}

/* Nuclear option for stuck installs: drop the old service worker and caches
 * (saved weights and progress live in localStorage and are untouched), then
 * reload straight from the network. */
async function forceUpdate() {
  const btn = $('#checkUpdate');
  btn.disabled = true;
  btn.innerHTML = ico('hourglass') + ' Refreshing…';
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== PHOTO_CACHE).map((k) => caches.delete(k)));
    }
  } catch { /* still reload */ }
  location.replace(location.pathname + '?fresh=' + Date.now());
}

$('#checkUpdate').addEventListener('click', forceUpdate);
window.addEventListener('online', prefetchPhotos);

render();
renderVideoLibrary();
prefetchPhotos();
hideSplash();
$('#checkUpdate').innerHTML = ico('refresh') + ' Check for updates';
$('#videoLibrary summary').innerHTML = ico('film') + ' Form video library &amp; offline setup (YouTube Premium)';

/* The splash screen is in the HTML from the first paint; fade it out once
 * the app has rendered, but never before ~1.1 s so it reads as a real
 * opening rather than a flicker. */
function hideSplash() {
  const el = $('#splash');
  if (!el) return;
  const MIN_MS = 1100;
  const elapsed = (typeof performance !== 'undefined' && performance.now) ? performance.now() : MIN_MS;
  const go = () => {
    el.classList.add('hide');
    const remove = () => el.remove();
    el.addEventListener('transitionend', remove, { once: true });
    setTimeout(remove, 600);   // in case transitions are disabled
  };
  setTimeout(go, Math.max(0, MIN_MS - elapsed));
}
