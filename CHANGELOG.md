# GetNerdyIn30 Workout Tracker — Changelog

**Current Version:** v0.11  
**Last Updated:** 2026-02-19  
**Live:** [getnerdyin30.com/workout-tracker](https://getnerdyin30.com/workout-tracker/)  
**Backup:** [getnerdyin30-tracker.web.app](https://getnerdyin30-tracker.web.app)

---

## v0.11 — 2026-02-19

### Bug Fixes
- **BUG-001 FIXED:** Changing working weight no longer overwrites completed sets — completed sets lock in their weight
- **BUG-005 FIXED:** Template and plan builder weight input borders now visible (opacity 25% → 60%)
- **BUG-006 FIXED:** Custom exercise edit now includes category dropdown (strength/cardio/mobility); built-in exercises show a message that only video URL is editable

### Architecture
- Split monolithic HTML into loader (9 lines on WordPress) + app.jsx (Firebase Hosting)
- Added CORS headers to firebase.json for cross-origin script loading
- WordPress page no longer requires Elementor paste for updates — just `firebase deploy`
- Updated README with architecture diagram, project structure, and accurate tech stack

---

## v0.10 — 2026-02-18

### Features
- Duplicate planned workout to another date (copy icon on dashboard)
- Convert completed workout to planned workout ("Plan Again" button in history)
- Templates now support warmup and cooldown notes

---

## v0.09 — 2026-02-18

### Features
- Exercise swap mid-workout — tap swap icon to see alternatives targeting the same muscle
- Active workout overwrite protection — confirms before replacing an in-progress workout

---

## v0.08 — 2026-02-18
**Offline Mode**
- Enabled Firestore offline persistence — app loads instantly from local cache regardless of connection
- Syncs with cloud in the background when WiFi/cell catches up
- Fixes the "blank screen at the gym" problem on bad WiFi

---

## v0.07 — 2026-02-18
**Planned Workouts, Template Editing, Auto-Save**

### New Features
- **Warmup & Cooldown notes** — free text fields at top/bottom of every active workout. Saves to history and exports
- **Planned workouts** — tap any calendar day → "Plan Workout For This Day." Pick exercises, set weights, warmup/cooldown notes. Blue dots mark planned days. Plans appear on dashboard
- **Plan editor** — tap a planned workout on dashboard to edit. Change name, exercises, weights, order, warmup, cooldown. Save Changes or Start
- **Template editor** — tap a template to open full editor. Edit name, add/remove exercises, adjust weights per exercise. Closes BUG-002, BUG-003, BUG-004
- **Weight selection in planning** — each exercise expands to show editable warmup weight, working weight, sets, reps. Last weight and suggested next weight visible. Supports light/heavy day planning
- **Exercise ordering** — up/down arrows to arrange exercises in planned workouts, plan editor, and template editor
- **Active workout auto-save** — in-progress workout continuously saved to Firestore as a draft (500ms debounce). Recovers on reload if phone dies or browser crashes
- **Add/remove exercises mid-workout** — blue Add Exercise button + red X on each exercise card
- **Help modal** — ? button in header with full user guide covering all features
- **Version tracking & changelog** — version number on dashboard and in help modal with full release history

### Bug Fixes
- **TODAY badge timezone fix** — was using UTC, showed wrong day in Central time. Now uses local date
- **Light mode readability** — darkened textMuted (#999 → #666) and textFaint (#bbb → #888)

### UI Improvements
- Calendar navigates to future months for planning ahead
- All calendar days are tappable (not just days with workouts)
- Better loading screen with dumbbell icon and "Connecting to your data" message
- Calendar shows blue dots for planned workouts, green dots for completed

---

## v0.06 — 2026-02-18
**Templates, Cardio & Polish**
- Workout template system — save routines, quick-start from dashboard
- Post-workout "Save as Template?" prompt
- Template builder from scratch with pre-planned weights, sets, reps
- Cardio tracking — 7 default exercises (Spin, Rowing, Treadmill, Outdoor Run, Walk, Elliptical, Stair Climber)
- Cardio UI: duration/distance/calories/heart rate fields
- Cardio in history, export, and templates
- Auto-generated workout names from exercise categories
- Exercise names shown on calendar workout cards
- Discard button moved/dimmed for safety

---

## v0.05 — 2026-02-17
**Calendar, Sharing & Community**
- Calendar view on dashboard with workout dots per day
- Gym check-in / location tracking on workouts
- Recent gym locations quick-tap
- Export/share workout as formatted text (clipboard + native share sheet)
- Shared exercise library (community Firestore collection)
- "Share with everyone" toggle when adding exercises
- Shared exercise badges with attribution
- Firestore security rules for shared library
- **Critical bug fix:** data loss prevention guard (dataLoaded flag prevents overwriting Firestore with empty state)
- Bolder nav bar styling

---

## v0.04 — 2026-02-17
**History & Editing**
- Full workout history view with expandable detail cards
- Edit past workouts (re-open, modify, save back)
- Backdate workout entries (log workouts from previous days)
- Firebase Hosting deploy workflow established
- Firebase auth domain troubleshooting
- Firestore data structure verification
- Light mode theme fixes

---

## v0.03 — 2026-02-17
**Firebase & Auth**
- Firebase project setup (getnerdyin30-tracker)
- Google Sign-In authentication
- Firestore cloud sync (workouts, custom exercises, preferences)
- Cross-device data persistence
- Light/dark theme toggle with preference saved to Firestore
- Per-set weight tracking (change weight mid-exercise, "BUMPED" indicator)
- Exercise notes field on every exercise
- Firebase Hosting setup (getnerdyin30-tracker.web.app)

---

## v0.02 — 2026-02-17
**React Web App (v1)**
- Full interactive React workout tracker
- Exercise library with 22 strength exercises across 6 categories
- Warmup/working set separation with completion toggles
- Per-set rep tracking
- Progression suggestions (auto-calculates 5% bump)
- PR tracking board
- Custom exercise creation (category, muscle, video link)
- Exercise library management
- Dark theme with JetBrains Mono font
- Deployed to WordPress via Elementor Custom HTML widget

---

## v0.01 — 2026-02-16
**Static Workout Plan**
- Reviewed 4 training sessions with Amber (exercises, weights, form notes)
- Built static HTML weekly workout plan
- Created DOCX version of the plan
- Created XLSX tracking spreadsheet
- Programmed Mon/Tue/Thu/Sat split

---

## Known Issues (Open Bugs)

| ID | Description | Status |
|----|-------------|--------|
| BUG-001 | Changing working weight propagates to all sets retroactively | ✅ Fixed v0.11 |
| BUG-005 | Template builder weight fields may not be visible enough | ✅ Fixed v0.11 |
| BUG-006 | Exercise edit pencil only allows video URL changes | ✅ Fixed v0.11 |

## Backlog

- Leaderboard (shared PR board, opt-in)
- Rest timer between sets
- PWA support (service worker + manifest for install-to-home-screen)
- GitHub repo + README
- Code cleanup: pre-compile JSX, modular Firebase SDK, break into sub-components
- Fix remaining UTC date issues in workoutDate default

---

## Technical Details

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 (browser-transpiled JSX), JetBrains Mono |
| Auth | Firebase Authentication (Google provider) |
| Database | Cloud Firestore (per-user collections + shared library) |
| Offline | Firestore offline persistence (IndexedDB cache) |
| Hosting | WordPress (Elementor HTML widget) + Firebase Hosting backup |
| CDN | React, ReactDOM, Firebase SDK, Babel from public CDNs |
| Deployment | Copy/paste HTML into Elementor → Publish |
| Lines of Code | ~3,300 |
