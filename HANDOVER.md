# Stay Strong — project handover

A brief for whoever picks this project up next (a Claude Project, Claude Code, or a
person). It covers what the app is, how it is built and released, the design rules
the owner has settled on, the decisions made so far and why, and what is still open.
The README is the feature reference; this file is the working knowledge around it.

*State at handover: version **71**, commit `401057d` (2 Nov 2026), 52 commits on
branch `claude/gym-workout-planner-dutuod`. Smoke test: 9 of 9 passing.*
*Planner tests added in version 72: 17 of 17 passing.*

---

## 1. What it is

**Stay Strong** is a phone-first workout planner, built as an offline web app (PWA)
that installs to the home screen. Plain HTML, CSS and JavaScript: no framework, no
build step, no server, no accounts. Everything a user saves stays on their phone.

- **Live:** https://71spock346-blip.github.io/gym-app/
- **Repository:** `71spock346-blip/gym-app`, branch `claude/gym-workout-planner-dutuod`
  (the only branch; GitHub Pages serves it, so **every push is a deploy**).
- **Who uses it:** the owner (goal *Build muscle*) and their training partner (goal
  *HIIT · Lean & toned*). Both phones get the same weekly plan when they pick the
  same split and equipment, so they can train side by side.
- **Owner's phone:** Android, app installed to the home screen. The owner has poor
  eyesight; legibility matters more than density.

### What a user sees
1. **Splash** (logo, about a second), then a **welcome** screen on first run: name,
   goal, equipment, week layout.
2. **Workout** (default view): week header with ‹ › to peek at other weeks, phase
   banner (Hypertrophy / Strength / Volume / Deload), five day tabs (Mon–Fri), a hero
   card with progress ring and streaks, a warm-up card, then one **exercise card** per
   exercise, then a finisher.
3. **History:** four-week calendar, logged sessions, personal records, anchor-lift weights.
4. **Settings:** profile, goal, equipment, split, units, **text size**, the PIN-locked
   **Your images · admin** area, form-video library, offline status, version line and
   **Check for updates**.

---

## 2. Files

```
index.html            app shell: splash, views, rest timer, toast, picture lightbox, leave dialog
css/styles.css        all styling; colour tokens at the top (:root)
css/fonts/            Manrope (body) and Oswald (display), bundled for offline
js/exercises.js       exercise database (200 exercises) with set-up/steps/tips/mistakes, day
                      definitions (DAYS = one muscle a day, DAYS_TWICE = twice-a-week split),
                      equipOf(), equipment pictograms
js/app.js             everything else: planner, goals, equipment modes, rendering, sets/reps,
                      anchors and double progression, rest timer, history, settings, admin
                      images UI, lightbox, back-button guard, text size, prefetch, updates
js/muscles.js         muscle focus map: words → body regions, cues, the drawn front/back figure
js/demos.js           manifests of bundled media: DEMO_PHOTOS (stock), DEMO_REV, DEMO_ILLUS,
                      DEMO_THUMBS, DEMO_FOCUS, and their URL helpers
js/anims.js           DEMO_ANIMS: looping mannequin clips (curl, lateral raise)
js/media.js           the owner's own images added on the phone (IndexedDB), crop/scale,
                      pack export/import, PIN hashing
js/videos.js          one curated YouTube form video per exercise
js/icons.js           monoline UI icon set (ico(name))
sw.js                 service worker: app-shell cache per version + persistent media cache
manifest.webmanifest  install metadata and icons
icons/                app icons (see §6)
img/demo/             stock start/finish photos, <id>-0.jpg / <id>-1.jpg (148 exercises)
img/illus/            owner's guide illustrations, <id>.jpg
img/thumb/            owner's card thumbnails, <id>.jpg
img/focus/            owner's lit muscle figures, <id>.webp
img/anim/             mannequin clips, <id>.webm / .mp4 / .jpg poster
tools/smoke_test.js   headless browser smoke test (see §5)
tools/planner_test.js planner rule tests in plain Node (see §5)
tools/*.py, *.sh      Blender scripts that rendered the mannequin clips, and the encoder
```

