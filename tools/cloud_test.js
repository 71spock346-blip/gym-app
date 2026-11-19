/* Stay Strong — account, sync and coach test, with no real services.
 *
 *   NODE_PATH=$(npm root -g) node tools/cloud_test.js            # run the checks
 *   NODE_PATH=$(npm root -g) node tools/cloud_test.js --shots out # also save screenshots
 *
 * One local server plays every part: the static app, the real Vercel functions
 * in api/ (config and coach), a small stand-in for Supabase (sign-up, sign-in,
 * token refresh, and the user_store / coach_log tables with each person kept
 * to their own rows) and a stand-in for the Anthropic API that records what the
 * coach sends. Two phone-sized browsers then sign in to the same account and
 * check that workouts move between them. Needs `npm install` (for the
 * Anthropic SDK used by api/coach.mjs) and Playwright. */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8971;
const BASE = `http://localhost:${PORT}`;
const shotsArg = process.argv.indexOf('--shots');
const SHOTS = shotsArg > -1 ? path.resolve(process.argv[shotsArg + 1] || 'shots') : null;
let pw;
try { pw = require('playwright'); } catch { pw = require('playwright-core'); }

process.env.SUPABASE_URL = BASE;
process.env.SUPABASE_ANON_KEY = 'anon-test-key';
process.env.ANTHROPIC_API_KEY = 'sk-test';
process.env.ANTHROPIC_BASE_URL = BASE + '/anthropic';
process.env.COACH_DAILY_LIMIT = '3';

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.webm': 'video/webm', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.svg': 'image/svg+xml',
};

/* ---------- stand-in Supabase ---------- */
const users = {};      // email -> { id, password }
const tokens = {};     // access or refresh token -> user id
const userStore = [];  // { user_id, key, value, stamp, updated_at }
const coachLog = [];   // { user_id, at }
let anthropicCalls = [];
let tick = 0;
const nowISO = () => new Date(Date.now() + (tick++)).toISOString();   // strictly increasing

function issue(user, email) {
  const access = 'at-' + crypto.randomBytes(8).toString('hex');
  const refresh = 'rt-' + crypto.randomBytes(8).toString('hex');
  tokens[access] = user.id; tokens[refresh] = user.id;
  return { access_token: access, refresh_token: refresh, expires_in: 3600, user: { id: user.id, email } };
}
const who = (req) => tokens[(req.headers.authorization || '').replace('Bearer ', '')];

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString();
  try { return raw ? JSON.parse(raw) : {}; } catch { return raw; }
}
function send(res, code, obj, headers = {}) {
  res.writeHead(code, { 'Content-Type': 'application/json', ...headers });
  res.end(obj === undefined ? '' : JSON.stringify(obj));
}

