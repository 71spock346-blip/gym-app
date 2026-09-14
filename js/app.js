/* Stay Strong — weekly plan generator + UI.
 * Every calendar week gets a deterministic seed, so the plan is stable within
 * a week but different from every other week: new exercise combos, new
 * set/rep schemes (4-week phase cycle) and adjusted weight suggestions.
 */

'use strict';

const APP_VERSION = 12;  // keep in step with the CACHE version in sw.js

/* ------------------------------ training phases ------------------------------ */
/* 4-week cycle. pct scales the user's saved working weight (a comfortable
 * ~10-rep load). Isolation moves never drop below 8 reps, even in strength week. */
const PHASES = [
  {
    key: 'hypertrophy', name: 'Hypertrophy', badge: '💪',
    desc: 'Muscle-building week: moderate weight, controlled 2–3 second negatives.',
    sets: [3, 4], reps: [[8, 12], [10, 12]], rest: '60–90 s',
    tempo: '1 s up · squeeze · 2–3 s down', restSec: 75,
    pct: 1.0, isoPct: 1.0, isoReps: [[10, 12], [12, 15]],
  },
  {
    key: 'strength', name: 'Strength', badge: '🏋️',
    desc: 'Heavy week: bigger loads, fewer reps, full rests between sets.',
    sets: [4, 5], reps: [[4, 6], [5, 6]], rest: '2–3 min',
    tempo: 'drive up hard · 2 s down', restSec: 150,
    pct: 1.15, isoPct: 1.05, isoReps: [[8, 10], [8, 12]],
  },
  {
    key: 'volume', name: 'Volume', badge: '🔥',
    desc: 'Pump week: lighter weight, high reps, short rests. Chase the burn.',
    sets: [3, 3], reps: [[12, 15], [15, 20]], rest: '45–60 s',
    tempo: 'steady rhythm · 1–2 s each way', restSec: 50,
    pct: 0.85, isoPct: 0.85, isoReps: [[15, 20], [12, 15]],
  },
  {
    key: 'deload', name: 'Deload', badge: '🧘',
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
    key: 'build', name: 'Build muscle', emoji: '💪',
    desc: 'Full rests and progressive overload — maximum strength and size.',
    repsDelta: 0, restMult: 1, pctMult: 1, finisher: false,
  },
  fatloss: {
    key: 'fatloss', name: 'Lose fat', emoji: '🔥',
    desc: 'Same exercises, higher reps and short rests to keep your heart rate up, plus a cardio finisher. You keep your muscle while the calories burn.',
    repsDelta: 3, restMult: 0.65, pctMult: 0.85, finisher: true,
  },
};

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

function currentGoal() { return GOALS[state.goal] || GOALS.build; }

const KG_PER_LB = 0.45359237;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
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
  weekOffset: 0,                                   // 0 = current week
  selectedDay: defaultDayIndex(),
  unit: store.read('unit', 'kg'),                  // 'kg' | 'lb'
  goal: store.read('goal', null),                  // 'build' | 'fatloss' | null = ask
  baselines: store.read('baselines', {}),          // { exId: { w: kg, c: cycleWhenSet } }
  done: store.read('done', {}),                    // { 'YYYY-MM-DD': { exId: completedSets } }
};

/* ------------------------------ date helpers ------------------------------ */
function startOfWeekUTC(date) {
  const d = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const dow = (new Date(d).getUTCDay() + 6) % 7;   // Mon=0 … Sun=6
  return d - dow * 24 * 60 * 60 * 1000;
}

