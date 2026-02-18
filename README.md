# 🏋️ GetNerdyIn30 Workout Tracker

A full-featured workout tracking web app built with React and Firebase. Track strength training, cardio, plan workouts, manage templates, and sync across devices.

**Live:** [getnerdyin30.com/workout-tracker](https://getnerdyin30.com/workout-tracker/)

## Features

- **Workout Tracking** — warmup/working sets, per-set weight tracking, rep counting, exercise notes
- **Progression Engine** — auto-suggests 5% weight increases, tracks PRs, shows last-used weights
- **Planned Workouts** — schedule workouts on specific dates with pre-set weights for light/heavy days
- **Templates** — save and reuse recurring routines with warmup/cooldown notes
- **Exercise Swap** — machine taken? Tap swap to see alternatives targeting the same muscle
- **Cardio** — duration, distance, calories, heart rate tracking
- **Calendar** — visual history with workout dots, tap any day to review or plan
- **Auto-Save** — active workouts continuously save to the cloud, survives crashes and reloads
- **Offline Mode** — loads instantly from local cache, syncs when connected
- **Export/Share** — copy workout summaries to clipboard or share natively
- **Community Library** — shared exercise library across users
- **Dark/Light Mode** — theme preference saved to cloud

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 (browser-transpiled JSX) |
| Auth | Firebase Authentication (Google Sign-In) |
| Database | Cloud Firestore |
| Offline | Firestore offline persistence (IndexedDB) |
| Hosting | Firebase Hosting + WordPress (Elementor iframe) |
| Font | JetBrains Mono |
| Deployment | GitHub Actions → Firebase Hosting |

## Architecture

The entire app is a single self-contained HTML file (~3,500 lines). No build step, no bundler, no package.json. React, Firebase SDK, and Babel are loaded from CDNs. This keeps deployment dead simple — push to GitHub, auto-deploys to Firebase Hosting.

## Development

```bash
# Test locally
cd public
python3 -m http.server 8888
# Open http://localhost:8888

# Deploy (automatic on push to main)
git add .
git commit -m "v0.10 — description of changes"
git push
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for full version history.

## Background

Built as a real-world project to track workouts with a personal trainer. Started as a static HTML workout plan and evolved into a full React app with cloud sync — all built iteratively with AI pair programming.

Read the build story at [getnerdyin30.com](https://getnerdyin30.com).

---

*Current version: v0.10*
