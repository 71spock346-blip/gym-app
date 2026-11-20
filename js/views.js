/* Stay Strong — Plan, Library and the Progress body map, plus the colour theme.
 *
 * Loaded before app.js: everything here is a function that runs after app.js
 * has set up `state`, `store` and the helpers, so nothing reads them at load.
 *
 *   Plan     the week at a glance (Mon–Sun strip, weekly goal, what each day trains)
 *   Library  every exercise, with search and Muscle group / Equipment filters
 *   Progress the muscles you trained, lit on the drawn figure (above the history)
 *   Colour   Ember (charcoal and orange) or Lime (the original look)
 */

/* ------------------------------ colour theme ------------------------------ */
const THEMES = [
  { key: 'ember', name: 'Ember', short: 'Charcoal and orange', badge: '<i class="swatch swatch-ember"></i>', meta: '#15171b' },
  { key: 'lime', name: 'Lime', short: 'The original black and lime', badge: '<i class="swatch swatch-lime"></i>', meta: '#080b06' },
];
const DEFAULT_THEME = 'ember';
function currentTheme() {
  const t = store.read('theme', DEFAULT_THEME);
  return THEMES.some((x) => x.key === t) ? t : DEFAULT_THEME;
}
function applyTheme(key) {
  const t = THEMES.find((x) => x.key === key) || THEMES[0];
  document.documentElement.dataset.theme = t.key;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t.meta);
}
function themePanel() {
  return `<div class="choice-grid two">${choiceCards('set-theme', THEMES, currentTheme(), 'theme')}</div>
    <p class="hint">Done sets stay green and sets still to do stay red in both.</p>`;
}

/* ------------------------------ shared bits ------------------------------ */
const allExercises = (() => {
  let list = null;
  return () => {
    if (list) return list;
    const seen = new Set();
    list = [];
    for (const group of Object.values(EXERCISE_DB)) for (const ex of group) if (!seen.has(ex.id)) { seen.add(ex.id); list.push(ex); }
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  };
})();
const plainMuscles = (ex) => String(ex.muscles || '').replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+,/g, ',').trim();
const isoPlusDays = (date, n) => new Date(date.getTime() + n * MS_PER_DAY).toISOString().slice(0, 10);

/* A square picture for a list row: your own thumbnail, else the finish photo,
 * else the kit pictogram. */
function exerciseThumb(ex) {
  if (hasThumb(ex)) return `<img src="${thumbSrc(ex.id)}" alt="" loading="lazy" />`;
  if (DEMO_PHOTOS[ex.id]) return `<img src="${photoUrl(ex.id, 1)}" alt="" loading="lazy" />`;
  return `<span class="lib-glyph">${ICONS[ex.icon] || ICONS.dumbbell}</span>`;
}

/* ------------------------------ Plan ------------------------------ */
const GOAL_CHOICES = [2, 3, 4, 5];
function weeklyGoal() { const g = Number(store.read('weeklyGoal', 4)); return GOAL_CHOICES.includes(g) ? g : 4; }

function planDay(i) {
  const weekIdx = displayedWeekIndex();
  const day = currentDays()[i];
  const iso = dayDateISO(i);
  const planned = pickExercises(day, weekIdx, i);
  const exercises = planned.map((ex) => swappedFor(iso, ex.id) || ex);
  return { day, iso, exercises, session: state.sessions[iso] };
}

