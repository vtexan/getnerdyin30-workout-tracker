# GetNerdyIn30 Workout Tracker — Wiki

## Architecture

### Build System
The app uses **Vite** with React 18. Migrated from single-file in-browser Babel transpilation in March 2026.

- Output is pinned to `dist/assets/app.js` (no content hash) via `vite.config.js`
- This means the WordPress embed script tag never needs updating after deploys
- Firebase v8 compat SDK is loaded via CDN `<script>` tags (not npm) — required for the cross-origin WordPress embed

### Two Access Points
| URL | How it works |
|---|---|
| `getnerdyin30-tracker.web.app` | Direct Firebase Hosting |
| `getnerdyin30.com/workout-tracker` | WordPress HTML block loading the Vite bundle via script tag |

### Deploy Workflow
```bash
cd ~/gn30-tracker
npm run build           # outputs to dist/assets/app.js
git add -A
git commit -m "message"
git push
firebase deploy --only hosting
```

---

## Component Architecture

As of v0.16.5 the codebase is split into 45 modules:

```
WorkoutTracker.jsx          Router + shared helpers (~900 lines)
context/WorkoutContext.jsx  All shared state + useWorkout() hook
hooks/useTheme.js           T (design tokens) + S (style objects) from theme

components/
  Build.jsx                 Exercise picker / start workout
  Progress.jsx              Weight history charts
  PRBoard.jsx               Personal records board
  History.jsx               Workout logs, trash/restore
  Library.jsx               Exercise CRUD, shared library
  BuildTemplate.jsx         Template builder
  Dashboard.jsx             Calendar, planned workouts, template editor, plan editor
  ActiveWorkout.jsx         Active workout view — exercise cards, finish/discard
  cards/
    StrengthCard.jsx        Strength exercise card (warmup + working sets)
    CardioCard.jsx          Cardio exercise card
    CarryCard.jsx           Carry exercise card (weight + laps)
    TabataCard.jsx          Tabata exercise card (round-based)
```

### State Management
All shared state lives in `WorkoutContext.jsx` (~40 useState calls). Components pull what they need via `useWorkout()`. Local-only state (like UI toggles that don't need to be shared) can live in individual components.

### Theme System
`useTheme.js` exports `T` (design tokens like colors and backgrounds), `S` (pre-built style objects like `S.card`, `S.btn`, `S.input`), and `dark` (boolean). All components call `useTheme()` — no style props passed down.

---

## Data Model

All user data lives in a single Firestore document:

```
users/{uid}/data/workouts
{
  workoutLogs: [...],        // completed workout history
  plannedWorkouts: [...],    // future planned sessions
  templates: [...],          // saved workout templates
  customExercises: [...],    // user-added exercises
  videoOverrides: {},        // { exerciseId: url } custom video links
  recentlyDeleted: [...],    // soft-deleted items (30-day retention)
  dismissedHints: {},        // UI hint dismissal state
  activeWorkoutDraft: {...}  // in-progress workout (auto-saved)
}
```

### Workout Log Entry
```javascript
{
  date: "2026-03-25T12:00:00.000Z",
  name: "Posterior Chain + Back",
  location: "Tom Muehlenbeck",
  warmupNotes: "Leg swings, TRX squat & row",
  cooldownNotes: "Foam roll hamstrings",
  exercises: [
    {
      exerciseId: "rdl",
      name: "Dumbbell Romanian Deadlift",
      category: "posterior",
      warmupWeight: 15,
      workingWeight: 30,
      warmupSets: [{ reps: 6, completed: true }],
      workingSets: [
        { reps: 10, completed: true, weight: 30 },
        { reps: 10, completed: true, weight: 30 },
        { reps: 9,  completed: true, weight: 35 },  // BUMPED
      ],
      notes: "Felt strong",
      pr: 35,
    }
  ]
}
```

### Exercise Types
| Flag | Card Type | Fields |
|---|---|---|
| `isCardio: true` | CardioCard | duration, distance, calories, avgHeartRate |
| `isCarry: true` | CarryCard | sets[].weight, sets[].laps, sets[].distance |
| `isTabata: true` | TabataCard | rounds[].completed |
| (default) | StrengthCard | warmupSets, workingSets, warmupWeight, workingWeight |

---

## Exercise Categories

| Category key | Display label | Primary joint / movement |
|---|---|---|
| `posterior` | Posterior | Hip hinge (RDL, KB swing) |
| `back` | Back | Scapular retraction or lat pull |
| `arms` | Arms | Elbow is primary joint |
| `legs` | Legs | Knee dominant (squat, leg press) |
| `core` | Core | Trunk stability / anti-rotation |
| `cardio` | Cardio | Continuous output |
| `carry` | Carry | Loaded carry |
| `tabata` | Tabata | Interval training |
| `mobility` | Mobility | Range of motion / flexibility |

**Category rule:** Arms = elbow is the primary joint and the arm is the prime mover. Back = shoulder blade retracting or lats driving the pull.

---

## Known Bugs

| ID | Description | Status |
|---|---|---|
| BUG-005 | Template/plan weight field visibility | Open |
| BUG-006 | Custom exercise category editing | Open |

Fixed bugs: BUG-001 (weight propagation), BUG-002/003 (template preview), BUG-004 (template editing), BUG-007 (duplicate calendar entries on plan edit).

---

## Firebase Setup

- **Project:** `getnerdyin30-tracker`
- **Auth:** Google Sign-In only
- **Authorized domains:** `getnerdyin30-tracker.web.app`, `getnerdyin30.com`
- **Firestore rules:** Each user can only read/write their own `users/{uid}` document. Shared exercise library at `shared/exercises/library/{id}` is readable by all authenticated users.
- **Console:** [console.firebase.google.com](https://console.firebase.google.com) → project `getnerdyin30-tracker`

---

## Planned Features

### Coach Mode (next major feature)
Spec: `coach-mode-spec.md` in project files.

Trainer/client relationship where a coach (Daniel) can:
- View client workout logs, PRs, volume trends, adherence
- Leave notes on individual sessions
- Program future workouts onto the client's calendar

Build phases: Foundation → Coach Read Dashboard → Coach Notes → Workout Programming.

**Prerequisites:** Component refactor complete ✅, Firestore security rules update (pending).

### Demo / Guest Mode
Spec: `demo-mode-spec.md` in project files.

"Try Demo" button on login screen, pre-built sample data, no-op persist(). Build after Coach Mode or as a standalone small project.

### Other Backlog
- Rest timer (between-set countdown)
- Tabata timer (in-workout 20s/10s interval)
- PWA support (service worker + manifest)
- Leaderboard (opt-in shared PR board)

---

## Development Notes

### Pre-Deploy Check
Always run `npm run build` before deploying to catch syntax errors. Vite will surface any JSX or import issues.

### Babel Parse Errors (historical)
Before the Vite migration, the app used in-browser Babel. Silent parse errors were a major footgun — errors only surfaced at runtime. Vite build-time checking eliminated this class of bug.

### State Timing Bugs
When async flows clear state before downstream code reads it, pass values directly as parameters and build objects locally before any state clear. Example: `startPlannedWorkout` receives the plan's date as a parameter rather than reading `workoutDate` state.

### Firebase Auth Domain Isolation
`getnerdyin30.com` and `getnerdyin30-tracker.web.app` are treated as different origins. Both must be listed as authorized domains in Firebase Console → Authentication → Settings.

### Raw GitHub URLs
GitHub raw file URLs are inaccessible from Claude's environment regardless of repo visibility (Anthropic network policy). Always upload `WorkoutTracker.jsx` directly to the chat when working on it.
