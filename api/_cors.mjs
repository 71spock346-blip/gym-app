/* Shared by the API functions (files starting with _ are not functions).
 * The Vercel copy calls these from the same address. The older GitHub Pages
 * copy calls them from its own address, so people can sign in there and move
 * their data across; nobody else is let in. */
const ALLOWED = (process.env.ALLOWED_ORIGINS || 'https://71spock346-blip.github.io')
  .split(',').map((s) => s.trim()).filter(Boolean);

export function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') { res.status(204).end(); return true; }
  return false;
}
