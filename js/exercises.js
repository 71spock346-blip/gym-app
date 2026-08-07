/* Iron Week — exercise database.
 * Each day has a pool of exercises; the planner picks a fresh combination every week.
 * tags drive selection rules (e.g. legs always get quads + hamstrings + calves).
 * video is a YouTube search query — search links never go stale, and on phones
 * they open directly in the YouTube app with the top form tutorials.
 * icon keys map to the ICONS pictogram set at the bottom of this file.
 */

const DAYS = [
  { key: 'shoulders', label: 'Mon', name: 'Shoulders', emoji: '🪨',
    picks: 5,
    slots: [ { tag: 'press', count: 1 }, { tag: 'side', count: 2 }, { tag: 'rear', count: 1 } ],
    warmup: [
      '5 min easy cardio (bike or rower) to raise your temperature.',
      '15 slow arm circles each way, then 15 band pull-aparts (or wall slides).',
      '2 light sets of your first press — about half your working weight.',
    ] },
  { key: 'back', label: 'Tue', name: 'Back', emoji: '🦅',
    picks: 5,
    slots: [ { tag: 'vertical', count: 1 }, { tag: 'horizontal', count: 2 } ],
    warmup: [
      '5 min easy cardio — rower is perfect for back day.',
      '20–30 s dead hang from the pull-up bar, then 10 slow cat-cows.',
      '2 light sets of your first pull — about half your working weight.',
    ] },
  { key: 'legs', label: 'Wed', name: 'Legs', emoji: '🦵',
    picks: 6,
    slots: [ { tag: 'quad', count: 2 }, { tag: 'ham', count: 1 }, { tag: 'calf', count: 1 } ],
    warmup: [
      '5 min incline walk or bike to warm up hips and knees.',
      '15 bodyweight squats and 10 leg swings per leg (front-to-back and side-to-side).',
      '2 light sets of your first exercise — about half your working weight.',
    ] },
  { key: 'chest', label: 'Thu', name: 'Chest', emoji: '🛡️',
    picks: 5,
    slots: [ { tag: 'press', count: 2 }, { tag: 'fly', count: 1 } ],
    warmup: [
      '5 min easy cardio to get the blood moving.',
      '10 slow push-ups and a 30 s doorway pec stretch per side.',
      '2 light sets of your first press — about half your working weight.',
    ] },
  { key: 'arms', label: 'Fri', name: 'Arms', emoji: '💪',
    picks: 6,
    slots: [ { tag: 'biceps', count: 3 }, { tag: 'triceps', count: 3 } ],
    warmup: [
      '3–5 min easy cardio — arms need less, but never train cold.',
      '15 wrist circles each way, 15 elbow circles.',
      '1 very light set of curls and 1 of pushdowns before the counted sets.',
    ] },
];