/* the Vercel (req, res) helpers the functions use */
function vercelRes(res) {
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => { if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return res; };
  return res;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, BASE);
  const p = decodeURIComponent(url.pathname);
  try {
    // ---- real Vercel functions ----
    if (p === '/api/config' || p === '/api/coach') {
      req.body = req.method === 'POST' ? await readBody(req) : undefined;
      const mod = await import(path.join(ROOT, p + '.mjs'));
      return await mod.default(req, vercelRes(res));
    }
    // ---- stand-in Anthropic ----
    if (p === '/anthropic/v1/messages') {
      const body = await readBody(req);
      anthropicCalls.push({ body, headers: req.headers });
      return send(res, 200, {
        id: 'msg_test', type: 'message', role: 'assistant', model: body.model, stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'Nice work today.\n- Keep **60 kg** on the press next time\n- Add one set of curls' }],
        usage: { input_tokens: 10, output_tokens: 10 },
      });
    }
    // ---- stand-in Supabase auth ----
    if (p.startsWith('/auth/v1/')) {
      if (req.headers.apikey !== 'anon-test-key') return send(res, 401, { msg: 'bad apikey' });
      const body = req.method === 'POST' ? await readBody(req) : {};
      if (p === '/auth/v1/signup') {
        if (users[body.email]) return send(res, 400, { msg: 'User already registered' });
        users[body.email] = { id: crypto.randomUUID(), password: body.password };
        return send(res, 200, issue(users[body.email], body.email));   // "confirm email" off
      }
      if (p === '/auth/v1/token' && url.searchParams.get('grant_type') === 'password') {
        const u = users[body.email];
        if (!u || u.password !== body.password) return send(res, 400, { error_description: 'Invalid login credentials' });
        return send(res, 200, issue(u, body.email));
      }
      if (p === '/auth/v1/token' && url.searchParams.get('grant_type') === 'refresh_token') {
        const id = tokens[body.refresh_token];
        if (!id) return send(res, 400, { msg: 'Invalid Refresh Token' });
        const email = Object.keys(users).find((e) => users[e].id === id);
        return send(res, 200, issue(users[email], email));
      }
      if (p === '/auth/v1/user') {
        const id = who(req);
        return id ? send(res, 200, { id }) : send(res, 401, { msg: 'invalid JWT' });
      }
      if (p === '/auth/v1/logout') return send(res, 204);
      return send(res, 404, {});
    }
    // ---- stand-in Supabase tables (row level security: own rows only) ----
    if (p === '/rest/v1/user_store') {
      const id = who(req);
      if (!id) return send(res, 401, { message: 'JWT expired' });
      if (req.method === 'GET') {
        const gt = url.searchParams.get('updated_at');
        const since = gt && gt.startsWith('gt.') ? gt.slice(3) : null;
        const rows = userStore.filter((r) => r.user_id === id && (!since || r.updated_at > since)).sort((a, b) => a.updated_at.localeCompare(b.updated_at));
        return send(res, 200, rows.map(({ key, value, stamp, updated_at }) => ({ key, value, stamp, updated_at })));
      }
      if (req.method === 'POST') {
        const body = await readBody(req);
        const out = [];
        for (const row of body) {
          if (row.user_id !== id) return send(res, 403, { message: 'new row violates row-level security policy' });
          let r = userStore.find((x) => x.user_id === id && x.key === row.key);
          if (!r) { r = { user_id: id, key: row.key }; userStore.push(r); }
          Object.assign(r, { value: row.value, stamp: row.stamp, updated_at: nowISO() });
          out.push(r);
        }
        return send(res, 201, out);
      }
    }
    if (p === '/rest/v1/coach_log') {
      const id = who(req);
      if (!id) return send(res, 401, {});
      if (req.method === 'GET') {
        const since = (url.searchParams.get('at') || 'gt.').slice(3);
        const n = coachLog.filter((r) => r.user_id === id && r.at > since).length;
        return send(res, 200, [], { 'Content-Range': `0-0/${n}` });
      }
      const body = await readBody(req);
      if (body.user_id !== id) return send(res, 403, {});
      coachLog.push({ user_id: id, at: new Date().toISOString() });
      return send(res, 201);
    }
    // ---- the app itself ----
    let f = p === '/' ? '/index.html' : p;
    f = path.join(ROOT, f);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  } catch (err) {
    console.error('server error', err);
    if (!res.headersSent) send(res, 500, { error: String(err) });
  }
});

