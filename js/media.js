/* Stay Strong — your own images for any exercise, added in Settings → Your
 * images (admin) and kept on this phone in IndexedDB, on top of the bundled
 * media in img/<kind>/. A phone-local image wins over a bundled one.
 *
 *   kind 'thumb'  → the card's pictogram box             (centred square, 320 px)
 *   kind 'illus'  → the guide's technique picture         (up to 900 px wide; drops the video link)
 *   kind 'focus'  → the lit front/back muscle figure      (up to 600 px wide, keeps transparency)
 *
 * Nothing here touches the network: images are cropped and shrunk on a canvas
 * and stored as blobs, and a "pack" (JSON with the images inline) moves them
 * to another phone or to the repo to be built in. */

const OWN_KINDS = {
  thumb: { label: 'Card thumbnail', hint: 'Square photo in place of the pictogram on the card.', max: 320, square: true, type: 'image/jpeg' },
  illus: { label: 'Guide illustration', hint: 'The technique picture in "How to do it"; the video link goes away.', max: 900, type: 'image/jpeg' },
  focus: { label: 'Muscle figure', hint: 'Front/back figure with the working muscles lit, transparent background.', max: 600, type: 'image/webp' },
};

const ownMedia = { thumb: {}, illus: {}, focus: {} };   // kind → exercise id → { url, blob, w, h, at }

const mediaDB = {
  open() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') return reject(new Error('This phone has no local image store.'));
      const req = indexedDB.open('staystrong-media', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('media');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('Could not open the image store.'));
    });
  },
  async run(mode, fn) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('media', mode);
      const req = fn(tx.objectStore('media'));
      tx.oncomplete = () => { db.close(); resolve(req && req.result); };
      tx.onerror = () => { db.close(); reject(tx.error || new Error('Image store error.')); };
      tx.onabort = tx.onerror;
    });
  },
  all() { return this.run('readonly', (st) => st.getAll()); },
  put(key, value) { return this.run('readwrite', (st) => st.put(value, key)); },
  del(key) { return this.run('readwrite', (st) => st.delete(key)); },
};

const ownKey = (kind, ex) => `${kind}:${ex}`;
function ownMediaUrl(kind, ex) { const m = ownMedia[kind] && ownMedia[kind][ex]; return m ? m.url : null; }
function ownMediaCount() { return Object.values(ownMedia).reduce((n, m) => n + Object.keys(m).length, 0); }

function adoptOwn(rec) {
  const prev = ownMedia[rec.kind][rec.ex];
  if (prev) URL.revokeObjectURL(prev.url);
  ownMedia[rec.kind][rec.ex] = { url: URL.createObjectURL(rec.blob), blob: rec.blob, w: rec.w, h: rec.h, at: rec.at };
}

/* Load everything saved on this phone; resolves to how many images there are. */
async function loadOwnMedia() {
  try {
    const rows = await mediaDB.all();
    (rows || []).forEach((r) => { if (r && OWN_KINDS[r.kind] && r.ex && r.blob) adoptOwn(r); });
  } catch { /* no IndexedDB (private mode): bundled media only */ }
  return ownMediaCount();
}

async function setOwnMedia(kind, ex, blob, opts) {
  if (!OWN_KINDS[kind]) throw new Error('Unknown image slot.');
  const { blob: out, w, h } = await processImage(blob, kind, opts);
  const rec = { kind, ex, blob: out, w, h, at: Date.now() };
  await mediaDB.put(ownKey(kind, ex), rec);
  adoptOwn(rec);
  return rec;
}

async function removeOwnMedia(kind, ex) {
  await mediaDB.del(ownKey(kind, ex));
  const prev = ownMedia[kind] && ownMedia[kind][ex];
  if (prev) { URL.revokeObjectURL(prev.url); delete ownMedia[kind][ex]; }
}

const loadImageBlob = (blob) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(blob);
  const im = new Image();
  im.onload = () => { URL.revokeObjectURL(url); resolve(im); };
  im.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file is not a picture this phone can read.')); };
  im.src = url;
});

/* Crop and scale on a canvas: an optional trim cuts a frame off the edges
 * (0.07 = 7% each side), thumbnails become centred squares, and everything is
 * capped at the slot's width. Figures keep their transparency (WebP where the
 * phone can encode it, PNG otherwise); the rest is JPEG on black. */
