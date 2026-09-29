# 🏋️ Stay Strong — Gym Planner

A phone-friendly workout planner for a 5-day split that **changes every week** — no
accounts, no ads, works offline in the gym. Pick your goal and your equipment once,
and every day's plan is built to fit.

| Day | Muscle group |
|-----|--------------|
| Monday | Shoulders |
| Tuesday | Back |
| Wednesday | Legs |
| Thursday | Chest |
| Friday | Arms |

## First open

A branded splash screen (icon, wordmark, tagline) shows for about a second on
every launch and fades into the app. A short welcome then asks three things — your first name, your **goal** and your
**equipment** — then drops you straight into today's session. All three can be
changed later in **Settings**.

### Two goals, one plan — train together

- **💪 Build muscle** — full rests, progressive overload.
- **🔥 HIIT · Lean & toned** — built for her: the same training days, but higher
  reps, supersets, rests cut to ~60%, lighter weight suggestions, core work on
  shoulder/push/arm days, a glute focus on leg day, and a rotating HIIT finisher
  (easy cardio on deload weeks). Chest-building lifts (bench, flys, pec deck)
  and heavy arm isolation (concentration curls, skull crushers, spider curls,
  close-grip bench, preacher curls) are never scheduled in this mode.

Exercise selection comes from the calendar week, so two phones with the same
equipment start from the same plan on the same day; the HIIT mode then swaps out
only what it avoids and adds its core/glute slots, so most of the session is still
shared machine for machine. Switch any time via the goal pill in the banner.

### Three equipment modes

- **🏢 Full gym** — machines, cables, racks and free weights.
- **🏋️ Free weights** — dumbbells, a barbell and a bench: home or garage gym.
  No machine or cable is ever scheduled.
- **🤸 Calisthenics** — bodyweight only, with a pull-up bar and a bench or box.
  Pike and handstand push-ups, pull-up progressions, inverted and towel rows,
  pistol and Bulgarian squats, Nordic curls, dips, archer and plyo push-ups…

Every day's plan is rebuilt from exercises that fit the mode, with the same slot
rules (leg day still gets quads + hamstrings + calves, arm day still gets 3 biceps
+ 3 triceps moves).

### Machine busy? Tap to swap

Every exercise card has a **"Machine busy? Tap to swap"** row with up to three
alternatives for the same muscles: another move on the same kit, a free-weight
version and a bodyweight version. Tap one and the card becomes that exercise for
today — its own photos, set-up steps, video and set bubbles — with an **↩ Undo**
button to go back. The week's plan itself is untouched, and the swap is
remembered if you close the app mid-session.

## What it does

- **A different plan every week.** Each calendar week gets its own combination of
  exercises, drawn from a pool of **115+ movements** (machine, free-weight and
  bodyweight). Selection rules keep every session balanced.
- **Anti-repeat rotation.** Exercises used last week go to the back of the queue,
  so consecutive weeks genuinely rotate through the pool instead of re-picking
  favourites. Strength weeks also lean into big compound lifts while volume weeks
  favour cable/isolation pump work, so each type of week feels different.
- **Reps and sets rotate through a 4-week training cycle:**
  1. **Hypertrophy** — 3–4 sets × 8–12 reps, moderate weight
  2. **Strength** — 4–5 sets × 4–6 reps, heavy
  3. **Volume** — 3 sets × 12–20 reps, lighter, short rests
  4. **Deload** — 2–3 easy sets to recover (this is where growth happens)
- **Today at a glance.** A hero card greets you by name, shows a progress ring
  for the session's sets, your week streak, sessions this week and PR count —
  and throws a little celebration when the last set is ticked.
- **History & personal bests.** The History tab keeps a Mon–Sun calendar of the
  last four weeks, every logged session, total sets, and a list of PRs (raise a
  saved weight and it lands there with a toast).
- **Rest timer.** Ticking off a set starts a countdown for that exercise's rest
  (+30 s / Skip), with a chime and vibration at zero and a wake lock so the phone
  stays awake.
- **Weight suggestions.** Type in your comfortable ~10-rep working weight once per
  exercise; the app scales it for each phase (e.g. +15% on strength week, −40% on
  deload) and adds +2.5% per completed cycle for steady progressive overload.
  Toggle between kg and lb in the header or Settings.
- **Plate-stack machines.** Tap the unit next to any weight box to switch that
  exercise to *plates* — for stacks with unmarked plates you enter the plate count
  and get suggestions back as plate counts.
- **How-to guides.** Every exercise card has a "How to do it" section with real
  start/finish photographs of the movement (cross-fading; tap to see them side by
  side), set-up steps, execution steps, form tips, and common mistakes. The photos
  are bundled with the app, so they work with no signal — basement gyms included.
- **Form videos for learning at home (YouTube Premium for offline).** Every
  exercise's Video button deep-links to one curated form video (many from
  NASM's technique series). They're meant for learning the move before a
  session; between sets the photos and cues are the reference. Settings →
  *Form video library* opens each training day as a YouTube playlist: save it,
  download it with Premium, and the buttons then play from your downloads with
  no signal.
- **One icon language.** A single monoline icon set (`js/icons.js`) and clean
  equipment pictograms on every exercise card, instead of platform emoji and
  stick figures, so the app looks the same on every phone.
- **Week preview.** Use the ‹ › arrows to peek at next week's (or last week's) plan.

Everything is stored locally on your phone (`localStorage`) — nothing leaves your device.

## Put it on your phone

The app is plain HTML/CSS/JS — any static host works. The easiest is **GitHub Pages**:

1. On GitHub, open **Settings → Pages**.
2. Under *Build and deployment*, set **Source** to *Deploy from a branch*, pick the
   branch and `/ (root)` folder, and save.
3. After a minute your app is live at `https://<your-username>.github.io/gym-app/`.
4. Open that link on your phone, then:
   - **iPhone (Safari):** Share button → **Add to Home Screen**
   - **Android (Chrome):** ⋮ menu → **Add to Home screen** / **Install app**

It installs like a native app, launches full-screen, and keeps working with no signal
in the gym thanks to the service worker cache. Settings shows a status line while
demo photos are being saved for offline use, the running version number, and a
**🔄 Check for updates** button that forces a clean refresh (your saved weights and
progress are kept).

## Run it locally

```bash
# any static server works, e.g.:
python3 -m http.server 8000
# then open http://localhost:8000
```

## Project layout

```
index.html            app shell (onboarding, workout, history, settings views)
css/styles.css        mobile-first dark theme (black / charcoal / gold, from the icon)
js/exercises.js       exercise database (115+ exercises with guides) + SVG pictograms
js/videos.js          curated YouTube form video per exercise
js/icons.js           monoline UI icon set
js/demos.js           generated manifest of bundled demo photos
img/demo/             start/finish photos per exercise (public domain)
js/app.js             weekly plan generator, goals, equipment modes, history, UI
sw.js                 service worker (offline support)
manifest.webmanifest  PWA install metadata
icons/                app icons
```

## Credits

Exercise photographs come from the
[free-exercise-db](https://github.com/yuhonas/free-exercise-db) project, released
into the public domain (Unlicense). They are re-encoded to phone size and stored
in `img/demo/`; `js/demos.js` maps each exercise to its source entry.

## How the weekly variation works

The planner derives a deterministic seed from the calendar week number, so:

- everyone sees the same stable plan for the whole week (no reshuffling mid-week),
- next week's seed is different → different exercise combos and rep schemes,
- the 4-week phase cycle (hypertrophy → strength → volume → deload) follows
  proven periodisation, so the variation is structured rather than random noise.
