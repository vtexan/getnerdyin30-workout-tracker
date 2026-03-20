# 🏋️ GetNerdyIn30 Workout Tracker

> *"I didn't build an app because I knew how to code. I built it because nothing out there did what I actually needed — and I was curious enough to figure it out as I went."*

**Live app:** [getnerdyin30-tracker.web.app](https://getnerdyin30-tracker.web.app)  
**Embedded:** [getnerdyin30.com/workout-tracker](https://getnerdyin30.com/workout-tracker)

---

## The Origin

In early 2026, I hired a personal trainer. She's good — programs in cycles, builds on movement patterns, tracks progression week over week. But she hands everything off in PDFs. There's no shared dashboard, no app we're both looking at, no place where my numbers actually live.

I looked around. Every workout app I tried was either built for elite athletes logging one-rep maxes, or a generic "log your reps" grid that felt like filling out a spreadsheet. None of them matched how I actually train.

So I built one that does.

This started as a static HTML workout plan and became a full-stack multi-user web app. Not because I had a roadmap. Because I had a problem and kept asking *"what would it take to fix this?"*

---

## Features

### 🗓️ Workout Planning & Logging
- Plan workouts ahead of time on a calendar
- Start a planned workout and log sets in real time
- Add, remove, and reorder exercises mid-workout
- Swap exercises on the fly (machine taken? no problem)

### 💪 Exercise Categories
Five distinct exercise types, each with purpose-built logging:
- **Strength** — warmup sets + working sets with per-set weight tracking
- **Carry** — weight, laps, and optional distance per set (Farmer Carry, Suitcase Carry, etc.)
- **Tabata** — round-based tracking (20s on / 10s off)
- **Cardio** — duration, distance, calories, heart rate
- **Core** — reps-based with optional weight

### 📈 Progress Tracking
- Per-exercise weight history with visual bar charts
- PR board — best weight ever logged for every exercise
  - First-time logs flagged as **FIRST LOG** (because that *is* a PR)
  - No-weight exercises (Tabata) shown with `—`
  - Gold / silver / bronze medals for top 3 weighted PRs
- In-workout **NEW PR!** detection when you beat a previous best

### 📚 Exercise Library
- Built-in library with form video links (muscleandstrength.com)
- Add custom exercises with name, category, muscle group, and video URL
- Shared community library — contribute exercises other users can access

### 🗂️ Templates & History
- Save workouts as reusable templates
- Full workout history with set-by-set detail
- Soft delete / trash system — nothing is permanently gone until you say so

### 🔐 Auth & Multi-User
- Google Sign-In via Firebase Auth
- Per-user data isolation (Firestore)
- Works across all your devices

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (in-browser Babel — no build step) |
| Auth | Firebase Authentication (Google Sign-In) |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting |
| Embedded | WordPress via `<script type="text/babel">` |

Single-file architecture (`app.jsx`) — intentionally lean. No bundler, no CLI, no node_modules in production. Load the script, it runs.

---

## Architecture Notes

**Why no build step?**  
This app is embedded inside a WordPress site via a `<script>` tag that loads `app.jsx` directly from Firebase Hosting. A build step would break that. In-browser Babel transpilation keeps the deployment model dead simple: edit the file, push to Firebase, done.

**Data model**  
All user data lives at `users/{uid}/data/workouts` in Firestore. Workout logs, exercise library entries, templates, and trash are all scoped per user. The shared exercise library lives in a separate top-level collection.

**Deploy flow**
```bash
mv ~/Downloads/app.jsx ~/gn30-tracker/public/app.jsx
cd ~/gn30-tracker
git add public/app.jsx
git commit -m "your message"
git push
firebase deploy --only hosting
```

---

## Version History

| Version | What shipped |
|---|---|
| v0.16.5 | Bug fixes from v0.16.3 refactor — render functions, parameter threading, planned workout data loss fix |
| v0.16.1 | Mid-workout exercise reordering via up/down arrows |
| v0.16.0 | Tabata category (round-based) + Carry category (weight + laps + distance) |
| v0.15.0 | Soft delete / trash system, safe navigation, BUG-007 fix (duplicate calendar entries) |
| v0.14.0 | Progress charts, PR board, exercise swap |
| v0.1.0 | Static HTML workout plan for a solo week with Amber |

---

## What I Learned

I didn't set out to learn Firebase. I set out to not lose my workout data when I closed the browser tab.

I didn't set out to learn React. I set out to make the exercise list feel less clunky.

I didn't set out to understand per-user data models. I set out to let a friend log in and see if the app made sense to someone who wasn't me.

Every technical decision came from a real problem. Curiosity first, tool second.

---

## Running Locally

No install required. Open `public/app.jsx` in a browser via Firebase local emulator, or just deploy and iterate — the deploy takes ~15 seconds.

```bash
cd ~/gn30-tracker
firebase serve --only hosting
```

Then open `http://localhost:5000`.

> **Note:** Firebase Auth requires an authorized domain. `localhost` is pre-authorized in the Firebase Console. If you fork this and use a custom domain, add it under Authentication → Settings → Authorized Domains.

---

## Forking / Contributing

This is a personal project built for my own training — but the codebase is public and the architecture is intentionally simple. If you want to fork it and adapt it for your own trainer's programming style, go for it.

The exercise categories, muscle group tags, and form video URLs are all configurable in the `EXERCISES` array at the top of `app.jsx`.

---

*Built February – March 2026 · [@vtexan](https://github.com/vtexan)*