function renderPlan() {
  const monday = displayedWeekMonday();
  const today = todayISO();
  const weekIdx = displayedWeekIndex();
  const phase = phaseForWeek(weekIdx);
  const fmt = (iso) => new Date(iso + 'T00:00:00Z').toLocaleDateString(undefined, { day: 'numeric', month: 'short', timeZone: 'UTC' });
  const days = currentDays().map((_, i) => planDay(i));

  const strip = [0, 1, 2, 3, 4, 5, 6].map((d) => {
    const iso = isoPlusDays(monday, d);
    const s = state.sessions[iso];
    const dow = new Date(iso + 'T00:00:00Z').toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' });
    const mark = s ? (s.completed ? 'full' : 'part') : (d < 5 ? 'planned' : '');
    return `<button class="strip-day ${iso === today ? 'today' : ''}" type="button"
      ${d < 5 ? `data-plan-day="${d}"` : 'disabled'} aria-label="${dow} ${fmt(iso)}${s ? (s.completed ? ', done' : ', started') : ''}">
      <span class="strip-dow">${dow}</span><span class="strip-num">${Number(iso.slice(8))}</span><i class="strip-dot ${mark}"></i></button>`;
  }).join('');

  const goal = weeklyGoal();
  const doneThisWeek = days.filter((x) => x.session && x.session.completed).length;
  const started = days.filter((x) => x.session).length;
  const pct = Math.min(100, Math.round((100 * doneThisWeek) / goal));

  const cards = days.map((x, i) => {
    const s = x.session;
    const status = s ? (s.completed ? `<span class="plan-status done">${ico('check')} Done</span>` : `<span class="plan-status part">${s.sets}/${s.total} sets</span>`)
      : x.iso === today ? '<span class="plan-status today">Today</span>'
        : x.iso < today ? '<span class="plan-status missed">Missed</span>' : '';
    const names = x.exercises.slice(0, 4).map((ex) => esc(ex.name)).join(' · ') + (x.exercises.length > 4 ? ' …' : '');
    return `
    <button class="plan-card ${x.iso === today ? 'is-today' : ''} ${s && s.completed ? 'is-done' : ''}" type="button" data-plan-day="${i}">
      <span class="plan-when"><span class="plan-dow">${x.day.label}</span><span class="plan-date">${fmt(x.iso)}</span></span>
      <span class="plan-main">
        <span class="plan-name">${dayName(x.day)}</span>
        <span class="plan-ex">${x.exercises.length} exercises · ${names}</span>
      </span>
      ${status}
      <span class="plan-go">${ico('arrowRight')}</span>
    </button>`;
  }).join('');

  $('#view-plan').innerHTML = `
    <div class="page-head"><h1 class="page-title">Plan</h1></div>
    <div class="plan-week">
      <button class="round-btn" id="planPrev" type="button" aria-label="Previous week">‹</button>
      <div class="plan-range"><strong>${fmt(isoPlusDays(monday, 0))} – ${fmt(isoPlusDays(monday, 6))}</strong>
        <small>${state.weekOffset === 0 ? 'This week' : state.weekOffset > 0 ? `In ${state.weekOffset} week${state.weekOffset > 1 ? 's' : ''}` : `${-state.weekOffset} week${state.weekOffset < -1 ? 's' : ''} ago`} · ${phase.name} week</small></div>
      <button class="round-btn" id="planNext" type="button" aria-label="Next week">›</button>
    </div>
    <div class="week-strip">${strip}</div>
    <div class="goal-head"><span class="eyebrow">Weekly goal</span>
      <span class="goal-set" role="group" aria-label="Sessions a week">${GOAL_CHOICES.map((n) => `<button class="goal-chip ${n === goal ? 'on' : ''}" type="button" data-goal-n="${n}">${n}</button>`).join('')}</span></div>
    <div class="goal-card">
      <div class="goal-nums"><strong>${doneThisWeek}</strong><span>of ${goal} sessions${started > doneThisWeek ? ` · ${started - doneThisWeek} started` : ''}</span></div>
      <div class="goal-bar"><i style="width:${pct}%"></i></div>
      <small>${doneThisWeek >= goal ? 'Goal reached this week. Nice work.' : `${goal - doneThisWeek} more to reach your goal.`}</small>
    </div>
    <h2 class="eyebrow plan-sub">Your sessions</h2>
    ${cards}
    <div class="plan-card plan-rest"><span class="plan-when"><span class="plan-dow">Sat–Sun</span></span>
      <span class="plan-main"><span class="plan-name">Rest</span><span class="plan-ex">A walk or a stretch helps you recover.</span></span></div>`;
}

/* ------------------------------ Library ------------------------------ */
const FRONT_MUSCLES = ['chest', 'front-delts', 'side-delts', 'biceps', 'forearms', 'abs', 'obliques', 'quads', 'adductors', 'calves'];
const BACK_MUSCLES = ['traps', 'rear-delts', 'lats', 'upper-back', 'lower-back', 'triceps', 'glutes', 'hamstrings', 'calves'];
const KITS = [
  { key: 'all', name: 'All equipment' },
  { key: 'barbell', name: 'Barbell' },
  { key: 'dumbbell', name: 'Dumbbells' },
  { key: 'cable', name: 'Cable' },
  { key: 'machine', name: 'Machine' },
  { key: 'kettlebell', name: 'Kettlebell or plate' },
  { key: 'body', name: 'Bodyweight' },
];
function kitOf(ex) {
  const g = String(ex.gear || '').toLowerCase();
  if (/cable|pulley|lat pulldown/.test(g)) return 'cable';
  if (/machine|smith|leverage|station|tower|stack/.test(g)) return 'machine';
  if (/barbell|ez[ -]?(curl )?bar|ez-bar|landmine|trap bar/.test(g)) return 'barbell';
  if (/dumbbell/.test(g)) return 'dumbbell';
  if (/kettlebell|plate/.test(g)) return 'kettlebell';
  return 'body';
}

