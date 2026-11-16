/* Stay Strong — smoke test in a headless phone-sized Chromium.
 *
 *   NODE_PATH=$(npm root -g) node tools/smoke_test.js            # run the checks
 *   NODE_PATH=$(npm root -g) node tools/smoke_test.js --shots out # also save screenshots to ./out
 *
 * Serves the repo on a local port, walks the main flows and prints PASS/FAIL per
 * check plus any page errors. Exit code 1 if anything failed. Needs Playwright
 * (the `playwright` or `playwright-core` package) and a Chromium it can find. */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 8961;
const shotsArg = process.argv.indexOf('--shots');
const SHOTS = shotsArg > -1 ? path.resolve(process.argv[shotsArg + 1] || 'shots') : null;
let pw;
try { pw = require('playwright'); } catch { pw = require('playwright-core'); }

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.webm': 'video/webm', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.svg': 'image/svg+xml',
};
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Content-Length': fs.statSync(f).size });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await pw.chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const results = [];
  const t = async (name, fn) => {
    try { await fn(); results.push('PASS ' + name); } catch (e) { results.push('FAIL ' + name + ' — ' + String(e.message).split('\n')[0]); }
  };
  const shot = async (name) => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, name + '.png') }); } };
  const settle = () => page.locator('#splash').waitFor({ state: 'detached', timeout: 6000 }).catch(() => {});
  const goto = (view) => page.locator(`.nav-btn[data-view="${view}"]`).click();
  const imgSize = (sel) => page.locator(sel).first().evaluate(async (img) => {
    if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; });
    return [img.naturalWidth, img.naturalHeight];
  });
  const appVersion = await (async () => { const m = /APP_VERSION = (\d+)/.exec(fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8')); return m ? Number(m[1]) : null; })();

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });

  await t('splash shows the 512 px logo, then fades to onboarding', async () => {
    const [w, h] = await imgSize('.splash-logo');
    if (w !== 512 || h !== 512) throw new Error(`splash logo ${w}x${h}`);
    await page.waitForTimeout(300); await shot('splash');
    await settle();
    if (!(await page.locator('#view-onboarding').isVisible())) throw new Error('no onboarding');
    const [ow] = await imgSize('.ob-logo');
    if (ow !== 512) throw new Error('onboarding logo is not the 512 px icon: ' + ow);
    await shot('onboarding');
  });

  await t('onboarding completes to the workout; the header logo loads', async () => {
    await page.fill('#obName', 'Dave');
    await page.locator('#obStart').click();
    await page.locator('#view-workout').waitFor({ timeout: 4000 });
    const [w] = await imgSize('.brand-icon');
    if (w !== 192) throw new Error('header logo ' + w);
    if ((await page.locator('.exercise-card').count()) < 3) throw new Error('too few exercise cards');
    await shot('workout');
  });

  await t('manifest icons resolve at their stated sizes; the adaptive icon is opaque and the standard one has transparent corners', async () => {
    const r = await page.evaluate(async () => {
      const m = await (await fetch('manifest.webmanifest', { cache: 'no-store' })).json();
      const out = [];
      for (const icon of m.icons) {
        const img = new Image(); img.src = icon.src;
        await img.decode();
        const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
        const g = c.getContext('2d'); g.drawImage(img, 0, 0);
        out.push({ src: icon.src, sizes: icon.sizes, purpose: icon.purpose || 'any', w: img.naturalWidth, h: img.naturalHeight,
          cornerAlpha: g.getImageData(1, 1, 1, 1).data[3], centreAlpha: g.getImageData(c.width >> 1, c.height >> 1, 1, 1).data[3] });
      }
      const apple = document.querySelector('link[rel="apple-touch-icon"]').href;
      const ai = new Image(); ai.src = apple; await ai.decode();
      return { out, apple: [ai.naturalWidth, ai.naturalHeight] };
    });
    for (const i of r.out) {
      if (`${i.w}x${i.h}` !== i.sizes) throw new Error(`${i.src} is ${i.w}x${i.h}, manifest says ${i.sizes}`);
      if (i.purpose === 'maskable' && i.cornerAlpha !== 255) throw new Error('adaptive icon has transparent corners');
      if (i.purpose === 'any' && i.cornerAlpha !== 0) throw new Error(`${i.src} corner is not transparent`);
      if (i.centreAlpha !== 255) throw new Error(`${i.src} centre is not opaque`);
    }
    if (r.apple.join('x') !== '180x180') throw new Error('apple-touch-icon ' + r.apple.join('x'));
  });

  await t('service worker installs this version and caches the new icons fresh', async () => {
    await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 15000 });
    const r = await page.evaluate(async (v) => {
      const keys = await caches.keys();
      const cache = await caches.open(`staystrong-v${v}`);
      const hit = await cache.match('./icons/icon-512.png');
      return { keys, size: hit ? (await hit.arrayBuffer()).byteLength : null };
    }, appVersion);
    if (!r.keys.includes(`staystrong-v${appVersion}`)) throw new Error('no cache for v' + appVersion + ': ' + r.keys.join(','));
    const disk = fs.statSync(path.join(ROOT, 'icons/icon-512.png')).size;
    if (r.size !== disk) throw new Error(`cached icon-512 is ${r.size} bytes, file is ${disk}`);
  });

  await t('ticking a set marks the bubble done and starts the rest timer', async () => {
    const bubble = page.locator('.exercise-card .set-bubble').first();
    await bubble.scrollIntoViewIfNeeded();
    await bubble.click();
    await page.waitForTimeout(300);
    if (!(await bubble.evaluate((b) => b.classList.contains('done')))) throw new Error('bubble not done');
    if (!(await page.locator('#restTimer').isVisible())) throw new Error('rest timer not shown');
    await page.locator('#restSkip').click();
  });

  await t('tapping an exercise icon opens its picture full screen; Escape closes it', async () => {
    const icon = page.locator('.exercise-card .exercise-icon[data-ex]').first();
    await icon.scrollIntoViewIfNeeded(); await icon.click();
    if (!(await page.locator('#lightbox').isVisible())) throw new Error('picture not open');
    await shot('picture');
    await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    if (await page.locator('#lightbox').isVisible()) throw new Error('Escape did not close');
  });

  await t('phone back: closes an open picture, then asks before leaving', async () => {
    const back = async () => { await page.evaluate(() => history.back()); await page.waitForTimeout(300); };
    const icon = page.locator('.exercise-card .exercise-icon[data-ex]').first();
    await icon.click();
    await back();
    if (await page.locator('#lightbox').isVisible()) throw new Error('back did not close the picture');
    if (await page.locator('#exitDialog').isVisible()) throw new Error('leave dialog shown too early');
    await back();
    if (!(await page.locator('#exitDialog').isVisible())) throw new Error('no leave dialog at the workout');
    await page.locator('#exitStay').click();
  });

  await t('the Aa button scales the text', async () => {
    const px = () => page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
    const base = await px();
    await page.locator('#textSize').click(); await page.waitForTimeout(150);
    const larger = await px();
    if (!(larger > base)) throw new Error(`${base} -> ${larger}`);
    await page.locator('#textSize').click(); await page.locator('#textSize').click(); await page.waitForTimeout(150);
    if (Math.abs((await px()) - base) > 0.5) throw new Error('did not cycle back to normal');
  });

  await t('history and settings render, including the admin images area', async () => {
    await goto('history');
    if (!(await page.locator('#view-history').isVisible())) throw new Error('history');
    await goto('settings');
    if ((await page.locator('.set-text').count()) !== 3) throw new Error('text size choices');
    if ((await page.locator('#adminPinNew, #adminPinIn').count()) !== 1) throw new Error('admin area');
    if ((await page.locator('#appVersion').textContent()).trim() !== `Stay Strong v${appVersion}`) throw new Error('version line');
    await goto('workout');
  });

  await t('backup: save a file, restore it on a wiped phone, then undo the restore', async () => {
    await goto('settings');
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }), page.locator('#backupSave').click()]);
    const b = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
    if (b.app !== 'staystrong-backup' || !b.data || !b.data.profile || b.data.profile.name !== 'Dave') throw new Error('backup file contents');
    if (!Object.keys(b.data.done || {}).length) throw new Error('backup has no ticked sets');
    if (!/Last backup/.test(await page.locator('.backup-last').textContent())) throw new Error('last-backup line');
    await shot('backup');
    // a wiped phone: the welcome screen offers the restore
    await page.evaluate(() => localStorage.clear());
    await page.reload(); await settle();
    if (!(await page.locator('#view-onboarding').isVisible())) throw new Error('wipe did not reach the welcome screen');
    await page.locator('#obBackupFile').setInputFiles({ name: 'b.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(b)) });
    await page.locator('#backupRestoreGo').waitFor({ timeout: 3000 });
    await shot('backup-confirm');
    await Promise.all([page.waitForEvent('load'), page.locator('#backupRestoreGo').click()]);
    await settle();
    await page.locator('#view-workout').waitFor({ timeout: 4000 });
    const restored = await page.evaluate(() => ({ p: JSON.parse(localStorage.getItem('ironweek.profile')), d: JSON.parse(localStorage.getItem('ironweek.done') || '{}') }));
    if (!restored.p || restored.p.name !== 'Dave' || JSON.stringify(restored.d) !== JSON.stringify(b.data.done)) throw new Error('data not restored');
    if ((await page.locator('.set-bubble.done').count()) < 1) throw new Error('ticked set not shown after restore');
    // undo puts the wiped phone back
    await goto('settings');
    await Promise.all([page.waitForEvent('load'), page.locator('#backupUndo').click()]);
    await settle();
    if (!(await page.locator('#view-onboarding').isVisible())) throw new Error('undo did not return to the wiped state');
    // a non-backup file is refused without touching anything
    await page.locator('#obBackupFile').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}') });
    await page.waitForTimeout(300);
    if (await page.locator('#backupRestoreGo').count()) throw new Error('accepted a file that is not a backup');
  });

  console.log(results.join('\n'));
  console.log(errors.length ? '\nPAGE ERRORS:\n' + errors.join('\n') : '\nNo page errors.');
  await browser.close(); server.close();
  process.exit(results.some((r) => r.startsWith('FAIL')) || errors.length ? 1 : 0);
})().catch((e) => { console.error(e); server.close(); process.exit(1); });
