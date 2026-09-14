# 🏋️ Stay Strong — Gym Planner

A phone-friendly workout planner for a 5-day split that **changes every week** — no
accounts, no ads, works offline in the gym.

| Day | Muscle group |
|-----|--------------|
| Monday | Shoulders |
| Tuesday | Back |
| Wednesday | Legs |
| Thursday | Chest |
| Friday | Arms |

## Two goals, one plan — train together

On first open each phone asks **"What's your goal?"**:

- **💪 Build muscle** — full rests, progressive overload.
- **🔥 Lose fat** — the *same exercises*, higher reps, rests cut to ~65%, lighter
  weight suggestions, and a rotating cardio finisher after every session.

Exercise selection comes from the calendar week, so two phones always show the
same machines on the same day — perfect for couples who train together with
different goals. Each device keeps its own goal, weights, and progress; switch
any time via the goal pill in the banner.

## What it does

- **A different plan every week.** Each calendar week gets its own combination of
  exercises, drawn from a pool of 65+ machine and free-weight movements. Selection
  rules keep every session balanced (leg day always has quads + hamstrings + calves,
  arm day always gets 3 biceps + 3 triceps moves, and so on).
- **Anti-repeat rotation.** Exercises used last week go to the back of the queue,
  so consecutive weeks genuinely rotate through the pool instead of re-picking
  favourites. Strength weeks also lean into big compound lifts while volume weeks
  favour cable/isolation pump work, so each type of week feels different.
- **Reps and sets rotate through a 4-week training cycle:**
  1. **Hypertrophy** — 3–4 sets × 8–12 reps, moderate weight
  2. **Strength** — 4–5 sets × 4–6 reps, heavy
  3. **Volume** — 3 sets × 12–20 reps, lighter, short rests
  4. **Deload** — 2–3 easy sets to recover (this is where growth happens)
- **Weight suggestions.** Type in your comfortable ~10-rep working weight once per
  exercise; the app scales it for each phase (e.g. +15% on strength week, −40% on
  deload) and adds +2.5% per completed cycle for steady progressive overload.
  Toggle between kg and lb in the header.
- **Machine guides.** Every exercise card has a "How to use this machine" section
  with an illustration, set-up steps, execution steps, and form tips.
- **Set tracking.** Tap the numbered bubbles to check off sets as you finish them.
- **Week preview.** Use the ‹ › arrows to peek at next week's (or last week's) plan.

Everything is stored locally on your phone (`localStorage`) — nothing leaves your device.

## Put it on your phone

The app is plain HTML/CSS/JS — any static host works. The easiest is **GitHub Pages**:

1. On GitHub, open **Settings → Pages**.
2. Under *Build and deployment*, set **Source** to *Deploy from a branch*, pick the
   `main` branch and `/ (root)` folder, and save.
3. After a minute your app is live at `https://<your-username>.github.io/gym-app/`.
4. Open that link on your phone, then:
   - **iPhone (Safari):** Share button → **Add to Home Screen**
   - **Android (Chrome):** ⋮ menu → **Add to Home screen** / **Install app**

It installs like a native app, launches full-screen, and keeps working with no signal
in the gym thanks to the service worker cache.

## Run it locally

```bash
# any static server works, e.g.:
python3 -m http.server 8000
# then open http://localhost:8000
```

## Project layout

```
index.html            app shell
css/styles.css        mobile-first dark theme
js/exercises.js       exercise database (65+ exercises with machine guides) + SVG pictograms
js/app.js             weekly plan generator, weight logic, UI
sw.js                 service worker (offline support)
manifest.webmanifest  PWA install metadata
icons/                app icons
```

## How the weekly variation works

The planner derives a deterministic seed from the calendar week number, so:

- everyone sees the same stable plan for the whole week (no reshuffling mid-week),
- next week's seed is different → different exercise combos and rep schemes,
- the 4-week phase cycle (hypertrophy → strength → volume → deload) follows
  proven periodisation, so the variation is structured rather than random noise.
