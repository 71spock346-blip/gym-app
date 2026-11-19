/* Stay Strong — optional online account, sync between phones, and the AI Coach.
 *
 * Loaded after views.js and before app.js. Like views.js, everything here is a
 * function that runs after app.js has set up `state`, `store` and the helpers.
 *
 * The app still works fully offline with no account: this phone's storage is
 * always the main copy. Signing in adds a copy in the cloud (Supabase), so a
 * second phone, a new phone or a cleared browser gets everything back.
 *
 *   Config   /api/config (a Vercel function) hands out the Supabase address and
 *            its public key, read from the Vercel settings. Nothing secret is
 *            in this file. Without that function (the old GitHub Pages copy,
 *            or no signal on first open) the account card says so and the
 *            rest of the app carries on.
 *   Account  email + password, straight against Supabase's sign-in service.
 *   Sync     one row per saved setting (goal, sessions, sets, weights...).
 *            Lists keyed by date are merged entry by entry, so workouts
 *            logged on two phones both survive; anything else: newest wins.
 *   Coach    /api/coach (a Vercel function) talks to Claude with the
 *            Anthropic key kept on the server. Signed-in only, with a
 *            daily limit, so nobody else can run up the bill.
 */

/* Where the Vercel copy lives. The GitHub Pages copy asks this address for its
 * settings and coach, so it can sign in and move its data across. */
const CLOUD_ORIGIN = 'https://stay-strong.vercel.app';
const CLOUD_CFG_KEY = 'staystrong.cloudConfig';   // last good /api/config answer (works offline after the first)
const AUTH_KEY = 'staystrong.auth';               // { access_token, refresh_token, expires_at, user: { id, email } }
const SYNC_KEY = 'staystrong.sync';               // { stamps: { key: ms }, dirty: [keys], pulledAt: iso, at: ms }

/* Settings that belong to one phone, never sent to the cloud. */
const DEVICE_ONLY = new Set(['backupAt', 'textSize', 'adminPin']);
/* Saved data keyed by date (or exercise): merged entry by entry. */
const MERGE_BY_ENTRY = new Set(['done', 'sessions', 'reps', 'swaps', 'baselines', 'anchors']);

const cloud = {
  cfg: null,          // { supabaseUrl, supabaseAnonKey, coach, apiBase }
  cfgTried: false,
  busy: false,        // a sync is running
  pushTimer: null,
  lastError: '',
  ui: { mode: 'signin', msg: '', working: false },   // account card (not saved)
  coach: { working: false, draft: '' },              // coach tab (not saved)
};

function readJSON(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v === null ? fallback : v; } catch { return fallback; } }
function writeJSON(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage full or blocked */ } }

/* ------------------------------ config ------------------------------ */
async function loadCloudConfig() {
  cloud.cfg = readJSON(CLOUD_CFG_KEY, null);
  if (!navigator.onLine) { cloud.cfgTried = true; return cloud.cfg; }
  const bases = location.origin === CLOUD_ORIGIN ? [''] : ['', CLOUD_ORIGIN];
  for (const base of bases) {
    try {
      const r = await fetch(base + '/api/config', { cache: 'no-store' });
      if (!r.ok) continue;
      const c = await r.json();
      if (!c || !c.supabaseUrl || !c.supabaseAnonKey) continue;
      cloud.cfg = { supabaseUrl: c.supabaseUrl.replace(/\/$/, ''), supabaseAnonKey: c.supabaseAnonKey, coach: !!c.coach, apiBase: base };
      writeJSON(CLOUD_CFG_KEY, cloud.cfg);
      break;
    } catch { /* try the next one */ }
  }
  cloud.cfgTried = true;
  return cloud.cfg;
}
const cloudReady = () => !!(cloud.cfg && cloud.cfg.supabaseUrl);

/* ------------------------------ account ------------------------------ */
const authSession = () => readJSON(AUTH_KEY, null);
const signedIn = () => !!(authSession() && authSession().refresh_token);
const accountEmail = () => (authSession() && authSession().user && authSession().user.email) || '';

function saveAuth(j) {
  if (!j || !j.access_token) return null;
  const s = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Math.floor(Date.now() / 1000) + (j.expires_in || 3600), user: { id: j.user && j.user.id, email: j.user && j.user.email } };
  writeJSON(AUTH_KEY, s);
  return s;
}