async function processImage(blob, kind, opts = {}) {
  const spec = OWN_KINDS[kind];
  const im = await loadImageBlob(blob);
  let sx = 0, sy = 0, sw = im.naturalWidth, sh = im.naturalHeight;
  if (!sw || !sh) throw new Error('That picture is empty.');
  const trim = Math.min(0.4, Math.max(0, Number(opts.trim) || 0));
  if (trim > 0) { sx = sw * trim; sy = sh * trim; sw *= 1 - 2 * trim; sh *= 1 - 2 * trim; }
  if (spec.square) { const s = Math.min(sw, sh); sx += (sw - s) / 2; sy += (sh - s) / 2; sw = sh = s; }
  const k = Math.min(1, spec.max / sw);
  const dw = Math.max(1, Math.round(sw * k)), dh = Math.max(1, Math.round(sh * k));
  const canvas = document.createElement('canvas');
  canvas.width = dw; canvas.height = dh;
  const ctx = canvas.getContext('2d');
  if (spec.type === 'image/jpeg') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, dw, dh); }
  ctx.drawImage(im, sx, sy, sw, sh, 0, 0, dw, dh);
  const out = await new Promise((resolve) => canvas.toBlob(resolve, spec.type, 0.86));
  if (!out) throw new Error('Could not encode the picture.');
  return { blob: out, w: dw, h: dh };
}

/* The clipboard, when the browser lets a tap read it (iOS and Android both
 * ask once). { blob } on success; { error: 'unsupported' | 'noimage' | 'denied' } otherwise. */
async function clipboardImage() {
  if (!navigator.clipboard || !navigator.clipboard.read) return { error: 'unsupported' };
  try {
    const items = await navigator.clipboard.read();
    for (const it of items) {
      const type = (it.types || []).find((t) => t.startsWith('image/'));
      if (type) return { blob: await it.getType(type) };
    }
    return { error: 'noimage' };
  } catch { return { error: 'denied' }; }
}

/* ------------------------------ packs ------------------------------ */
const blobToDataURL = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = () => reject(r.error || new Error('read failed'));
  r.readAsDataURL(blob);
});

async function exportOwnMedia() {
  const items = [];
  for (const kind of Object.keys(ownMedia)) {
    for (const [ex, m] of Object.entries(ownMedia[kind])) items.push({ kind, ex, w: m.w, h: m.h, data: await blobToDataURL(m.blob) });
  }
  const pack = { app: 'staystrong-media', v: 1, at: new Date().toISOString(), items };
  return new Blob([JSON.stringify(pack)], { type: 'application/json' });
}

async function importOwnMedia(file) {
  let pack;
  try { pack = JSON.parse(await file.text()); } catch { throw new Error('That file is not a Stay Strong image pack.'); }
  if (!pack || pack.app !== 'staystrong-media' || !Array.isArray(pack.items)) throw new Error('That file is not a Stay Strong image pack.');
  let n = 0;
  for (const it of pack.items) {
    if (!it || !OWN_KINDS[it.kind] || typeof it.ex !== 'string' || typeof it.data !== 'string' || !it.data.startsWith('data:image/')) continue;
    const blob = await (await fetch(it.data)).blob();
    const rec = { kind: it.kind, ex: it.ex, blob, w: it.w, h: it.h, at: Date.now() };
    await mediaDB.put(ownKey(it.kind, it.ex), rec);
    adoptOwn(rec);
    n++;
  }
  return n;
}

/* Hand a file to the phone: the share sheet where it takes files (AirDrop,
 * Files, Drive, a chat), otherwise a plain download. */
async function saveBlobToPhone(blob, filename) {
  const file = new File([blob], filename, { type: blob.type });
  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: filename }); return 'shared'; }
    catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  return 'downloaded';
}

/* ------------------------------ PIN ------------------------------ */
/* Only the SHA-256 of the PIN is kept (WebCrypto needs https or localhost;
 * a plain http test server falls back to a weak hash). */
async function pinHash(pin) {
  const data = new TextEncoder().encode('staystrong:' + pin);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 7;
  for (const b of data) h = (Math.imul(h, 31) + b) >>> 0;
  return 'x' + h.toString(16);
}
