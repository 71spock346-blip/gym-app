/* GET /api/config — the public settings the app needs to sign people in.
 *
 * The Supabase address and its anon ("publishable") key are meant to be
 * public: the database only lets each signed-in person read and write their
 * own rows (see supabase/setup.sql). Keeping them in Vercel's settings rather
 * than in the code means they can be changed without a new release.
 * The Anthropic key is never sent; `coach` only says whether it is set. */
import { cors } from './_cors.mjs';

export default function handler(req, res) {
  if (cors(req, res)) return;
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
  res.setHeader('Cache-Control', 'no-store');
  if (!supabaseUrl || !supabaseAnonKey) { res.status(503).json({ error: 'Online accounts are not set up yet' }); return; }
  res.status(200).json({ supabaseUrl, supabaseAnonKey, coach: !!process.env.ANTHROPIC_API_KEY });
}
