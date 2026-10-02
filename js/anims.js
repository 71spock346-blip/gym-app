/* Stay Strong — animated exercise demos.
 * One looping clip per exercise id in img/anim/<id>.webm + .mp4 with a
 * poster frame <id>.jpg. Rendered by tools/mannequin_curl.py (or encoded
 * from any source clip with tools/encode_anim.sh). Exercises not listed
 * here fall back to the start/finish photos.
 *
 * Bump `rev` whenever a clip is re-rendered: the files are cached on the
 * phone by URL, and the revision is part of the URL. */

const DEMO_ANIMS = {
  'ar-db-curl': { muscle: 'Biceps', source: 'mannequin', rev: 3 },
};

function animUrl(id, ext) {
  const a = DEMO_ANIMS[id];
  return `img/anim/${id}.${ext}${a && a.rev ? `?r=${a.rev}` : ''}`;
}