const lib = { q: '', muscle: null, kit: 'all', sheet: null, side: 'front', pickMuscle: null, open: null };

function libMatches() {
  const q = lib.q.trim().toLowerCase();
  const out = [];
  for (const ex of allExercises()) {
    if (lib.kit !== 'all' && kitOf(ex) !== lib.kit) continue;
    if (q && !(`${ex.name} ${ex.muscles} ${ex.gear}`.toLowerCase().includes(q))) continue;
    let rank = 0;
    if (lib.muscle) {
      const f = focusFor(ex);
      if (f.primary.includes(lib.muscle)) rank = 0;
      else if (f.secondary.includes(lib.muscle)) rank = 1;
      else continue;
    }
    out.push([rank, ex]);
  }
  return out.sort((a, b) => a[0] - b[0]).map((x) => x[1]);
}

function libRow(ex) {
  return `
  <button class="lib-row" type="button" data-lib-ex="${ex.id}">
    <span class="lib-thumb">${exerciseThumb(ex)}</span>
    <span class="lib-text"><strong>${esc(ex.name)}</strong><span>${esc(plainMuscles(ex))}</span><small>${esc(ex.gear)}</small></span>
    <span class="lib-chev" aria-hidden="true">›</span>
  </button>`;
}

function renderLibList() {
  const list = libMatches();
  const el = $('#libList');
  if (!el) return;
  el.innerHTML = list.length
    ? `<p class="lib-count">${list.length} exercise${list.length === 1 ? '' : 's'}</p>${list.map(libRow).join('')}`
    : '<p class="empty">Nothing matches. Try another word or clear a filter.</p>';
}