async function authFetch(path, body) {
  const r = await fetch(cloud.cfg.supabaseUrl + '/auth/v1/' + path, {
    method: 'POST',
    headers: { apikey: cloud.cfg.supabaseAnonKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let j = {};
  try { j = await r.json(); } catch { /* empty answer */ }
  if (!r.ok) throw new Error(friendlyAuthError(j));
  return j;
}
function friendlyAuthError(j) {
  const m = String((j && (j.msg || j.error_description || j.message || j.error)) || 'Something went wrong');
  if (/invalid login/i.test(m)) return 'Email or password is wrong';
  if (/email not confirmed/i.test(m)) return 'Open the link in the email we sent you first, then sign in';
  if (/already registered|already exists/i.test(m)) return 'There is already an account with that email. Sign in instead';
  if (/password.*(6|characters|short)/i.test(m)) return 'Use a password of at least 8 characters';
  if (/rate limit|too many/i.test(m)) return 'Too many tries. Wait a minute and try again';
  return m;
}

/* A fresh access token, refreshed when it is within a minute of expiring. */
async function accessToken() {
  let s = authSession();
  if (!s) return null;
  if (s.expires_at - 60 > Date.now() / 1000) return s.access_token;
  try {
    s = saveAuth(await authFetch('token?grant_type=refresh_token', { refresh_token: s.refresh_token }));
    return s && s.access_token;
  } catch (err) {
    if (navigator.onLine) { localStorage.removeItem(AUTH_KEY); cloud.lastError = 'Signed out. Please sign in again'; }
    return null;
  }
}

async function accountSubmit() {
  const email = ($('#acctEmail') || {}).value || '';
  const password = ($('#acctPass') || {}).value || '';
  const mode = cloud.ui.mode;
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) { cloud.ui.msg = 'Type your email address'; rerenderAccount(); return; }
  if (mode !== 'reset' && password.length < 8) { cloud.ui.msg = 'Use a password of at least 8 characters'; rerenderAccount(); return; }
  cloud.ui.working = true; cloud.ui.msg = ''; rerenderAccount();
  try {
    if (mode === 'reset') {
      await authFetch('recover', { email: email.trim() });
      cloud.ui.mode = 'signin';
      cloud.ui.msg = 'Check your email for a link to set a new password.';
    } else if (mode === 'signup') {
      const j = await authFetch('signup', { email: email.trim(), password });
      if (j.access_token) { saveAuth(j); await afterSignIn(); }
      else { cloud.ui.mode = 'signin'; cloud.ui.msg = 'Account made. Open the link in the email we just sent you, then sign in here.'; }
    } else {
      saveAuth(await authFetch('token?grant_type=password', { email: email.trim(), password }));
      await afterSignIn();
    }
  } catch (err) { cloud.ui.msg = err.message || String(err); }
  cloud.ui.working = false;
  rerenderAccount();
}

async function afterSignIn() {
  // everything on this phone is offered to the cloud; entry-by-entry merging keeps both sides
  const sync = syncState();
  sync.dirty = Object.keys(savedData()).filter((k) => !DEVICE_ONLY.has(k));
  sync.pulledAt = null;
  writeJSON(SYNC_KEY, sync);
  cloud.ui.msg = '';
  await syncNow(true);
  showToast('Signed in. Your workouts are backed up online', 'check');
}

async function signOut() {
  const s = authSession();
  try { if (s && cloudReady()) await fetch(cloud.cfg.supabaseUrl + '/auth/v1/logout', { method: 'POST', headers: { apikey: cloud.cfg.supabaseAnonKey, Authorization: 'Bearer ' + s.access_token } }); } catch { /* signed out here anyway */ }
  localStorage.removeItem(AUTH_KEY);
  writeJSON(SYNC_KEY, { stamps: syncState().stamps, dirty: [], pulledAt: null, at: 0 });
  cloud.ui = { mode: 'signin', msg: 'Signed out. Everything stays on this phone.', working: false };
  render();
}

/* ------------------------------ sync ------------------------------ */
function syncState() {
  const s = readJSON(SYNC_KEY, null) || {};
  return { stamps: s.stamps || {}, dirty: Array.isArray(s.dirty) ? s.dirty : [], pulledAt: s.pulledAt || null, at: s.at || 0 };
}

/* Called by store.write: remember when each setting changed, and push it soon. */
function noteLocalChange(key) {
  if (DEVICE_ONLY.has(key)) return;
  const s = syncState();
  s.stamps[key] = Date.now();
  if (!s.dirty.includes(key)) s.dirty.push(key);
  writeJSON(SYNC_KEY, s);
  if (signedIn() && cloudReady()) { clearTimeout(cloud.pushTimer); cloud.pushTimer = setTimeout(() => syncNow(), 4000); }
}

/* After a restore every setting counts as changed now. */
function noteAllChanged() {
  const s = syncState();
  const now = Date.now();
  for (const k of Object.keys(savedData())) if (!DEVICE_ONLY.has(k)) { s.stamps[k] = now; if (!s.dirty.includes(k)) s.dirty.push(k); }
  writeJSON(SYNC_KEY, s);
}

function sbRest(path, token, opts = {}) {
  return fetch(cloud.cfg.supabaseUrl + '/rest/v1/' + path, {
    ...opts,
    headers: { apikey: cloud.cfg.supabaseAnonKey, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
}

/* Merge a value from the cloud with the one on this phone. `remoteNewer`
 * decides ties: the newer side wins where both changed the same entry. */
function mergeValue(key, local, remote, remoteNewer) {
  if (local === undefined) return remote;
  if (remote === undefined) return local;
  if (MERGE_BY_ENTRY.has(key) && local && remote && typeof local === 'object' && typeof remote === 'object' && !Array.isArray(local) && !Array.isArray(remote)) {
    return remoteNewer ? { ...local, ...remote } : { ...remote, ...local };
  }
  if (key === 'prs' && Array.isArray(local) && Array.isArray(remote)) {
    const first = remoteNewer ? remote : local;
    const other = remoteNewer ? local : remote;
    const id = (p) => `${p && p.id}|${p && p.date}|${p && p.w}`;
    const seen = new Set(first.map(id));
    return first.concat(other.filter((p) => !seen.has(id(p))));
  }
  return remoteNewer ? remote : local;
}

const sameJSON = (a, b) => JSON.stringify(a) === JSON.stringify(b);

async function syncNow(force) {
  if (cloud.busy || !signedIn() || !navigator.onLine) return;
  if (!cloudReady()) await loadCloudConfig();
  if (!cloudReady()) return;
  cloud.busy = true;
  cloud.lastError = '';
  let changedHere = false;
  const startedAt = Date.now();
  try {
    const token = await accessToken();
    if (!token) throw new Error(cloud.lastError || 'Not signed in');
    const userId = authSession().user.id;
    const s = syncState();

    // 1. pull what changed in the cloud since last time
    const since = s.pulledAt && !force ? `&updated_at=gt.${encodeURIComponent(s.pulledAt)}` : '';
    const r = await sbRest(`user_store?select=key,value,stamp,updated_at${since}&order=updated_at.asc`, token);
    if (!r.ok) throw new Error('Could not read your online copy (' + r.status + ')');
    const rows = await r.json();
    for (const row of rows) {
      if (DEVICE_ONLY.has(row.key)) continue;
      const local = store.read(row.key, undefined);
      const localStamp = s.stamps[row.key] || 0;
      const merged = mergeValue(row.key, local, row.value, Number(row.stamp) >= localStamp);
      if (!sameJSON(merged, local)) { try { localStorage.setItem('ironweek.' + row.key, JSON.stringify(merged)); } catch { /* full */ } changedHere = true; }
      if (!sameJSON(merged, row.value)) { if (!s.dirty.includes(row.key)) s.dirty.push(row.key); }
      else { s.dirty = s.dirty.filter((k) => k !== row.key); }
      s.stamps[row.key] = Math.max(localStamp, Number(row.stamp) || 0);
      if (!s.pulledAt || row.updated_at > s.pulledAt) s.pulledAt = row.updated_at;
    }

    // 2. push what changed here
    const keys = s.dirty.filter((k) => !DEVICE_ONLY.has(k));
    if (keys.length) {
      const body = keys.map((k) => ({ user_id: userId, key: k, value: store.read(k, null), stamp: s.stamps[k] || startedAt }));
      const w = await sbRest('user_store?on_conflict=user_id,key', token, {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify(body),
      });
      if (!w.ok) throw new Error('Could not save your online copy (' + w.status + ')');
      const saved = await w.json();
      for (const row of saved) if (!s.pulledAt || row.updated_at > s.pulledAt) s.pulledAt = row.updated_at;
    }

    // 3. keep anything changed on this phone while the sync ran (a set ticked off mid-upload) queued for next time
    const now = syncState();
    const pushed = new Set(keys);
    const later = now.dirty.filter((k) => (now.stamps[k] || 0) >= startedAt);
    s.dirty = [...new Set(s.dirty.filter((k) => !pushed.has(k)).concat(later))];
    for (const [k, v] of Object.entries(now.stamps)) if (v > (s.stamps[k] || 0)) s.stamps[k] = v;
    s.at = Date.now();
    writeJSON(SYNC_KEY, s);
    if (later.length) { clearTimeout(cloud.pushTimer); cloud.pushTimer = setTimeout(() => syncNow(), 4000); }
  } catch (err) {
    cloud.lastError = err.message || String(err);
  }
  cloud.busy = false;
  if (changedHere) reloadStateFromStore();
  if (state.view === 'settings' || changedHere) render();
}

/* Pick up data the sync just wrote into this phone's storage. */
function reloadStateFromStore() {
  const fields = { unit: 'kg', goal: null, equip: 'gym', profile: null, baselines: {}, done: {}, swaps: {}, sessions: {}, prs: [], split: 'bodypart', reps: {}, anchors: {} };
  for (const [k, fb] of Object.entries(fields)) state[k] = store.read(k, fb);
  if (typeof applyTheme === 'function' && typeof currentTheme === 'function') applyTheme(currentTheme());
  if (typeof currentPlan !== 'undefined') currentPlan = null;
}

function initCloud() {
  loadCloudConfig().then(() => {
    if (signedIn()) syncNow();
    if (!onboarded() || state.view === 'settings' || state.view === 'coach') render();
  });
  window.addEventListener('online', () => { if (signedIn()) syncNow(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && signedIn() && Date.now() - syncState().at > 60 * 1000) syncNow();
    if (document.visibilityState === 'hidden' && signedIn() && syncState().dirty.length) { clearTimeout(cloud.pushTimer); syncNow(); }
  });
}

/* ------------------------------ Settings → Account ------------------------------ */
const onboarded = () => !!(state.profile && state.profile.onboarded);
function rerenderAccount() {
  if (!onboarded()) renderOnboarding();
  else if (state.view === 'settings') renderSettings();
}

/* The welcome screen on a new phone: sign in first, so this phone picks up
 * your plan, weights and history instead of starting from scratch. */
function obAccountBlock() {
  if (!cloudReady()) return '';
  if (!cloud.ui.ob) return `<button id="obSignIn" class="ob-restore" type="button">${ico('lock')} Have an account? <strong>Sign in</strong></button>`;
  return `<div class="ob-account">${accountPanel()}</div>`;
}
function sinceText(ms) {
  if (!ms) return 'not yet';
  const m = Math.round((Date.now() - ms) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}

function accountPanel() {
  if (!cloudReady()) {
    return `<div class="admin-card account-card">
      <p class="admin-p">${cloud.cfgTried
        ? (navigator.onLine ? 'Online accounts are not switched on for this copy of the app yet.' : 'Connect to the internet once to set up an online account.')
        : 'Checking for online accounts…'}</p>
      <p class="admin-p">Everything still works on this phone. Use Backup below to keep a copy.</p></div>`;
  }
  const msg = cloud.ui.msg ? `<p class="admin-p account-msg">${esc(cloud.ui.msg)}</p>` : '';
  if (signedIn()) {
    const s = syncState();
    const status = cloud.busy ? 'Syncing…'
      : cloud.lastError ? `<span class="account-err">${esc(cloud.lastError)}</span>`
      : !navigator.onLine ? `Offline. ${s.dirty.length ? 'Changes will upload when you are back online.' : 'Everything is uploaded.'}`
      : `Synced ${sinceText(s.at)}.`;
    return `<div class="admin-card account-card">
      <p class="admin-p">Signed in as <strong>${esc(accountEmail())}</strong>. Your workouts, weights and settings are copied online, so you can sign in on another phone and pick up where you left off.</p>
      <p class="admin-p account-status">${status}</p>
      ${msg}
      <div class="media-actions">
        <button id="acctSync" class="admin-btn" type="button" ${cloud.busy ? 'disabled' : ''}>${ico('refresh')} Sync now</button>
        <button id="acctOut" class="admin-btn" type="button">${ico('lock')} Sign out</button>
      </div></div>`;
  }
  const mode = cloud.ui.mode;
  const title = mode === 'signup' ? 'Make an account' : mode === 'reset' ? 'Forgot your password' : 'Sign in';
  const go = mode === 'signup' ? 'Make account' : mode === 'reset' ? 'Send reset link' : 'Sign in';
  return `<div class="admin-card account-card">
    <p class="admin-p">Optional. With an account your workouts are backed up online and shared between your phones. Without one, everything stays on this phone as before.</p>
    <p class="admin-p"><strong>${title}</strong></p>
    <label class="ob-field">Email
      <input id="acctEmail" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" value="${esc(cloud.ui.email || '')}" />
    </label>
    ${mode === 'reset' ? '' : `<label class="ob-field account-pass">Password
      <input id="acctPass" type="password" autocomplete="${mode === 'signup' ? 'new-password' : 'current-password'}" placeholder="At least 8 characters" />
    </label>`}
    ${msg}
    <div class="media-actions">
      <button id="acctGo" class="admin-btn primary" type="button" ${cloud.ui.working ? 'disabled' : ''}>${cloud.ui.working ? ico('hourglass') + ' One moment…' : ico('arrowRight') + ' ' + go}</button>
      ${mode !== 'signin' ? `<button class="admin-btn acct-mode" data-mode="signin" type="button">I have an account</button>` : ''}
      ${mode !== 'signup' ? `<button class="admin-btn acct-mode" data-mode="signup" type="button">Make an account</button>` : ''}
      ${mode === 'signin' ? `<button class="admin-btn acct-mode" data-mode="reset" type="button">Forgot password</button>` : ''}
    </div></div>`;
}

/* ------------------------------ AI Coach ------------------------------ */
const COACH_KEY = 'coach';   // { msgs: [{ role: 'user'|'coach', text, at, kind }], monthlyAt, feedbackFor }
const COACH_MAX_MSGS = 40;
const COACH_PROMPTS = [
  { label: 'Short on time today', text: 'I only have about 30 minutes today. How should I shorten today\'s workout?' },
  { label: 'Feeling sore', text: 'I\'m still sore from my last session. What should I change today?' },
  { label: 'Low energy', text: 'My energy is low today. Should I still train, and how hard?' },
  { label: 'Am I progressing?', text: 'Looking at my recent workouts, am I progressing? What should I focus on next?' },
];

const coachData = () => { const c = store.read(COACH_KEY, null) || {}; return { msgs: Array.isArray(c.msgs) ? c.msgs : [], monthlyAt: c.monthlyAt || null, feedbackFor: c.feedbackFor || null }; };
function saveCoach(c) { c.msgs = c.msgs.slice(-COACH_MAX_MSGS); store.write(COACH_KEY, c); }

function lastLoggedSession() {
  const dates = Object.keys(state.sessions).sort();
  const d = dates[dates.length - 1];
  return d ? { date: d, ...state.sessions[d] } : null;
}
const monthlyDue = (c) => !c.monthlyAt || Date.now() - Date.parse(c.monthlyAt) > 28 * MS_PER_DAY;

/* What the coach gets to see: your settings, today's plan and the last few
 * weeks of training. Compact, so each question costs a fraction of a cent. */
function coachContext() {
  const since = new Date(Date.now() - 42 * MS_PER_DAY).toISOString().slice(0, 10);
  const recent = Object.keys(state.sessions).filter((d) => d >= since).sort().map((d) => {
    const s = state.sessions[d];
    const reps = state.reps[d] || {};
    return { date: d, day: s.name, sets: s.sets, of: s.total, completed: !!s.completed, exercises: s.ex,
      reps: Object.fromEntries(Object.entries(reps).map(([id, r]) => [(findExercise(id) || { name: id }).name, r])) };
  });
  let today = null;
  try {
    const dow = (new Date().getDay() + 6) % 7;
    if (dow <= 4 && state.weekOffset === 0 && typeof planDay === 'function') {
      const p = planDay(dow);
      today = { day: dayName(p.day), exercises: p.exercises.map((ex) => {
        const b = state.baselines[ex.id];
        return b && b.w ? `${ex.name} (working weight ${Math.round(b.w * 10) / 10} kg)` : ex.name;
      }) };
    }
  } catch { /* plan not ready */ }
  const weights = Object.entries(state.baselines).slice(0, 40).map(([id, b]) => `${(findExercise(id) || { name: id }).name}: ${Math.round((b.w || 0) * 10) / 10} kg`);
  return {
    name: (state.profile && state.profile.name) || '',
    goal: currentGoal().name, equipment: currentEquip().name, split: currentSplit().name, unit: state.unit,
    weekly_goal_days: typeof weeklyGoal === 'function' ? weeklyGoal() : null,
    today_iso: todayISO(), today_plan: today,
    recent_sessions: recent, personal_bests: state.prs.slice(-15), working_weights: weights,
  };
}

async function askCoach(kind, text) {
  if (cloud.coach.working) return;
  if (!signedIn()) { showToast('Sign in under Settings → Account to use the coach', 'info'); return; }
  if (!navigator.onLine) { showToast('The coach needs an internet connection', 'info'); return; }
  const c = coachData();
  const history = c.msgs.filter((m) => m.kind !== 'error').slice(-8).map((m) => ({ role: m.role === 'coach' ? 'assistant' : 'user', text: m.text }));
  let shown = text;
  if (kind === 'feedback') { const s = lastLoggedSession(); shown = `How did my last workout go?${s ? ` (${s.name}, ${shortDate(s.date + 'T12:00:00')})` : ''}`; c.feedbackFor = s && s.date; }
  if (kind === 'monthly') { shown = 'Monthly check-in: how did the last month go?'; c.monthlyAt = new Date().toISOString(); }
  c.msgs.push({ role: 'user', text: shown, at: new Date().toISOString(), kind });
  saveCoach(c);
  cloud.coach.working = true; cloud.coach.draft = '';
  renderCoach();
  let reply;
  try {
    const token = await accessToken();
    if (!token) throw new Error('Please sign in again under Settings → Account');
    const r = await fetch((cloud.cfg.apiBase || '') + '/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ kind, message: kind === 'ask' ? text : '', history, context: coachContext() }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || `The coach is not available right now (${r.status})`);
    reply = { role: 'coach', text: j.reply, at: new Date().toISOString(), kind };
  } catch (err) {
    reply = { role: 'coach', text: err.message || String(err), at: new Date().toISOString(), kind: 'error' };
  }
  const c2 = coachData();
  c2.msgs.push(reply);
  saveCoach(c2);
  cloud.coach.working = false;
  if (state.view === 'coach') renderCoach();
}

/* Light formatting for coach replies: paragraphs, bullet lines and **bold**. */
function coachText(t) {
  const lines = esc(t || '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').split(/\n+/);
  let html = '', inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const item = /^[-•*]\s+(.*)/.exec(line) || /^\d+[.)]\s+(.*)/.exec(line);
    if (item) { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${item[1]}</li>`; continue; }
    if (inList) { html += '</ul>'; inList = false; }
    html += `<p>${line.replace(/^#+\s*/, '')}</p>`;
  }
  return html + (inList ? '</ul>' : '');
}

function renderCoach() {
  const el = $('#view-coach');
  if (!el) return;
  const name = (state.profile && state.profile.name) || '';
  if (!cloudReady() || !signedIn() || cloud.cfg.coach === false) {
    const why = !cloudReady()
      ? (cloud.cfgTried ? 'The coach is not switched on for this copy of the app yet.' : 'Checking for the coach…')
      : !signedIn() ? 'The coach looks at your training to give advice, so it needs an account. It is free to make one under Settings → Account.'
      : 'The coach is not switched on yet.';
    el.innerHTML = `<h2 class="section-title">Coach</h2>
      <div class="admin-card coach-intro">
        <div class="coach-hello">${ico('activity')} <strong>Your AI coach</strong></div>
        <p class="admin-p">Ask what to do today, get feedback after a workout, and a check-in every month.</p>
        <p class="admin-p">${why}</p>
        ${cloudReady() && !signedIn() ? `<button class="admin-btn primary" type="button" data-goto="settings">${ico('arrowRight')} Go to Account</button>` : ''}
      </div>`;
    return;
  }
  const c = coachData();
  const last = lastLoggedSession();
  const feedbackCard = last && c.feedbackFor !== last.date ? `
    <button class="coach-card" type="button" data-coach="feedback">
      <span class="coach-card-ico">${ico('check')}</span>
      <span><strong>Feedback on your last workout</strong><small>${esc(last.name)} · ${last.sets}/${last.total} sets · ${shortDate(last.date + 'T12:00:00')}</small></span>
      ${ico('arrowRight')}</button>` : '';
  const monthlyCard = monthlyDue(c) && Object.keys(state.sessions).length >= 3 ? `
    <button class="coach-card" type="button" data-coach="monthly">
      <span class="coach-card-ico">${ico('calendar')}</span>
      <span><strong>Monthly check-in</strong><small>How the last four weeks went, and what to change</small></span>
      ${ico('arrowRight')}</button>` : '';
  const msgs = c.msgs.map((m) => `<div class="coach-msg ${m.role === 'coach' ? 'from-coach' : 'from-you'} ${m.kind === 'error' ? 'error' : ''}">${m.role === 'coach' ? coachText(m.text) : `<p>${esc(m.text)}</p>`}</div>`).join('');
  el.innerHTML = `
    <h2 class="section-title">Coach</h2>
    <div class="coach-hello">${ico('activity')} <strong>What do you want today${name ? ', ' + esc(name) : ''}?</strong></div>
    <div class="coach-chips">${COACH_PROMPTS.map((p, i) => `<button class="goal-pill coach-chip" type="button" data-coach-chip="${i}" ${cloud.coach.working ? 'disabled' : ''}>${esc(p.label)}</button>`).join('')}</div>
    ${feedbackCard}${monthlyCard}
    <div class="coach-thread" aria-live="polite">${msgs}${cloud.coach.working ? `<div class="coach-msg from-coach thinking"><p>${ico('hourglass')} Thinking…</p></div>` : ''}</div>
    <div class="coach-ask">
      <textarea id="coachInput" rows="2" maxlength="600" placeholder="Ask your coach anything about your training…">${esc(cloud.coach.draft)}</textarea>
      <button id="coachSend" class="admin-btn primary" type="button" ${cloud.coach.working ? 'disabled' : ''} aria-label="Send">${ico('arrowRight')}</button>
    </div>
    ${c.msgs.length ? `<button id="coachClear" class="admin-btn coach-clear" type="button">${ico('undo')} Clear conversation</button>` : ''}
    <p class="hint">The coach sees your goal, this week's plan and the last six weeks of workouts. It gives general fitness advice, not medical advice: stop and see a doctor if something hurts.</p>`;
  const thread = $('.coach-thread');
  if (thread && thread.lastElementChild) thread.lastElementChild.scrollIntoView({ block: 'nearest' });
}

/* ------------------------------ events ------------------------------ */
document.addEventListener('click', (e) => {
  const t = e.target;
  if (!t || !t.closest) return;
  if (t.closest('#acctGo')) { cloud.ui.email = ($('#acctEmail') || {}).value || ''; accountSubmit(); return; }
  const m = t.closest('.acct-mode');
  if (m) { cloud.ui.email = ($('#acctEmail') || {}).value || cloud.ui.email || ''; cloud.ui.mode = m.dataset.mode; cloud.ui.msg = ''; rerenderAccount(); return; }
  if (t.closest('#acctSync')) { syncNow(true).then(() => { if (!cloud.lastError) showToast('Synced', 'check'); }); rerenderAccount(); return; }
  if (t.closest('#acctOut')) { signOut(); return; }
  if (t.closest('#obSignIn')) { cloud.ui.ob = true; cloud.ui.mode = 'signin'; cloud.ui.msg = ''; renderOnboarding(); const f = $('#acctEmail'); if (f) f.focus(); return; }
  const go = t.closest('[data-goto]');
  if (go && typeof openView === 'function') { openView(go.dataset.goto); return; }
  const chip = t.closest('[data-coach-chip]');
  if (chip) { const p = COACH_PROMPTS[Number(chip.dataset.coachChip)]; if (p) askCoach('ask', p.text); return; }
  const card = t.closest('[data-coach]');
  if (card) { askCoach(card.dataset.coach, ''); return; }
  if (t.closest('#coachSend')) { const v = (($('#coachInput') || {}).value || '').trim(); if (v) askCoach('ask', v); return; }
  if (t.closest('#coachClear')) { const c = coachData(); c.msgs = []; saveCoach(c); renderCoach(); }
});
document.addEventListener('input', (e) => { if (e.target && e.target.id === 'coachInput') cloud.coach.draft = e.target.value; });
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || !e.target) return;
  if (e.target.id === 'acctEmail' || e.target.id === 'acctPass') { e.preventDefault(); cloud.ui.email = ($('#acctEmail') || {}).value || ''; accountSubmit(); }
  if (e.target.id === 'coachInput' && !e.shiftKey) { e.preventDefault(); const v = e.target.value.trim(); if (v) askCoach('ask', v); }
});