/* ---------- the checks ---------- */
const results = [];
const check = (name, ok, extra) => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${!ok && extra ? ' — ' + extra : ''}`); };

async function phone(browser, errors, label) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: SHOTS ? 2 : 1, serviceWorkers: 'block' });
  // keep the GitHub Pages fallback from reaching the real internet
  await context.route('https://stay-strong.vercel.app/**', (r) => r.abort());
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`${label}: ${e.message}`));
  return page;
}
const shot = async (page, name) => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + '.png') }); } };
const ls = (page, key) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key);

async function onboard(page, name) {
  await page.goto(BASE + '/');
  await page.waitForSelector('#obName');
  await page.fill('#obName', name);
  await page.click('#obStart');
  await page.waitForSelector('#view-workout:not([hidden])');
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await pw.chromium.launch();
  const errors = [];
  try {
    // Phone A: set up, log a set, make an account
    const a = await phone(browser, errors, 'A');
    await onboard(a, 'Jerome');
    await a.waitForTimeout(400);
    await a.locator('.set-bubble').first().click();
    await a.waitForTimeout(300);
    await a.click('.nav-btn[data-view="settings"]');
    await a.waitForSelector('.account-card #acctGo, .account-card .acct-mode', { timeout: 5000 });
    check('Settings shows the account card once /api/config answers', await a.isVisible('#acctEmail'));
    await a.click('.acct-mode[data-mode="signup"]');
    await a.fill('#acctEmail', 'test@example.com');
    await a.fill('#acctPass', 'short');
    await a.click('#acctGo');
    check('a too-short password is refused with a plain message', /at least 8/.test(await a.textContent('.account-card')));
    await a.fill('#acctPass', 'longenough1');
    await a.click('#acctGo');
    await a.waitForSelector('#acctOut', { timeout: 5000 });
    await a.waitForFunction(() => /Synced/.test(document.querySelector('.account-status').textContent), null, { timeout: 5000 });
    await shot(a, 'cloud-1-signed-in');
    const mine = userStore.filter((r) => r.key === 'sessions' || r.key === 'done' || r.key === 'profile');
    check('signing up uploads the workout, ticked sets and profile', mine.length === 3 && Object.keys(mine.find((r) => r.key === 'sessions').value).length === 1);
    check('phone-only settings (text size, backup date, admin PIN) stay off the cloud', !userStore.some((r) => ['textSize', 'backupAt', 'adminPin'].includes(r.key)));
    check('the login lives outside the backup prefix', (await a.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('ironweek.') && /auth|sync/.test(k)))).length === 0);

    // Phone B: brand-new phone signs in from the welcome screen and gets everything
    const b = await phone(browser, errors, 'B');
    await b.goto(BASE + '/');
    await b.waitForSelector('#obSignIn', { timeout: 5000 });
    check('the welcome screen offers "Have an account? Sign in"', true);
    await b.click('#obSignIn');
    await b.fill('#acctEmail', 'test@example.com');
    await b.fill('#acctPass', 'wrong-password');
    await b.click('#acctGo');
    await b.waitForSelector('.account-msg');
    check('a wrong password says so', /wrong/i.test(await b.textContent('.account-msg')));
    await b.fill('#acctPass', 'longenough1');
    await b.click('#acctGo');
    await b.waitForSelector('#view-workout:not([hidden])', { timeout: 5000 });
    const bProfile = await ls(b, 'ironweek.profile');
    const bSessions = await ls(b, 'ironweek.sessions');
    check('signing in on a new phone skips set-up and brings the profile and workouts over', bProfile && bProfile.name === 'Jerome' && bSessions && Object.keys(bSessions).length === 1);
    await shot(b, 'cloud-2-new-phone');

    // B logs another set; A picks it up and both sets survive (merged, not overwritten)
    await b.locator('.set-bubble').nth(1).click();
    await b.waitForTimeout(300);
    await a.click('.nav-btn[data-view="workout"]');
    await a.locator('.set-bubble').nth(2).click();   // A ticks a different set before syncing
    await b.evaluate(() => syncNow());
    await b.waitForTimeout(300);
    await a.evaluate(() => syncNow());
    await a.waitForTimeout(300);
    await b.evaluate(() => syncNow());
    await b.waitForTimeout(300);
    const doneA = await ls(a, 'ironweek.done');
    const doneB = await ls(b, 'ironweek.done');
    const countSets = (d) => Object.values(d || {}).reduce((n, day) => n + Object.values(day).reduce((x, y) => x + y, 0), 0);
    check('sets ticked on both phones are merged on both', countSets(doneA) >= 2 && JSON.stringify(doneA) === JSON.stringify(doneB), `${JSON.stringify(doneA)} vs ${JSON.stringify(doneB)}`);

    // A changes the unit; B gets it on its next sync, and the screen follows
    await a.click('.nav-btn[data-view="settings"]');
    await a.click('.set-unit[data-unit="lb"]');
    await a.evaluate(() => syncNow());
    await a.waitForTimeout(300);
    await b.evaluate(() => syncNow());
    await b.waitForTimeout(400);
    check('a setting changed on one phone reaches the other (kg → lb)', (await b.textContent('#unitToggle')).trim() === 'lb');

    // Offline: changes queue and go up when back online
    await b.context().setOffline(true);
    await b.locator('.set-bubble').nth(3).click();
    await b.waitForTimeout(300);
    const queued = (await ls(b, 'staystrong.sync')).dirty;
    check('offline changes wait in the queue', queued.includes('done'));
    await b.context().setOffline(false);
    await b.evaluate(() => window.dispatchEvent(new Event('online')));
    await b.waitForTimeout(800);
    check('…and upload once back online', (await ls(b, 'staystrong.sync')).dirty.length === 0);

    // Coach
    await a.click('.nav-btn[data-view="coach"]');
    await a.waitForSelector('.coach-hello');
    check('Coach tab greets with "What do you want today?"', /What do you want today, Jerome/.test(await a.textContent('#view-coach')));
    check('Coach offers feedback on the last workout', await a.isVisible('[data-coach="feedback"]'));
    await a.click('[data-coach="feedback"]');
    await a.waitForSelector('.coach-msg.from-coach:not(.thinking)', { timeout: 8000 });
    const call = anthropicCalls[anthropicCalls.length - 1];
    check('the coach asks Claude through the server with the key kept there', call && (call.headers['x-api-key'] === 'sk-test' || /sk-test/.test(call.headers.authorization || '')) && call.body.model === 'claude-opus-5-5' && call.body.fallbacks === 'default');
    check('the coach sends the training snapshot (sessions, plan, settings)', call && /recent_sessions/.test(call.body.messages[call.body.messages.length - 1].content) && /Jerome/.test(call.body.messages[call.body.messages.length - 1].content));
    check('the reply shows with bullets and bold', (await a.locator('.coach-msg.from-coach li').count()) === 2 && (await a.locator('.coach-msg.from-coach strong').count()) === 1);
    check('after feedback, the feedback card goes away', !(await a.isVisible('[data-coach="feedback"]')));
    await a.fill('#coachInput', 'Should I train legs tomorrow?');
    await a.click('#coachSend');
    await a.waitForFunction(() => document.querySelectorAll('.coach-msg.from-coach:not(.thinking)').length === 2, null, { timeout: 8000 });
    const call2 = anthropicCalls[anthropicCalls.length - 1];
    check('follow-up questions carry the earlier turns', call2.body.messages.length === 3 && call2.body.messages[0].role === 'user' && call2.body.messages[1].role === 'assistant');
    await shot(a, 'cloud-3-coach');
    await a.locator('.coach-chip').first().click();
    await a.waitForFunction(() => document.querySelectorAll('.coach-msg.from-coach:not(.thinking)').length === 3, null, { timeout: 8000 });
    await a.locator('.coach-chip').nth(1).click();
    await a.waitForFunction(() => document.querySelectorAll('.coach-msg.from-coach:not(.thinking)').length === 4, null, { timeout: 8000 });
    check('the daily limit stops the 4th question of 3 with a clear message', /daily limit/.test(await a.locator('.coach-msg.from-coach').last().textContent()) && anthropicCalls.length === 3);

    // Coach without an account
    const c = await phone(browser, errors, 'C');
    await onboard(c, 'Sam');
    await c.click('.nav-btn[data-view="coach"]');
    await c.waitForSelector('.coach-intro [data-goto="settings"]', { timeout: 5000 });
    check('signed out, the Coach tab explains and links to Account', true);
    await shot(c, 'cloud-4-coach-signed-out');
    const r = await c.evaluate(async () => (await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"kind":"ask","message":"hi"}' })).status);
    check('the coach function refuses anyone not signed in', r === 401);

    // Sign out keeps data on the phone
    await a.click('.nav-btn[data-view="settings"]');
    await a.click('#acctOut');
    await a.waitForSelector('#acctGo');
    check('signing out keeps the workouts on the phone', Object.keys(await ls(a, 'ironweek.sessions')).length >= 1 && (await ls(a, 'staystrong.auth')) === null);
  } catch (err) {
    check('test ran to the end', false, err.stack || String(err));
  }
  check('no page errors', errors.length === 0, errors.join('; '));
  await browser.close();
  server.close();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed} of ${results.length} cloud checks passed.`);
  process.exit(failed ? 1 : 0);
})();
