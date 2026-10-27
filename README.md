# 🏋️ Stay Strong — Gym Planner

A phone-friendly workout planner for a 5-day week that **changes every week** — no
accounts, no ads, works offline in the gym. Pick your goal, your equipment and your
week layout once, and every day's plan is built to fit.

| Day | Twice-a-week split (recommended) | One muscle a day |
|-----|----------------------------------|------------------|
| Monday | Upper | Shoulders |
| Tuesday | Lower | Back |
| Wednesday | Push | Legs |
| Thursday | Pull | Chest |
| Friday | Legs | Arms |

## Programming — what the evidence says, and what the app does about it

- **Train each muscle twice a week.** The default *Upper / Lower / Push / Pull /
  Legs* layout gives every muscle two sessions a week, which the training-frequency
  research favours over once-a-week body-part splits. The classic one-muscle-a-day
  split is still there for anyone who prefers it (partners should pick the same
  layout so they share days).
- **Anchor lifts.** Each day's main movement(s) — a press, a row, a squat pattern, a
  hinge — are **fixed for a whole 4-week cycle** so you can practise and progress
  them, then rotated to a fresh candidate next cycle. Only the accessories rotate
  weekly. Anchors always go first in the session and carry an *Anchor lift* chip.
- **Double progression on anchors.** Every ticked set logs its reps (the top of the
  range until you adjust it — tap a done bubble to change). Hit the top of the rep
  range on every set and that zone's weight goes up next cycle (+2.5 kg upper body,
  +5 kg legs, +1 plate on plate stacks); miss it and the app tells you to hold the
  weight and chase the reps. Each anchor keeps its own weight per zone (hypertrophy
  / strength / volume); deload weeks use 60% of the hypertrophy weight. History lists
  every anchor's zone weights and how the last session went.
- **Volume cap.** Around 10–12 hard sets per muscle per session is where returns
  flatten, so sets are trimmed from the last accessories (never below 2, never from
  an anchor) until each muscle on the day is under its cap; a trimmed card says
  *volume cap*. The twice-a-week split uses lower per-session caps because each
  muscle gets two sessions.
- **Compounds first, isolation later; a press, a pull, a squat, a hinge, calves and
  rear delts every week** — the slot rules behind every day. Slots set the floor
  and caps set the ceiling: one calf-raise variant per session, and the free
  picks go to a muscle the day has not covered yet before doubling up.

## First open

A branded splash screen (icon, wordmark, tagline) shows for about a second on
every launch and fades into the app. A short welcome then asks four things — your
first name, your **goal**, your **equipment** and your **week layout** — then drops
you straight into today's session. All of them can be changed later in **Settings**.

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
+ 3 triceps moves). Full gym mode never schedules or suggests bodyweight work
(core moves for the HIIT goal aside). Free weights mode puts loaded exercises
first and allows at most one bodyweight gym staple per day (pull-ups, chin-ups,
dips, Nordic curls, push-up and bench-dip finishers) where nothing loaded fits.
The calisthenics-only fillers never appear outside Calisthenics mode.

### Machine busy? Tap to swap

Every exercise card has a **"Machine busy? Tap to swap"** row with up to three
alternatives for the same muscles: another move on the same kit, a free-weight
version and a bodyweight version. Tap one and the card becomes that exercise for
today — its own photos, set-up steps, video and set bubbles — with an **↩ Undo**
button to go back. The week's plan itself is untouched, and the swap is
remembered if you close the app mid-session.

## What it does

- **A different plan every week.** Each calendar week gets its own combination of
  exercises, drawn from a pool of **160+ movements** (machine, free-weight and
  bodyweight). Selection rules keep every session balanced.
- **Anti-repeat rotation (accessories).** The planner remembers when each exercise
  was last scheduled and prefers anything unused for three weeks or more, so an
  accessory never comes back within two weeks and each day cycles through most of
  its pool; on the twice-a-week split the second session of a muscle also avoids
  what the first used that week. Strength weeks lean into big compound lifts while
  volume weeks favour cable/isolation pump work, so each type of week feels different.
  Anchor lifts are the exception: they stay put for the cycle on purpose.
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
  accessory exercise; the app scales it for each phase (e.g. +15% on strength week,
  −40% on deload) and adds +2.5% per completed cycle for steady progressive overload.
  On an anchor lift the box is that zone's working weight, and double progression
  moves it for you. Toggle between kg and lb in the header or Settings.
- **Reps per set.** Ticking a set logs it at the top of the rep range; tap a done
  bubble to open a stepper and correct the reps (or undo the set). Done bubbles show
  the reps they logged.
- **Plate-stack machines.** Tap the unit next to any weight box to switch that
  exercise to *plates* — for stacks with unmarked plates you enter the plate count
  and get suggestions back as plate counts.