const EXERCISE_DB = {
  /* ------------------------------ SHOULDERS ------------------------------ */
  shoulders: [
    {
      id: 'sh-press-machine', name: 'Seated Shoulder Press Machine',
      gear: 'Shoulder press machine', icon: 'pressMachine',
      tags: ['compound', 'press'], muscles: 'Front & side delts, triceps',
      video: 'seated shoulder press machine proper form',
      setup: [
        'Adjust the seat so the handles sit level with your shoulders (not above your ears).',
        'Sit with your back flat against the pad, feet planted on the floor.',
        'Grip the horizontal or neutral handles — whichever feels better on your shoulders.',
      ],
      execution: [
        'Press the handles up until your arms are almost straight (don’t lock the elbows hard).',
        'Lower slowly for 2–3 seconds until your hands are back at shoulder level.',
        'Keep your lower back against the pad the whole time.',
      ],
      tips: [
        'If your lower back arches off the pad, the weight is too heavy.',
        'Exhale as you press up, inhale on the way down.',
      ],
      mistakes: [
        'Seat too low — starting the press from ear height strains the shoulders.',
        'Arching the lower back off the pad to grind out reps.',
        'Slamming into elbow lockout at the top of every rep.',
      ],
    },
    {
      id: 'sh-db-press', name: 'Dumbbell Overhead Press',
      gear: 'Dumbbells + upright bench', icon: 'dumbbell',
      tags: ['compound', 'press'], muscles: 'Front & side delts, triceps',
      video: 'seated dumbbell shoulder press proper form',
      setup: [
        'Set an adjustable bench upright (85–90°).',
        'Sit down and bring the dumbbells to shoulder height, palms facing forward.',
        'Plant your feet and keep your core braced.',
      ],
      execution: [
        'Press both dumbbells up and slightly inward until they nearly touch overhead.',
        'Lower with control back to shoulder height — elbows at about 45° from your body.',
      ],
      tips: [
        'Kick the dumbbells up with your knees one at a time to get into position safely.',
        'Don’t let the dumbbells drift forward — keep them stacked over your elbows.',
      ],
      mistakes: [
        'Stopping halfway down — lower all the way to shoulder height each rep.',
        'Flaring the elbows straight out to the sides, which stresses the shoulder joint.',
        'Clanging the dumbbells together hard at the top.',
      ],
    },
    {
      id: 'sh-smith-press', name: 'Smith Machine Overhead Press',
      gear: 'Smith machine + bench', icon: 'smith',
      tags: ['compound', 'press'], muscles: 'Front & side delts, triceps',
      video: 'smith machine overhead press proper form',
      setup: [
        'Place an upright bench in the Smith machine so the bar comes down just in front of your face.',
        'Set the bar at shoulder height while seated; add plates.',
        'Grip slightly wider than shoulder width and rotate the bar to unhook it.',
      ],
      execution: [
        'Press the bar straight up until arms are almost fully extended.',
        'Lower under control to chin level, then press again.',
        'Re-hook the bar by rotating your wrists at the end of the set.',
      ],
      tips: [
        'The fixed bar path makes this a safe way to go heavier without a spotter.',
        'Set the safety stops just below your lowest bar position.',
      ],
      mistakes: [
        'Bench positioned so the bar path hits your chin or nose — line it up first with no weight.',
        'Forgetting to set the safety stops before going heavy.',
        'Half reps — bring the bar down to at least chin level.',
      ],
    },
    {
      id: 'sh-lat-raise-machine', name: 'Lateral Raise Machine',
      gear: 'Lateral raise machine', icon: 'pressMachine',
      tags: ['isolation', 'side'], muscles: 'Side delts',
      video: 'lateral raise machine proper form',
      setup: [
        'Adjust the seat so your shoulders line up with the machine’s pivot points.',
        'Sit upright, place your arms against the pads (elbows bent ~90°).',
      ],
      execution: [
        'Push through your elbows — not your hands — to raise your arms out to the sides.',
        'Stop when your elbows reach shoulder height, pause one second.',
        'Lower slowly; don’t let the stack slam down.',
      ],
      tips: [
        'This machine keeps tension on the side delts through the whole range — go lighter than you think.',
      ],
      mistakes: [
        'Shrugging the shoulders up as you raise — keep them pulled down.',
        'Raising above shoulder height, which shifts the load to the traps.',
        'Letting the weight stack drop instead of lowering it slowly.',
      ],
    },
    {
      id: 'sh-db-lat-raise', name: 'Dumbbell Lateral Raise',
      gear: 'Dumbbells', icon: 'dumbbell',
      tags: ['isolation', 'side'], muscles: 'Side delts',
      video: 'dumbbell lateral raise proper form',
      setup: [
        'Stand tall with a light dumbbell in each hand at your sides, slight bend in the elbows.',
      ],
      execution: [
        'Raise both arms out to the sides, leading with the elbows, until they reach shoulder height.',
        'Tilt the dumbbells slightly, like pouring water from a jug, at the top.',
        'Lower slowly — 2–3 seconds down.',
      ],
      tips: [
        'No swinging: if you need momentum, the weight is too heavy.',
        'These stay light — even strong lifters use surprisingly small dumbbells here.',
      ],
      mistakes: [
        'Rocking the torso to swing the weights up.',
        'Bending the elbows more as you lift — the arc should stay wide.',
        'Going too heavy and turning it into a shrug.',
      ],
    },
    {
      id: 'sh-cable-lat-raise', name: 'Cable Lateral Raise',
      gear: 'Cable tower, single handle at lowest setting', icon: 'cable',
      tags: ['isolation', 'side'], muscles: 'Side delts',
      video: 'cable lateral raise proper form',
      setup: [
        'Set a single handle on the lowest pulley position.',
        'Stand sideways to the tower and grab the handle with your outside hand.',
        'The cable runs across the front of your body.',
      ],
      execution: [
        'Raise your arm out to the side up to shoulder height, elbow slightly bent.',
        'Lower with control. Finish all reps, then face the other way for the other arm.',
      ],
      tips: [
        'The cable keeps tension at the bottom where dumbbells feel weightless — great delt builder.',
      ],
      mistakes: [
        'Standing too close to the tower so the cable rubs your body.',
        'Leaning away from the cable to cheat the weight up.',
      ],
    },
    {
      id: 'sh-reverse-pec-deck', name: 'Reverse Pec Deck',
      gear: 'Pec deck machine (reverse setting)', icon: 'pecDeck',
      tags: ['isolation', 'rear'], muscles: 'Rear delts, upper back',
      video: 'reverse pec deck rear delt fly proper form',
      setup: [
        'Set the pec deck arms all the way back (reverse fly position).',
        'Sit facing the machine with your chest against the pad.',
        'Adjust the seat so the handles are at shoulder height; grab them with a neutral grip.',
      ],
      execution: [
        'Sweep your arms back and out in a wide arc until they’re in line with your shoulders.',
        'Squeeze your shoulder blades for a second, then return slowly.',
      ],
      tips: [
        'Keep elbows only slightly bent — think of pushing the handles apart, not rowing them.',
      ],
      mistakes: [
        'Bending the elbows and turning the fly into a row.',
        'Using momentum — the arc should be slow and wide.',
        'Forgetting to switch the machine arms from the chest-fly setting.',
      ],
    },
    {
      id: 'sh-face-pull', name: 'Cable Face Pull',
      gear: 'Cable tower + rope attachment', icon: 'cable',
      tags: ['isolation', 'rear'], muscles: 'Rear delts, traps, rotator cuff',
      video: 'cable face pull proper form',
      setup: [
        'Attach a rope to a pulley set at upper-chest / face height.',
        'Grab the rope ends with thumbs pointing back toward you and step back until the cable is taut.',
      ],
      execution: [
        'Pull the rope toward your face, splitting the ends apart so your hands finish beside your ears.',
        'Squeeze your rear delts and upper back, then return with control.',
      ],
      tips: [
        'Great for posture and shoulder health — prioritise perfect form over weight.',
      ],
      mistakes: [
        'Pulling to the chest instead of the face — the hands should finish by your ears.',
        'Leaning back and rowing with your bodyweight.',
        'Going heavy — this movement is about quality, not load.',
      ],
    },
    {
      id: 'sh-front-raise', name: 'Dumbbell Front Raise',
      gear: 'Dumbbells', icon: 'dumbbell',
      tags: ['isolation', 'front'], muscles: 'Front delts',
      video: 'dumbbell front raise proper form',
      setup: [
        'Stand holding a dumbbell in each hand in front of your thighs, palms facing you.',
      ],
      execution: [
        'Raise one arm straight in front of you to shoulder height, lower it, then raise the other.',
        'Keep a slight elbow bend and avoid leaning back.',
      ],
      tips: [
        'Alternate arms to stay balanced and keep the movement strict.',
      ],
      mistakes: [
        'Leaning back to hoist the weight up.',
        'Raising above shoulder height — no benefit, extra joint stress.',
      ],
    },
  ],

  /* -------------------------------- BACK -------------------------------- */
  back: [
    {
      id: 'bk-lat-pulldown', name: 'Lat Pulldown',
      gear: 'Lat pulldown machine, wide bar', icon: 'latPulldown',
      tags: ['compound', 'vertical'], muscles: 'Lats, biceps, mid back',
      video: 'lat pulldown proper form',
      setup: [
        'Adjust the thigh pad so your legs are locked snugly under it.',
        'Grab the wide bar just outside shoulder width, palms facing away.',
        'Sit down with arms fully extended overhead.',
      ],
      execution: [
        'Pull the bar down to the top of your chest, driving your elbows down and back.',
        'Squeeze your lats at the bottom, then let the bar rise slowly to full stretch.',
      ],
      tips: [
        'Lean back only slightly (10–15°) — no swinging.',
        'Think “elbows into your back pockets”, not “pull with your hands”.',
      ],
      mistakes: [
        'Pulling the bar behind the neck — always to the top of the chest.',
        'Leaning way back and using bodyweight to move the stack.',
        'Cutting the top short — let your arms fully straighten for the lat stretch.',
      ],
    },
    {
      id: 'bk-seated-row', name: 'Seated Cable Row',
      gear: 'Cable row station, V-handle', icon: 'cableRow',
      tags: ['compound', 'horizontal'], muscles: 'Mid back, lats, biceps',
      video: 'seated cable row proper form',
      setup: [
        'Sit on the bench with feet braced on the platform, knees slightly bent.',
        'Grab the V-handle and sit up tall with arms extended.',
      ],
      execution: [
        'Pull the handle to your lower ribs, driving your elbows straight back.',
        'Squeeze your shoulder blades together, then return until your arms are fully stretched.',
      ],
      tips: [
        'Keep your torso upright — a small rock is fine, rowing with your lower back is not.',
      ],
      mistakes: [
        'Rounding the back at the stretch position with heavy weight.',
        'Yanking the handle with a big backward lean.',
        'Shrugging the shoulders toward the ears while pulling.',
      ],
    },
    {
      id: 'bk-assisted-pullup', name: 'Assisted Pull-Up',
      gear: 'Assisted pull-up machine', icon: 'pullup',
      tags: ['compound', 'vertical'], muscles: 'Lats, biceps',
      video: 'assisted pull up machine proper form',
      setup: [
        'Select the assist weight — heavier assist = easier reps. Start with about half your body weight.',
        'Kneel or stand on the assist platform and grab the wide handles overhead.',
      ],
      execution: [
        'Pull yourself up until your chin passes your hands.',
        'Lower slowly to a full hang — that’s where the growth is.',
      ],
      tips: [
        'Each week, try lowering the assist weight a little. The goal is a bodyweight pull-up.',
      ],
      mistakes: [
        'Confusing the assist stack: on this machine MORE weight = EASIER, not harder.',
        'Dropping fast from the top instead of lowering under control.',
        'Kipping and swinging to get your chin over.',
      ],
    },
    {
      id: 'bk-chest-row', name: 'Chest-Supported Row Machine',
      gear: 'Seated row machine with chest pad', icon: 'rowMachine',
      tags: ['compound', 'horizontal'], muscles: 'Mid back, lats, rear delts',
      video: 'chest supported row machine proper form',
      setup: [
        'Adjust the seat so the handles are at chest height and your chest rests on the pad.',
        'Grab the handles (neutral grip hits lats, overhand grip hits upper back).',
      ],
      execution: [
        'Row the handles toward you, keeping your chest glued to the pad.',
        'Squeeze at the back for a second, then extend fully forward.',
      ],
      tips: [
        'The chest pad removes cheating — perfect for going hard safely late in a workout.',
      ],
      mistakes: [
        'Peeling the chest off the pad to jerk the weight back.',
        'Half-range reps — reach all the way forward between rows.',
      ],
    },
    {
      id: 'bk-db-row', name: 'One-Arm Dumbbell Row',
      gear: 'Dumbbell + flat bench', icon: 'dumbbell',
      tags: ['compound', 'horizontal'], muscles: 'Lats, mid back, biceps',
      video: 'one arm dumbbell row proper form',
      setup: [
        'Place your left knee and left hand on a flat bench, right foot on the floor.',
        'Hold a dumbbell in your right hand, arm hanging straight down, back flat.',
      ],
      execution: [
        'Row the dumbbell up to your hip, elbow brushing your side.',
        'Lower to a full stretch. Do all reps, then switch sides.',
      ],
      tips: [
        'Pull with your back, not your arm — imagine starting the motion from your elbow.',
        'Keep your shoulders square; don’t twist your torso to lift the weight.',
      ],
      mistakes: [
        'Twisting and opening the torso to heave the dumbbell up.',
        'Rowing to the chest instead of the hip — the elbow should brush your side.',
        'Rounding the lower back — keep it flat like a table.',
      ],
    },
    {
      id: 'bk-straight-arm', name: 'Straight-Arm Pulldown',
      gear: 'Cable tower + straight bar or rope', icon: 'cable',
      tags: ['isolation', 'vertical'], muscles: 'Lats',
      video: 'straight arm cable pulldown proper form',
      setup: [
        'Set the pulley to the highest position with a straight bar or rope.',
        'Step back, hinge slightly forward, arms extended up toward the pulley.',
      ],
      execution: [
        'With almost-straight arms, sweep the bar down in an arc to your thighs.',
        'Feel your lats do the work; return slowly to the overhead stretch.',
      ],
      tips: [
        'This is the one back exercise where your biceps can’t take over — pure lats.',
      ],
      mistakes: [
        'Bending the elbows and turning it into a triceps pushdown.',
        'Standing bolt upright — a slight forward hinge lets the lats stretch fully.',
      ],
    },
    {
      id: 'bk-tbar-row', name: 'T-Bar Row',
      gear: 'T-bar row machine or landmine + handle', icon: 'rowMachine',
      tags: ['compound', 'horizontal'], muscles: 'Mid back, lats, traps',
      video: 't-bar row proper form',
      setup: [
        'Straddle the bar, hinge at the hips with a flat back (~45° torso).',
        'Grab the handles and lift the bar off the rest.',
      ],
      execution: [
        'Row the weight to your chest, elbows driving back.',
        'Lower under control without rounding your back.',
      ],
      tips: [
        'Small plates (10–15 kg) let the handles travel further — better range of motion than one big plate.',
      ],
      mistakes: [
        'Standing too upright — keep the ~45° hinge throughout.',
        'Bouncing the weight off the plates at the bottom of each rep.',
        'Rounding the lower back as you fatigue.',
      ],
    },
    {
      id: 'bk-back-ext', name: 'Back Extension',
      gear: '45° back extension bench', icon: 'backExt',
      tags: ['isolation', 'lower'], muscles: 'Lower back, glutes, hamstrings',
      video: '45 degree back extension proper form',
      setup: [
        'Adjust the pad so your hips sit just above it and you can hinge freely.',
        'Hook your heels under the ankle pads, cross your arms over your chest.',
      ],
      execution: [
        'Lower your torso toward the floor with a flat back.',
        'Raise back up until your body forms a straight line — don’t hyperextend.',
      ],
      tips: [
        'Hold a weight plate against your chest once bodyweight gets easy.',
      ],
      mistakes: [
        'Hyperextending — arching past a straight line at the top.',
        'Pad set too high, which blocks the hinge and turns it into a squat-bow.',
        'Rushing the reps — slow and smooth protects the lower back.',
      ],
    },
    {
      id: 'bk-shrug', name: 'Dumbbell Shrug',
      gear: 'Heavy dumbbells', icon: 'dumbbell',
      tags: ['isolation', 'traps'], muscles: 'Traps',
      video: 'dumbbell shrug proper form',
      setup: [
        'Stand tall holding a heavy dumbbell in each hand at your sides.',
      ],
      execution: [
        'Shrug your shoulders straight up toward your ears as high as possible.',
        'Pause at the top, then lower slowly to a full stretch.',
      ],
      tips: [
        'Straight up and down — rolling your shoulders adds nothing but injury risk.',
      ],
      mistakes: [
        'Rolling the shoulders in circles.',
        'Bending the elbows and turning it into a half-curl.',
        'Tiny bouncy reps — pause at the top, stretch at the bottom.',
      ],
    },
  ],

  /* -------------------------------- LEGS -------------------------------- */
  legs: [
    {
      id: 'lg-leg-press', name: 'Leg Press',
      gear: '45° leg press machine', icon: 'legPress',
      tags: ['compound', 'quad'], muscles: 'Quads, glutes, hamstrings',
      video: '45 degree leg press proper form',
      setup: [
        'Sit into the machine, back and hips flat against the pads.',
        'Place your feet shoulder-width on the platform, mid-height.',
        'Release the safety handles once you’re supporting the sled.',
      ],
      execution: [
        'Lower the platform until your knees reach ~90° (hips stay on the pad).',
        'Press back up through your whole foot, stopping just short of locking your knees.',
      ],
      tips: [
        'Never let your lower back curl off the pad at the bottom.',
        'Feet higher on the platform = more glutes/hams; lower = more quads.',
      ],
      mistakes: [
        'Going so deep your hips and lower back curl off the pad.',
        'Locking the knees hard at the top under heavy load.',
        'Pressing through your toes only — drive through the whole foot.',
      ],
    },
    {
      id: 'lg-hack-squat', name: 'Hack Squat Machine',
      gear: 'Hack squat machine', icon: 'hackSquat',
      tags: ['compound', 'quad'], muscles: 'Quads, glutes',
      video: 'hack squat machine proper form',
      setup: [
        'Stand on the platform with your back and shoulders against the pads.',
        'Feet shoulder-width, slightly ahead of your hips.',
        'Release the handles to unlock the sled.',
      ],
      execution: [
        'Squat down until your thighs are at least parallel to the platform.',
        'Drive back up through mid-foot without locking your knees at the top.',
      ],
      tips: [
        'The machine guides the path, letting you focus purely on depth and drive — great quad builder.',
      ],
      mistakes: [
        'Feet too low on the platform, which strains the knees.',
        'Cutting depth as the weight goes up — parallel or below, every rep.',
        'Letting the heels lift off the platform at the bottom.',
      ],
    },
    {
      id: 'lg-smith-squat', name: 'Smith Machine Squat',
      gear: 'Smith machine', icon: 'smith',
      tags: ['compound', 'quad'], muscles: 'Quads, glutes',
      video: 'smith machine squat proper form',
      setup: [
        'Set the bar to shoulder height, step under it so it rests on your upper traps (not your neck).',
        'Feet shoulder-width, half a step in front of the bar.',
        'Rotate the bar to unhook it.',
      ],
      execution: [
        'Squat down until thighs are parallel, keeping your chest up.',
        'Drive up through your heels. Re-hook the bar when done.',
      ],
      tips: [
        'Always set the safety stops just below your deepest squat position.',
      ],
      mistakes: [
        'Resting the bar on your neck instead of your upper traps.',
        'Feet directly under the bar — step them slightly forward on a Smith machine.',
        'Skipping the safety stops.',
      ],
    },
    {
      id: 'lg-leg-ext', name: 'Leg Extension Machine',
      gear: 'Leg extension machine', icon: 'legIso',
      tags: ['isolation', 'quad'], muscles: 'Quads',
      video: 'leg extension machine proper form',
      setup: [
        'Adjust the backrest so your knees line up with the machine’s pivot.',
        'Set the ankle pad on your shins just above your feet.',
      ],
      execution: [
        'Extend your legs until they’re straight, squeezing your quads hard at the top.',
        'Lower slowly — 3 seconds down beats bouncing the stack.',
      ],
      tips: [
        'Hold the top for one second per rep; it makes light weight feel brutal (in a good way).',
      ],
      mistakes: [
        'Knees not aligned with the pivot — you’ll feel it in the joint, not the muscle.',
        'Kicking the weight up with momentum and letting it crash down.',
        'Lifting your hips off the seat to cheat the last reps.',
      ],
    },
    {
      id: 'lg-leg-curl', name: 'Seated Leg Curl Machine',
      gear: 'Seated leg curl machine', icon: 'legIso',
      tags: ['isolation', 'ham'], muscles: 'Hamstrings',
      video: 'seated leg curl machine proper form',
      setup: [
        'Align your knees with the pivot point; the ankle pad sits just above your heels.',
        'Lower the lap pad snugly onto your thighs.',
      ],
      execution: [
        'Curl your heels down and under you as far as possible.',
        'Squeeze the hamstrings, then return slowly to the stretched position.',
      ],
      tips: [
        'Point your toes toward your shins to keep the calves out of it — pure hamstring.',
      ],
      mistakes: [
        'Loose lap pad — if your thighs lift, you lose the hamstring isolation.',
        'Short reps in the middle of the range; go full stretch to full squeeze.',
      ],
    },
    {
      id: 'lg-rdl', name: 'Dumbbell Romanian Deadlift',
      gear: 'Dumbbells', icon: 'dumbbell',
      tags: ['compound', 'ham'], muscles: 'Hamstrings, glutes, lower back',
      video: 'dumbbell romanian deadlift proper form',
      setup: [
        'Stand holding dumbbells in front of your thighs, feet hip-width.',
        'Soft bend in the knees, shoulders back, chest proud.',
      ],
      execution: [
        'Push your hips straight back, sliding the dumbbells down your legs.',
        'Stop when you feel a deep hamstring stretch (usually mid-shin).',
        'Drive your hips forward to stand tall — squeeze your glutes at the top.',
      ],
      tips: [
        'This is a hip hinge, not a squat — knees barely bend more as you descend.',
        'Keep the dumbbells brushing your legs the entire way.',
      ],
      mistakes: [
        'Rounding the back to reach lower — depth comes from the hip hinge, not the spine.',
        'Bending the knees into a squat instead of pushing the hips back.',
        'Letting the dumbbells drift away from your legs.',
      ],
    },
    {
      id: 'lg-lunges', name: 'Walking Dumbbell Lunges',
      gear: 'Dumbbells + open floor space', icon: 'dumbbell',
      tags: ['compound', 'quad', 'glute'], muscles: 'Quads, glutes, balance',
      video: 'walking dumbbell lunges proper form',
      setup: [
        'Hold a dumbbell in each hand at your sides; find a clear walkway.',
      ],
      execution: [
        'Step forward and lower until both knees form ~90° (rear knee just off the floor).',
        'Push through the front heel to step through into the next lunge.',
        'Count total steps — both legs — as your reps.',
      ],
      tips: [
        'Keep your torso tall; short choppy steps hit quads, longer strides hit glutes.',
      ],
      mistakes: [
        'Letting the front knee cave inward — track it over the toes.',
        'Leaning far forward over the front leg.',
        'Steps so short the back knee never gets near the floor.',
      ],
    },
    {
      id: 'lg-seated-calf', name: 'Seated Calf Raise Machine',
      gear: 'Seated calf raise machine', icon: 'calf',
      tags: ['isolation', 'calf'], muscles: 'Calves (soleus)',
      video: 'seated calf raise machine proper form',
      setup: [
        'Sit with the balls of your feet on the platform, heels hanging off.',
        'Lower the knee pad snugly onto your thighs and release the safety.',
      ],
      execution: [
        'Let your heels drop into a deep stretch.',
        'Press up onto your tiptoes as high as possible and pause.',
      ],
      tips: [
        'Full range is everything for calves: deep stretch, high squeeze, no bouncing.',
      ],
      mistakes: [
        'Fast half-rep bouncing in the middle of the range.',
        'Skipping the pause — hold the stretch 2 s and the top squeeze 1 s.',
      ],
    },
    {
      id: 'lg-standing-calf', name: 'Standing Calf Raise',
      gear: 'Standing calf machine or Smith machine + step', icon: 'calf',
      tags: ['isolation', 'calf'], muscles: 'Calves (gastrocnemius)',
      video: 'standing calf raise machine proper form',
      setup: [
        'Step under the shoulder pads with the balls of your feet on the platform edge.',
        'Stand tall so the weight lifts off the rest.',
      ],
      execution: [
        'Drop your heels for a deep 2-second stretch.',
        'Rise as high onto your toes as you can; squeeze at the top.',
      ],
      tips: [
        'Straight knees hit the upper calf; the seated version hits the lower calf — your plan rotates both.',
      ],
      mistakes: [
        'Bending and straightening the knees to bounce the weight up.',
        'Tiny range of motion — the stretch at the bottom does most of the work.',
      ],
    },
    {
      id: 'lg-adductor', name: 'Hip Adduction Machine',
      gear: 'Adduction machine (pads inside knees)', icon: 'legIso',
      tags: ['isolation', 'glute'], muscles: 'Inner thighs',
      video: 'hip adduction machine proper form',
      setup: [
        'Sit with your legs inside the pads and select the open starting width you can control.',
      ],
      execution: [
        'Squeeze your legs together smoothly against the pads.',
        'Resist on the way back out — don’t let the machine yank your legs apart.',
      ],
      tips: [
        'Strong adductors protect your knees and boost your squat — not just an aesthetics machine.',
      ],
      mistakes: [
        'Starting wider than your mobility allows.',
        'Letting the stack pull your legs open fast between reps.',
      ],
    },
  ],

  /* -------------------------------- CHEST -------------------------------- */
  chest: [
    {
      id: 'ch-press-machine', name: 'Chest Press Machine',
      gear: 'Seated chest press machine', icon: 'pressMachine',
      tags: ['compound', 'press'], muscles: 'Chest, front delts, triceps',
      video: 'seated chest press machine proper form',
      setup: [
        'Adjust the seat so the handles line up with the middle of your chest.',
        'Sit back flat against the pad; use the foot lever (if fitted) to bring the handles forward.',
      ],
      execution: [
        'Press the handles forward until your arms are almost straight.',
        'Return slowly until you feel a stretch across your chest.',
      ],
      tips: [
        'Keep your shoulder blades pinned back and down — chest does the pressing, not shoulders.',
      ],
      mistakes: [
        'Handles set at shoulder height instead of mid-chest.',
        'Shoulders rolling forward at the end of the press.',
        'Short reps — come back until you feel the chest stretch.',
      ],
    },
    {
      id: 'ch-bench-press', name: 'Barbell Bench Press',
      gear: 'Flat bench + barbell rack', icon: 'bench',
      tags: ['compound', 'press'], muscles: 'Chest, triceps, front delts',
      video: 'barbell bench press proper form',
      setup: [
        'Lie on the bench with your eyes under the bar, feet planted on the floor.',
        'Grip slightly wider than shoulder width; squeeze your shoulder blades together.',
        'Unrack and hold the bar over your chest.',
      ],
      execution: [
        'Lower the bar to your mid-chest with elbows ~45° from your body.',
        'Press up and slightly back toward your face until arms are extended.',
      ],
      tips: [
        'Ask anyone for a spot on heavy sets — nobody minds, everybody does it.',
        'Touch, don’t bounce, the bar off your chest.',
      ],
      mistakes: [
        'Bouncing the bar off the chest.',
        'Flaring the elbows to 90°, which grinds the shoulders.',
        'Lifting the hips off the bench to finish a rep.',
        'Going heavy with no spotter and no safety arms.',
      ],
    },
    {
      id: 'ch-incline-db', name: 'Incline Dumbbell Press',
      gear: 'Adjustable bench (30–45°) + dumbbells', icon: 'dumbbell',
      tags: ['compound', 'press', 'upper'], muscles: 'Upper chest, front delts',
      video: 'incline dumbbell press proper form',
      setup: [
        'Set the bench to a 30–45° incline.',
        'Sit with dumbbells on your thighs, then kick them up one at a time as you lie back.',
        'Start with dumbbells at chest level, palms forward.',
      ],
      execution: [
        'Press both dumbbells up and slightly together until arms are extended.',
        'Lower with control until you feel a stretch in your upper chest.',
      ],
      tips: [
        'Lower incline = more chest, steeper = more shoulders. 30° is the sweet spot.',
      ],
      mistakes: [
        'Bench set too steep — past 45° it becomes a shoulder press.',
        'Dumbbells drifting apart or forward at the top.',
        'Dropping the weights from the top instead of lowering them (dangerous and skips half the work).',
      ],
    },
    {
      id: 'ch-smith-incline', name: 'Smith Machine Incline Press',
      gear: 'Smith machine + incline bench', icon: 'smith',
      tags: ['compound', 'press', 'upper'], muscles: 'Upper chest, triceps',
      video: 'smith machine incline press proper form',
      setup: [
        'Centre an incline bench under the Smith bar so it touches your upper chest at the bottom.',
        'Grip slightly wider than shoulders; rotate the bar to unhook.',
      ],
      execution: [
        'Lower the bar to your upper chest, pause briefly, and press to near-lockout.',
      ],
      tips: [
        'Fixed path = safe heavy pressing without a spotter. Set the safeties just below chest level.',
      ],
      mistakes: [
        'Bench misaligned so the bar lands on your neck or belly — check with an empty bar first.',
        'Bouncing the bar off your chest.',
        'No safety stops set.',
      ],
    },
    {
      id: 'ch-pec-deck', name: 'Pec Deck (Chest Fly Machine)',
      gear: 'Pec deck machine', icon: 'pecDeck',
      tags: ['isolation', 'fly'], muscles: 'Chest',
      video: 'pec deck chest fly machine proper form',
      setup: [
        'Adjust the seat so the handles are at chest height.',
        'Sit back flat, grab the handles with a slight bend in your elbows.',
      ],
      execution: [
        'Bring the handles together in front of your chest in a hugging motion.',
        'Squeeze your chest for a second, then open up slowly to a comfortable stretch.',
      ],
      tips: [
        'Think “hug a barrel”, not “push the handles” — keep the elbow angle fixed.',
      ],
      mistakes: [
        'Opening too far back beyond a comfortable stretch.',
        'Changing the elbow bend mid-rep — that turns the fly into a press.',
        'Letting the stack pull your arms open quickly.',
      ],
    },
    {
      id: 'ch-cable-cross', name: 'Cable Crossover',
      gear: 'Dual cable towers, handles at high setting', icon: 'cable',
      tags: ['isolation', 'fly'], muscles: 'Chest (lower/outer)',
      video: 'high cable crossover proper form',
      setup: [
        'Set both pulleys above shoulder height with single handles.',
        'Grab one in each hand and step forward into a staggered stance, slight forward lean.',
      ],
      execution: [
        'Sweep both hands down and together in front of your hips, like drawing a big X.',
        'Squeeze your chest at the middle, then let your arms open wide with control.',
      ],
      tips: [
        'Set the pulleys at chest height instead to target the middle of your chest — vary it.',
      ],
      mistakes: [
        'Standing square instead of staggered — you’ll wobble on every rep.',
        'Pressing with bent elbows instead of sweeping with nearly-straight arms.',
        'Leaning further and further forward as you fatigue.',
      ],
    },
    {
      id: 'ch-dips', name: 'Chest Dips (Assisted)',
      gear: 'Dip station or assisted dip machine', icon: 'dip',
      tags: ['compound', 'press', 'lower'], muscles: 'Lower chest, triceps',
      video: 'chest dips proper form',
      setup: [
        'On the assisted machine, set an assist weight you can control (start ~half bodyweight).',
        'Grip the bars, lean your torso forward ~30°, knees on the pad or feet crossed behind.',
      ],
      execution: [
        'Lower until your upper arms are parallel to the floor.',
        'Press back up without locking your elbows harshly.',
      ],
      tips: [
        'Forward lean = chest; upright torso = triceps. For chest day, lean in.',
        'Reduce the assist a little each week.',
      ],
      mistakes: [
        'Dropping below parallel with cold shoulders — build depth gradually.',
        'Shrugging the shoulders up at the top; keep them down and back.',
        'Staying bolt upright when you want to hit chest (that targets triceps).',
      ],
    },
    {
      id: 'ch-pushup', name: 'Push-Up Finisher',
      gear: 'Bodyweight (floor)', icon: 'pushup',
      tags: ['compound', 'press', 'finisher'], muscles: 'Chest, triceps, core',
      video: 'perfect push up form',
      setup: [
        'Hands slightly wider than shoulders, body in a straight line from head to heels.',
      ],
      execution: [
        'Lower your chest to just above the floor, elbows ~45° from your body.',
        'Press back up to full arm extension. Go to near-failure on each set.',
      ],
      tips: [
        'Too easy? Elevate your feet on a bench. Too hard? Put your hands on the bench instead.',
      ],
      mistakes: [
        'Sagging hips — squeeze your glutes to hold the plank line.',
        'Half reps that stop a foot above the floor.',
        'Head diving first while the chest stays high.',
      ],
    },
  ],

  /* -------------------------------- ARMS -------------------------------- */
  arms: [
    {
      id: 'ar-ez-curl', name: 'EZ-Bar Curl',
      gear: 'EZ curl bar', icon: 'barbell',
      tags: ['biceps'], muscles: 'Biceps',
      video: 'ez bar curl proper form',
      setup: [
        'Grab the EZ bar on the angled grips at shoulder width, palms angled up.',
        'Stand tall, elbows pinned to your sides.',
      ],
      execution: [
        'Curl the bar up to shoulder height without moving your elbows forward.',
        'Lower slowly — 2–3 seconds — to full arm extension.',
      ],
      tips: [
        'The angled bar is easier on your wrists than a straight bar.',
        'If your hips swing to lift it, drop the weight.',
      ],
      mistakes: [
        'Swinging the hips and leaning back to heave the bar up.',
        'Elbows drifting forward, which turns it into a front raise.',
        'Stopping the lowering phase halfway — full extension every rep.',
      ],
    },
    {
      id: 'ar-preacher', name: 'Preacher Curl Machine',
      gear: 'Preacher curl machine', icon: 'preacher',
      tags: ['biceps'], muscles: 'Biceps (lower portion)',
      video: 'preacher curl machine proper form',
      setup: [
        'Adjust the seat so your armpits sit snugly over the top of the angled pad.',
        'Grab the handles with arms extended down the pad.',
      ],
      execution: [
        'Curl the handles up until your forearms are vertical.',
        'Lower slowly all the way — the stretch at the bottom is the money part.',
      ],
      tips: [
        'The pad makes cheating impossible; expect to use less weight than standing curls.',
        'Never fully relax and hyperextend at the bottom with heavy weight.',
      ],
      mistakes: [
        'Seat too high, so only your wrists reach over the pad.',
        'Lifting the elbows off the pad at the top of the curl.',
        'Bouncing out of the fully stretched bottom position.',
      ],
    },
    {
      id: 'ar-hammer', name: 'Dumbbell Hammer Curl',
      gear: 'Dumbbells', icon: 'dumbbell',
      tags: ['biceps'], muscles: 'Biceps, brachialis, forearms',
      video: 'dumbbell hammer curl proper form',
      setup: [
        'Stand with a dumbbell in each hand, palms facing your thighs (neutral grip).',
      ],
      execution: [
        'Curl both dumbbells up, keeping palms facing each other the whole way.',
        'Squeeze at the top, lower under control.',
      ],
      tips: [
        'The neutral grip hits the brachialis — the muscle that pushes your biceps up and makes arms look thicker.',
      ],
      mistakes: [
        'Rotating the palms up mid-rep — that’s a regular curl, keep the hammer grip.',
        'Swinging both dumbbells with body momentum.',
      ],
    },
    {
      id: 'ar-cable-curl', name: 'Cable Rope Curl',
      gear: 'Cable tower + rope, lowest setting', icon: 'cable',
      tags: ['biceps'], muscles: 'Biceps, forearms',
      video: 'cable rope hammer curl proper form',
      setup: [
        'Attach a rope to the lowest pulley. Grab the ends with palms facing each other.',
        'Stand a step back, elbows at your sides.',
      ],
      execution: [
        'Curl the rope up and twist your palms slightly outward at the top.',
        'Lower slowly against the cable’s constant pull.',
      ],
      tips: [
        'Cables keep tension at the bottom of the curl where dumbbells rest — great pump.',
      ],
      mistakes: [
        'Standing so close the cable goes slack at the bottom.',
        'Elbows floating forward and up as you curl.',
      ],
    },
    {
      id: 'ar-incline-curl', name: 'Incline Dumbbell Curl',
      gear: 'Incline bench (45–60°) + dumbbells', icon: 'dumbbell',
      tags: ['biceps'], muscles: 'Biceps (long head, deep stretch)',
      video: 'incline dumbbell curl proper form',
      setup: [
        'Set a bench to about 60° and sit back with a dumbbell in each hand.',
        'Let your arms hang straight down and slightly behind your body.',
      ],
      execution: [
        'Curl both dumbbells up without letting your elbows drift forward.',
        'Lower to a full, deep stretch behind your torso.',
      ],
      tips: [
        'Go noticeably lighter than standing curls — the stretched position is brutal and effective.',
      ],
      mistakes: [
        'Elbows swinging forward, which erases the stretch this exercise exists for.',
        'Lifting the head and shoulders off the bench to help.',
        'Using standing-curl weight and cutting the range short.',
      ],
    },
    {
      id: 'ar-pushdown', name: 'Cable Triceps Pushdown',
      gear: 'Cable tower + rope or bar, high setting', icon: 'pushdown',
      tags: ['triceps'], muscles: 'Triceps',
      video: 'cable triceps pushdown proper form',
      setup: [
        'Set the pulley high and attach a rope (or straight bar).',
        'Grab it with elbows pinned to your sides, forearms parallel to the floor.',
      ],
      execution: [
        'Push the rope down until your arms are fully straight, splitting the rope ends at the bottom.',
        'Squeeze your triceps, then let your forearms rise back to parallel — elbows never move.',
      ],
      tips: [
        'If your elbows flare or shoulders shrug, lighten the load.',
      ],
      mistakes: [
        'Leaning over the cable and pressing with bodyweight.',
        'Elbows drifting away from your sides.',
        'Letting your hands rise above parallel so the tension disappears.',
      ],
    },
    {
      id: 'ar-overhead-ext', name: 'Overhead Cable Triceps Extension',
      gear: 'Cable tower + rope, low setting', icon: 'cable',
      tags: ['triceps'], muscles: 'Triceps (long head)',
      video: 'overhead cable triceps extension proper form',
      setup: [
        'Set the rope on a low pulley. Grab it and turn away from the tower.',
        'Bring the rope overhead, elbows pointing forward, and step into a staggered stance.',
      ],
      execution: [
        'Extend your arms straight overhead until elbows lock out.',
        'Lower behind your head for a deep triceps stretch.',
      ],
      tips: [
        'The overhead stretch targets the long head — the biggest part of the triceps.',
      ],
      mistakes: [
        'Elbows flaring wide — keep them pointing forward and close together.',
        'Arching the lower back hard instead of bracing the core.',
      ],
    },
    {
      id: 'ar-dip-machine', name: 'Seated Dip Machine',
      gear: 'Seated dip / triceps press machine', icon: 'pressMachine',
      tags: ['triceps'], muscles: 'Triceps, lower chest',
      video: 'seated dip machine proper form',
      setup: [
        'Adjust the seat so the handles sit level with your lower chest.',
        'Sit tall, grab the handles with elbows bent ~90°.',
      ],
      execution: [
        'Press the handles straight down until your arms are fully extended.',
        'Return with control to the 90° start position.',
      ],
      tips: [
        'Stay upright and drive straight down — leaning forward shifts the work to your chest.',
      ],
      mistakes: [
        'Hunching forward over the handles.',
        'Short pulsing reps — full lockout, full return.',
      ],
    },
    {
      id: 'ar-skull', name: 'EZ-Bar Skull Crusher',
      gear: 'EZ bar + flat bench', icon: 'bench',
      tags: ['triceps'], muscles: 'Triceps',
      video: 'ez bar skull crusher proper form',
      setup: [
        'Lie on a flat bench holding an EZ bar over your chest, narrow grip.',
      ],
      execution: [
        'Bend only at the elbows to lower the bar to your forehead (or just behind your head).',
        'Extend back up to the start, keeping upper arms vertical and still.',
      ],
      tips: [
        'Lowering behind your head instead of to the forehead is easier on the elbows and stretches more.',
        'Go light and strict — this one punishes sloppy form.',
      ],
      mistakes: [
        'Upper arms swinging back and forth — only the forearms should move.',
        'Going too heavy and turning it into a close-grip press.',
        'Lowering fast toward your face (the name is a warning, not a goal).',
      ],
    },
    {
      id: 'ar-bench-dip', name: 'Bench Dips',
      gear: 'Flat bench (bodyweight)', icon: 'dip',
      tags: ['triceps', 'finisher'], muscles: 'Triceps',
      video: 'bench dips proper form',
      setup: [
        'Sit on the edge of a bench, hands gripping the edge beside your hips.',
        'Slide your hips off the bench, legs extended in front of you.',
      ],
      execution: [
        'Bend your elbows to lower your hips toward the floor until upper arms are parallel.',
        'Press back up to straight arms.',
      ],
      tips: [
        'Feet on a second bench = harder. A plate on your lap = harder still.',
      ],
      mistakes: [
        'Hips drifting far away from the bench, which strains the shoulders.',
        'Shoulders rolling forward at the bottom — keep the chest up.',
        'Only bending the elbows a few centimetres.',
      ],
    },
  ],
};

