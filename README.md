# GetNerdyIn30 — Workout Tracker

A personal workout tracking web app built to digitize and log gym programming handed off by a personal trainer via PDF. Built with curiosity and vibe coding — no formal CS background, just a real problem and the tools to solve it.

**Live:** [getnerdyin30-tracker.web.app](https://getnerdyin30-tracker.web.app) · [getnerdyin30.com/workout-tracker](https://getnerdyin30.com/workout-tracker)

---

## What It Does

- **Log workouts** with warmup and working sets, per-set weight tracking, and automatic PR detection
- **Plan ahead** — build workouts for specific dates on a calendar, with target weights pre-loaded
- **Templates** — save recurring routines, edit them, and launch with one tap
- **Exercise library** — built-in exercises plus custom and community-shared exercises
- **Progress tracking** — weight history charts and a personal records board
- **History** — full log of every workout, with export/share and soft delete (trash system)
- **Multi-user** — per-user data via Firebase Auth (Google Sign-In)

### Exercise Categories
- **Strength** — warmup sets + working sets with per-set weight tracking
- **Cardio** — duration, distance, calories, avg heart rate
- **Carry** — weight + laps + optional distance (Farmer Carry, Suitcase Carry, etc.)
- **Tabata** — round-based tracking (20s on / 10s off)
- **Posterior, Back, Arms, Legs, Core, Mobility** — all tracked as strength

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite build) |
| Auth | Firebase Auth (Google Sign-In) |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting |
| WordPress embed | CDN script tag loading Vite bundle |
| Styling | Inline styles with theme system (dark/light) |

---

## Project Structure

```
src/
├── App.jsx                    # Auth shell, wraps WorkoutTracker in WorkoutProvider
├── WorkoutTracker.jsx          # Router + shared helpers (~900 lines)
├── firebase.js                # Firebase config + Firestore helpers
├── constants.js               # DEFAULT_EXERCISES, CATEGORY_COLORS, CHANGELOG, softDelete
├── utils.js                   # getPR, getLastWorkingWeight, formatDate, etc.
├── icons.jsx                  # All SVG icon components
├── context/
│   └── WorkoutContext.jsx     # All shared state (~40 useState), useWorkout() hook
├── hooks/
│   └── useTheme.js            # Computes T (tokens) and S (styles) from theme
└── components/
    ├── Build.jsx              # Exercise picker / start workout
    ├── Progress.jsx           # Weight history charts
    ├── PRBoard.jsx            # Personal records board
    ├── History.jsx            # Workout logs, trash, restore
    ├── Library.jsx            # Exercise CRUD, shared library
    ├── BuildTemplate.jsx      # Template builder
    ├── Dashboard.jsx          # Calendar, planned workouts, template editor, plan editor
    ├── ActiveWorkout.jsx      # Active workout view, exercise cards, finish/discard
    └── cards/
        ├── StrengthCard.jsx
        ├── CardioCard.jsx
        ├── CarryCard.jsx
        └── TabataCard.jsx
```

---

## Version History

| Version | What shipped |
|---|---|
| v0.16.5 | Bug fixes from v0.16.3 refactor — render function scoping, exInfo parameter threading, date race condition fix |
| v0.16.3–4 | Refactor: extract exercise card render functions |
| v0.16.1 | Mid-workout exercise reordering (up/down arrows on all card types) |
| v0.16 | Tabata exercise category (round-based tracking) · Carry exercise category (weight + laps + distance) |
| v0.15 | Soft delete / trash system · safe navigation · smarter discard · BUG-007 fix |
| v0.14 | Planned workouts (calendar) · date picker · backdated entries |
| v0.13 | Exercise swap (same-muscle alternatives mid-workout) |
| v0.12 | Per-set weight overrides · BUMPED indicator |
| v0.11 | Workout templates · template editor |
| v0.10 | Progress charts · PR board overhaul |
| v0.9 | Workout history · export/share |
| v0.8 | Multi-user auth (Firebase) |
| v0.7 | Custom exercises · shared library |
| Earlier | Single-file Babel app → iterative feature additions |

**Current version: v0.16.5** · Migrated to Vite + component architecture in March 2026

---

## Architecture Notes

**Vite build** — migrated from single-file in-browser Babel transpilation to a proper Vite build pipeline in March 2026. Output is pinned to `dist/assets/app.js` (no content hash) so the WordPress embed script tag never needs updating.

**Firebase v8 compat** — loaded via CDN `<script>` tags in `index.html` (not npm). Required for the WordPress cross-origin embed to work.

**WordPress embed** — `getnerdyin30.com/workout-tracker` loads the Firebase CDN scripts and the Vite bundle via a single HTML block. The `<div id="root">` is in the same block.

**Per-user data model** — all workout data lives at `users/{uid}/data/workouts` in Firestore. One document per user.

**Exercise category design rule** — Arms = elbow is the primary joint, arm doing the work. Back = shoulder blade retracting or lats pulling.

---

## Local Development

```bash
git clone https://github.com/vtexan/getnerdyin30-workout-tracker
cd getnerdyin30-workout-tracker
npm install
npm run dev
```

### Deploy

```bash
npm run build
firebase deploy --only hosting
```

Local repo path: `~/gn30-tracker`

---

## Open Bugs

| ID | Description |
|---|---|
| BUG-005 | Template/plan weight field visibility |
| BUG-006 | Custom exercise category editing |

---

## Planned Features

- **Coach Mode** — trainer/client relationship, coach dashboard, session notes, workout programming
- **Demo / Guest Mode** — "Try Demo" button on login, pre-built sample data, no-op persist
- **Rest timer** — between-set countdown
- **Tabata timer** — in-workout 20s/10s interval timer
- **PWA support** — service worker + manifest for install-to-home-screen
- **Leaderboard** — opt-in shared PR board

---

*Built by Tommy Trogden · [GetNerdyIn30.com](https://getnerdyin30.com)*