Exercise ids are prefixed by group: `sh-` shoulders, `bk-` back, `lg-` legs, `ch-` chest,
`ar-` arms, `co-` core. Groups: shoulders 33, back 30, legs 38, chest 26, arms 31, core 6.

---

## 3. Releasing a change (do this every time)

The service worker serves the app shell from a cache named after the version. **If the
version is not bumped, phones keep running the old files.**

1. Make the change.
2. Bump the version in three places at once (replace 71/72 with the real numbers):
   ```bash
   OLD=71; NEW=72
   sed -i "s/?v=$OLD/?v=$NEW/g" index.html
   sed -i "s/^const APP_VERSION = $OLD;/const APP_VERSION = $NEW;/" js/app.js
   sed -i "s/^const VERSION = $OLD; /const VERSION = $NEW; /" sw.js
   ```
   `index.html` has nine `?v=` references (one stylesheet, eight scripts).
3. Run the smoke test and the planner tests (§5).
4. Update `README.md` when a feature changes.
5. Commit and push to `claude/gym-workout-planner-dutuod`. GitHub Pages rebuilds in
   about a minute. Do not open pull requests unless the owner asks.
6. Confirm it is live: the site's `index.html` should reference `app.js?v=<NEW>`.
   ```bash
   curl -s "https://71spock346-blip.github.io/gym-app/?x=$RANDOM" | grep -o 'app.js?v=[0-9]*'
   ```
7. On the phone: **Settings → Check for updates** (or reopen the app twice).

**Media is cached separately and permanently** (`staystrong-photos` cache). When an image
file is *replaced* under the same name, bump its `rev` in `js/demos.js` (or `js/anims.js`)
so its URL changes (`?r=2`) and phones fetch the new one.

---

## 4. How the planner works (short version; README has the detail)

- **Deterministic by calendar week.** The plan comes from a seed derived from the week
  number, so everyone on the same split and equipment sees the same plan all week.
  Changing pools or slot rules changes everyone's plan.
- **Splits:** *twice a week* (Upper / Lower / Push / Pull / Legs; the default for new
  users) or *one muscle a day* (Shoulders / Back / Legs / Chest / Arms).
- **Slots:** each day lists required slots by tag (press, row, squat, hinge, calf, rear
  delt…); free picks prefer muscles not yet covered. `TAG_CAP = { calf: 1 }`, so there
  is never more than one calf raise in a session.
- **Anchor lifts:** each day's main movements stay fixed for two weeks (`ANCHOR_WEEKS`,
  owner's choice in v73; was the whole 4-week cycle), go first,
  and progress by **double progression** (top of the rep range on every set → +2.5 kg
  upper body, +5 kg legs, +1 plate; otherwise hold). An exercise can opt out of
  anchoring with `noAnchor: true` (renegade row, kettlebell swing, lateral lunge).
  Accessories rotate weekly, longest-unused first (staleness cap 12 weeks since v73,
  was 3), so each slot goes through all its alternatives before one repeats.
- **Phases:** a 4-week cycle of Hypertrophy → Strength → Drop-set volume → Deload.
  In week 3 the last set of each loaded accessory is a drop set (`dropSets` on the
  phase; the phase key stays `volume` so saved anchor weights keep working).
- **Volume caps:** per-muscle hard-set caps per session; sets are trimmed from the last
  accessories (never below 2, never from an anchor).
- **Goals:** *Build muscle* (full rests) and *HIIT · Lean & toned* (higher reps,
  supersets, shorter rests, core and glute slots, a HIIT finisher, no chest-building or
  heavy arm-isolation lifts).
- **Equipment modes:** Full gym, Free weights, Calisthenics.
- **Machine busy? Tap to swap:** up to three alternatives per card, for today only, with Undo.

---

## 5. Testing

```bash
NODE_PATH=$(npm root -g) node tools/smoke_test.js            # needs Playwright + Chromium
NODE_PATH=$(npm root -g) node tools/smoke_test.js --shots out # also saves screenshots
```

Nine checks: splash and welcome logos, onboarding, header logo, manifest icon sizes and
transparency, service-worker install and caching, ticking a set and the rest timer, the
full-screen picture, the phone back button, text size, and the Settings screens. Exit
code 1 on any failure or page error.

