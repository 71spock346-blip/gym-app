/* Stay Strong — curated form videos, one per exercise.
 * Each ▶ Video button deep-links to its exact YouTube video, so a video
 * downloaded in the YouTube app (YouTube Premium) plays with no signal.
 * NASM = National Academy of Sports Medicine's official technique series. */

const FORM_VIDEOS = {
  /* shoulders */
  'sh-press-machine':    { id: 'BAZkFGeUy5U', title: 'Shoulder Press Machine — tutorial for gym beginners' },
  'sh-db-press':         { id: 'qEwKCR5JCog', title: 'How To: Dumbbell Shoulder Press' },
  'sh-smith-press':      { id: 'flnw6LPN5oM', title: 'Smith Machine Overhead Press — how to' },
  'sh-lat-raise-machine':{ id: 'IropE3iOk2c', title: 'Machine Lateral Raise — proper form' },
  'sh-db-lat-raise':     { id: 'XPPfnSEATJA', title: 'Dumbbell Lateral Raise (NASM)' },
  'sh-cable-lat-raise':  { id: 'zpbm-xRHB6k', title: 'Cable Lateral Raise — proper form' },
  'sh-reverse-pec-deck': { id: 'v0rJuhEa59c', title: 'Reverse Pec Deck Fly — proper form' },
  'sh-face-pull':        { id: 'eTCBSFlCJ_s', title: 'Face Pull (NASM)' },
  'sh-front-raise':      { id: '-t7fuZ0KhDA', title: 'How To: Dumbbell Front Raise' },
  'sh-arnold-press':     { id: 'EyqMRSyfV0M', title: 'How To: Arnold Press' },
  'sh-bb-press':         { id: 'bMksDb5a3P0', title: 'Standing Barbell Overhead Press — form & safety' },
  'sh-lean-raise':       { id: 'qWif_7SOYpQ', title: 'Leaning Lateral Raise — tutorial' },
  'sh-cross-cable-rear': { id: 'ywMSCem375A', title: 'Cross Cable Rear Delt Fly — form tutorial' },
  'sh-plate-raise':      { id: 'HN8HYJTOl8c', title: 'How To Do Front Plate Raises' },

  /* back */
  'bk-lat-pulldown':     { id: 'CAwf7n6Luuc', title: 'How To: Lat Pulldown — 3 golden rules' },
  'bk-seated-row':       { id: '0R9ZQd3aM6s', title: 'How to do a Seated Row (NASM)' },
  'bk-assisted-pullup':  { id: 'fnHeovkmkkk', title: 'Assisted Pull-Up Machine — form, setup & safety' },
  'bk-chest-row':        { id: 'yFo-EFYzf1s', title: 'Chest Supported Row Machine — good form' },
  'bk-db-row':           { id: 'pYcpY20QaE8', title: 'How To: Single-Arm Dumbbell Row' },
  'bk-straight-arm':     { id: 'WDOV2PDpkiU', title: 'Straight Arm Pulldown — actually feel your lats' },
  'bk-tbar-row':         { id: 'BbBR3v2UShw', title: 'Standing T-Bar Row — proper form' },
  'bk-back-ext':         { id: 'cFNs7A3_oeI', title: 'How To Do 45 Degree Back Extensions' },
  'bk-shrug':            { id: 'cJRVVxmytaM', title: 'How To: Dumbbell Shrugs' },
  'bk-close-pulldown':   { id: 'mUoo2l-p8Hw', title: 'Close Grip Lat Pulldown — technique & tips' },
  'bk-machine-highrow':  { id: 'beKbbq6NhWY', title: 'Machine High Row (Hammer Strength) — guide' },
  'bk-single-cable-row': { id: 'CrylzZHfO1c', title: 'Single Arm Seated Cable Row — how to' },
  'bk-bb-row':           { id: 'Lf4LUL3FeUM', title: 'Barbell Bent-Over Row — form, cues & mistakes' },

  /* legs */
  'lg-leg-press':        { id: 'cDGOn-yfKJA', title: 'How to do a Leg Press (NASM)' },
  'lg-hack-squat':       { id: '-lAnEGH2blE', title: 'How to Do the Hack Squat' },
  'lg-smith-squat':      { id: 'AHnX-aimA4E', title: 'How To: Smith Machine Squat' },
  'lg-leg-ext':          { id: '4zOky6-n78I', title: 'Leg Extension — proper form' },
  'lg-leg-curl':         { id: '14OrOWlM5QU', title: 'Seated Leg Curl — proper form' },
  'lg-rdl':              { id: 'aa57T45iFSE', title: 'Dumbbell Romanian Deadlift (NASM)' },
  'lg-lunges':           { id: 'I34ysEkPK7w', title: 'Dumbbell Walking Lunge — how to' },
  'lg-seated-calf':      { id: 'I1uQtobaNRQ', title: 'Seated Calf Raise — proper form' },
  'lg-standing-calf':    { id: '4HQ8Am9IuME', title: 'Standing Calf Raise — proper form' },
  'lg-adductor':         { id: 'ScqpbvOZWe8', title: 'Hip Adduction Machine — how to' },
  'lg-goblet-squat':     { id: 'nfX7IFK9UNI', title: 'Goblet Squat (NASM)' },
  'lg-bulgarian':        { id: 'hbw7hdyOpq0', title: 'Bulgarian Split Squat (NASM)' },
  'lg-hip-thrust':       { id: 'eutQE64svRE', title: 'Barbell Hip Thrust — step by step' },
  'lg-lying-curl':       { id: 'lUH80pneL5w', title: 'Lying Leg Curl (NASM)' },
  'lg-legpress-calf':    { id: '8k435cj30gc', title: 'Leg Press Calf Raise (NASM)' },

  /* chest */
  'ch-press-machine':    { id: 'sqNwDkUU_Ps', title: 'How To Use The Chest Press Machine' },
  'ch-bench-press':      { id: 'CayG6UYqL8g', title: 'Barbell Bench Press (NASM)' },
  'ch-incline-db':       { id: 'JKnpHchOWPU', title: 'Incline Dumbbell Chest Press (NASM)' },
  'ch-smith-incline':    { id: 'b8DqTO6ak0k', title: 'How To: Smith Machine Incline Bench Press' },
  'ch-pec-deck':         { id: 'hZ0CGRaKwbQ', title: 'Pec Deck / Chest Fly — how to' },
  'ch-cable-cross':      { id: 'XY6JrX1wyxk', title: 'Cable Crossover (NASM)' },
  'ch-dips':             { id: 'kbmVlw-i0Vs', title: 'Assisted Dips — exercise tutorial' },
  'ch-pushup':           { id: 'WDIpL0pjun0', title: 'Push-Up (NASM)' },
  'ch-flat-db-press':    { id: 'Y_7aHqXeCfQ', title: 'How To: Dumbbell Bench Press — 3 golden rules' },
  'ch-smith-flat':       { id: 'z_r6hDOYtO0', title: 'How To: Smith Machine Bench Press' },
  'ch-low-cable-fly':    { id: 'eQ_NBB6OBH4', title: 'Low-To-High Cable Fly — perfect form' },
  'ch-flat-fly':         { id: 'eozdVDA78K0', title: 'How To: Dumbbell Flys On A Flat Bench' },

  /* arms */
  'ar-ez-curl':          { id: '5NsFLGUf0Fo', title: 'EZ Bar Curl — perfect form' },
  'ar-preacher':         { id: 'to3m8zws1n8', title: 'Machine Preacher Curl — how to' },
  'ar-hammer':           { id: 'zC3nLlEvin4', title: 'How To: Dumbbell Hammer Curl' },
  'ar-cable-curl':       { id: 'VY4walmoM-I', title: 'Cable Hammer Curls — tutorial' },
  'ar-incline-curl':     { id: '1gCfaEWk_Ds', title: 'Incline Dumbbell Curl — form tutorial' },
  'ar-pushdown':         { id: 'qHDrQglWgS4', title: 'Cable Rope Pushdown — tutorial' },
  'ar-overhead-ext':     { id: '8WC7rIOkhi0', title: 'Cable Overhead Tricep Extension — how to' },
  'ar-dip-machine':      { id: 'snKz3KZw6GA', title: 'Tricep Dip Machine — proper form' },
  'ar-skull':            { id: 'GaK2da6B2zM', title: 'EZ Bar Skull Crushers — how to' },
  'ar-bench-dip':        { id: 'WVeZDBhZwLA', title: 'Bench Dip (NASM)' },
  'ar-concentration':    { id: 'Jvj2wV0vOYU', title: 'How To: Dumbbell Concentration Curl' },
  'ar-spider-curl':      { id: 'OK6vpxXZ2pk', title: 'How To: Prone Incline Curl (Spider Curl)' },
  'ar-cgbp':             { id: 'LJeqLAmJLfs', title: 'Close Grip Bench Press — proper form' },
  'ar-db-overhead':      { id: 'kZ-ReOdn2qk', title: 'Seated Single-Arm Dumbbell Tricep Extension' },
  'ar-kickback':         { id: '6SS6K3lAwZ8', title: 'How To: Tricep Kickback (Dumbbell)' },

  /* glutes */
  'lg-cable-kickback':   { id: 'bVrmtCI00Ys', title: 'Cable Kickback (Glute Max) — form tutorial' },
  'lg-abductor':         { id: 'soaTR1UtEw0', title: 'Hip Abductor Machine — how to' },
  'lg-step-up':          { id: 'tqECKZxlCKE', title: 'Dumbbell Step-Ups — master proper form' },
  'lg-sumo-squat':       { id: 'YYpq4fkl308', title: 'Dumbbell Sumo Squat — perfect form' },

  /* core */
  'co-plank':            { id: 'mwlp75MS6Rg', title: 'Plank (NASM)' },
  'co-dead-bug':         { id: 'bxn9FBrt4-A', title: 'Dead Bug (NASM)' },
  'co-cable-crunch':     { id: '0KEP6A1deBE', title: 'Kneeling Cable Crunch — tutorial' },
  'co-hanging-knee':     { id: 'G6a5267YpHM', title: 'Hanging Knee Raise — proper form' },
  'co-mountain-climber': { id: 'BhERlhtzQ1s', title: 'Mountain Climbers — proper form' },
  'co-bicycle':          { id: 'Mwo0pNv5EG8', title: 'Bicycle Crunch — NASM CPT' },
};