/* ------------------------- machine pictograms ------------------------- */
/* Simple line-art SVGs. Stroke colour inherits from CSS currentColor.   */

const ICON_WRAP = (inner) =>
  `<svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

const ICONS = {
  dumbbell: ICON_WRAP(`
    <line x1="30" y1="60" x2="90" y2="60"/>
    <rect x="18" y="38" width="12" height="44" rx="3"/>
    <rect x="90" y="38" width="12" height="44" rx="3"/>
    <rect x="8" y="46" width="10" height="28" rx="3"/>
    <rect x="102" y="46" width="10" height="28" rx="3"/>`),
  barbell: ICON_WRAP(`
    <line x1="10" y1="60" x2="110" y2="60"/>
    <rect x="24" y="34" width="10" height="52" rx="3"/>
    <rect x="86" y="34" width="10" height="52" rx="3"/>
    <rect x="36" y="42" width="8" height="36" rx="3"/>
    <rect x="76" y="42" width="8" height="36" rx="3"/>`),
  smith: ICON_WRAP(`
    <line x1="28" y1="12" x2="28" y2="108"/>
    <line x1="92" y1="12" x2="92" y2="108"/>
    <line x1="16" y1="108" x2="104" y2="108"/>
    <line x1="20" y1="52" x2="100" y2="52"/>
    <rect x="34" y="40" width="8" height="24" rx="3"/>
    <rect x="78" y="40" width="8" height="24" rx="3"/>`),
  cable: ICON_WRAP(`
    <line x1="34" y1="12" x2="34" y2="108"/>
    <line x1="22" y1="108" x2="70" y2="108"/>
    <circle cx="34" cy="24" r="7"/>
    <line x1="34" y1="31" x2="72" y2="66"/>
    <path d="M72 66 l14 12"/>
    <path d="M80 84 a8 8 0 1 0 12 -8"/>`),
  pressMachine: ICON_WRAP(`
    <line x1="30" y1="108" x2="90" y2="108"/>
    <line x1="44" y1="108" x2="44" y2="64"/>
    <rect x="36" y="56" width="30" height="10" rx="4"/>
    <line x1="52" y1="56" x2="52" y2="34"/>
    <rect x="44" y="24" width="16" height="12" rx="4"/>
    <path d="M78 44 v-14 h14"/>
    <path d="M78 44 v20 h10"/>
    <circle cx="98" cy="30" r="6"/>`),
  latPulldown: ICON_WRAP(`
    <line x1="60" y1="10" x2="60" y2="26"/>
    <path d="M24 26 q36 14 72 0"/>
    <line x1="60" y1="26" x2="60" y2="44"/>
    <rect x="42" y="70" width="36" height="10" rx="4"/>
    <line x1="52" y1="80" x2="52" y2="108"/>
    <line x1="68" y1="80" x2="68" y2="108"/>
    <rect x="46" y="52" width="28" height="10" rx="4"/>`),
  cableRow: ICON_WRAP(`
    <line x1="14" y1="108" x2="106" y2="108"/>
    <line x1="20" y1="108" x2="20" y2="56"/>
    <circle cx="20" cy="50" r="6"/>
    <line x1="26" y1="52" x2="64" y2="52"/>
    <path d="M64 44 v16"/>
    <rect x="72" y="76" width="30" height="10" rx="4"/>
    <line x1="78" y1="86" x2="78" y2="108"/>
    <line x1="96" y1="86" x2="96" y2="108"/>`),
  rowMachine: ICON_WRAP(`
    <line x1="16" y1="108" x2="104" y2="108"/>
    <rect x="60" y="72" width="30" height="10" rx="4"/>
    <line x1="66" y1="82" x2="66" y2="108"/>
    <line x1="84" y1="82" x2="84" y2="108"/>
    <rect x="42" y="36" width="10" height="34" rx="4"/>
    <path d="M30 52 h-12"/>
    <path d="M30 40 h-12"/>
    <line x1="47" y1="70" x2="47" y2="108"/>`),
  pullup: ICON_WRAP(`
    <line x1="24" y1="14" x2="96" y2="14"/>
    <line x1="24" y1="14" x2="24" y2="108"/>
    <line x1="96" y1="14" x2="96" y2="108"/>
    <circle cx="60" cy="38" r="9"/>
    <line x1="60" y1="47" x2="60" y2="76"/>
    <path d="M60 52 L40 20"/>
    <path d="M60 52 L80 20"/>
    <path d="M60 76 l-10 22"/>
    <path d="M60 76 l10 22"/>`),
  backExt: ICON_WRAP(`
    <line x1="14" y1="108" x2="106" y2="108"/>
    <line x1="30" y1="108" x2="58" y2="66"/>
    <rect x="52" y="58" width="26" height="10" rx="4" transform="rotate(-10 65 63)"/>
    <circle cx="98" cy="44" r="8"/>
    <path d="M78 62 L92 50"/>
    <line x1="36" y1="88" x2="52" y2="88"/>`),
  legPress: ICON_WRAP(`
    <line x1="12" y1="108" x2="108" y2="108"/>
    <path d="M20 108 L52 66 L64 76"/>
    <rect x="76" y="30" width="12" height="44" rx="3" transform="rotate(35 82 52)"/>
    <circle cx="34" cy="74" r="8"/>
    <path d="M42 82 l16 -4 14 14"/>`),
  hackSquat: ICON_WRAP(`
    <line x1="12" y1="108" x2="108" y2="108"/>
    <line x1="30" y1="108" x2="78" y2="30"/>
    <rect x="70" y="24" width="26" height="10" rx="4" transform="rotate(-58 83 29)"/>
    <circle cx="88" cy="36" r="8"/>
    <path d="M76 52 l-14 20 12 14"/>
    <line x1="52" y1="96" x2="86" y2="96"/>`),
  legIso: ICON_WRAP(`
    <line x1="16" y1="108" x2="104" y2="108"/>
    <line x1="34" y1="108" x2="34" y2="60"/>
    <rect x="26" y="30" width="12" height="34" rx="4"/>
    <rect x="38" y="58" width="34" height="10" rx="4"/>
    <line x1="72" y1="63" x2="94" y2="84"/>
    <circle cx="98" cy="90" r="7"/>`),
  calf: ICON_WRAP(`
    <line x1="20" y1="108" x2="100" y2="108"/>
    <rect x="40" y="96" width="40" height="12" rx="3"/>
    <path d="M54 96 v-18"/>
    <path d="M68 96 v-18"/>
    <path d="M48 78 h28"/>
    <path d="M54 60 q6 -10 14 0"/>
    <line x1="61" y1="42" x2="61" y2="56"/>
    <circle cx="61" cy="32" r="8"/>`),
  bench: ICON_WRAP(`
    <rect x="24" y="62" width="72" height="10" rx="4"/>
    <line x1="34" y1="72" x2="34" y2="96"/>
    <line x1="86" y1="72" x2="86" y2="96"/>
    <line x1="10" y1="40" x2="110" y2="40"/>
    <rect x="26" y="24" width="9" height="32" rx="3"/>
    <rect x="85" y="24" width="9" height="32" rx="3"/>`),
  dip: ICON_WRAP(`
    <line x1="30" y1="30" x2="30" y2="108"/>
    <line x1="90" y1="30" x2="90" y2="108"/>
    <line x1="30" y1="30" x2="46" y2="30"/>
    <line x1="74" y1="30" x2="90" y2="30"/>
    <circle cx="60" cy="26" r="9"/>
    <line x1="60" y1="35" x2="60" y2="66"/>
    <path d="M60 40 L46 30"/>
    <path d="M60 40 L74 30"/>
    <path d="M60 66 l-8 20 4 16"/>`),
  preacher: ICON_WRAP(`
    <line x1="20" y1="108" x2="100" y2="108"/>
    <line x1="44" y1="108" x2="44" y2="72"/>
    <path d="M36 72 L70 48"/>
    <rect x="34" y="66" width="40" height="10" rx="4" transform="rotate(-32 54 71)"/>
    <circle cx="84" cy="34" r="8"/>
    <path d="M76 44 l-10 16"/>
    <path d="M66 60 q-10 6 -20 2"/>`),
  pushdown: ICON_WRAP(`
    <line x1="60" y1="10" x2="60" y2="26"/>
    <circle cx="60" cy="20" r="7"/>
    <line x1="60" y1="27" x2="60" y2="52"/>
    <path d="M44 52 h32"/>
    <path d="M44 52 l-4 14"/>
    <path d="M76 52 l4 14"/>
    <circle cx="60" cy="76" r="9"/>
    <line x1="60" y1="85" x2="60" y2="108"/>`),
  pushup: ICON_WRAP(`
    <line x1="12" y1="100" x2="108" y2="100"/>
    <circle cx="26" cy="62" r="8"/>
    <path d="M34 68 L92 84"/>
    <path d="M40 70 l-4 30"/>
    <path d="M92 84 l10 16"/>`),
};