```bash
node tools/planner_test.js                     # planner rules, plain Node, about 12 s
PLANNER_WEEKS=52 node tools/planner_test.js    # a full year of weeks (about a minute)
```

The planner tests load the app's scripts into a Node `vm` context with a stub DOM and
replay 20 weeks (five 4-week cycles) for both splits, all three equipment modes and both
goals. Seventeen checks: unique ids, muscle map and cue on every exercise, bundled
picture files present, unique video ids, deterministic plans, full-size sessions within
the kit, required slots filled, anchors fixed for their two-week block, listed first and
rotated each block, no back-to-back accessory repeats in a full gym, twice-a-week coverage and no
repeats across paired days, volume caps, the one-calf-raise cap, bodyweight limits per
equipment mode, the HIIT goal's avoided lifts and core/glute slots, and double
progression.

Some rules are only checked where the pool makes them possible: with free weights or
calisthenics there are too few rows, calf raises and chest moves to avoid repeats, and a
full gym cannot always keep a two-week gap on Friday's second hamstring move. The comments
above each check say why.

---

## 6. Design system (what the owner has settled on)

### Colour
The palette comes from the app logo: lime-tinted near-black, with the logo's neon lime
as the **one signal colour**. Tokens live at the top of `css/styles.css`.

| Token | Value | Use |
|---|---|---|
| `--bg` | `#080b06` | page |
| `--surface`, `-2`, `-3` | `#10140c`, `#171d12`, `#1f2818` | cards, chips, raised bits |
| `--accent` | `#86ee14` | solid fills (done set, focus rings) |
| `--accent-2` | `#a8f64c` | lime text and outlines; pill, set-up chip and stepper fills |
| `--on-accent` | `#0c1700` | dark text on lime (about 13:1 contrast) |
| `--danger` / `--danger-text` | `#e5484d` / `#ff8083` | a set still to do |
| `--rim` | white at 88% | rim on every lime chip, pill and bubble |
| `--text`, `--text-dim`, `--text-faint` | `#f2f5ec`, `#a6ad9b`, `#939c87` | text |

The exercise card is a solid slab (`#151b10`) with a 2 px lime-tinted border, one step
lighter than the page.

### Rules
- **Lime only means "tap this" or "this matters".** On a card only three things are
  solid lime: the set-up chip, the sets × reps pill and a done set. Everything else
  tappable is outlined in lime.
