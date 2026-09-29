/* Stay Strong — exercise database.
 * Each day has a pool of exercises; the planner picks a fresh combination every week.
 * tags drive selection rules (e.g. legs always get quads + hamstrings + calves).
 * video is a YouTube search query — search links never go stale, and on phones
 * they open directly in the YouTube app with the top form tutorials.
 * icon keys map to the ICONS pictogram set at the bottom of this file.
 */

/* hiitName: what the day is called in the HIIT / lean-and-toned goal. */
const DAYS = [
  { key: 'shoulders', label: 'Mon', name: 'Shoulders', hiitName: 'Shoulders & Core', emoji: '🪨',
    picks: 5,
    slots: [ { tag: 'press', count: 1 }, { tag: 'side', count: 2 }, { tag: 'rear', count: 1 } ],
    warmup: [
      '5 min easy cardio (bike or rower) to raise your temperature.',
      '15 slow arm circles each way, then 15 band pull-aparts (or wall slides).',
      '2 light sets of your first press — about half your working weight.',
    ] },
  { key: 'back', label: 'Tue', name: 'Back', hiitName: 'Back', emoji: '🦅',
    picks: 5,
    slots: [ { tag: 'vertical', count: 1 }, { tag: 'horizontal', count: 2 } ],
    warmup: [
      '5 min easy cardio — rower is perfect for back day.',
      '20–30 s dead hang from the pull-up bar, then 10 slow cat-cows.',
      '2 light sets of your first pull — about half your working weight.',
    ] },
  { key: 'legs', label: 'Wed', name: 'Legs', hiitName: 'Legs & Glutes', emoji: '🦵',
    picks: 6,
    slots: [ { tag: 'quad', count: 2 }, { tag: 'ham', count: 1 }, { tag: 'calf', count: 1 } ],
    warmup: [
      '5 min incline walk or bike to warm up hips and knees.',
      '15 bodyweight squats and 10 leg swings per leg (front-to-back and side-to-side).',
      '2 light sets of your first exercise — about half your working weight.',
    ] },
  { key: 'chest', label: 'Thu', name: 'Chest', hiitName: 'Push & Core', emoji: '🛡️',
    picks: 5,
    slots: [ { tag: 'press', count: 2 }, { tag: 'fly', count: 1 } ],
    warmup: [
      '5 min easy cardio to get the blood moving.',
      '10 slow push-ups and a 30 s doorway pec stretch per side.',
      '2 light sets of your first press — about half your working weight.',
    ] },
  { key: 'arms', label: 'Fri', name: 'Arms', hiitName: 'Arms & Core', emoji: '💪',
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
    {
      id: 'sh-arnold-press', name: 'Arnold Press',
      gear: 'Dumbbells + upright bench', icon: 'dumbbell',
      tags: ['compound', 'press'], muscles: 'All three delt heads, triceps',
      video: 'seated arnold press proper form',
      setup: [
        'Sit on an upright bench holding dumbbells at shoulder height, palms facing YOU.',
      ],
      execution: [
        'Press up while rotating your palms outward — at the top they face forward.',
        'Reverse the rotation on the way down, back to palms-facing-you.',
      ],
      tips: [
        'The rotation sweeps through more of the delt than a straight press — go a bit lighter.',
      ],
      mistakes: [
        'Rotating with a jerk instead of smoothly through the whole press.',
        'Flaring the elbows out early — they should follow the rotation.',
      ],
    },
    {
      id: 'sh-bb-press', name: 'Standing Barbell Press',
      gear: 'Barbell + rack', icon: 'barbell',
      tags: ['compound', 'press'], muscles: 'Delts, triceps, core',
      video: 'standing barbell overhead press proper form',
      setup: [
        'Set the bar at upper-chest height in the rack; grip just outside your shoulders.',
        'Unrack with the bar on your front delts, elbows slightly in front, core braced.',
      ],
      execution: [
        'Press the bar straight up, moving your head back slightly to clear the chin.',
        'Push your head "through the window" at the top so the bar stacks over mid-foot.',
        'Lower under control back to your upper chest.',
      ],
      tips: [
        'Squeeze glutes and abs hard — a rigid body presses more.',
      ],
      mistakes: [
        'Arching the lower back into a standing incline press.',
        'Pressing the bar out in front instead of straight overhead.',
      ],
    },
    {
      id: 'sh-lean-raise', name: 'Leaning Lateral Raise',
      gear: 'Dumbbell + upright post or rack', icon: 'dumbbell',
      tags: ['isolation', 'side'], muscles: 'Side delts (extra range at the bottom)',
      video: 'leaning single arm lateral raise form',
      setup: [
        'Hold a post or rack upright with one hand and lean your whole body away, feet close to the post.',
        'Hold a light dumbbell in the hanging outside hand.',
      ],
      execution: [
        'Raise the dumbbell out to shoulder height, lower slowly; finish the set, switch sides.',
      ],
      tips: [
        'The lean keeps tension on the delt at the bottom where normal raises go slack.',
      ],
      mistakes: [
        'Turning the raise into a swing with the lean as momentum.',
        'Grip hand doing the work — the holding arm stays passive.',
      ],
    },
    {
      id: 'sh-cross-cable-rear', name: 'Cross-Body Cable Rear Delt Fly',
      gear: 'Cable tower, single handle at shoulder height', icon: 'cable',
      tags: ['isolation', 'rear'], muscles: 'Rear delts',
      video: 'single arm cross body cable rear delt fly form',
      setup: [
        'Set a pulley at shoulder height with no handle (grip the ball/end) or a single handle.',
        'Stand side-on and grab it with the FAR hand, arm across your chest.',
      ],
      execution: [
        'Sweep your arm out and back in a wide arc until it points away from the machine.',
        'Return slowly across your body. Finish the set, then switch arms.',
      ],
      tips: [
        'Very light weight — the rear delt is small and this movement is unforgiving of cheating.',
      ],
      mistakes: [
        'Bending the elbow and rowing instead of sweeping.',
        'Rotating the torso to help the arm across.',
      ],
    },
    {
      id: 'sh-plate-raise', name: 'Plate Front Raise',
      gear: 'One weight plate', icon: 'dumbbell',
      tags: ['isolation', 'front'], muscles: 'Front delts',
      video: 'plate front raise proper form',
      setup: [
        'Hold a plate with both hands at 3 and 9 o\'clock, arms hanging in front of you.',
      ],
      execution: [
        'Raise the plate to eye level with slightly bent arms, pause, lower slowly.',
      ],
      tips: [
        'Holding the top for 2 seconds every few reps burns beautifully.',
      ],
      mistakes: [
        'Leaning back and turning it into a swing.',
        'Dropping the plate down fast — the lowering half is half the exercise.',
      ],
    },
    {
      id: 'sh-bent-rear-fly', name: 'Bent-Over Dumbbell Rear Delt Fly',
      gear: 'Light dumbbells', icon: 'dumbbell', equip: 'free',
      tags: ['isolation', 'rear'], muscles: 'Rear delts, upper back',
      video: 'bent over dumbbell rear delt fly proper form',
      setup: [
        'Hinge forward until your torso is nearly parallel to the floor, dumbbells hanging under your chest, slight elbow bend.',
      ],
      execution: [
        'Raise both arms out to the sides until they are level with your shoulders.',
        'Pause, then lower slowly. Keep the hinge — the torso never moves.',
      ],
      tips: [
        'Lead with the elbows and think "thumbs down" at the top to hit the rear delt rather than the traps.',
      ],
      mistakes: [
        'Standing up as you raise the weights.',
        'Going heavy and swinging.',
      ],
    },
    {
      id: 'sh-pike-pushup', name: 'Pike Push-Up',
      gear: 'Bodyweight (floor)', icon: 'pushup', equip: 'body',
      tags: ['compound', 'press'], muscles: 'Shoulders, triceps',
      video: 'pike push up proper form',
      setup: [
        'From a push-up position, walk your feet in and lift your hips high so your body makes an upside-down V.',
        'Hands slightly wider than shoulders, head between your arms.',
      ],
      execution: [
        'Bend the elbows to lower the top of your head toward the floor between your hands.',
        'Press back up to straight arms. Elevate your feet on a bench to make it harder.',
      ],
      tips: [
        'The more vertical your torso, the more it becomes a shoulder press.',
      ],
      mistakes: [
        'Letting the hips drop — that turns it into a regular push-up.',
        'Nodding the head forward instead of lowering it straight down.',
      ],
    },
    {
      id: 'sh-handstand-hold', name: 'Wall Handstand Hold',
      gear: 'Bodyweight (wall)', icon: 'pushup', equip: 'body',
      tags: ['compound', 'press'], muscles: 'Shoulders, triceps, core',
      video: 'wall handstand hold beginner tutorial',
      setup: [
        'Kick up into a handstand with your heels resting on a wall, hands about a hand-length from it.',
        'Beginners: walk your feet up the wall from a plank with your back to it instead.',
      ],
      execution: [
        'Push the floor away, lock the elbows, squeeze glutes and hold for the time shown (reps = seconds).',
      ],
      tips: [
        'Look at the floor between your hands, not at the wall.',
      ],
      mistakes: [
        'Banana back — squeeze your abs and ribs in.',
        'Bent elbows.',
      ],
    },
    {
      id: 'sh-prone-y', name: 'Prone Y-Raise',
      gear: 'Bodyweight (floor or bench)', icon: 'pushup', equip: 'body',
      tags: ['isolation', 'rear'], muscles: 'Rear delts, lower traps',
      video: 'prone Y raise bodyweight rear delt exercise tutorial',
      setup: [
        'Lie face down, arms stretched overhead in a Y shape, thumbs up.',
      ],
      execution: [
        'Lift both arms as high as you can, squeezing your shoulder blades down and together.',
        'Hold a second, lower slowly.',
      ],
      tips: [
        'Tiny movement, huge posture payoff — hold a water bottle in each hand once it gets easy.',
      ],
      mistakes: [
        'Shrugging the shoulders up to the ears.',
        'Arching the lower back to lift higher.',
      ],
    },
    {
      id: 'sh-handstand-pushup', name: 'Wall Handstand Push-Up',
      gear: 'Bodyweight (wall)', icon: 'pushup', equip: 'body',
      tags: ['compound', 'press'], muscles: 'Shoulders, triceps, upper chest',
      video: 'wall handstand push up tutorial progression',
      setup: [
        'Kick up into a handstand with your heels on a wall, hands a little wider than shoulders.',
        'Not there yet? Do the pike push-up with feet on a bench instead — same pattern, less load.',
      ],
      execution: [
        'Bend the elbows and lower under control until the top of your head touches the floor (or a cushion).',
        'Press back to straight arms. Reps are low — this is your heaviest “press” without weights.',
      ],
      tips: [
        'Stack a cushion or two under your head to shorten the range while you build strength.',
      ],
      mistakes: [
        'Flaring the elbows straight out to the sides — keep them at about 45°.',
        'Dropping fast onto your head — own the lowering phase.',
      ],
    },
    {
      id: 'sh-arm-circles', name: 'Arm Circles Burnout',
      gear: 'Bodyweight (add water bottles to progress)', icon: 'pushup', equip: 'body',
      tags: ['isolation', 'side'], muscles: 'Side delts',
      video: 'arm circles shoulder exercise proper form',
      setup: [
        'Stand tall, arms straight out to the sides at shoulder height, palms down.',
      ],
      execution: [
        'Draw slow, controlled circles about the size of a dinner plate — forward for the reps shown, then backward.',
        'Keep the arms at shoulder height the whole time. Reps here = seconds per direction.',
      ],
      tips: [
        'It burns because the side delts hold the arms up for the whole set — that is the point. Add 500 ml bottles when 60 s feels easy.',
      ],
      mistakes: [
        'Letting the arms sink below shoulder height as they tire.',
        'Fast, floppy circles — small and slow is harder.',
      ],
    },
    {
      id: 'sh-lateral-plank-walk', name: 'Lateral Plank Walk',
      gear: 'Bodyweight (floor)', icon: 'pushup', equip: 'body',
      tags: ['compound', 'side'], muscles: 'Side delts, core, chest',
      video: 'lateral plank walk shoulder exercise',
      setup: [
        'Start in a straight-arm plank, hands under shoulders, feet hip-width.',
      ],
      execution: [
        'Step your right hand and right foot out to the side, then follow with the left — travel sideways 4–6 “steps”.',
        'Come back the other way. Each direction = 1 rep.',
      ],
      tips: [
        'Keep the hips level and quiet — the shoulders do the walking, not the hips.',
      ],
      mistakes: [
        'Sagging hips or a piked bum.',
        'Crossing the hands over each other — step, don’t reach.',
      ],
    },
    {
      id: 'sh-wall-lateral-iso', name: 'Wall Lateral Raise Hold',
      gear: 'Bodyweight (door frame or wall)', icon: 'pushup', equip: 'body',
      tags: ['isolation', 'side'], muscles: 'Side delts',
      video: 'isometric lateral raise against wall shoulder',
      setup: [
        'Stand side-on to a wall or in a door frame, the back of your hand and wrist pressed against it, arm straight by your side.',
      ],
      execution: [
        'Push outward into the wall as if doing a lateral raise, as hard as you can — hold for the time shown (reps = seconds).',
        'Swap sides. Then, if you can, do 2–3 slow “reps” in the open air with a bottle or bag for the pump.',
      ],
      tips: [
        'Build the push up over 2–3 s and breathe — don’t hold your breath.',
      ],
      mistakes: [
        'Leaning your whole body into the wall instead of pushing with the shoulder.',
        'Shrugging up to the ear.',
      ],
    },
    {
      id: 'sh-prone-t', name: 'Prone T-Raise',
      gear: 'Bodyweight (floor or bench)', icon: 'pushup', equip: 'body',
      tags: ['isolation', 'rear'], muscles: 'Rear delts, mid traps',
      video: 'prone T raise rear delt bodyweight',
      setup: [
        'Lie face down, arms straight out to the sides in a T, thumbs pointing up.',
      ],
      execution: [
        'Squeeze the shoulder blades together and lift both arms as high as they go.',
        'Pause a second at the top, lower slowly.',
      ],
      tips: [
        'Think of pinching a pencil between your shoulder blades. Water bottles in each hand when it gets easy.',
      ],
      mistakes: [
        'Lifting the chest off the floor to cheat the arms higher.',
        'Bending the elbows.',
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
    {
      id: 'bk-close-pulldown', name: 'Close-Grip Lat Pulldown',
      gear: 'Lat pulldown machine + V-handle', icon: 'latPulldown',
      tags: ['compound', 'vertical'], muscles: 'Lower lats, biceps',
      video: 'close grip v bar lat pulldown proper form',
      setup: [
        'Swap the wide bar for the narrow V-handle.',
        'Lock your thighs under the pad and sit tall, arms extended overhead.',
      ],
      execution: [
        'Pull the handle to the top of your chest, elbows driving down past your ribs.',
        'Lean back only slightly; let the handle rise to a full stretch between reps.',
      ],
      tips: [
        'The neutral close grip lets most people feel their lats better than the wide bar — great swap week.',
      ],
      mistakes: [
        'Rocking back and pulling with bodyweight.',
        'Stopping the stretch short at the top.',
      ],
    },
    {
      id: 'bk-machine-highrow', name: 'Machine High Row',
      gear: 'High row machine (chest pad, overhead handles)', icon: 'rowMachine',
      tags: ['compound', 'vertical'], muscles: 'Upper lats, mid back',
      video: 'machine high row proper form',
      setup: [
        'Adjust the seat so the handles sit up and forward of your shoulders.',
        'Chest on the pad, grab the handles with a neutral grip.',
      ],
      execution: [
        'Pull down-and-back toward your lower ribs in one arc.',
        'Squeeze the shoulder blades, then let the arms stretch fully up-and-forward.',
      ],
      tips: [
        'Halfway between a pulldown and a row — hits the lats from an angle the others miss.',
      ],
      mistakes: [
        'Chest leaving the pad to jerk the weight.',
        'Pulling straight down instead of down-and-back.',
      ],
    },
    {
      id: 'bk-single-cable-row', name: 'Single-Arm Cable Row',
      gear: 'Cable row station or low pulley + single handle', icon: 'cableRow',
      tags: ['compound', 'horizontal'], muscles: 'Lats, mid back (each side alone)',
      video: 'single arm seated cable row proper form',
      setup: [
        'Attach a single handle to the low pulley and sit as for a normal cable row.',
        'Grab it with one hand, palm facing in, arm extended.',
      ],
      execution: [
        'Row the handle to your hip, elbow tight to your side; you may rotate the torso slightly open at the stretch.',
        'Finish all reps, then switch arms.',
      ],
      tips: [
        'One side at a time exposes and fixes strength imbalances the two-hand row hides.',
      ],
      mistakes: [
        'Twisting hard with the torso to move heavier weight.',
        'Shrugging the working shoulder toward your ear.',
      ],
    },
    {
      id: 'bk-bb-row', name: 'Barbell Bent-Over Row',
      gear: 'Barbell', icon: 'barbell',
      tags: ['compound', 'horizontal'], muscles: 'Whole back, rear delts, biceps',
      video: 'barbell bent over row proper form',
      setup: [
        'Grip the bar just outside your knees, hinge to ~45°, back flat, knees soft.',
      ],
      execution: [
        'Row the bar to your lower ribs, elbows driving back, and lower under control.',
        'Hold the hinge — your torso angle should not change during the set.',
      ],
      tips: [
        'The king of back builders — but only with a weight you can row without heaving.',
      ],
      mistakes: [
        'Standing up a little on every rep to bounce the weight.',
        'Rounding the lower back as the set gets hard.',
        'Rowing to the chest instead of the lower ribs.',
      ],
    },
    {
      id: 'bk-pullup', name: 'Pull-Up',
      gear: 'Pull-up bar', icon: 'pullup', equip: 'body',
      tags: ['compound', 'vertical'], muscles: 'Lats, biceps, grip',
      video: 'pull up proper form',
      setup: [
        'Hang from the bar with an overhand grip just outside shoulder width, arms straight.',
      ],
      execution: [
        'Pull your chest toward the bar, driving the elbows down and back, until your chin clears it.',
        'Lower all the way to straight arms every rep.',
      ],
      tips: [
        'Can’t do one yet? Jump to the top and lower yourself over 5 seconds — "negatives" build pull-ups fast.',
      ],
      mistakes: [
        'Kipping or swinging.',
        'Half reps that never reach a full hang.',
      ],
    },
    {
      id: 'bk-chinup', name: 'Chin-Up',
      gear: 'Pull-up bar', icon: 'pullup', equip: 'body', also: ['arms'],
      tags: ['compound', 'vertical', 'biceps'], muscles: 'Lats, biceps',
      video: 'chin up proper form',
      setup: [
        'Hang from the bar with an underhand grip, hands shoulder-width apart.',
      ],
      execution: [
        'Pull until your chin passes the bar, elbows finishing tight to your ribs.',
        'Lower under control to a dead hang.',
      ],
      tips: [
        'The underhand grip makes this the best bodyweight biceps exercise there is.',
      ],
      mistakes: [
        'Craning the neck to get the chin over.',
        'Dropping fast from the top.',
      ],
    },
    {
      id: 'bk-inverted-row', name: 'Inverted Row',
      gear: 'Bar at hip height (Smith bar, rack, or sturdy table)', icon: 'pullup', equip: 'body',
      tags: ['compound', 'horizontal'], muscles: 'Mid back, lats, biceps',
      video: 'inverted row proper form',
      setup: [
        'Set a bar at hip height. Lie under it, grab it overhand, heels on the floor, body straight.',
      ],
      execution: [
        'Pull your chest to the bar, squeezing the shoulder blades together.',
        'Lower slowly to straight arms. Raise the bar to make it easier, or put your feet on a bench to make it harder.',
      ],
      tips: [
        'The bodyweight answer to every row machine — and a great pull-up builder.',
      ],
      mistakes: [
        'Hips sagging toward the floor.',
        'Chin poking forward at the top.',
      ],
    },
    {
      id: 'bk-inverted-row-under', name: 'Underhand Inverted Row',
      gear: 'Bar at hip height', icon: 'pullup', equip: 'body', also: ['arms'],
      tags: ['compound', 'horizontal', 'biceps'], muscles: 'Lats, biceps',
      video: 'underhand inverted row bodyweight bicep tutorial',
      setup: [
        'As for the inverted row, but grab the bar underhand at shoulder width.',
      ],
      execution: [
        'Row your lower chest to the bar, elbows sliding along your sides.',
        'Lower slowly, body rigid as a plank.',
      ],
      tips: [
        'Underhand grip shifts more work to the biceps — the arm-day bodyweight option.',
      ],
      mistakes: [
        'Bending at the hips to shorten the pull.',
      ],
    },
    {
      id: 'bk-superman', name: 'Superman Hold',
      gear: 'Mat', icon: 'pushup', equip: 'body',
      tags: ['isolation', 'lower'], muscles: 'Lower back, glutes',
      video: 'superman exercise proper form back',
      setup: [
        'Lie face down, arms stretched out in front, legs straight.',
      ],
      execution: [
        'Lift arms, chest and legs off the floor together and hold for 2 seconds.',
        'Lower slowly. Each lift is one rep.',
      ],
      tips: [
        'Look at the floor to keep your neck neutral.',
      ],
      mistakes: [
        'Jerking up with momentum.',
      ],
    },
    {
      id: 'bk-db-pullover', name: 'Dumbbell Pullover',
      gear: 'One dumbbell + bench', icon: 'dumbbell', equip: 'free',
      tags: ['isolation', 'vertical'], muscles: 'Lats, chest',
      video: 'dumbbell pullover proper form',
      setup: [
        'Lie across or along a bench, holding one dumbbell with both hands above your chest.',
      ],
      execution: [
        'With a slight elbow bend, lower the dumbbell in an arc behind your head until you feel a lat stretch.',
        'Pull it back over your chest using your lats.',
      ],
      tips: [
        'Keep the ribs down — the stretch should be in the lats, not the lower back.',
      ],
      mistakes: [
        'Bending the elbows into a triceps extension.',
        'Flaring the ribs and arching the back.',
      ],
    },
    {
      id: 'bk-two-db-row', name: 'Bent-Over Two-Dumbbell Row',
      gear: 'Dumbbells', icon: 'dumbbell', equip: 'free',
      tags: ['compound', 'horizontal'], muscles: 'Whole back, biceps',
      video: 'bent over two dumbbell row proper form',
      setup: [
        'Hinge to ~45° with a flat back, a dumbbell in each hand hanging under your shoulders.',
      ],
      execution: [
        'Row both dumbbells to your hips, elbows driving back, squeeze, and lower slowly.',
      ],
      tips: [
        'The free-weight stand-in for any row machine — hold the hinge for the whole set.',
      ],
      mistakes: [
        'Standing up to heave the weight.',
        'Rounding the lower back.',
      ],
    },
    {
      id: 'bk-scap-pullup', name: 'Scapular Pull-Up',
      gear: 'Pull-up bar', icon: 'pullup', equip: 'body',
      tags: ['isolation', 'vertical'], muscles: 'Lats, lower traps',
      video: 'scapular pull up tutorial',
      setup: [
        'Hang from the bar with straight arms, shoulder-width overhand grip, body still.',
      ],
      execution: [
        'Without bending the elbows, pull the shoulder blades down and back so your body rises a few centimetres.',
        'Hold a second at the top, then let the shoulders rise slowly back to a full hang.',
      ],
      tips: [
        'This is the first inch of every pull-up — master it and full pull-ups follow. Add a 3 s hold to progress.',
      ],
      mistakes: [
        'Bending the elbows — the arms stay locked the whole time.',
        'Rushing; the movement is small and should be slow.',
      ],
    },
    {
      id: 'bk-feet-elevated-row', name: 'Feet-Elevated Inverted Row',
      gear: 'Bar at hip height + bench or box for the feet', icon: 'pullup', equip: 'body',
      tags: ['compound', 'horizontal'], muscles: 'Lats, mid back, biceps',
      video: 'feet elevated inverted row',
      setup: [
        'Set a bar at about hip height, lie under it and put your heels up on a bench so your body is horizontal.',
        'Overhand grip just wider than shoulders, body straight from head to heels.',
      ],
      execution: [
        'Pull the chest to the bar, driving the elbows back and squeezing the shoulder blades together.',
        'Lower under control to straight arms.',
      ],
      tips: [
        'Body horizontal means you are rowing most of your bodyweight — the hardest inverted row, one step from pull-ups.',
      ],
      mistakes: [
        'Hips sagging toward the floor.',
        'Half reps — chest to the bar every time.',
      ],
    },
    {
      id: 'bk-towel-door-row', name: 'Towel Door Row',
      gear: 'Two towels (or a bedsheet) and a solid door', icon: 'pullup', equip: 'body',
      tags: ['compound', 'horizontal'], muscles: 'Lats, mid back, biceps',
      video: 'towel row door at home back exercise',
      setup: [
        'Drape two towels over the top of a door and close it so the ends hang on your side. Check the door is solid.',
        'Grab a towel in each hand, feet by the door, and lean back until the arms are straight.',
      ],
      execution: [
        'Row your chest up to your hands, elbows driving back, shoulder blades pinching.',
        'Lower slowly. Walk the feet closer to the door to make it harder.',
      ],
      tips: [
        'No bar, no problem — this is the home version of the inverted row.',
      ],
      mistakes: [
        'Bending at the hips — keep a straight line from head to heels.',
        'Yanking with the arms instead of pulling with the back.',
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
    {
      id: 'lg-goblet-squat', name: 'Goblet Squat',
      gear: 'One dumbbell or kettlebell', icon: 'dumbbell',
      tags: ['compound', 'quad'], muscles: 'Quads, glutes, core',
      video: 'goblet squat proper form',
      setup: [
        'Hold a dumbbell vertically against your chest, elbows tucked under it.',
        'Feet slightly wider than shoulders, toes a little out.',
      ],
      execution: [
        'Squat down between your knees until your elbows brush your thighs.',
        'Drive up through mid-foot, chest tall the whole way.',
      ],
      tips: [
        'The front-held weight balances you into a naturally deep, upright squat — the best squat teacher there is.',
      ],
      mistakes: [
        'Letting the dumbbell drift away from the chest.',
        'Heels lifting — widen the stance or slow down.',
      ],
    },
    {
      id: 'lg-bulgarian', name: 'Bulgarian Split Squat',
      gear: 'Dumbbells + bench behind you', icon: 'dumbbell',
      tags: ['compound', 'quad', 'glute'], muscles: 'Quads, glutes, balance',
      video: 'dumbbell bulgarian split squat proper form',
      setup: [
        'Stand a big step in front of a bench; rest the top of your rear foot on it.',
        'Hold a dumbbell in each hand at your sides.',
      ],
      execution: [
        'Lower straight down until the front thigh is parallel, rear knee toward the floor.',
        'Drive up through the front heel. All reps, then switch legs.',
      ],
      tips: [
        'Everyone wobbles at first — start with bodyweight only and add dumbbells next week.',
      ],
      mistakes: [
        'Front foot too close to the bench, slamming the knee forward.',
        'Pushing off the back foot — it is a balance point, not a driver.',
      ],
    },
    {
      id: 'lg-hip-thrust', name: 'Barbell Hip Thrust',
      gear: 'Barbell + bench (bar pad recommended)', icon: 'bench',
      tags: ['compound', 'glute'], muscles: 'Glutes, hamstrings',
      video: 'barbell hip thrust proper form',
      setup: [
        'Sit on the floor, upper back against a bench, barbell (with pad) across your hips.',
        'Feet flat, shoulder-width, close enough that your shins are vertical at the top.',
      ],
      execution: [
        'Drive through your heels and squeeze your glutes to lift your hips until your body is a flat table.',
        'Chin tucked, ribs down; lower with control and repeat.',
      ],
      tips: [
        'The single best glute builder in the gym — squeeze hard for a full second at the top.',
      ],
      mistakes: [
        'Overarching the lower back at the top instead of finishing with the glutes.',
        'Pushing through the toes — heels drive, knees stay over ankles.',
      ],
    },
    {
      id: 'lg-lying-curl', name: 'Lying Leg Curl Machine',
      gear: 'Lying leg curl machine', icon: 'legIso',
      tags: ['isolation', 'ham'], muscles: 'Hamstrings',
      video: 'lying leg curl machine proper form',
      setup: [
        'Lie face down, knees just off the pad edge, ankle roller on your lower calves.',
        'Grip the handles and press your hips into the bench.',
      ],
      execution: [
        'Curl your heels toward your glutes as far as they go.',
        'Lower slowly to a full stretch without the stack touching down.',
      ],
      tips: [
        'Lying and seated curls hit the hamstrings slightly differently — your plan rotates both.',
      ],
      mistakes: [
        'Hips popping up off the bench to cheat the weight over.',
        'Half reps in the middle of the range.',
      ],
    },
    {
      id: 'lg-legpress-calf', name: 'Leg Press Calf Raise',
      gear: '45° leg press machine', icon: 'legPress',
      tags: ['isolation', 'calf'], muscles: 'Calves',
      video: 'leg press calf raise proper form',
      setup: [
        'Sit in the leg press with only the balls of your feet on the bottom edge of the platform.',
        'Press the sled up and keep your knees almost straight — safeties ON.',
      ],
      execution: [
        'Let the platform push your toes back for a deep calf stretch.',
        'Press through the balls of your feet until your ankles are fully extended.',
      ],
      tips: [
        'Lets you load calves heavier than standing raises without balancing anything.',
      ],
      mistakes: [
        'Bending and snapping the knees to bounce the sled.',
        'Feet too high on the platform — you lose the range of motion.',
      ],
    },
    {
      id: 'lg-cable-kickback', name: 'Cable Glute Kickback',
      gear: 'Cable tower, ankle strap, lowest setting', icon: 'cable',
      tags: ['isolation', 'glute'], muscles: 'Glutes (max)',
      video: 'cable glute kickback proper form',
      setup: [
        'Strap an ankle cuff to the low pulley and onto one ankle.',
        'Face the tower, hold it for balance, and hinge slightly forward.',
      ],
      execution: [
        'Drive the strapped leg straight back and up, squeezing the glute hard at the top.',
        'Return slowly without letting the stack touch down. All reps, then switch legs.',
      ],
      tips: [
        'Small, strict range beats a big swing — the squeeze at the top is the exercise.',
      ],
      mistakes: [
        'Arching the lower back to kick higher.',
        'Swinging the leg with momentum.',
      ],
    },
    {
      id: 'lg-abductor', name: 'Hip Abduction Machine',
      gear: 'Abduction machine (pads outside knees)', icon: 'legIso',
      tags: ['isolation', 'glute'], muscles: 'Glutes (side), hips',
      video: 'hip abduction machine proper form',
      setup: [
        'Sit with your legs inside the pads pressing outward; lean slightly forward for more glute.',
      ],
      execution: [
        'Push your knees apart as far as you can, pause, and return slowly.',
      ],
      tips: [
        'Hold the open position for a second — this builds the upper/side glute that shapes the hip.',
      ],
      mistakes: [
        'Bouncing through the range with heavy weight.',
        'Letting the pads slam back together.',
      ],
    },
    {
      id: 'lg-step-up', name: 'Dumbbell Step-Up',
      gear: 'Dumbbells + box or bench (knee height)', icon: 'dumbbell',
      tags: ['compound', 'glute', 'quad'], muscles: 'Glutes, quads',
      video: 'dumbbell step up proper form',
      setup: [
        'Stand facing a box or bench about knee height, a dumbbell in each hand.',
      ],
      execution: [
        'Put your whole foot on the box and drive through that heel to stand up tall on it.',
        'Lower the other foot slowly back to the floor — don’t drop. All reps, then switch legs.',
      ],
      tips: [
        'Push off the top leg only — the bottom foot is just a landing gear.',
      ],
      mistakes: [
        'Bouncing off the bottom foot.',
        'Knee caving inward on the way up.',
      ],
    },
    {
      id: 'lg-sumo-squat', name: 'Dumbbell Sumo Squat',
      gear: 'One heavy dumbbell', icon: 'dumbbell',
      tags: ['compound', 'glute', 'quad'], muscles: 'Glutes, inner thighs, quads',
      video: 'dumbbell sumo squat proper form',
      setup: [
        'Wide stance, toes turned out ~45°, holding one dumbbell hanging between your legs.',
      ],
      execution: [
        'Squat down keeping your chest tall and knees tracking over your toes.',
        'Drive up and squeeze your glutes together at the top.',
      ],
      tips: [
        'The wide stance shifts work from the quads to glutes and inner thighs.',
      ],
      mistakes: [
        'Knees falling inward.',
        'Leaning forward instead of sitting straight down.',
      ],
    },
    {
      id: 'lg-bw-squat', name: 'Bodyweight Squat',
      gear: 'Bodyweight', icon: 'pushup', equip: 'body',
      tags: ['compound', 'quad'], muscles: 'Quads, glutes',
      video: 'bodyweight squat proper form',
      setup: [
        'Feet shoulder-width, toes slightly out, arms out in front for balance.',
      ],
      execution: [
        'Sit down between your heels until thighs are at least parallel, chest up.',
        'Stand up driving through the whole foot. Slow the lowering to 3 seconds to make it harder.',
      ],
      tips: [
        'Pause at the bottom for a second — bodyweight squats get hard fast that way.',
      ],
      mistakes: [
        'Heels lifting.',
        'Knees caving inward.',
      ],
    },
    {
      id: 'lg-pistol', name: 'Assisted Pistol Squat',
      gear: 'Bodyweight + post or door frame to hold', icon: 'pushup', equip: 'body',
      tags: ['compound', 'quad', 'glute'], muscles: 'Quads, glutes, balance',
      video: 'assisted pistol squat progression tutorial',
      setup: [
        'Hold a post lightly with both hands, stand on one leg, other leg straight out in front.',
      ],
      execution: [
        'Lower on the standing leg as deep as you can, using the post only for balance.',
        'Drive back up. All reps, then switch legs.',
      ],
      tips: [
        'Squat down to a bench or box first if a full pistol is too much — that is the leg press of calisthenics.',
      ],
      mistakes: [
        'Pulling yourself up with the arms.',
        'Knee collapsing inward.',
      ],
    },
    {
      id: 'lg-reverse-lunge', name: 'Reverse Lunge',
      gear: 'Bodyweight (add dumbbells to progress)', icon: 'pushup', equip: 'body',
      tags: ['compound', 'quad', 'glute'], muscles: 'Quads, glutes',
      video: 'reverse lunge proper form',
      setup: [
        'Stand tall, feet hip-width.',
      ],
      execution: [
        'Step one foot back and lower until both knees are at 90°, front shin vertical.',
        'Push through the front heel to return. Alternate legs; each step is one rep.',
      ],
      tips: [
        'Easier on the knees than forward lunges and better for the glutes.',
      ],
      mistakes: [
        'Short steps that jam the front knee forward.',
        'Leaning forward.',
      ],
    },
    {
      id: 'lg-bw-bulgarian', name: 'Bodyweight Bulgarian Split Squat',
      gear: 'Bodyweight + bench or chair', icon: 'pushup', equip: 'body',
      tags: ['compound', 'quad', 'glute'], muscles: 'Quads, glutes',
      video: 'bulgarian split squat proper form',
      setup: [
        'Rear foot on a bench behind you, front foot a big step forward.',
      ],
      execution: [
        'Lower straight down until the front thigh is parallel, then drive up through the heel.',
        'All reps, then switch legs.',
      ],
      tips: [
        'Hardest bodyweight leg exercise there is — hold dumbbells when 15 reps gets easy.',
      ],
      mistakes: [
        'Pushing off the back foot.',
        'Front foot too close to the bench.',
      ],
    },
    {
      id: 'lg-glute-bridge', name: 'Glute Bridge',
      gear: 'Mat (add a dumbbell across the hips to progress)', icon: 'pushup', equip: 'body',
      tags: ['compound', 'glute', 'ham'], muscles: 'Glutes, hamstrings',
      video: 'glute bridge proper form',
      setup: [
        'Lie on your back, knees bent, feet flat and close to your glutes, arms by your sides.',
      ],
      execution: [
        'Drive through the heels to lift your hips until your body is straight from shoulders to knees.',
        'Squeeze the glutes for a second at the top, lower slowly.',
      ],
      tips: [
        'Tuck your chin and keep the ribs down — the lift comes from the glutes, not the lower back.',
      ],
      mistakes: [
        'Overarching the back at the top.',
        'Pushing through the toes.',
      ],
    },
    {
      id: 'lg-sl-glute-bridge', name: 'Single-Leg Glute Bridge',
      gear: 'Mat', icon: 'pushup', equip: 'body',
      tags: ['compound', 'glute', 'ham'], muscles: 'Glutes, hamstrings',
      video: 'single leg glute bridge proper form',
      setup: [
        'Glute bridge position, then straighten one leg and hold it in line with the other thigh.',
      ],
      execution: [
        'Drive the planted heel down to lift the hips, keeping them level.',
        'Lower slowly. All reps, then switch.',
      ],
      tips: [
        'Level hips are the whole game — if one side drops, slow down and shorten the range.',
      ],
      mistakes: [
        'Hips rotating toward the lifted leg.',
        'Rushing the reps.',
      ],
    },
    {
      id: 'lg-nordic', name: 'Nordic Hamstring Curl',
      gear: 'Bodyweight + something to anchor the heels', icon: 'pushup', equip: 'body',
      tags: ['isolation', 'ham'], muscles: 'Hamstrings',
      video: 'nordic hamstring curl proper form beginner',
      setup: [
        'Kneel with your ankles anchored under a bar, bench, or a partner’s hands; body upright.',
      ],
      execution: [
        'Lower your torso forward as slowly as possible, hamstrings fighting gravity, hands ready to catch you.',
        'Push off the floor lightly to return. Reps = slow lowers.',
      ],
      tips: [
        'The strongest hamstring exercise in the world needs no equipment — 3 slow reps beats 10 fast ones.',
      ],
      mistakes: [
        'Bending at the hips — keep a straight line from knees to shoulders.',
        'Dropping fast.',
      ],
    },
    {
      id: 'lg-bw-calf', name: 'Bodyweight Calf Raise',
      gear: 'Bodyweight + step or stair', icon: 'calf', equip: 'body',
      tags: ['isolation', 'calf'], muscles: 'Calves',
      video: 'bodyweight calf raise proper form step',
      setup: [
        'Balls of your feet on the edge of a step, heels hanging off, a hand on the wall for balance.',
      ],
      execution: [
        'Drop the heels into a deep stretch, then rise as high onto your toes as possible.',
        'Do them one leg at a time to make it harder.',
      ],
      tips: [
        'Pause 2 seconds at the bottom and 1 at the top — that is where the calves grow.',
      ],
      mistakes: [
        'Bouncing.',
        'Skipping the stretch at the bottom.',
      ],
    },
    {
      id: 'lg-jump-squat', name: 'Jump Squat',
      gear: 'Bodyweight', icon: 'pushup', equip: 'body',
      tags: ['compound', 'quad', 'finisher'], muscles: 'Quads, glutes, power',
      video: 'jump squat proper form',
      setup: [
        'Feet shoulder-width, arms ready to swing.',
      ],
      execution: [
        'Squat to parallel, then explode up as high as you can.',
        'Land softly on the balls of your feet, sinking straight into the next rep.',
      ],
      tips: [
        'Quiet landings — if you can hear them, absorb more with the legs.',
      ],
      mistakes: [
        'Landing with straight legs.',
        'Knees caving on landing.',
      ],
    },
    {
      id: 'lg-db-calf', name: 'Dumbbell Calf Raise',
      gear: 'Dumbbells + step', icon: 'dumbbell', equip: 'free',
      tags: ['isolation', 'calf'], muscles: 'Calves',
      video: 'standing dumbbell calf raise proper form',
      setup: [
        'Stand with the balls of your feet on a step, a dumbbell in one hand, the other hand on the wall.',
      ],
      execution: [
        'Lower the heels into a full stretch, then rise all the way onto the toes and squeeze.',
      ],
      tips: [
        'One leg at a time with the dumbbell on that side is brutal and effective.',
      ],
      mistakes: [
        'Short bouncy reps.',
      ],
    },
    {
      id: 'lg-sl-calf', name: 'Single-Leg Calf Raise',
      gear: 'Bodyweight + step (hold a wall for balance)', icon: 'calf', equip: 'body',
      tags: ['isolation', 'calf'], muscles: 'Calves',
      video: 'single leg calf raise bodyweight',
      setup: [
        'Ball of one foot on the edge of a step, the other foot tucked behind, fingertips on a wall for balance.',
      ],
      execution: [
        'Lower the heel below the step for a full stretch, then rise as high as you can onto the toes.',
        'Pause at the top, 2–3 s down. Do all reps, then swap legs.',
      ],
      tips: [
        'One leg doubles the load without any weight — and evens out a weaker calf.',
      ],
      mistakes: [
        'Leaning on the wall instead of just balancing.',
        'Bouncing out of the bottom.',
      ],
    },
  ],

  /* -------------------------------- CORE -------------------------------- */
  /* Pool used by the HIIT goal to add core work to shoulder / push / arm days. */
  core: [
    {
      id: 'co-plank', name: 'Plank',
      gear: 'Mat', icon: 'pushup',
      tags: ['core', 'finisher'], muscles: 'Deep core, shoulders',
      video: 'plank proper form',
      setup: [
        'Forearms on the mat, elbows under shoulders, feet together.',
      ],
      execution: [
        'Lift into a straight line from head to heels and hold for the time shown (reps = seconds).',
        'Squeeze glutes, brace like you’re about to be poked in the stomach, breathe.',
      ],
      tips: [
        'Shorter perfect holds beat long saggy ones.',
      ],
      mistakes: [
        'Hips sagging or piking up.',
        'Holding your breath.',
      ],
    },
    {
      id: 'co-dead-bug', name: 'Dead Bug',
      gear: 'Mat', icon: 'pushup',
      tags: ['core'], muscles: 'Deep core, hip flexors',
      video: 'dead bug exercise proper form',
      setup: [
        'Lie on your back, arms straight up, knees bent at 90° over your hips.',
        'Press your lower back into the floor.',
      ],
      execution: [
        'Slowly lower one arm overhead and the opposite leg toward the floor.',
        'Return and switch sides. Each side counts as one rep.',
      ],
      tips: [
        'The lower back never leaves the floor — if it does, shorten the reach.',
      ],
      mistakes: [
        'Rushing — this is a slow, controlled movement.',
        'Lower back arching off the floor.',
      ],
    },
    {
      id: 'co-cable-crunch', name: 'Kneeling Cable Crunch',
      gear: 'Cable tower + rope, high setting', icon: 'cable',
      tags: ['core'], muscles: 'Abs',
      video: 'kneeling cable crunch proper form',
      setup: [
        'Kneel facing the tower with the rope held either side of your head.',
      ],
      execution: [
        'Crunch your ribs down toward your hips, rounding the upper back.',
        'Return slowly to a tall kneel.',
      ],
      tips: [
        'The hands stay by your head the whole time — this is not a rope pulldown.',
      ],
      mistakes: [
        'Hinging at the hips instead of crunching the spine.',
        'Pulling with the arms.',
      ],
    },
    {
      id: 'co-hanging-knee', name: 'Hanging Knee Raise',
      gear: 'Pull-up bar or captain’s chair', icon: 'pullup',
      tags: ['core'], muscles: 'Lower abs, hip flexors',
      video: 'hanging knee raise proper form',
      setup: [
        'Hang from the bar (or rest your forearms in the captain’s chair), legs straight down.',
      ],
      execution: [
        'Curl your knees up toward your chest, tucking the pelvis at the top.',
        'Lower slowly without swinging.',
      ],
      tips: [
        'Pause at the top and tilt the hips up — that little curl is where the abs work.',
      ],
      mistakes: [
        'Swinging to build momentum.',
        'Dropping the legs fast.',
      ],
    },
    {
      id: 'co-mountain-climber', name: 'Mountain Climbers',
      gear: 'Mat', icon: 'pushup',
      tags: ['core', 'finisher'], muscles: 'Core, shoulders, heart rate',
      video: 'mountain climbers proper form',
      setup: [
        'Straight-arm plank, hands under shoulders, body in a straight line.',
      ],
      execution: [
        'Drive one knee toward your chest, then switch legs quickly. Each knee is one rep.',
      ],
      tips: [
        'Keep the hips level and low — no bouncing up and down.',
      ],
      mistakes: [
        'Hips piking up toward the ceiling.',
        'Shoulders drifting behind the hands.',
      ],
    },
    {
      id: 'co-bicycle', name: 'Bicycle Crunch',
      gear: 'Mat', icon: 'pushup',
      tags: ['core'], muscles: 'Abs, obliques',
      video: 'bicycle crunch proper form',
      setup: [
        'Lie on your back, hands lightly behind your head, knees up.',
      ],
      execution: [
        'Bring one elbow toward the opposite knee while extending the other leg, then switch.',
        'Each elbow-to-knee is one rep.',
      ],
      tips: [
        'Slow and twisting from the ribs beats fast pedalling.',
      ],
      mistakes: [
        'Yanking on your neck with your hands.',
        'Going so fast it becomes a leg exercise.',
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
    {
      id: 'ch-flat-db-press', name: 'Flat Dumbbell Press',
      gear: 'Flat bench + dumbbells', icon: 'dumbbell',
      tags: ['compound', 'press'], muscles: 'Chest, triceps, stabilisers',
      video: 'flat dumbbell bench press proper form',
      setup: [
        'Sit with dumbbells on your thighs; kick them up one at a time as you lie back.',
        'Start with dumbbells over your chest, palms forward, feet planted.',
      ],
      execution: [
        'Lower both dumbbells to the sides of your chest for a deeper stretch than a barbell allows.',
        'Press up and slightly together without clanging them at the top.',
      ],
      tips: [
        'No spotter needed — if you fail, just lower the dumbbells to your sides.',
      ],
      mistakes: [
        'Elbows flaring straight out at 90°.',
        'Dropping the dumbbells from the top instead of lowering them.',
      ],
    },
    {
      id: 'ch-smith-flat', name: 'Smith Machine Flat Press',
      gear: 'Smith machine + flat bench', icon: 'smith',
      tags: ['compound', 'press'], muscles: 'Chest, triceps',
      video: 'smith machine flat bench press proper form',
      setup: [
        'Centre a flat bench so the bar comes down to mid-chest.',
        'Grip slightly wider than shoulders; set the safety stops just below chest level.',
      ],
      execution: [
        'Lower the bar to your mid-chest, pause a beat, press to near-lockout.',
      ],
      tips: [
        'The fixed path is perfect for pushing close to failure safely on heavy weeks.',
      ],
      mistakes: [
        'Bench off-centre so the bar lands on your belly or throat — check with an empty bar.',
        'Bouncing the bar off the chest.',
      ],
    },
    {
      id: 'ch-low-cable-fly', name: 'Low-to-High Cable Fly',
      gear: 'Dual cable towers, handles at lowest setting', icon: 'cable',
      tags: ['isolation', 'fly', 'upper'], muscles: 'Upper chest',
      video: 'low to high cable fly proper form',
      setup: [
        'Set both pulleys to the lowest position, one handle in each hand.',
        'Step forward into a staggered stance, arms down-and-back, slight elbow bend.',
      ],
      execution: [
        'Sweep both hands up and together, finishing in front of your upper chest.',
        'Squeeze, then lower wide and back with control.',
      ],
      tips: [
        'The upward angle hits the upper chest that flat pressing misses — pairs perfectly with incline press weeks.',
      ],
      mistakes: [
        'Turning it into an upward press by bending the elbows.',
        'Standing square and wobbling — stagger the feet.',
      ],
    },
    {
      id: 'ch-flat-fly', name: 'Flat Dumbbell Fly',
      gear: 'Flat bench + light dumbbells', icon: 'dumbbell',
      tags: ['isolation', 'fly'], muscles: 'Chest (stretch focus)',
      video: 'flat dumbbell chest fly proper form',
      setup: [
        'Lie on a flat bench, dumbbells over your chest, palms facing each other, slight elbow bend.',
      ],
      execution: [
        'Open your arms in a wide arc until you feel a deep chest stretch.',
        'Sweep back up like hugging a barrel — the elbow angle never changes.',
      ],
      tips: [
        'Go much lighter than presses; the stretched bottom position is where it works and where it bites.',
      ],
      mistakes: [
        'Bending the elbows on the way up — that is a press, not a fly.',
        'Descending past a comfortable stretch and straining the shoulder.',
      ],
    },
    {
      id: 'ch-decline-pushup', name: 'Decline Push-Up',
      gear: 'Bodyweight + bench (feet elevated)', icon: 'pushup', equip: 'body',
      tags: ['compound', 'press', 'upper'], muscles: 'Upper chest, shoulders, triceps',
      video: 'decline push up proper form',
      setup: [
        'Feet on a bench or step, hands on the floor slightly wider than shoulders.',
      ],
      execution: [
        'Lower your chest toward the floor with elbows at ~45°, press back to straight arms.',
      ],
      tips: [
        'Feet up = the bodyweight incline press. Higher feet = harder.',
      ],
      mistakes: [
        'Letting the hips sag.',
        'Dropping the head first.',
      ],
    },
    {
      id: 'ch-diamond-pushup', name: 'Diamond Push-Up',
      gear: 'Bodyweight (floor)', icon: 'pushup', equip: 'body', also: ['arms'],
      tags: ['compound', 'press', 'triceps'], muscles: 'Triceps, inner chest',
      video: 'diamond push up proper form',
      setup: [
        'Hands together under your chest, thumbs and index fingers forming a diamond.',
      ],
      execution: [
        'Lower your chest to your hands with elbows tucked back, then press up hard.',
      ],
      tips: [
        'The heaviest bodyweight triceps exercise you can do — drop to the knees if needed and keep the form.',
      ],
      mistakes: [
        'Elbows flaring out.',
        'Hands too far forward of the chest.',
      ],
    },
    {
      id: 'ch-wide-pushup', name: 'Wide Push-Up',
      gear: 'Bodyweight (floor)', icon: 'pushup', equip: 'body',
      tags: ['isolation', 'fly'], muscles: 'Chest (outer)',
      video: 'wide grip push up proper form',
      setup: [
        'Hands about 1.5× shoulder width, fingers pointing slightly out.',
      ],
      execution: [
        'Lower until your chest is a fist from the floor, feeling the chest stretch, then press up.',
      ],
      tips: [
        'The bodyweight stand-in for a chest fly — wide hands, slow reps, big stretch.',
      ],
      mistakes: [
        'Going so wide the shoulders take over.',
        'Half reps.',
      ],
    },
    {
      id: 'ch-bar-dips', name: 'Parallel Bar Dips',
      gear: 'Dip bars (or two sturdy chairs)', icon: 'dip', equip: 'body', also: ['arms'],
      tags: ['compound', 'press', 'lower', 'triceps'], muscles: 'Lower chest, triceps',
      video: 'parallel bar dips proper form calisthenics',
      setup: [
        'Support yourself on straight arms between the bars, feet crossed behind you.',
      ],
      execution: [
        'Lower with a slight forward lean until your upper arms are parallel to the floor.',
        'Press back up without locking the elbows harshly.',
      ],
      tips: [
        'Lean forward for chest, stay upright for triceps.',
      ],
      mistakes: [
        'Dropping too deep with cold shoulders.',
        'Shrugging at the top.',
      ],
    },
    {
      id: 'ch-incline-pushup', name: 'Incline Push-Up',
      gear: 'Bodyweight + bench or bar (hands elevated)', icon: 'pushup', equip: 'body',
      tags: ['compound', 'press'], muscles: 'Chest, triceps',
      video: 'incline push up proper form',
      setup: [
        'Hands on a bench, bar or step, body in a straight line from head to heels.',
      ],
      execution: [
        'Lower your chest to the edge, elbows at ~45°, then press back up.',
      ],
      tips: [
        'The easiest push-up variation — perfect for high-rep pump sets and beginners. Lower the surface as you get stronger.',
      ],
      mistakes: [
        'Hips piking up.',
        'Hands too far apart.',
      ],
    },
    {
      id: 'ch-floor-press', name: 'Dumbbell Floor Press',
      gear: 'Dumbbells (no bench needed)', icon: 'dumbbell', equip: 'free',
      tags: ['compound', 'press'], muscles: 'Chest, triceps',
      video: 'dumbbell floor press proper form',
      setup: [
        'Lie on the floor, knees bent, dumbbells pressed over your chest.',
      ],
      execution: [
        'Lower until your upper arms touch the floor, pause, and press back up.',
      ],
      tips: [
        'No bench? This is your bench press — and it is kinder on the shoulders.',
      ],
      mistakes: [
        'Bouncing the elbows off the floor.',
      ],
    },
    {
      id: 'ch-plyo-pushup', name: 'Plyo (Clap) Push-Up',
      gear: 'Bodyweight (floor)', icon: 'pushup', equip: 'body',
      tags: ['compound', 'press'], muscles: 'Chest, triceps, front delts',
      video: 'plyometric clap push up tutorial',
      setup: [
        'Standard push-up position, hands just wider than shoulders, body rigid.',
      ],
      execution: [
        'Lower with control, then drive up as explosively as you can so the hands leave the floor — clap if you can.',
        'Land softly with slightly bent elbows and go straight into the next rep.',
      ],
      tips: [
        'Not there yet? Do it from the knees, or just push hard enough to get the hands an inch off the floor.',
      ],
      mistakes: [
        'Landing on locked elbows.',
        'Hips piking or sagging on landing.',
      ],
    },
    {
      id: 'ch-archer-pushup', name: 'Archer Push-Up',
      gear: 'Bodyweight (floor)', icon: 'pushup', equip: 'body',
      tags: ['compound', 'press'], muscles: 'Chest, triceps (one side at a time)',
      video: 'archer push up tutorial',
      setup: [
        'Hands set very wide, fingers pointing outward, body straight.',
      ],
      execution: [
        'Lower toward one hand, bending that elbow while the other arm stays straight and slides out to the side.',
        'Press back up through the working arm. Alternate sides each rep.',
      ],
      tips: [
        'Halfway to a one-arm push-up — the straight arm is only there for balance, so give it as little work as you can.',
      ],
      mistakes: [
        'Twisting the hips toward the working side.',
        'Bending the “straight” arm and turning it into a wide push-up.',
      ],
    },
    {
      id: 'ch-sliding-fly', name: 'Sliding Push-Up Fly',
      gear: 'Two towels or sliders on a smooth floor', icon: 'pushup', equip: 'body',
      tags: ['isolation', 'fly'], muscles: 'Chest (stretch focus)',
      video: 'slider push up fly',
      setup: [
        'Push-up position with a towel or slider under each hand on a smooth floor. From the knees is fine to start.',
      ],
      execution: [
        'Keep the arms nearly straight and slide the hands apart, lowering the chest toward the floor.',
        'Squeeze the chest to drag the hands back together. Small range first — it is much harder than it looks.',
      ],
      tips: [
        'This is the bodyweight cable fly: the further the hands travel, the harder it is.',
      ],
      mistakes: [
        'Letting the hips drop as the hands slide out.',
        'Bending the elbows and turning it into a wide push-up.',
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
    {
      id: 'ar-body-tricep-press', name: 'Bodyweight Triceps Extension',
      gear: 'Bar at hip-to-chest height (Smith bar, rack, or a sturdy table edge)', icon: 'pushup', equip: 'body',
      tags: ['triceps'], muscles: 'Triceps (long head)',
      video: 'bodyweight triceps extension on bar tutorial',
      setup: [
        'Grip the bar shoulder-width, step back so your body is a straight line leaning into it, arms straight.',
      ],
      execution: [
        'Keep the upper arms still and bend only the elbows so your head passes under the bar.',
        'Drive with the triceps back to straight arms. Lower bar = harder.',
      ],
      tips: [
        'Keep the elbows tucked in and squeeze your glutes so the body stays rigid.',
      ],
      mistakes: [
        'Bending at the hips or shoulders instead of the elbows.',
        'Letting the elbows flare out wide.',
      ],
    },
    {
      id: 'ar-triceps-dip', name: 'Triceps Dips (upright)',
      gear: 'Dip bars (or two sturdy chairs)', icon: 'dip', equip: 'body',
      tags: ['compound', 'triceps'], muscles: 'Triceps, front delts',
      video: 'triceps dips proper form upright torso',
      setup: [
        'Support yourself on the bars with straight arms, torso upright, legs straight down or slightly bent.',
      ],
      execution: [
        'Bend the elbows straight back and lower until the upper arms are about parallel to the floor.',
        'Press back up until the elbows lock — squeeze the triceps hard at the top.',
      ],
      tips: [
        'Staying upright with elbows back keeps this on the triceps; leaning forward turns it into the chest version.',
      ],
      mistakes: [
        'Dropping too deep with the shoulders rolled forward.',
        'Flaring the elbows out to the sides.',
      ],
    },
    {
      id: 'ar-negative-chinup', name: 'Negative Chin-Up',
      gear: 'Pull-up bar + box or jump', icon: 'pullup', equip: 'body',
      tags: ['compound', 'biceps'], muscles: 'Biceps, lats',
      video: 'negative chin up eccentric tutorial',
      setup: [
        'Jump or step up so your chin is over the bar, palms facing you, shoulder-width grip.',
      ],
      execution: [
        'Lower yourself as slowly as you can — aim for 4–6 seconds — until the arms are straight.',
        'Step back up and repeat. The slow lowering is the whole exercise.',
      ],
      tips: [
        'This is how you earn full chin-ups: the lowering phase builds strength fastest.',
      ],
      mistakes: [
        'Dropping quickly through the bottom half — that is where it counts.',
        'Swinging or kipping to get back up.',
      ],
    },
    {
      id: 'ar-chinup-hold', name: 'Chin-Up Hold',
      gear: 'Pull-up bar', icon: 'pullup', equip: 'body',
      tags: ['biceps'], muscles: 'Biceps (isometric), lats',
      video: 'chin up isometric hold flexed arm hang',
      setup: [
        'Palms facing you, pull (or jump) up until your elbows are bent to about 90°.',
      ],
      execution: [
        'Hold that position for the time shown (reps = seconds), elbows tight, shoulders down.',
        'Lower slowly and rest between holds.',
      ],
      tips: [
        'Three positions to rotate through: chin over bar, 90°, and just off straight — each burns differently.',
      ],
      mistakes: [
        'Letting the shoulders creep up to the ears.',
        'Holding your breath — keep breathing steadily.',
      ],
    },
    {
      id: 'ar-bw-curl', name: 'Bodyweight Curl',
      gear: 'Low bar at hip height (Smith bar, rack, rings, or a table edge)', icon: 'pullup', equip: 'body',
      tags: ['biceps'], muscles: 'Biceps',
      video: 'bodyweight bicep curl on bar tutorial',
      setup: [
        'Lie under the bar and grab it palms facing you, shoulder-width, body straight from head to heels.',
        'The more horizontal you are, the harder it is.',
      ],
      execution: [
        'Keep the upper arms pointing at the bar and bend only the elbows, curling your forehead up to your hands.',
        'Lower slowly to straight arms.',
      ],
      tips: [
        'Unlike an inverted row, the elbows stay in front of you — that keeps it on the biceps, not the back.',
      ],
      mistakes: [
        'Pulling the elbows back and rowing instead of curling.',
        'Hips sagging.',
      ],
    },
    {
      id: 'ar-concentration', name: 'Concentration Curl',
      gear: 'One dumbbell + bench', icon: 'dumbbell',
      tags: ['biceps'], muscles: 'Biceps (peak focus)',
      video: 'seated concentration curl proper form',
      setup: [
        'Sit on a bench, feet wide; brace your elbow against the inside of your thigh.',
        'Let the dumbbell hang at full arm extension.',
      ],
      execution: [
        'Curl the dumbbell to your shoulder without the elbow leaving your thigh.',
        'Lower slowly to a dead hang. All reps, then switch arms.',
      ],
      tips: [
        'The thigh brace removes every trace of cheating — the strictest curl there is.',
      ],
      mistakes: [
        'Leaning your torso back to finish reps.',
        'Letting the elbow slide off the thigh as you fatigue.',
      ],
    },
    {
      id: 'ar-spider-curl', name: 'Spider Curl',
      gear: 'Incline bench + dumbbells', icon: 'preacher',
      tags: ['biceps'], muscles: 'Biceps (short head, squeeze focus)',
      video: 'dumbbell spider curl proper form',
      setup: [
        'Lie chest-down on a 45° incline bench, arms hanging straight toward the floor.',
      ],
      execution: [
        'Curl both dumbbells up without moving your upper arms, squeeze hard at the top.',
        'Lower all the way to straight arms.',
      ],
      tips: [
        'The opposite of the incline curl: maximum tension at the squeeze instead of the stretch — your plan rotates both.',
      ],
      mistakes: [
        'Swinging the upper arms forward to lift more.',
        'Lifting the chest off the bench.',
      ],
    },
    {
      id: 'ar-cgbp', name: 'Close-Grip Bench Press',
      gear: 'Barbell + flat bench', icon: 'bench',
      tags: ['triceps'], muscles: 'Triceps, inner chest',
      video: 'close grip bench press proper form',
      setup: [
        'Lie on the bench and grip the bar at shoulder width — NOT hands-touching.',
        'Shoulder blades pinched, feet planted.',
      ],
      execution: [
        'Lower the bar to your lower chest with elbows tucked close to your sides.',
        'Press up, focusing on pushing through the triceps.',
      ],
      tips: [
        'The heaviest triceps exercise you can do — perfect for strength weeks.',
      ],
      mistakes: [
        'Gripping too narrow, which wrecks the wrists.',
        'Letting the elbows flare — that turns it back into a chest press.',
      ],
    },
    {
      id: 'ar-db-overhead', name: 'Single-Arm Overhead Dumbbell Extension',
      gear: 'One dumbbell', icon: 'dumbbell',
      tags: ['triceps'], muscles: 'Triceps (long head)',
      video: 'single arm overhead dumbbell tricep extension form',
      setup: [
        'Sit or stand tall holding one dumbbell straight overhead, elbow by your ear.',
      ],
      execution: [
        'Bend only the elbow to lower the dumbbell behind your head to a deep stretch.',
        'Extend back to straight. All reps, then switch arms.',
      ],
      tips: [
        'Support your working elbow with the free hand if it wanders.',
      ],
      mistakes: [
        'Elbow flaring out sideways as you lower.',
        'Arching the back instead of bracing the core.',
      ],
    },
    {
      id: 'ar-kickback', name: 'Triceps Kickback',
      gear: 'Dumbbells + bench (or cable, low setting)', icon: 'dumbbell',
      tags: ['triceps'], muscles: 'Triceps (peak contraction)',
      video: 'dumbbell tricep kickback proper form',
      setup: [
        'Hinge forward with one hand braced on a bench, back flat.',
        'Hold a light dumbbell with your upper arm pinned parallel to the floor.',
      ],
      execution: [
        'Extend the forearm straight back until the arm is fully locked out — squeeze one second.',
        'Return to 90° without dropping the upper arm.',
      ],
      tips: [
        'Featherweight and strict — the lockout squeeze is the entire point.',
      ],
      mistakes: [
        'Upper arm dropping and swinging on every rep.',
        'Going heavy and shortening the lockout.',
      ],
    },
    {
      id: 'ar-db-curl', name: 'Standing Dumbbell Curl',
      gear: 'Dumbbells', icon: 'dumbbell', equip: 'free',
      tags: ['biceps'], muscles: 'Biceps',
      video: 'standing dumbbell bicep curl proper form',
      setup: [
        'Stand tall, a dumbbell in each hand, palms forward, elbows at your sides.',
      ],
      execution: [
        'Curl both dumbbells to shoulder height without moving the elbows, squeeze, lower slowly.',
      ],
      tips: [
        'Alternate arms if you want to go heavier with strict form.',
      ],
      mistakes: [
        'Swinging the torso.',
        'Elbows drifting forward.',
      ],
    },
    {
      id: 'ar-db-skull', name: 'Lying Dumbbell Triceps Extension',
      gear: 'Dumbbells + bench (or floor)', icon: 'dumbbell', equip: 'free',
      tags: ['triceps'], muscles: 'Triceps',
      video: 'lying dumbbell triceps extension proper form',
      setup: [
        'Lie back holding dumbbells over your chest, palms facing each other.',
      ],
      execution: [
        'Bend only the elbows to lower the dumbbells beside your ears, then extend back up.',
      ],
      tips: [
        'The dumbbell skull crusher — upper arms stay vertical the whole time.',
      ],
      mistakes: [
        'Upper arms drifting toward the hips.',
        'Going too heavy and flaring the elbows.',
      ],
    },
  ],
};

/* Which of the three equipment profiles an exercise needs. Explicit `equip`
 * on the exercise wins; otherwise it is inferred from the gear description. */
function equipOf(ex) {
  if (ex.equip) return ex.equip;
  const g = ex.gear;
  if (/machine|cable|smith|pulley|leverage|station|tower|stack|extension bench/i.test(g)) return 'machine';
  if (/dumbbell|barbell|kettlebell|ez[ -]|plate/i.test(g)) return 'free';
  return 'body';
}

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