- **Muscle focus map.** Every card shows a small front/back figure with the
  target muscle lit bright and the helpers dimmer, plus a one-line
  mind–muscle cue ("Pull with your elbows, not your hands…"). The guide has a
  larger "Where to feel it" version with a legend. The regions are read from each
  exercise's muscle description (`js/muscles.js`), so new exercises get a map
  automatically.
- **How-to guides.** Every exercise card has a "How to do it" section with real
  start/finish photographs of the movement (cross-fading; tap to see them side by
  side), set-up steps, execution steps, form tips, and common mistakes. The photos
  are bundled with the app, so they work with no signal — basement gyms included.
- **Your own illustrations.** Drop an image at `img/illus/<exercise-id>.jpg` and
  list the id in `DEMO_ILLUS` (`js/demos.js`); the guide shows it full width in
  place of the stock photos, saved for offline use like everything else, and the
  exercise then carries no video link at all (card, guide or video library). The
  chest day uses them: Smith machine incline press, barbell bench press,
  low-to-high cable fly, incline dumbbell fly and cable crossover.
- **Your own card thumbnails.** Drop a square photo at `img/thumb/<exercise-id>.jpg`
  (240 px is plenty) and list the id in `DEMO_THUMBS` (`js/demos.js`); the card's
  pictogram box shows the photo instead of the equipment icon, cached offline
  with the rest of the media.
- **Your own muscle figures.** Drop a front/back figure with the working muscles
  lit at `img/focus/<exercise-id>.webp` (transparent background, about 600 px
  wide) and list the id in `DEMO_FOCUS` (`js/demos.js`); the card's Focus row and
  the guide's "Where to feel it" block show it instead of the drawn body map.
  The Smith machine incline press uses one.
- **Add your own pictures from the phone (admin).** Settings → *Your images ·
  admin* is locked with a PIN you choose, so only you can change them. Unlocked,
  pick any exercise and paste a picture (or choose one from Photos) into its
  card-thumbnail, guide-illustration or muscle-figure slot; the app trims, crops
  and shrinks it on the phone and shows it everywhere that exercise appears (an
  own illustration drops the video link, like a bundled one). Pictures live on
  that phone only (`js/media.js`, IndexedDB). *Export pack* hands the whole set
  to another phone (AirDrop, Files, a chat) or produces a file to send so they
  can be built into the app for everyone; *Import pack* loads one.
- **Animated demos.** Exercises listed in `js/anims.js` show a looping clip
  (`img/anim/<id>.webm` + `.mp4`, poster `.jpg`) in place of the photos, with the
  working muscle highlighted. Clips play while the guide is open, pause on
  tap, are saved for offline use with the photos, and the service worker answers
  the byte-range requests video players make, so they play offline on iPhone too.
  `tools/mannequin_curl.py` and `tools/mannequin_lat_raise.py` render the
  mannequin-style clips headless in Blender (the lateral raise shows the elbow
  leading to shoulder height with a neutral grip); `tools/encode_anim.sh`
  encodes any source clip to the right formats.
- **Form videos for learning at home (YouTube Premium for offline).** Every
  exercise's Video button deep-links to one curated form video (many from
  NASM's technique series). They're meant for learning the move before a
  session; between sets the photos and cues are the reference. Settings →
  *Form video library* opens each training day as a YouTube playlist: save it,
  download it with Premium, and the buttons then play from your downloads with
  no signal.
- **Text size.** Settings → *Text size* (Normal / Large / Extra large), or the
  **Aa** button in the header, scales the whole app — words and tap targets
  together, since everything is sized in rem — and the choice is remembered.
- **Three design rules.** Neon green is the one *signal* colour and only ever means
  "tap this" — buttons, chips, the active tab, set bubbles; everything else is
  ink on paper. Type is either huge (the day name, the week, a stat, the rest
  clock) or tiny (labels, chips, cues), nothing in between. Every screen is
  built in three planes: huge ghost type at the back (the day name behind the
  hero, the exercise number behind each card), the subject in the middle, and
  the buttons on top (day tabs riding over the hero, the set bubbles, the
  sticky Let's go button).
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
css/styles.css        mobile-first dark theme (near-black with neon green, after the gym photos)
js/exercises.js       exercise database (160+ exercises with guides) + SVG pictograms
js/videos.js          curated YouTube form video per exercise
js/icons.js           monoline UI icon set
js/demos.js           generated manifest of bundled demo photos
js/media.js           your own images: phone-local store, crop/scale, pack export/import, PIN
img/demo/             start/finish photos per exercise (public domain)
img/illus/            your own guide illustrations (DEMO_ILLUS)
img/thumb/            your own card thumbnails (DEMO_THUMBS)
img/focus/            your own lit muscle figures (DEMO_FOCUS)
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