- **Set bubbles:** a set still to do is a **red ring**; a done set is **solid lime
  with dark text** and shows the reps logged. (Red/green semantics are the owner's request.)
- **Type is huge or tiny** (Oswald for titles and numbers, Manrope for text), but
  nothing below about 0.7rem, because the owner has poor eyesight.
- **Size in `rem`** for anything that should grow with the text-size setting (Normal /
  Large +15% / Extra large +30%, plus the **Aa** button in the header). Use `px` only
  for hairlines, borders and shadows.
- **Three planes:** ghost type at the back (day name behind the hero, exercise number
  behind each card), content in the middle, buttons on top.

### Exercise card order (the owner set this; keep it)
1. Swap note (only when swapped), then the **icon box** (tap to see the picture full
   screen), the **name**, and chips: set-up (filled), muscles, kit (outlined), Video
   (hidden when the owner's illustration exists), Anchor lift, Superset.
2. **Weight** box (suggested or working weight; tap the unit for plate counts).
3. **How to do it** (collapsed): the picture (own illustration, else mannequin clip,
   else stock start/finish photos), *Where to feel it*, set-up, steps, tips, mistakes,
   form video.
4. **Sets × reps** pill and rest, tempo line, then the **set bubbles** (tap a done one
   to adjust reps or undo), and the anchor progression note.
5. **Focus** row: muscle figure with the target lit, plus a one-line cue.
6. **Machine busy? Tap to swap.**

### Icons
The logo (two figures, dumbbell, heartbeat, neon frame) is the app icon:

- `icon-512` and `icon-192`: the full logo, transparent outside the frame. Used for
  the header, splash and welcome screens.
- `icon-maskable-512`: the Android adaptive icon. The frame is removed and the artwork
  is scaled into the 80% safe circle, so launcher shapes never cut it.
- `apple-touch-icon`: the full logo with a small black margin for iOS's rounded corners.

Manifest and apple-touch URLs carry `?v=2`. Bump that if the icon changes again, so
phones fetch the new artwork.

---

## 7. The owner's own images

The owner supplies images. They usually arrive as one image per message with the
exercise name as the caption. There are two ways to add them.

**A. Bundled for everyone (in the repo).** Put the file in place, add the id to the
manifest in `js/demos.js` with `rev: 1`, bump the app version, and push.

| Slot | File | Manifest | Size |
|---|---|---|---|
| Guide illustration (also hides the video link) | `img/illus/<id>.jpg` | `DEMO_ILLUS` | 900 px wide |
| Card thumbnail (replaces the pictogram) | `img/thumb/<id>.jpg` | `DEMO_THUMBS` | 240 × 240 |
| Muscle figure (replaces the drawn map) | `img/focus/<id>.webp` | `DEMO_FOCUS` | 600 px wide, transparent |

These ImageMagick commands were checked to produce the sizes above:
```bash
convert in.png -resize '900x>' -strip -quality 85 img/illus/<id>.jpg
convert in.png -resize 240x240^ -gravity center -extent 240x240 -strip -quality 88 img/thumb/<id>.jpg
# thumbnail from a picture with a coloured frame: trim 7% off each side first
convert in.png -gravity center -crop 86%x86%+0+0 +repage -resize 240x240^ -extent 240x240 -strip -quality 88 img/thumb/<id>.jpg
convert in.png -resize '600x>' -strip -quality 84 -define webp:alpha-quality=100 img/focus/<id>.webp
```

**B. On the phone, no code (Settings → Your images · admin).** Locked with a PIN the
owner chose. Only a SHA-256 hash is stored, in localStorage key `ironweek.adminPin`.
Pick an exercise (alphabetical list), then paste or choose a picture for any of the
three slots. Pictures live in that phone's IndexedDB (`staystrong-media`) and win over
bundled files. **Export pack** produces a JSON file with the images inline. Send that
file to the next developer to bundle them for everyone, or import it on another phone.

**Bundled so far:** illustrations and thumbnails for five chest lifts (Smith Machine
Incline Press, Barbell Bench Press, Low-to-High Cable Fly, Incline Dumbbell Fly, Cable
Crossover), plus a muscle figure for the Smith Machine Incline Press.

---

## 8. Phone behaviour worth knowing

- **Offline:** the shell is precached per version; media is cached on first use and
  prefetched in the background (Settings shows progress). The app works with no signal.
- **Back button (Android system back):** the app keeps one spare history entry so back
  closes an open picture first, then returns from History or Settings to the workout,
  and at the workout shows *Leave Stay Strong?* (No, stay / Yes, leave). Chrome ignores
  history entries added without a user gesture, so the spare entry is pushed on the
  first tap (`ensureGuard` in `js/app.js`). Most phones refuse `window.close()`, so
  *Yes, leave* then says "Press back once more to leave".
- **Storage:** localStorage keys use the old prefix `ironweek.` (the app's first name).
  **Do not rename it**, or every user loses their weights and history. Keys: `profile`,
  `goal`, `equip`, `split`, `unit`, `textSize`, `baselines`, `done`, `reps`, `swaps`,
  `sessions`, `prs`, `anchors`, `adminPin`.
- **Backup (v74):** Settings → Backup saves every `ironweek.*` key (plus the admin
  image pack) to one JSON file (`app: 'staystrong-backup'`) and restores it on any
  phone, including from the welcome screen. A restore replaces all `ironweek.*` keys,
  merges images, and keeps the replaced data in `staystrong.beforeRestore` (outside
  the prefix) for *Undo last restore*. `backupAt` records the last save. Any new
  saved key under the prefix is included automatically.

---

## 9. Decisions and the owner's preferences

What the owner asked for, kept or rejected. Check here before proposing a change in the
same area.

- **Colour history:** black / charcoal / gold → a blue card background (tried) → gold
  dropped for the green of a gym photo → **lime from the logo** (current). Don't bring
  gold back.
- **Cards:** gradient slabs were rejected; a solid colour with a thicker 2 px border was
  approved. A version with heavy separators between cards was called "UGLY" and reverted.
- **Bubbles and chips:** the owner asked for filled pills/chips with a white rim, and for
  sets red until done and green when done.
- **Card order** was set by the owner across several rounds; the current order is in §6.
- **Accessibility:** text size option and tap-to-enlarge pictures came from the owner's
  poor eyesight. Prefer bigger type and more contrast over fitting more on screen.
- **Content:** Chest Dips removed. The Dumbbell Lateral Raise was corrected (elbows
  lead to shoulder height, neutral grip, a mannequin clip instead of a wrong stock
  photo). Only one calf-raise variant per session. The owner's own illustrations
  replace stock photos *and* the video link for that exercise.
- **Programme:** evidence-based choices the owner approved: twice-a-week split, anchor
  lifts with double progression, per-session volume caps, 4-week periodisation.
- **Variety (v73):** the owner found workouts repetitive. 36 exercises were added where
  pools were thinnest (core 6 → 17, free-weight back, calves and hamstrings, calisthenics
  moves), anchors change every two weeks (owner picked this over four), and week 3 is a
  drop-set week (owner asked for one). 18 new moves have stock photos from
  free-exercise-db; the rest show the kit pictogram until the owner sends pictures.
  Calisthenics mode still repeats on some days: its pools are small.
- **HIIT extras win (v72):** when a day's shared slots already fill every place (the
  Pull day), the HIIT goal drops a shared accessory, usually the curl, so its promised
  core or glute move stays. Before v72 the core move was the one dropped.
- **Admin exercise list:** alphabetical, by group.
- **Working style:** the owner writes short messages, often from the phone, and wants
  the change made rather than discussed. Screenshots in replies help. When a request is
  unclear, a quick visual is better than a long explanation.

---

## 10. Open items

1. **Confirm the back-button fix on the phone (v69+).** The owner reported that back
   still left the app on v68. v69 moved the history entry to the first tap. If it still
   fails, find out which browser the app was installed from (Chrome, Samsung Internet…).
2. **Barbell Bench Press muscle figure:** the owner sent it once, but it never arrived.
   Add it via the admin area or ask for it again. Other exercises have no figures yet.
3. **Home-screen icon refresh:** Android updates installed-app icons on its own schedule
   (around a day, sometimes asking first); iPhone needs the app re-added to the home screen.
4. More of the owner's illustrations and thumbnails are expected, probably beyond chest day.

---

## 11. Suggested instructions for a Claude Project

Paste this into the Project's custom instructions, and add this file plus `README.md`
(or the whole repository) to the Project's knowledge:

```
You are continuing development of Stay Strong, an offline workout PWA (plain HTML/CSS/JS,
no build) at github.com/71spock346-blip/gym-app, branch claude/gym-workout-planner-dutuod,
live on GitHub Pages at 71spock346-blip.github.io/gym-app. HANDOVER.md is the source of
truth for how it works, the design rules and the owner's decisions; README.md is the
feature reference. Read the relevant section before changing anything.

Every release: bump the version in js/app.js (APP_VERSION), sw.js (VERSION) and every ?v=
in index.html; run tools/smoke_test.js and tools/planner_test.js; update README.md for feature changes; push to the
branch above (each push deploys); then tell the owner to tap Settings → Check for updates.

Keep the design rules: lime (#86ee14 / #a8f64c) is the only signal colour; to-do sets are
red rings, done sets solid lime; white rims on lime pills and chips; nothing smaller than
about 0.7rem; size in rem so the text-size setting works; keep the exercise card order.
Never rename the 'ironweek.' localStorage prefix. Bump an image's rev when replacing it.

The owner has poor eyesight, trains with a partner, uses an Android phone, and sends short
requests and images (one per message, captioned with the exercise name). Make the change
rather than discussing it, show a screenshot or describe exactly what changed, and say
plainly when something could not be verified on a real phone.
```