function renderLibrary() {
  const kit = KITS.find((k) => k.key === lib.kit);
  const chev = '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  $('#view-library').innerHTML = `
    <div class="page-head"><h1 class="page-title">Exercises</h1></div>
    <label class="lib-search">
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
      <input id="libSearch" type="search" placeholder="Search exercises" autocomplete="off" value="${esc(lib.q)}" aria-label="Search exercises" />
    </label>
    <div class="lib-filters">
      <button id="libMuscleBtn" class="filter-btn ${lib.muscle ? 'on' : ''}" type="button">${lib.muscle ? MUSCLE_LABELS[lib.muscle] : 'Muscle group'} ${chev}</button>
      <button id="libKitBtn" class="filter-btn ${lib.kit !== 'all' ? 'on' : ''}" type="button">${lib.kit !== 'all' ? kit.name : 'Equipment'} ${chev}</button>
    </div>
    ${lib.muscle || lib.kit !== 'all' || lib.q ? '<button id="libClear" class="lib-clear" type="button">Clear filters</button>' : ''}
    <div id="libList"></div>`;
  renderLibList();
}

/* ------------------------------ overlay: filter sheets and the exercise page ------------------------------ */
function overlayEl() {
  let el = document.getElementById('overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'overlay';
    el.className = 'overlay';
    el.hidden = true;
    document.body.appendChild(el);
  }
  return el;
}
function overlayOpen() { return !!(lib.sheet || lib.open); }

function muscleSheet() {
  const muscles = lib.side === 'front' ? FRONT_MUSCLES : BACK_MUSCLES;
  const pick = lib.pickMuscle;
  return `
  <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle">
    <div class="sheet-grip"></div>
    <div class="sheet-head"><h2 id="sheetTitle">Choose the muscle group</h2>
      <button class="round-btn sheet-close" type="button" aria-label="Close">×</button></div>
    <div class="seg" role="tablist">
      <button class="seg-btn ${lib.side === 'front' ? 'on' : ''}" type="button" data-side="front" role="tab" aria-selected="${lib.side === 'front'}">Front</button>
      <button class="seg-btn ${lib.side === 'back' ? 'on' : ''}" type="button" data-side="back" role="tab" aria-selected="${lib.side === 'back'}">Back</button>
    </div>
    <div class="pick-figure">${bodyMapSVG(pick ? [pick] : [], [], 'pick-map', lib.side)}</div>
    <p class="pick-hint">Tap a muscle on the figure or a name below.</p>
    <div class="pick-grid">${muscles.map((m) => `<button class="pick-btn ${m === pick ? 'on' : ''}" type="button" data-muscle="${m}">${MUSCLE_LABELS[m]}</button>`).join('')}</div>
    <div class="sheet-foot">
      ${pick ? '<button class="ghost-btn" id="muscleAny" type="button">Any muscle</button>' : ''}
      <button class="primary-btn" id="muscleApply" type="button">${pick ? `Show ${MUSCLE_LABELS[pick].toLowerCase()} exercises` : 'Show all exercises'}</button>
    </div>
  </div>`;
}

function kitSheet() {
  return `
  <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle">
    <div class="sheet-grip"></div>
    <div class="sheet-head"><h2 id="sheetTitle">Choose the equipment</h2>
      <button class="round-btn sheet-close" type="button" aria-label="Close">×</button></div>
    <div class="kit-list">${KITS.map((k) => `
      <button class="kit-row ${k.key === lib.kit ? 'on' : ''}" type="button" data-kit="${k.key}">${k.name}${k.key === lib.kit ? ico('check') : ''}</button>`).join('')}
    </div>
  </div>`;
}

function exercisePage(ex) {
  const f = focusFor(ex);
  const plain = plainMuscles(ex);
  return `
  <div class="ex-page" role="dialog" aria-modal="true" aria-labelledby="exPageTitle">
    <div class="ex-page-bar">
      <button class="round-btn sheet-close" type="button" aria-label="Back">‹</button>
      <h2 id="exPageTitle">${esc(ex.name)}</h2>
    </div>
    <div class="ex-page-body">
      <div class="ex-page-hero">
        <span class="lib-thumb big">${exerciseThumb(ex)}</span>
        <div>
          <div class="ex-page-muscles">${esc(plain)}</div>
          <div class="ex-page-gear">${esc(ex.gear)}</div>
          ${f.cue ? `<p class="ex-page-cue">${f.cue}</p>` : ''}
        </div>
      </div>
      <div class="howto-body">${guideHtml(ex)}</div>
    </div>
  </div>`;
}

function renderOverlay() {
  const el = overlayEl();
  if (!overlayOpen()) { el.hidden = true; el.innerHTML = ''; document.body.classList.remove('overlay-open'); return; }
  const ex = lib.open && findExercise(lib.open);
  el.className = 'overlay ' + (ex ? 'is-page' : 'is-sheet');
  el.innerHTML = ex ? exercisePage(ex) : lib.sheet === 'muscle' ? muscleSheet() : kitSheet();
  el.hidden = false;
  document.body.classList.add('overlay-open');
}
function openOverlay() {
  const wasOpen = !overlayEl().hidden;
  renderOverlay();
  if (!wasOpen) { const p = overlayEl().querySelector('.sheet, .ex-page'); if (p) p.scrollTop = 0; }
  if (typeof history !== 'undefined' && history.pushState && histState() !== 'overlay') history.pushState({ ss: 'overlay' }, '');
}
/* fromBack: the back button already took the overlay's history entry. */
function closeOverlay(fromBack) {
  lib.sheet = null; lib.open = null;
  renderOverlay();
  if (!fromBack && histState() === 'overlay') { backNav.ignore = true; history.back(); }
}

/* ------------------------------ Progress: muscles trained ------------------------------ */
/* Sets per muscle from the ticked sets: a set counts in full for the exercise's
 * main muscles and half for the ones also working. */
function trainedMuscles(weeks) {
  const thisWeek = currentWeekIndex();
  const sets = {};
  for (const [iso, exs] of Object.entries(state.done)) {
    const w = weekIndexOfISO(iso);
    if (w > thisWeek || w <= thisWeek - weeks) continue;
    for (const [id, n] of Object.entries(exs || {})) {
      const ex = n > 0 && findExercise(id);
      if (!ex) continue;
      const f = focusFor(ex);
      for (const r of f.primary) sets[r] = (sets[r] || 0) + n;
      for (const r of f.secondary) sets[r] = (sets[r] || 0) + n / 2;
    }
  }
  return sets;
}

let progressRange = 1;   // weeks: 1 = this week, 4 = the last four
function progressMapHtml() {
  const sets = trainedMuscles(progressRange);
  const strong = progressRange === 1 ? 6 : 20;   // about a week's worth of hard sets for one muscle
  const regions = Object.keys(sets).filter((r) => sets[r] > 0);
  const primary = regions.filter((r) => sets[r] >= strong);
  const secondary = regions.filter((r) => sets[r] < strong);
  const top = regions.sort((a, b) => sets[b] - sets[a]);
  const max = top.length ? sets[top[0]] : 1;
  const rows = top.map((r) => `
    <div class="mus-row"><span>${MUSCLE_LABELS[r]}</span><i class="mus-bar"><b style="width:${Math.max(6, Math.round((100 * sets[r]) / max))}%"></b></i><strong>${Math.round(sets[r])}</strong></div>`).join('');
  return `
    <div class="page-head"><h1 class="page-title">Progress</h1></div>
    <div class="seg prog-seg" role="tablist">
      <button class="seg-btn ${progressRange === 1 ? 'on' : ''}" type="button" data-range="1">This week</button>
      <button class="seg-btn ${progressRange === 4 ? 'on' : ''}" type="button" data-range="4">Last 4 weeks</button>
    </div>
    <div class="prog-figure" role="img" aria-label="${regions.length ? `Muscles trained: ${top.map((r) => MUSCLE_LABELS[r]).join(', ')}` : 'No muscles trained yet'}">
      ${bodyMapSVG(primary, secondary, 'prog-map')}
      <div class="prog-labels"><span>Front</span><span>Back</span></div>
    </div>
    <p class="cal-key prog-key"><span class="key lit"></span> worked hard (${strong}+ sets) <span class="key half"></span> some work</p>
    ${rows ? `<h2 class="section-title">Sets per muscle</h2><div class="mus-list">${rows}</div>`
      : `<p class="empty">Tick off sets in a workout and the muscles you trained light up here.</p>`}`;
}

/* ------------------------------ events ------------------------------ */
document.addEventListener('click', (e) => {
  const t = e.target;
  // theme
  const th = t.closest('.set-theme');
  if (th) { store.write('theme', th.dataset.theme); applyTheme(th.dataset.theme); render(); return; }

  // plan
  const pd = t.closest('[data-plan-day]');
  if (pd) { state.selectedDay = Number(pd.dataset.planDay); openView('workout'); return; }
  if (t.closest('#planPrev')) { state.weekOffset--; renderPlan(); return; }
  if (t.closest('#planNext')) { state.weekOffset++; renderPlan(); return; }
  const gn = t.closest('[data-goal-n]');
  if (gn) { store.write('weeklyGoal', Number(gn.dataset.goalN)); renderPlan(); return; }

  // progress range
  const rg = t.closest('[data-range]');
  if (rg) { progressRange = Number(rg.dataset.range); renderHistory(); return; }

  // library
  if (t.closest('#libMuscleBtn')) {
    lib.sheet = 'muscle'; lib.pickMuscle = lib.muscle;
    if (lib.muscle) lib.side = FRONT_MUSCLES.includes(lib.muscle) ? 'front' : 'back';
    openOverlay(); return;
  }
  if (t.closest('#libKitBtn')) { lib.sheet = 'kit'; openOverlay(); return; }
  if (t.closest('#libClear')) { lib.q = ''; lib.muscle = null; lib.kit = 'all'; renderLibrary(); return; }
  const row = t.closest('[data-lib-ex]');
  if (row) { lib.open = row.dataset.libEx; openOverlay(); return; }

  // inside the overlay
  if (!t.closest('#overlay')) return;
  if (t.closest('.sheet-close') || t === overlayEl()) { closeOverlay(); return; }
  const side = t.closest('[data-side]');
  if (side) { lib.side = side.dataset.side; renderOverlay(); return; }
  const m = t.closest('[data-muscle], .pick-map [data-m]');
  if (m) { const key = m.dataset.muscle || m.dataset.m; lib.pickMuscle = lib.pickMuscle === key ? null : key; renderOverlay(); return; }
  if (t.closest('#muscleAny')) { lib.pickMuscle = null; renderOverlay(); return; }
  if (t.closest('#muscleApply')) { lib.muscle = lib.pickMuscle; closeOverlay(); renderLibrary(); window.scrollTo(0, 0); return; }
  const k = t.closest('[data-kit]');
  if (k) { lib.kit = k.dataset.kit; closeOverlay(); renderLibrary(); window.scrollTo(0, 0); return; }
  // the start/finish photos and clips are handled by app.js's listener
});
document.addEventListener('input', (e) => {
  if (e.target && e.target.id === 'libSearch') { lib.q = e.target.value; renderLibList(); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlayOpen()) closeOverlay();
});
