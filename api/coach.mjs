/* POST /api/coach — the AI Coach.
 *
 * Body: { kind: 'ask' | 'feedback' | 'monthly', message, history: [{ role, text }], context }
 * Header: Authorization: Bearer <Supabase access token>
 *
 * Only signed-in people can use it, and each person gets COACH_DAILY_LIMIT
 * questions a day (default 30), so the Anthropic bill stays small. The key
 * (ANTHROPIC_API_KEY) lives in Vercel's settings and never reaches the phone.
 */
import Anthropic from '@anthropic-ai/sdk';
import { cors, SUPABASE_KEY } from './_cors.mjs';

const MODEL = 'claude-opus-5-5';
const DAILY_LIMIT = Number(process.env.COACH_DAILY_LIMIT || 30);

const SYSTEM = `You are the coach inside Stay Strong, a gym app that builds a new weekly plan (Monday to Friday) from the person's goal, equipment and training split. Each message includes a JSON snapshot of their settings, today's planned exercises and their last six weeks of logged sessions (sets done out of sets planned, reps per set, personal bests and working weights in kg).

How to coach:
- Speak directly to the person, warmly and plainly, like a good personal trainer at the gym. Use their name now and then if you have it.
- Base every point on their actual data. Name the exercises and numbers you are looking at. If the data is thin, say so and keep advice general.
- Keep replies short enough to read between sets: usually 3 to 6 short lines or bullets, never more than about 150 words unless they ask for detail.
- When they ask what to do today, work from today's planned exercises: say which to keep, cut, swap or go lighter on, and roughly how many sets. Do not invent a whole new programme.
- Give weights in their unit (the snapshot says kg or lb; stored weights are kg, 1 kg = 2.2 lb).
- You give general fitness advice, not medical advice. If they mention pain (not normal muscle soreness), dizziness, chest pain or an injury, tell them to stop that movement and see a doctor or physio.
- Do not use headings or tables. Bullets with "- " and **bold** for a key number are fine.`;

const TASKS = {
  feedback: 'Give feedback on my most recent logged session (the last entry in recent_sessions): what went well, anything I missed or should change next time, and one thing to aim for in my next session.',
  monthly: 'Do my monthly check-in. Look at the last four weeks: how many sessions I did against my weekly goal, which lifts went up, anything I keep skipping or not finishing. End with two or three concrete things to focus on for the next month.',
};

async function supabaseUser(token) {
  const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
  });
  return r.ok ? r.json() : null;
}

/* Count today's questions in coach_log (each person can only see and add
 * their own rows; they cannot delete them), then add this one. */
async function underDailyLimit(token, userId) {
  const base = `${process.env.SUPABASE_URL}/rest/v1/coach_log`;
  const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const r = await fetch(`${base}?select=id&at=gt.${encodeURIComponent(since)}`, { headers: { ...headers, Prefer: 'count=exact', Range: '0-0' } });
  if (!r.ok) throw new Error(`coach_log read failed: ${r.status}`);
  const total = Number((r.headers.get('content-range') || '*/0').split('/')[1]) || 0;
  if (total >= DAILY_LIMIT) return false;
  const w = await fetch(base, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ user_id: userId }) });
  if (!w.ok) throw new Error(`coach_log write failed: ${w.status}`);
  return true;
}

const clip = (s, n) => String(s || '').slice(0, n);

export default async function handler(req, res) {
  if (cors(req, res)) return;
  if (req.method !== 'POST') { res.status(405).json({ error: 'Use POST' }); return; }
  if (!process.env.ANTHROPIC_API_KEY) { res.status(503).json({ error: 'The coach is not switched on yet' }); return; }
  if (!process.env.SUPABASE_URL || !SUPABASE_KEY) { res.status(503).json({ error: 'Online accounts are not set up yet' }); return; }

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const user = token ? await supabaseUser(token).catch(() => null) : null;
  if (!user || !user.id) { res.status(401).json({ error: 'Please sign in again under Settings → Account' }); return; }

  try {
    if (!(await underDailyLimit(token, user.id))) {
      res.status(429).json({ error: `That's ${DAILY_LIMIT} questions today, the daily limit. The coach is back tomorrow.` });
      return;
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'The coach could not start (database). Try again in a minute.' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const kind = TASKS[body.kind] ? body.kind : 'ask';
  const ask = kind === 'ask' ? clip(body.message, 600).trim() : TASKS[kind];
  if (!ask) { res.status(400).json({ error: 'Type a question first' }); return; }
  const context = clip(JSON.stringify(body.context || {}), 24000);

  // earlier turns (text only), then this turn with the fresh training snapshot
  const messages = [];
  for (const m of Array.isArray(body.history) ? body.history.slice(-8) : []) {
    const role = m && m.role === 'assistant' ? 'assistant' : 'user';
    const text = clip(m && m.text, 2000).trim();
    if (!text) continue;
    if (messages.length && messages[messages.length - 1].role === role) messages[messages.length - 1].content += '\n\n' + text;
    else messages.push({ role, content: text });
  }
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (messages.length && messages[messages.length - 1].role === 'user') messages.pop();   // the turn being answered now (sent again below)
  messages.push({ role: 'user', content: `My training data right now:\n${context}\n\n${ask}` });

  const client = new Anthropic();   // reads ANTHROPIC_API_KEY
  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',            // if a safety check declines, the API retries on a suitable model
      output_config: { effort: 'low' },
      system: SYSTEM,
      messages,
    });
    if (response.stop_reason === 'refusal') {
      res.status(200).json({ reply: "I can't help with that one. Ask me about your training, today's plan or how your last workout went." });
      return;
    }
    const reply = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    res.status(200).json({ reply: reply || 'Sorry, I lost my train of thought. Ask me again?' });
  } catch (err) {
    console.error('coach error', err && err.status, err && err.message);
    if (err instanceof Anthropic.RateLimitError) { res.status(503).json({ error: 'The coach is busy. Try again in a minute.' }); return; }
    if (err instanceof Anthropic.AuthenticationError) { res.status(503).json({ error: 'The coach key in Vercel is not working. Check ANTHROPIC_API_KEY.' }); return; }
    res.status(502).json({ error: 'The coach could not answer just now. Try again in a minute.' });
  }
}
