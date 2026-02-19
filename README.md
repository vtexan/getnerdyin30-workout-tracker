# 🏋️ GetNerdyIn30 Workout Tracker

A full-featured workout tracking web app built with React and Firebase. Track strength training, cardio, plan workouts, manage templates, and sync across devices.

**Live:** [getnerdyin30.com/workout-tracker](https://getnerdyin30.com/workout-tracker/)

## Features

- **Workout Tracking** — warmup/working sets, per-set weight tracking, rep counting, exercise notes
- **Progression Engine** — auto-suggests 5% weight increases, tracks PRs, shows last-used weights
- **Planned Workouts** — schedule workouts on specific dates with pre-set weights for light/heavy days
- **Templates** — save and reuse recurring routines with warmup/cooldown notes
- **Exercise Swap** — machine taken? Tap swap to see alternatives targeting the same muscle group
- **Cardio** — duration, distance, calories, heart rate tracking
- **Calendar** — visual history with workout dots, tap any day to review or plan
- **Auto-Save** — active workouts continuously save to the cloud, survives crashes and reloads
- **Offline Mode** — loads instantly from local cache via Firestore persistence, syncs when connected
- **Export/Share** — copy workout summaries to clipboard or share natively
- **Community Library** — shared exercise library across users
- **Dark/Light Mode** — theme preference saved to cloud

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 (browser-transpiled JSX via Babel) |
| Auth | Firebase Authentication (Google Sign-In) |
| Database | Cloud Firestore |
| Offline | Firestore offline persistence (IndexedDB) |
| Hosting | Firebase Hosting (CDN) + WordPress (loader) |
| Font | JetBrains Mono |
| Deployment | `firebase deploy` from CLI |

## Architecture

```
┌─────────────────────────────────────────┐
│  getnerdyin30.com/workout-tracker/      │
│  (WordPress + Elementor)                │
│                                         │
│  9-line loader:                         │
│    <div id="workout-root">              │
│    <script src="...app.jsx">            │
│                                         │
│  Loads scripts from Firebase Hosting ↓  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  getnerdyin30-tracker.web.app           │
│  (Firebase Hosting CDN)                 │
│                                         │
│  public/                                │
│  ├── app.jsx      ← React app + logic  │
│  ├── styles.css   ← base styles        │
│  └── index.html   ← standalone version │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  Cloud Firestore                        │
│                                         │
│  users/{uid}/data/workouts              │
│    ├── workoutLogs[]                    │
│    ├── templates[]                      │
│    ├── plannedWorkouts[]                │
│    └── customExercises[]                │
│                                         │
│  users/{uid}/data/activeDraft           │
│    └── in-progress workout auto-save    │
│                                         │
│  sharedExercises/{id}                   │
│    └── community exercise library       │
└─────────────────────────────────────────┘
```

WordPress serves a lightweight loader that pulls the app from Firebase Hosting. The app code runs directly on `getnerdyin30.com` (not in an iframe), so Firebase Auth works seamlessly across all browsers including mobile Safari. Firebase Hosting serves the static assets via CDN with CORS headers enabled.

## Development

```bash
# Test locally (standalone version)
cd public
python3 -m http.server 8888
# Open http://localhost:8888

# Deploy
git add .
git commit -m "v0.11 — description of changes"
git push
firebase deploy --only hosting
```

## Project Structure

```
gn30-tracker/
├── public/
│   ├── app.jsx         ← all React components, Firebase logic, icons
│   ├── styles.css      ← base styles + font import
│   └── index.html      ← standalone version (also serves as Firebase default)
├── firebase.json       ← hosting config with CORS headers
├── .firebaserc         ← Firebase project link
├── CHANGELOG.md        ← full version history
└── README.md
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for full version history.

## Background

Built as a real-world project to track workouts with a personal trainer. Started as a static HTML workout plan and evolved into a full React + Firebase app with cloud sync, offline support, and multi-user features — all built iteratively with AI pair programming.

Read the build story at [getnerdyin30.com](https://getnerdyin30.com).

---

*Current version: v0.11*