function currentWeekIndex() {
  return Math.floor((startOfWeekUTC(new Date()) - WEEK_EPOCH) / MS_PER_WEEK);
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
  const d = new Date(displayedWeekMonday().getTime() + dayIdx * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
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
 * together still see the same exercises. */
const ANTI_REPEAT_ANCHOR = Math.floor((Date.UTC(2026, 0, 5) - WEEK_EPOCH) / MS_PER_WEEK);

function pickExercises(day, weekIdx, dayIdx) {
  let prevIds = new Set();
  let picks = null;
  for (let w = Math.min(weekIdx, ANTI_REPEAT_ANCHOR); w <= weekIdx; w++) {
    picks = pickWeek(day, w, dayIdx, prevIds);
    prevIds = new Set(picks.map((ex) => ex.id));
  }
  return picks;
}

function pickWeek(day, weekIdx, dayIdx, prevIds) {
  const rng = mulberry32(weekIdx * 7919 + dayIdx * 104729 + 17);
  const phase = phaseForWeek(weekIdx);
  const flavour = (ex) => {
    if (phase.key === 'strength') return ex.tags.includes('compound') ? 0 : 1;
    if (phase.key === 'volume') return ex.tags.includes('compound') ? 1 : 0;
    return 0;
  };
  const pool = seededShuffle(EXERCISE_DB[day.key], rng)
    .map((ex, i) => ({ ex, i }))
    .sort((a, b) =>
      (prevIds.has(a.ex.id) - prevIds.has(b.ex.id)) ||
      (flavour(a.ex) - flavour(b.ex)) ||
      (a.i - b.i))
    .map((o) => o.ex);

  const chosen = [];
  const taken = new Set();
  for (const slot of day.slots) {
    let need = slot.count;
    for (const ex of pool) {
      if (need === 0) break;
      if (!taken.has(ex.id) && ex.tags.includes(slot.tag)) {
        chosen.push(ex); taken.add(ex.id); need--;
      }
    }
  }
  for (const ex of pool) {
    if (chosen.length >= day.picks) break;
    if (!taken.has(ex.id)) { chosen.push(ex); taken.add(ex.id); }
  }

  const isCompound = (ex) => ex.tags.includes('compound');
  const isFinisher = (ex) => ex.tags.includes('finisher');
  chosen.sort((a, b) =>
    (isFinisher(a) - isFinisher(b)) || (isCompound(b) - isCompound(a)));
  return chosen.slice(0, day.picks);
}

/* Per-exercise scheme for the week: sets/reps drawn from the phase's options
 * with a seeded per-exercise variation, so schemes differ between exercises
 * and between weeks. */
function schemeFor(ex, phase, weekIdx, exOrdinal) {
  const rng = mulberry32(weekIdx * 31337 + exOrdinal * 977 + hashId(ex.id));
  const iso = !ex.tags.includes('compound');
  const goal = currentGoal();
  const repsOptions = iso ? phase.isoReps : phase.reps;
  let [lo, hi] = repsOptions[Math.floor(rng() * repsOptions.length)];
  lo = Math.min(lo + goal.repsDelta, 18);
  hi = Math.min(hi + goal.repsDelta, 22);
  const sets = phase.sets[Math.floor(rng() * phase.sets.length)];
  const restSec = Math.max(40, Math.round((phase.restSec * goal.restMult) / 5) * 5);
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
function swapSuggestion(ex, dayKey, chosenIds, weekIdx) {
  const pool = EXERCISE_DB[dayKey];
  const specific = ex.tags.filter((t) => !GENERIC_TAGS.has(t));
  const rank = (e) => {
    if (e.id === ex.id) return -1;
    const shared = e.tags.some((t) => specific.includes(t));
    if (!shared) return -1;
    return chosenIds.has(e.id) ? 1 : 2;   // prefer exercises not already planned today
  };
  const candidates = pool.filter((e) => rank(e) > 0).sort((a, b) => rank(b) - rank(a));
  if (!candidates.length) return null;
  const top = candidates.filter((e) => rank(e) === rank(candidates[0]));
  const rng = mulberry32(weekIdx * 52711 + hashId(ex.id));
  return top[Math.floor(rng() * top.length)];
}

function videoUrl(ex) {
  return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(ex.video || ex.name + ' proper form');
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

function parseWeightInput(text) {
  const n = parseFloat(String(text).replace(',', '.'));
  if (!isFinite(n) || n <= 0) return null;
  return state.unit === 'lb' ? n * KG_PER_LB : n;
}

/* ------------------------------ set tracking ------------------------------ */
function doneCount(dateISO, exId) {
  return (state.done[dateISO] && state.done[dateISO][exId]) || 0;
}

function setDoneCount(dateISO, exId, count) {
  if (!state.done[dateISO]) state.done[dateISO] = {};
  state.done[dateISO][exId] = count;
  pruneDone();
  store.write('done', state.done);
}

function pruneDone() {
  const keys = Object.keys(state.done).sort();
  while (keys.length > 60) delete state.done[keys.shift()];
}

/* ------------------------------ rendering ------------------------------ */
const $ = (sel) => document.querySelector(sel);

function render() {
  renderHeader();
  renderPhaseBanner();
  renderTabs();
  renderDay();
}

function renderHeader() {
  const monday = displayedWeekMonday();
  const friday = new Date(monday.getTime() + 4 * 24 * 60 * 60 * 1000);
  const fmt = (d) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const offsetNote = state.weekOffset === 0 ? '' :
    state.weekOffset > 0 ? ` · in ${state.weekOffset} wk` : ` · ${-state.weekOffset} wk ago`;
  $('#weekTitle').textContent = `Week ${isoWeekNumber(monday)}${offsetNote}`;
  $('#weekDates').textContent = `${fmt(monday)} – ${fmt(friday)}`;
  $('#unitToggle').textContent = state.unit;
  $('#appVersion').textContent = `Stay Strong v${APP_VERSION}`;
}

function renderPhaseBanner() {
  const phase = phaseForWeek(displayedWeekIndex());
  const goal = currentGoal();
  $('#phaseBanner').innerHTML = `
    <div class="phase-head">
      <span class="phase-badge">${phase.badge}</span>
      <span class="phase-name phase-${phase.key}">${phase.name} week</span>
      <button id="goalPill" class="goal-pill" type="button"
        title="Tap to switch goal">${goal.emoji} ${goal.name} ⇄</button>
    </div>
    <p class="phase-desc">${phase.desc}</p>`;
}

function renderTabs() {
  const tabs = DAYS.map((day, i) => `
    <button class="day-tab ${i === state.selectedDay ? 'active' : ''}" data-day="${i}" type="button">
      <span class="day-tab-dow">${day.label}</span>
      <span class="day-tab-name">${day.emoji} ${day.name}</span>
    </button>`).join('');
  $('#dayTabs').innerHTML = tabs;
}

function renderDay() {
  const weekIdx = displayedWeekIndex();
  const phase = phaseForWeek(weekIdx);
  const dayIdx = state.selectedDay;
  const day = DAYS[dayIdx];
  const exercises = pickExercises(day, weekIdx, dayIdx);
  const dateISO = dayDateISO(dayIdx);
  const todayISO = new Date().toISOString().slice(0, 10);

  const isToday = dateISO === todayISO;
  const dow = (new Date().getDay() + 6) % 7;
  const weekendNote = (state.weekOffset === 0 && dow > 4)
    ? `<div class="note-card">😴 It’s the weekend — rest up! Here’s Monday’s ${day.name} session.</div>` : '';

  const chosenIds = new Set(exercises.map((ex) => ex.id));
  const cards = exercises.map((ex, i) => exerciseCard(ex, i, phase, weekIdx, dateISO, day, chosenIds)).join('');

  // Until this phone has explicitly picked a goal, show a one-time pointer
  // to the switch — that's all the setup a second person needs.
  const goalHint = state.goal === null ? `
    <div class="note-card goal-hint">👋 Training as a pair? This phone is set to
      <strong>💪 Build muscle</strong>. Tap the pill at the top to switch to
      <strong>🔥 Lose fat</strong> — same exercises, tuned reps, rests and weights.
      Each phone keeps its own choice.
      <button id="goalHintDismiss" class="hint-dismiss" type="button">Got it 👍</button>
    </div>` : '';

  $('#content').innerHTML = `
    ${goalHint}
    ${weekendNote}
    <div class="day-heading">
      <h2>${day.emoji} ${day.name}</h2>
      <span class="day-date ${isToday ? 'today' : ''}">${isToday ? 'Today' : new Date(dateISO + 'T00:00:00Z')
        .toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' })}</span>
    </div>
    <div class="warmup-card">
      <strong>🔥 Warm-up first</strong>
      <ol class="warmup-list">${day.warmup.map((s) => `<li>${s}</li>`).join('')}</ol>
    </div>
    ${cards}
    ${finisherCard(weekIdx, dayIdx)}`;
}

/* Fat-loss mode ends every session with a rotating cardio finisher. */
function finisherCard(weekIdx, dayIdx) {
  if (!currentGoal().finisher) return '';
  const rng = mulberry32(weekIdx * 6011 + dayIdx * 389);
  const fin = FINISHERS[Math.floor(rng() * FINISHERS.length)];
  return `
  <article class="exercise-card finisher-card">
    <div class="exercise-top">
      <div class="exercise-icon finisher-icon">🏃</div>
      <div class="exercise-info">
        <h3 class="exercise-name">Cardio finisher: ${fin.name}</h3>
        <div class="exercise-meta">
          <span class="chip chip-gear">${fin.time}</span>
          <span class="chip chip-muscle">Fat burn</span>
        </div>
      </div>
    </div>
    <p class="finisher-how">${fin.how}</p>
    <p class="finisher-note">Straight after your last set, while your heart rate is already up.
    And remember: fat loss is won mostly in the kitchen — this builds the shape underneath. 🍎</p>
  </article>`;
}

function exerciseCard(ex, i, phase, weekIdx, dateISO, day, chosenIds) {
  const scheme = schemeFor(ex, phase, weekIdx, i);
  const suggested = suggestedWeightKg(ex, scheme, weekIdx);
  const weightText = formatWeight(suggested);
  const base = state.baselines[ex.id];
  const baseText = base && base.w
    ? (state.unit === 'lb' ? Math.round(base.w / KG_PER_LB) : Math.round(base.w * 10) / 10)
    : '';
  const completed = doneCount(dateISO, ex.id);
  const isBodyweight = /bodyweight/i.test(ex.gear);

  const bubbles = Array.from({ length: scheme.sets }, (_, s) => `
    <button class="set-bubble ${s < completed ? 'done' : ''}" type="button"
      data-ex="${ex.id}" data-set="${s + 1}" data-date="${dateISO}" data-rest="${scheme.restSec}"
      aria-label="Mark set ${s + 1}">${s + 1}</button>`).join('');

  const weightBlock = isBodyweight
    ? `<div class="weight-line"><span class="weight-suggest">Bodyweight — go to near-failure</span></div>`
    : `<div class="weight-line">
        <span class="weight-suggest">${weightText
          ? `🎯 Suggested: <strong>${weightText}</strong>`
          : `Set your weight to get weekly suggestions →`}</span>
        <label class="weight-input-wrap">
          <input class="weight-input" type="number" inputmode="decimal" min="1" step="0.5"
            placeholder="wt" value="${baseText}" data-ex="${ex.id}" aria-label="Your working weight" />
          <span class="weight-unit">${state.unit}</span>
        </label>
      </div>`;

  return `
  <article class="exercise-card">
    <div class="exercise-top">
      <div class="exercise-icon">${ICONS[ex.icon] || ICONS.dumbbell}</div>
      <div class="exercise-info">
        <h3 class="exercise-name">${i + 1}. ${ex.name}</h3>
        <div class="exercise-meta">
          <span class="chip chip-gear">${ex.gear}</span>
          <span class="chip chip-muscle">${ex.muscles}</span>
          <a class="chip chip-video" href="${videoUrl(ex)}" target="_blank" rel="noopener">▶ Video</a>
        </div>
      </div>
    </div>
    <div class="scheme-row">
      <span class="scheme-pill">${scheme.sets} × ${scheme.repsLo}–${scheme.repsHi} reps</span>
      <span class="scheme-rest">rest ${scheme.rest}</span>
    </div>
    <div class="tempo-line">⏱ ${phase.tempo}</div>
    ${weightBlock}
    <div class="sets-row">${bubbles}</div>
    <details class="howto">
      <summary>📖 How to use this machine</summary>
      <div class="howto-body">
        <a class="video-link" href="${videoUrl(ex)}" target="_blank" rel="noopener">
          ▶ Watch form videos on YouTube
        </a>
        <h4>Set-up</h4>
        <ol>${ex.setup.map((s) => `<li>${s}</li>`).join('')}</ol>
        <h4>Doing the exercise</h4>
        <ol>${ex.execution.map((s) => `<li>${s}</li>`).join('')}</ol>
        <h4>Tips</h4>
        <ul>${ex.tips.map((s) => `<li>${s}</li>`).join('')}</ul>
        ${ex.mistakes ? `<h4>Common mistakes</h4>
        <ul class="mistakes">${ex.mistakes.map((s) => `<li>${s}</li>`).join('')}</ul>` : ''}
        ${swapLine(ex, day, chosenIds, weekIdx)}
      </div>
    </details>
  </article>`;
}

function swapLine(ex, day, chosenIds, weekIdx) {
  const alt = swapSuggestion(ex, day.key, chosenIds, weekIdx);
  if (!alt) return '';
  return `<div class="swap-line">🔄 <strong>Machine busy?</strong> Swap for: ${alt.name} (${alt.gear.toLowerCase()})</div>`;
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
  el.hidden = false;
  el.classList.remove('done');
  document.body.classList.add('timer-on');
  $('#restEmoji').textContent = '⏳';
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
  $('#restEmoji').textContent = '🔔';
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
  $('#restTimer').hidden = true;
  document.body.classList.remove('timer-on');
}

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
  if (e.target.closest('#goalPill')) {
    state.goal = currentGoal().key === 'build' ? 'fatloss' : 'build';
    store.write('goal', state.goal);
    render();
    return;
  }
  if (e.target.closest('#goalHintDismiss')) {
    state.goal = 'build';        // explicit choice = hint never comes back
    store.write('goal', state.goal);
    render();
    return;
  }
  const tab = e.target.closest('.day-tab');
  if (tab) {
    state.selectedDay = Number(tab.dataset.day);
    renderTabs(); renderDay();
    return;
  }
  const bubble = e.target.closest('.set-bubble');
  if (bubble) {
    const { ex, set, date } = bubble.dataset;
    const setNum = Number(set);
    const current = doneCount(date, ex);
    const completing = current !== setNum;
    // Tapping the last completed bubble un-completes it; otherwise complete up to here.
    setDoneCount(date, ex, completing ? setNum : setNum - 1);
    if (completing) {
      ensureAudio();   // user tap = the moment we're allowed to unlock sound
      const restSec = Number(bubble.dataset.rest) || 60;
      const exercise = EXERCISE_DB[DAYS[state.selectedDay].key].find((x) => x.id === ex);
      startRestTimer(restSec, `Rest — ${exercise ? exercise.name : 'set'} · set ${setNum} done`);
    }
    renderDay();
  }
});

document.addEventListener('change', (e) => {
  const input = e.target.closest('.weight-input');
  if (!input) return;
  const kg = parseWeightInput(input.value);
  const exId = input.dataset.ex;
  if (kg) {
    state.baselines[exId] = { w: kg, c: cycleForWeek(currentWeekIndex()) };
  } else {
    delete state.baselines[exId];
  }
  store.write('baselines', state.baselines);
  renderDay();
});

$('#prevWeek').addEventListener('click', () => { state.weekOffset--; render(); });
$('#nextWeek').addEventListener('click', () => { state.weekOffset++; render(); });

$('#unitToggle').addEventListener('click', () => {
  state.unit = state.unit === 'kg' ? 'lb' : 'kg';
  store.write('unit', state.unit);
  render();
});

render();
