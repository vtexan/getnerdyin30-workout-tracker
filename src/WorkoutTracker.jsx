import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase.js';
import {
  DEFAULT_EXERCISES, CATEGORY_COLORS, APP_VERSION, APP_BUILD_DATE, CHANGELOG,
  getInitialData, softDelete, purgeExpiredTrash,
} from './constants.js';
import {
  formatDate, getLastWorkingWeight, getLastWarmupWeight, getLastCardioStats,
  getLastCarryStats, getLastTabataRounds, getProgressionSuggestion, getPR,
} from './utils.js';
import {
  CheckIcon, PlusIcon, MinusIcon, TrophyIcon, PlayIcon, ChartIcon, DumbbellIcon,
  FlameIcon, LibraryIcon, LinkIcon, EditIcon, TrashIcon, XIcon, SunIcon, MoonIcon,
  HistoryIcon, ChevronIcon, ArrowLeftIcon, ArrowUpSmall, ArrowDownSmall, SwapIcon,
  ArrowRightIcon, MapPinIcon, CopyIcon, TemplateIcon, CalendarIcon,
} from './icons.jsx';
import { useWorkout } from './context/WorkoutContext.jsx';
import Build from './components/Build.jsx';
import Progress from './components/Progress.jsx';
import PRBoard from './components/PRBoard.jsx';
import History from './components/History.jsx';
import Library from './components/Library.jsx';
import BuildTemplate from './components/BuildTemplate.jsx';
import Dashboard from './components/Dashboard.jsx';
import ActiveWorkout from './components/ActiveWorkout.jsx';
import CardioCard from './components/cards/CardioCard.jsx';
import CarryCard from './components/cards/CarryCard.jsx';
import TabataCard from './components/cards/TabataCard.jsx';
import StrengthCard from './components/cards/StrengthCard.jsx';

export default function WorkoutTracker() {
  const {
    data, loading, view, setView, theme, dataLoaded,
    user, authLoading, authError, handleSignIn, handleSignOut,
    activeWorkout, setActiveWorkout,
    selectedExercises, setSelectedExercises,
    workoutName, setWorkoutName,
    workoutDate, setWorkoutDate,
    workoutLocation, setWorkoutLocation,
    locationSearch, setLocationSearch,
    showMidWorkoutPicker, setShowMidWorkoutPicker,
    swappingExerciseIdx, setSwappingExerciseIdx,
    planningDate, setPlanningDate,
    editingPlan, setEditingPlan,
    planName, setPlanName,
    planExerciseConfigs, setPlanExerciseConfigs,
    planWarmup, setPlanWarmup,
    planCooldown, setPlanCooldown,
    editingTemplate, setEditingTemplate,
    tplName, setTplName,
    tplExerciseConfigs, setTplExerciseConfigs,
    tplWarmup, setTplWarmup,
    tplCooldown, setTplCooldown,
    showSaveTemplate, setShowSaveTemplate,
    templateName, setTemplateName,
    buildingTemplate, setBuildingTemplate,
    editingLogIdx, setEditingLogIdx,
    editingLogName, setEditingLogName,
    expandedLogIdx, setExpandedLogIdx,
    copiedIdx, setCopiedIdx,
    sharedExercises, setSharedExercises,
    shareToLibrary, setShareToLibrary,
    showAddExercise, setShowAddExercise,
    newExercise, setNewExercise,
    editingExercise, setEditingExercise,
    librarySearch, setLibrarySearch,
    exerciseSearch, setExerciseSearch,
    calendarMonth, setCalendarMonth,
    calendarSelectedDate, setCalendarSelectedDate,
    showHelp, setShowHelp,
    dismissedHints, dismissHint,
    toggleTheme, moveItem, persist,
  } = useWorkout();

  // ─── Login Screen ───
  if (!user) {
    const dark = theme === "dark";
    return (
      <div style={{ minHeight: "100vh", background: dark ? "#08080d" : "#f5f5f7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'JetBrains Mono', monospace" }}>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ color: "#e94560", marginBottom: 16 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767-1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l1.767 1.767a2 2 0 1 1 2.829 2.829Z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829Z"/></svg>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: dark ? "#fff" : "#111", letterSpacing: "-0.5px", marginBottom: 4 }}>WORKOUT TRACKER</div>
        <div style={{ fontSize: 10, color: dark ? "#444" : "#999", letterSpacing: 2, textTransform: "uppercase", marginBottom: 32 }}>GetNerdyIn30.com</div>
        <div style={{ fontSize: 12, color: dark ? "#888" : "#666", textAlign: "center", marginBottom: 24, maxWidth: 300, lineHeight: 1.6 }}>
          Track your workouts, log your sets, and watch your PRs climb. Sign in to sync across all your devices.
        </div>
        <button onClick={handleSignIn} style={{
          background: dark ? "#fff" : "#111",
          color: dark ? "#111" : "#fff",
          border: "none", borderRadius: 10, padding: "14px 28px",
          fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
          cursor: "pointer", letterSpacing: 0.5,
          display: "flex", alignItems: "center", gap: 10,
          transition: "opacity 0.2s",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          SIGN IN WITH GOOGLE
        </button>
        {authError && <div style={{ marginTop: 16, fontSize: 11, color: "#e94560" }}>{authError}</div>}
        <button onClick={toggleTheme} style={{ marginTop: 24, background: "none", border: `1px solid ${dark ? "#22223a" : "#d0d0da"}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: dark ? "#444" : "#999", fontSize: 9, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
          {dark ? "☀ LIGHT MODE" : "🌙 DARK MODE"}
        </button>
      </div>
    );
  }

  const allExercises = [...DEFAULT_EXERCISES, ...sharedExercises, ...(data.customExercises || [])];

  const getVideoUrl = (ex) => {
    if (data.videoOverrides && data.videoOverrides[ex.id]) return data.videoOverrides[ex.id];
    return ex.videoUrl || '';
  };

  const startWorkout = () => {
    if (activeWorkout && activeWorkout.exercises) {
      if (!confirm("You have a workout in progress (" + activeWorkout.name + "). Starting a new one will replace it. Continue?")) return;
    }
    const exercises = selectedExercises.map(id => {
      const ex = allExercises.find(e => e.id === id);
      const isCardio = ex.isCardio || ex.category === "cardio";

      if (isCardio) {
        // Get last cardio stats for this exercise
        const lastCardio = getLastCardioStats(id, data.workoutLogs);
        return {
          exerciseId: id,
          name: ex.name,
          category: ex.category,
          isCardio: true,
          duration: lastCardio?.duration || 0,
          distance: lastCardio?.distance || 0,
          calories: lastCardio?.calories || 0,
          avgHeartRate: lastCardio?.avgHeartRate || 0,
          notes: "",
          completed: false,
        };
      }

      const isCarry = ex.category === "carry";
      const isTabata = ex.isTabata || ex.category === "tabata";

      if (isCarry) {
        const lastCarry = getLastCarryStats(id, data.workoutLogs);
        const lastSet = lastCarry?.sets?.[0] || {};
        return {
          exerciseId: id, name: ex.name, category: ex.category, isCarry: true,
          sets: [{ weight: lastSet.weight || 0, laps: lastSet.laps || 1, distance: "", completed: false }],
          notes: "",
        };
      }

      if (isTabata) {
        const lastRounds = getLastTabataRounds(id, data.workoutLogs);
        const startRounds = lastRounds > 0 ? lastRounds : 1;
        return {
          exerciseId: id, name: ex.name, category: ex.category, isTabata: true,
          rounds: Array.from({ length: startRounds }, () => ({ completed: false })),
          notes: "",
        };
      }

      const lastWorking = getLastWorkingWeight(id, data.workoutLogs);
      const lastWarmup = getLastWarmupWeight(id, data.workoutLogs);
      const suggestion = getProgressionSuggestion(id, data.workoutLogs);
      const pr = getPR(id, data.workoutLogs);
      return {
        exerciseId: id,
        name: ex.name,
        category: ex.category,
        warmupWeight: lastWarmup || (lastWorking > 0 ? Math.round(lastWorking * 0.5 / 5) * 5 : 0),
        workingWeight: lastWorking || 0,
        warmupSets: [{ reps: 0, completed: false }],
        workingSets: [
          { reps: 0, completed: false, weight: null },
          { reps: 0, completed: false, weight: null },
          { reps: 0, completed: false, weight: null },
        ],
        notes: "",
        pr,
        suggestion,
        lastWorking,
      };
    });
    const selectedDate = new Date(workoutDate + "T12:00:00");
    // Auto-generate name from exercise categories if user didn't set one
    let autoName = workoutName;
    if (!autoName) {
      const cats = [...new Set(exercises.map(e => e.category))];
      const catLabels = cats.map(c => (CATEGORY_COLORS[c] || {}).label || c).filter(Boolean);
      autoName = catLabels.length > 0 ? catLabels.join(" + ") : "Workout";
    }
    setActiveWorkout({ date: selectedDate.toISOString(), name: autoName, location: workoutLocation || "", exercises });
    setView("active");
  };

  const saveWorkout = () => {
    if (editingLogIdx !== null) {
      // Editing existing workout — replace it in place
      const updatedLogs = [...data.workoutLogs];
      updatedLogs[editingLogIdx] = activeWorkout;
      persist({ ...data, workoutLogs: updatedLogs });
      setEditingLogIdx(null);
    } else {
      // New workout
      persist({ ...data, workoutLogs: [...data.workoutLogs, activeWorkout] });
    }
    setActiveWorkout(null);
    setSelectedExercises([]);
    setWorkoutName("");
    setWorkoutLocation("");
    setWorkoutDate(new Date().toISOString().split("T")[0]);
    setView("dashboard");
  };

  const clearAllData = () => {
    persist(getInitialData());
    setActiveWorkout(null);
    setSelectedExercises([]);
    setView("dashboard");
  };

  // ─── Location helpers ───
  const getRecentGyms = () => {
    const gyms = [];
    const seen = new Set();
    for (let i = (data.workoutLogs || []).length - 1; i >= 0; i--) {
      const loc = data.workoutLogs[i].location;
      if (loc && !seen.has(loc)) {
        seen.add(loc);
        gyms.push(loc);
      }
      if (gyms.length >= 5) break;
    }
    return gyms;
  };

  // ─── Theme tokens ───
  const dark = theme === "dark";
  const T = {
    bg: dark ? "#08080d" : "#f5f5f7",
    bgCard: dark ? "#0e0e16" : "#ffffff",
    bgInset: dark ? "#0c0c12" : "#f0f0f4",
    bgNav: dark ? "#0a0a10" : "#ffffff",
    border: dark ? "#18182a" : "#e2e2ea",
    borderSubtle: dark ? "#14141f" : "#ececf0",
    borderInput: dark ? "#22223a" : "#d0d0da",
    text: dark ? "#c0c0cc" : "#333340",
    textStrong: dark ? "#fff" : "#111118",
    textMuted: dark ? "#444" : "#666",
    textFaint: dark ? "#333" : "#888",
    inputBg: dark ? "#08080d" : "#f5f5f7",
    inputText: dark ? "#fff" : "#111118",
    navInactive: dark ? "#333" : "#aaa",
    warmupBg: dark ? "#0c0c12" : "#fffbf0",
    completedSetBg: (isWarmup) => dark
      ? (isWarmup ? "#f59e0b12" : "#22c55e12")
      : (isWarmup ? "#f59e0b15" : "#22c55e15"),
    uncompletedSetBg: dark ? "#08080d" : "#f5f5f7",
  };

  // ─── Styles ───
  const S = {
    app: { minHeight: "100vh", background: T.bg, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: T.text, maxWidth: 520, margin: "0 auto", padding: "0 16px 100px", transition: "background 0.3s, color 0.3s" },
    header: { padding: "24px 0 16px", borderBottom: `1px solid ${T.borderSubtle}`, marginBottom: 20 },
    title: { fontSize: 19, fontWeight: 800, color: T.textStrong, letterSpacing: "-0.5px" },
    subtitle: { fontSize: 10, color: T.textMuted, letterSpacing: 2, textTransform: "uppercase", marginTop: 2 },
    card: { background: T.bgCard, borderRadius: 10, padding: 16, marginBottom: 10, border: `1px solid ${T.border}`, transition: "background 0.3s, border-color 0.3s" },
    btn: (color = "#e94560") => ({ background: color, color: "#fff", border: "none", borderRadius: 8, padding: "13px 20px", fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", letterSpacing: 1, width: "100%", transition: "opacity 0.2s" }),
    btnOutline: (color = "#e94560") => ({ background: "none", color, border: `1px solid ${color}`, borderRadius: 8, padding: "10px 16px", fontSize: 11, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", letterSpacing: 0.5, width: "100%" }),
    tag: (color) => ({ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color, background: color + (dark ? "15" : "18"), marginRight: 6 }),
    input: { background: T.inputBg, border: `1px solid ${T.borderInput}`, borderRadius: 6, color: T.inputText, padding: "8px 12px", fontSize: 14, fontFamily: "'JetBrains Mono', monospace", width: "100%", outline: "none", transition: "background 0.3s, border-color 0.3s, color 0.3s" },
    sectionLabel: { fontSize: 9, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 },
    setBtn: (completed, isWarmup) => ({
      width: 42, height: 42, borderRadius: 8,
      border: completed ? `2px solid ${isWarmup ? "#f59e0b" : "#22c55e"}` : `2px solid ${T.borderInput}`,
      background: completed ? T.completedSetBg(isWarmup) : T.uncompletedSetBg,
      color: completed ? (isWarmup ? "#f59e0b" : "#22c55e") : T.textMuted,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", fontSize: 13, fontWeight: 700,
      fontFamily: "'JetBrains Mono', monospace", transition: "all 0.15s",
    }),
    nav: { position: "fixed", bottom: 0, left: 0, right: 0, background: dark ? "#111118" : "#ffffff", borderTop: `2px solid ${dark ? "#e9456033" : "#e9456022"}`, display: "flex", justifyContent: "center", zIndex: 100, padding: "6px 8px 8px", gap: 6, transition: "background 0.3s, border-color 0.3s" },
    navBtn: (active) => ({ flex: 1, maxWidth: 110, padding: "10px 0 8px", background: active ? (dark ? "#e9456020" : "#e9456012") : "transparent", border: active ? "1px solid #e9456044" : "1px solid transparent", borderRadius: 10, color: active ? "#e94560" : (dark ? "#555" : "#aaa"), fontSize: 9, fontWeight: active ? 700 : 500, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.2s" }),
    themeToggle: { background: "none", border: `1px solid ${T.borderInput}`, borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: T.textMuted, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" },
  };

  // ═══════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════
  const addExercise = async () => {
    if (!newExercise.name.trim()) return;
    const id = "custom-" + Date.now();
    const exercise = { ...newExercise, id, name: newExercise.name.trim(), muscle: newExercise.muscle.trim(), videoUrl: newExercise.videoUrl.trim() };

    if (shareToLibrary) {
      // Save to shared Firestore collection
      try {
        const sharedDoc = { ...exercise, addedBy: user.uid, addedByName: user.name || "Unknown", addedAt: new Date().toISOString() };
        await db.collection("shared").doc("exercises").collection("library").doc(id).set(sharedDoc);
        setSharedExercises(prev => [...prev, sharedDoc]);
      } catch (e) { console.error("Share failed:", e); }
    } else {
      // Save only to personal custom exercises
      persist({ ...data, customExercises: [...(data.customExercises || []), exercise] });
    }

    setNewExercise({ name: "", category: "posterior", muscle: "", videoUrl: "" });
    setShareToLibrary(true);
    setShowAddExercise(false);
  };

  const updateExerciseVideo = (exerciseId, newUrl) => {
    const isCustom = (data.customExercises || []).find(e => e.id === exerciseId);
    if (isCustom) {
      persist({ ...data, customExercises: data.customExercises.map(e => e.id === exerciseId ? { ...e, videoUrl: newUrl } : e) });
    } else {
      const existing = (data.videoOverrides || {});
      persist({ ...data, videoOverrides: { ...existing, [exerciseId]: newUrl } });
    }
    setEditingExercise(null);
  };

  const updateCustomExercise = (exerciseId, updates) => {
    persist({ ...data, customExercises: (data.customExercises || []).map(e => e.id === exerciseId ? { ...e, ...updates } : e) });
    setEditingExercise(null);
  };

  const deleteCustomExercise = (exerciseId) => {
    persist({ ...data, customExercises: (data.customExercises || []).filter(e => e.id !== exerciseId) });
  };

  const deleteSharedExercise = async (exerciseId) => {
    try {
      await db.collection("shared").doc("exercises").collection("library").doc(exerciseId).delete();
      setSharedExercises(prev => prev.filter(e => e.id !== exerciseId));
    } catch (e) { console.error("Delete shared exercise failed:", e); }
  };

  // ─── Template helpers ───
  const saveAsTemplate = (name, exerciseIds, location, exerciseConfigs, warmupNotes, cooldownNotes) => {
    const template = {
      id: "tpl-" + Date.now(),
      name: name.trim(),
      exerciseIds,
      exerciseConfigs: exerciseConfigs || [],
      location: location || "",
      warmupNotes: warmupNotes || "",
      cooldownNotes: cooldownNotes || "",
      createdAt: new Date().toISOString(),
    };
    persist({ ...data, templates: [...(data.templates || []), template] });
  };

  const deleteTemplate = (templateId) => {
    const found = (data.templates || []).find(t => t.id === templateId);
    const trash = found ? [...(data.recentlyDeleted || []), softDelete(found, "template")] : (data.recentlyDeleted || []);
    persist({ ...data, templates: (data.templates || []).filter(t => t.id !== templateId), recentlyDeleted: trash });
    if (editingTemplate?.id === templateId) setEditingTemplate(null);
  };

  // ─── Restore from trash ───
  const restoreFromTrash = (deletedAt) => {
    const item = (data.recentlyDeleted || []).find(d => d.deletedAt === deletedAt);
    if (!item) return;
    const remaining = (data.recentlyDeleted || []).filter(d => d.deletedAt !== deletedAt);
    const { _type, deletedAt: _, ...restored } = item;
    if (_type === "workout") {
      persist({ ...data, workoutLogs: [...data.workoutLogs, restored], recentlyDeleted: remaining });
    } else if (_type === "planned") {
      persist({ ...data, plannedWorkouts: [...(data.plannedWorkouts || []), restored], recentlyDeleted: remaining });
    } else if (_type === "template") {
      persist({ ...data, templates: [...(data.templates || []), restored], recentlyDeleted: remaining });
    }
  };

  const emptyTrash = () => {
    if (confirm("Permanently delete all items in the trash? This cannot be undone.")) {
      persist({ ...data, recentlyDeleted: [] });
    }
  };

  const openTemplateEditor = (tpl) => {
    setTplName(tpl.name);
    setTplWarmup(tpl.warmupNotes || "");
    setTplCooldown(tpl.cooldownNotes || "");
    setTplExerciseConfigs(tpl.exerciseConfigs || tpl.exerciseIds.map(id => ({
      exerciseId: id,
      targetWeight: 0,
      warmupWeight: 0,
      targetSets: 3,
      targetReps: 12,
      notes: "",
    })));
    setEditingTemplate(tpl);
  };

  const updateTemplate = () => {
    if (!editingTemplate) return;
    const exerciseIds = tplExerciseConfigs.map(c => c.exerciseId);

    let finalName = tplName.trim();
    if (!finalName) {
      const cats = [...new Set(exerciseIds.map(id => {
        const ex = allExercises.find(e => e.id === id);
        return ex ? (CATEGORY_COLORS[ex.category]?.label || ex.category) : null;
      }).filter(Boolean))];
      finalName = cats.join(" + ") || "Workout";
    }

    const updated = {
      ...editingTemplate,
      name: finalName,
      exerciseIds,
      exerciseConfigs: tplExerciseConfigs,
      warmupNotes: tplWarmup,
      cooldownNotes: tplCooldown,
    };
    const templates = (data.templates || []).map(t => t.id === editingTemplate.id ? updated : t);
    persist({ ...data, templates });
    setEditingTemplate(null);
    setTplName("");
    setTplExerciseConfigs([]);
    setTplWarmup("");
    setTplCooldown("");
  };

  const startFromTemplate = (template, dateOverride) => {
    if (activeWorkout && activeWorkout.exercises) {
      if (!confirm("You have a workout in progress (" + activeWorkout.name + "). Starting a new one will replace it. Continue?")) return;
    }
    const ids = template.exerciseIds.filter(id => allExercises.find(e => e.id === id));
    const configs = template.exerciseConfigs || [];

    // Build exercises with template weights pre-loaded
    const exercises = ids.map(id => {
      const ex = allExercises.find(e => e.id === id);
      const config = configs.find(c => c.exerciseId === id);
      const isCardio = ex.isCardio || ex.category === "cardio";

      if (isCardio) {
        const lastCardio = getLastCardioStats(id, data.workoutLogs);
        return {
          exerciseId: id, name: ex.name, category: ex.category, isCardio: true,
          duration: lastCardio?.duration || 0, distance: lastCardio?.distance || 0,
          calories: lastCardio?.calories || 0, avgHeartRate: lastCardio?.avgHeartRate || 0,
          notes: config?.notes || "", completed: false,
        };
      }

      const lastWorking = getLastWorkingWeight(id, data.workoutLogs);
      const lastWarmup = getLastWarmupWeight(id, data.workoutLogs);
      const suggestion = getProgressionSuggestion(id, data.workoutLogs);
      const pr = getPR(id, data.workoutLogs);

      const workingWeight = config?.targetWeight || lastWorking || 0;
      const warmupWeight = config?.warmupWeight || lastWarmup || (workingWeight > 0 ? Math.round(workingWeight * 0.5 / 5) * 5 : 0);
      const numSets = config?.targetSets || 3;
      const targetReps = config?.targetReps || 12;

      const isCarryTpl = ex.category === "carry";
      const isTabataTpl = ex.isTabata || ex.category === "tabata";

      if (isCarryTpl) {
        const lastCarry = getLastCarryStats(id, data.workoutLogs);
        const lastSet = lastCarry?.sets?.[0] || {};
        return {
          exerciseId: id, name: ex.name, category: ex.category, isCarry: true,
          sets: [{ weight: config?.targetWeight || lastSet.weight || 0, laps: lastSet.laps || 1, distance: "", completed: false }],
          notes: config?.notes || "",
        };
      }

      if (isTabataTpl) {
        const lastRounds = getLastTabataRounds(id, data.workoutLogs);
        const startRounds = config?.targetSets || (lastRounds > 0 ? lastRounds : 1);
        return {
          exerciseId: id, name: ex.name, category: ex.category, isTabata: true,
          rounds: Array.from({ length: startRounds }, () => ({ completed: false })),
          notes: config?.notes || "",
        };
      }

      return {
        exerciseId: id,
        name: ex.name,
        category: ex.category,
        warmupWeight,
        workingWeight,
        warmupSets: [{ reps: 0, completed: false }],
        workingSets: Array.from({ length: numSets }, () => ({ reps: 0, completed: false, weight: null })),
        notes: config?.notes || "",
        pr,
        suggestion,
        lastWorking,
      };
    });

    const selectedDate = new Date((dateOverride || workoutDate) + "T12:00:00");
    setActiveWorkout({ date: selectedDate.toISOString(), name: template.name, location: template.location || workoutLocation || "", exercises, warmupNotes: template.warmupNotes || "", cooldownNotes: template.cooldownNotes || "", originalTemplateExerciseIds: template.exerciseIds || [] });
    setView("active");
  };

  // ─── Planned Workouts ───
  const savePlannedWorkout = (date, name) => {
    const exerciseIds = planExerciseConfigs.map(c => c.exerciseId);

    // Auto-generate name from categories if empty
    let finalName = name.trim();
    if (!finalName) {
      const cats = [...new Set(exerciseIds.map(id => {
        const ex = allExercises.find(e => e.id === id);
        return ex ? (CATEGORY_COLORS[ex.category]?.label || ex.category) : null;
      }).filter(Boolean))];
      finalName = cats.join(" + ") || "Workout";
    }

    const planned = {
      id: Date.now().toString(),
      date,
      name: finalName,
      exerciseIds,
      exerciseConfigs: planExerciseConfigs,
      warmupNotes: planWarmup,
      cooldownNotes: planCooldown,
      createdAt: new Date().toISOString(),
    };
    const existing = data.plannedWorkouts || [];
    persist({ ...data, plannedWorkouts: [...existing, planned] });
    setPlanningDate(null);
    setPlanExerciseConfigs([]);
    setPlanName("");
    setPlanWarmup("");
    setPlanCooldown("");
  };

  const startPlannedWorkout = (planned) => {
    // Pass the plan's date directly — don't rely on workoutDate state (race condition)
    const template = { ...planned, location: "" };
    startFromTemplate(template, planned.date);
    // Add warmup/cooldown notes to the active workout
    setActiveWorkout(prev => prev ? { ...prev, warmupNotes: planned.warmupNotes || "", cooldownNotes: planned.cooldownNotes || "", originalTemplateExerciseIds: planned.exerciseIds || [] } : prev);
    // Remove the planned workout since it's now active
    const remaining = (data.plannedWorkouts || []).filter(p => p.id !== planned.id);
    persist({ ...data, plannedWorkouts: remaining });
  };

  const deletePlannedWorkout = (id) => {
    const found = (data.plannedWorkouts || []).find(p => p.id === id);
    const remaining = (data.plannedWorkouts || []).filter(p => p.id !== id);
    const trash = found ? [...(data.recentlyDeleted || []), softDelete(found, "planned")] : (data.recentlyDeleted || []);
    persist({ ...data, plannedWorkouts: remaining, recentlyDeleted: trash });
    if (editingPlan?.id === id) setEditingPlan(null);
  };

  const duplicatePlannedWorkout = (plan) => {
    const newDate = prompt("Copy this workout to which date? (YYYY-MM-DD)", "");
    if (!newDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return;
    const copy = {
      ...plan,
      id: Date.now().toString(),
      date: newDate,
      name: plan.name,
    };
    persist({ ...data, plannedWorkouts: [...(data.plannedWorkouts || []), copy] });
  };

  const convertLogToPlannedWorkout = (log, targetDate) => {
    const newDate = targetDate || prompt("Plan this workout for which date? (YYYY-MM-DD)", "");
    if (!newDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) return;
    const exerciseConfigs = (log.exercises || []).map(ex => ({
      exerciseId: ex.exerciseId,
      targetWeight: ex.isCarry ? (ex.sets?.[0]?.weight || 0) : (ex.workingWeight || 0),
      warmupWeight: ex.warmupWeight || 0,
      targetSets: ex.isCardio ? 0 : ex.isCarry ? (ex.sets || []).length : ex.isTabata ? (ex.rounds || []).filter(r => r.completed).length : (ex.workingSets || []).length,
      targetReps: ex.isCardio || ex.isCarry || ex.isTabata ? 0 : Math.max(...(ex.workingSets || []).map(s => s.reps || 0), 0),
    }));
    const planned = {
      id: Date.now().toString(),
      date: newDate,
      name: log.name || "Workout",
      exerciseIds: (log.exercises || []).map(e => e.exerciseId),
      exerciseConfigs,
      warmupNotes: log.warmupNotes || "",
      cooldownNotes: log.cooldownNotes || "",
    };
    persist({ ...data, plannedWorkouts: [...(data.plannedWorkouts || []), planned] });
  };

  const openPlanEditor = (plan) => {
    setPlanningDate(plan.date);
    setPlanName(plan.name);
    setPlanWarmup(plan.warmupNotes || "");
    setPlanCooldown(plan.cooldownNotes || "");
    setPlanExerciseConfigs(plan.exerciseConfigs || plan.exerciseIds.map(id => ({
      exerciseId: id,
      targetWeight: 0,
      warmupWeight: 0,
      targetSets: 3,
      targetReps: 12,
    })));
    setEditingPlan(plan);
    setView("dashboard");
  };

  const updatePlannedWorkout = () => {
    if (!editingPlan) return;
    const exerciseIds = planExerciseConfigs.map(c => c.exerciseId);

    let finalName = planName.trim();
    if (!finalName) {
      const cats = [...new Set(exerciseIds.map(id => {
        const ex = allExercises.find(e => e.id === id);
        return ex ? (CATEGORY_COLORS[ex.category]?.label || ex.category) : null;
      }).filter(Boolean))];
      finalName = cats.join(" + ") || "Workout";
    }

    const updated = {
      ...editingPlan,
      name: finalName,
      exerciseIds,
      exerciseConfigs: planExerciseConfigs,
      warmupNotes: planWarmup,
      cooldownNotes: planCooldown,
    };
    const remaining = (data.plannedWorkouts || []).map(p => p.id === editingPlan.id ? updated : p);
    persist({ ...data, plannedWorkouts: remaining });
    setEditingPlan(null);
    setPlanningDate(null);
    setPlanExerciseConfigs([]);
    setPlanName("");
    setPlanWarmup("");
    setPlanCooldown("");
  };

  // ═══════════════════════════════════════
  // WORKOUT HISTORY
  // ═══════════════════════════════════════
  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#e94560" }}><DumbbellIcon /></span>
            <span style={S.title}>WORKOUT TRACKER</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => setShowHelp(true)} style={S.themeToggle} title="Help">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </button>
            <button onClick={toggleTheme} style={S.themeToggle}>
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <div style={S.subtitle}>GetNerdyIn30.com <span style={{ color: T.textFaint, marginLeft: 4 }}>v{APP_VERSION}</span></div>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {user.photo && <img src={user.photo} alt="" style={{ width: 18, height: 18, borderRadius: "50%" }} />}
              <span style={{ fontSize: 9, color: T.textMuted }}>{user.name?.split(" ")[0]}</span>
              <button onClick={handleSignOut} style={{ background: "none", border: "none", color: T.textFaint, cursor: "pointer", fontSize: 8, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 0.5, textDecoration: "underline" }}>SIGN OUT</button>
            </div>
          )}
        </div>
      </div>

      {view === "dashboard" && <Dashboard allExercises={allExercises} startWorkout={startWorkout} getRecentGyms={getRecentGyms} openPlanEditor={openPlanEditor} updatePlannedWorkout={updatePlannedWorkout} startPlannedWorkout={startPlannedWorkout} deletePlannedWorkout={deletePlannedWorkout} duplicatePlannedWorkout={duplicatePlannedWorkout} savePlannedWorkout={savePlannedWorkout} openTemplateEditor={openTemplateEditor} updateTemplate={updateTemplate} startFromTemplate={startFromTemplate} deleteTemplate={deleteTemplate} />}
      {view === "build" && <Build allExercises={allExercises} startWorkout={startWorkout} getRecentGyms={getRecentGyms} />}
      {view === "buildTemplate" && <BuildTemplate allExercises={allExercises} saveAsTemplate={saveAsTemplate} getRecentGyms={getRecentGyms} />}
      {view === "active" && <ActiveWorkout allExercises={allExercises} saveWorkout={saveWorkout} getVideoUrl={getVideoUrl} />}
      {view === "progress" && <Progress allExercises={allExercises} />}
      {view === "prs" && <PRBoard allExercises={allExercises} />}
      {view === "history" && <History allExercises={allExercises} convertLogToPlannedWorkout={convertLogToPlannedWorkout} restoreFromTrash={restoreFromTrash} emptyTrash={emptyTrash} />}
      {view === "library" && <Library allExercises={allExercises} addExercise={addExercise} updateExerciseVideo={updateExerciseVideo} updateCustomExercise={updateCustomExercise} deleteCustomExercise={deleteCustomExercise} deleteSharedExercise={deleteSharedExercise} clearAllData={clearAllData} getVideoUrl={getVideoUrl} />}

      {view !== "active" && (
        <div style={S.nav}>
          {[
            { id: "dashboard", icon: <DumbbellIcon />, label: "WORKOUT" },
            { id: "history", icon: <HistoryIcon />, label: "HISTORY" },
            { id: "library", icon: <LibraryIcon />, label: "EXERCISES" },
            { id: "progress", icon: <ChartIcon />, label: "PROGRESS" },
            { id: "prs", icon: <TrophyIcon />, label: "PRs" },
          ].map(tab => (
            <button key={tab.id} style={S.navBtn(view === tab.id)} onClick={() => setView(tab.id)}>
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Save as Template Modal */}
      {showSaveTemplate && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}
          onClick={() => setShowSaveTemplate(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, maxWidth: 360, width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ color: "#f59e0b" }}><TemplateIcon /></span>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.textStrong }}>Save as Template?</div>
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 16, lineHeight: 1.5 }}>
              Save this workout as a template so you can start it with one tap next time.
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9, color: T.textFaint, letterSpacing: 1, marginBottom: 4 }}>TEMPLATE NAME</div>
              <input style={S.input} value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="e.g. Monday: Posterior Chain + Back" />
            </div>
            <div style={{ fontSize: 9, color: T.textFaint, marginBottom: 14 }}>
              {showSaveTemplate.exerciseIds?.length} exercises{showSaveTemplate.location ? ` · 📍 ${showSaveTemplate.location}` : ""}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...S.btn("#f59e0b"), flex: 1 }} onClick={() => {
                if (templateName.trim()) {
                  saveAsTemplate(templateName, showSaveTemplate.exerciseIds, showSaveTemplate.location, showSaveTemplate.exerciseConfigs, showSaveTemplate.warmupNotes, showSaveTemplate.cooldownNotes);
                  setShowSaveTemplate(false);
                  setTemplateName("");
                }
              }}>
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><TemplateIcon /> SAVE TEMPLATE</span>
              </button>
              <button style={{ ...S.btnOutline("#555"), flex: 0, width: "auto", padding: "10px 16px" }} onClick={() => { setShowSaveTemplate(false); setTemplateName(""); }}>
                SKIP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HELP / USER GUIDE MODAL ── */}
      {showHelp && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 300, padding: 16, overflowY: "auto" }}
          onClick={() => setShowHelp(false)}>
          <div style={{ background: T.bgCard, borderRadius: 12, padding: 0, maxWidth: 500, width: "100%", marginTop: 40, marginBottom: 40, border: `1px solid ${T.border}`, overflow: "hidden" }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: T.textStrong, letterSpacing: -0.5 }}>Quick Start Guide</span>
              <button onClick={() => setShowHelp(false)} style={{ background: "none", border: "none", color: T.textMuted, cursor: "pointer", padding: 4 }}><XIcon /></button>
            </div>

            <div style={{ padding: "16px 20px", fontSize: 12, color: T.text, lineHeight: 1.8, maxHeight: "70vh", overflowY: "auto" }}>

              {/* Starting a Workout */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#e94560", letterSpacing: 1, marginBottom: 8 }}>STARTING A WORKOUT</div>
              <div style={{ marginBottom: 16, color: T.textMuted, fontSize: 11 }}>
                Tap <strong style={{ color: T.textStrong }}>Start New Workout</strong> to pick exercises manually, or tap a saved <strong style={{ color: T.textStrong }}>template</strong> on the dashboard to jump right in. You can set the date and gym location before starting.
              </div>

              {/* Warmup vs Working */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: 1, marginBottom: 8 }}>WARMUP vs WORKING SETS</div>
              <div style={{ marginBottom: 16, color: T.textMuted, fontSize: 11 }}>
                Each exercise has two sections. <strong style={{ color: "#f59e0b" }}>Warmup</strong> is a lighter weight to groove your form (maybe 50% of your working weight for 6 reps). <strong style={{ color: "#22c55e" }}>Working sets</strong> are your real weight. Tap the set button to mark it complete, then enter your reps.
              </div>

              {/* Per-Set Weight */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: 1, marginBottom: 8 }}>CHANGING WEIGHT PER SET</div>
              <div style={{ marginBottom: 16, color: T.textMuted, fontSize: 11 }}>
                The top weight field sets the default for all sets. To change weight on a specific set (like bumping up on your last set), edit the weight number on that individual set row. It'll show <strong style={{ color: "#f59e0b" }}>BUMPED</strong> to confirm it's different from your default.
              </div>

              {/* Add/Remove Mid-Workout */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9", letterSpacing: 1, marginBottom: 8 }}>ADD OR REMOVE EXERCISES</div>
              <div style={{ marginBottom: 16, color: T.textMuted, fontSize: 11 }}>
                During a workout, tap the blue <strong style={{ color: "#0ea5e9" }}>Add Exercise</strong> button below your exercises to add more. To remove one, tap the <strong style={{ color: "#e94560" }}>X</strong> in the top-right corner of any exercise card. You can also add and remove sets using the + SET / - SET buttons.
              </div>

              {/* Exercise Swap */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9", letterSpacing: 1, marginBottom: 8 }}>EXERCISE SWAP</div>
              <div style={{ marginBottom: 16, color: T.textMuted, fontSize: 11 }}>
                Machine taken? During a workout, tap the blue <strong style={{ color: "#0ea5e9" }}>↔ swap icon</strong> on any exercise card. It shows alternatives that target the <strong style={{ color: T.textStrong }}>same muscle group</strong>, plus other exercises in the same category. Pick one and it replaces the original — your last weight for the new exercise auto-loads. The swap is noted in your workout log.
              </div>

              {/* Exercise Search */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9", letterSpacing: 1, marginBottom: 8 }}>EXERCISE SEARCH</div>
              <div style={{ marginBottom: 16, color: T.textMuted, fontSize: 11 }}>
                When picking exercises (in planned workouts, templates, or mid-workout), use the <strong style={{ color: T.textStrong }}>🔍 search bar</strong> at the top of the list. Type an exercise name, muscle group, or category to filter instantly.
              </div>

              {/* Templates */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", letterSpacing: 1, marginBottom: 8 }}>TEMPLATES</div>
              <div style={{ marginBottom: 16, color: T.textMuted, fontSize: 11 }}>
                Templates are for <strong style={{ color: T.textStrong }}>recurring routines</strong> you do regularly (like "Full Body Day"). Tap <strong style={{ color: T.textStrong }}>Create Template</strong> on the dashboard to build one, or finish any workout and you'll be asked to save it as a template. Tap a template on the dashboard to <strong style={{ color: T.textStrong }}>review and edit</strong> — change the name, add or remove exercises, adjust warmup/working weights, sets, and reps. Hit <strong style={{ color: "#f59e0b" }}>Save Changes</strong> to update it, or <strong style={{ color: "#22c55e" }}>Start</strong> to launch the workout with all weights pre-loaded.
              </div>

              {/* Planned Workouts */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9", letterSpacing: 1, marginBottom: 8 }}>PLANNED WORKOUTS</div>
              <div style={{ marginBottom: 16, color: T.textMuted, fontSize: 11 }}>
                Planning is for <strong style={{ color: T.textStrong }}>specific dates</strong> — like designing Thursday's workout on Tuesday night. Tap any day on the calendar, then <strong style={{ color: "#0ea5e9" }}>Plan Workout For This Day</strong>. Pick your exercises and each one expands to show your <strong style={{ color: T.textStrong }}>last weight, suggested next weight,</strong> and editable fields for <strong style={{ color: "#f59e0b" }}>warmup weight</strong>, <strong style={{ color: "#22c55e" }}>working weight</strong>, sets, and reps. Set warmup and cooldown notes too (like "TRX squat & row" or "Tabata finisher"). Blue dots on the calendar mark planned days. On that day, your plan appears on the dashboard — tap it to review and edit, or start right away. All weights pre-load from your plan.
              </div>

              {/* Editing Plans */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0ea5e9", letterSpacing: 1, marginBottom: 8 }}>EDITING A PLAN</div>
              <div style={{ marginBottom: 16, color: T.textMuted, fontSize: 11 }}>
                Tap a planned workout on the dashboard to open it in <strong style={{ color: T.textStrong }}>edit mode</strong>. You can change the name, warmup, cooldown, add or remove exercises, and adjust any weights. Hit <strong style={{ color: "#0ea5e9" }}>Save Changes</strong> to update the plan and go back, or <strong style={{ color: "#22c55e" }}>Start</strong> to save and begin the workout. From the calendar, you'll see both an <strong style={{ color: "#0ea5e9" }}>Edit Plan</strong> and <strong style={{ color: "#22c55e" }}>Start</strong> button.
              </div>

              {/* Light vs Heavy Days */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: 1, marginBottom: 8 }}>LIGHT vs HEAVY DAYS</div>
              <div style={{ marginBottom: 16, color: T.textMuted, fontSize: 11 }}>
                When planning a workout, each exercise shows your <strong style={{ color: T.textStrong }}>last weight</strong> and a <strong style={{ color: "#22c55e" }}>suggested next weight</strong> (5% increase). For a light day, dial the working weight down. For a heavy day, bump it up. The warmup weight field is there too — typically ~50% of your working weight. Set it all the night before so you walk into the gym with zero decisions.
              </div>

              {/* Warmup & Cooldown */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8b5cf6", letterSpacing: 1, marginBottom: 8 }}>WARMUP & COOLDOWN</div>
              <div style={{ marginBottom: 16, color: T.textMuted, fontSize: 11 }}>
                Every workout has a <strong style={{ color: "#f59e0b" }}>Warmup</strong> notes section at the top and a <strong style={{ color: "#8b5cf6" }}>Cooldown</strong> section at the bottom. Use these for what your trainer prescribes — leg swings, TRX, tabata finisher, stretching, foam rolling. You can also set these when planning a workout so they're ready when you start. Notes save with your workout and show up in history and exports.
              </div>

              {/* Cardio */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#ff6b35", letterSpacing: 1, marginBottom: 8 }}>CARDIO TRACKING</div>
              <div style={{ marginBottom: 16, color: T.textMuted, fontSize: 11 }}>
                Cardio exercises (Spin, Rowing, Treadmill, etc.) have different fields: <strong style={{ color: T.textStrong }}>duration, distance, calories, and heart rate</strong>. Fill in what you know from your machine or watch, add notes about the class or how it felt, and tap Mark Complete.
              </div>

              {/* Tabata & Carry */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#a855f7", letterSpacing: 1, marginBottom: 8 }}>TABATA & CARRIES</div>
              <div style={{ marginBottom: 16, color: T.textMuted, fontSize: 11 }}>
                <strong style={{ color: "#a855f7" }}>Tabata</strong> exercises track rounds (each round = 20s on / 10s off). Tap a round to mark it complete. Use <strong>+</strong> and <strong>−</strong> to adjust round count. <strong style={{ color: "#ec4899" }}>Carry</strong> exercises track weight, laps, and optional distance per set. Add extra sets with the <strong>+</strong> button.
              </div>

              {/* Exercises & Library */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8b5cf6", letterSpacing: 1, marginBottom: 8 }}>EXERCISE LIBRARY</div>
              <div style={{ marginBottom: 16, color: T.textMuted, fontSize: 11 }}>
                The <strong style={{ color: T.textStrong }}>Exercises</strong> tab shows all available exercises. You can add custom exercises, link how-to videos, and share exercises with the community. There are three types: <strong>built-in</strong> (always there), <strong style={{ color: "#0ea5e9" }}>custom</strong> (private to you), and <strong style={{ color: "#22c55e" }}>shared</strong> (visible to everyone).
              </div>

              {/* Progress & PRs */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", letterSpacing: 1, marginBottom: 8 }}>PROGRESS & PRs</div>
              <div style={{ marginBottom: 16, color: T.textMuted, fontSize: 11 }}>
                The <strong style={{ color: T.textStrong }}>Progress</strong> tab shows your weight over time for each exercise. The <strong style={{ color: T.textStrong }}>PRs</strong> tab tracks your personal records. The app auto-detects new PRs during workouts and celebrates them.
              </div>

              {/* History */}
              <div style={{ fontSize: 11, fontWeight: 700, color: "#ec4899", letterSpacing: 1, marginBottom: 8 }}>HISTORY & EDITING</div>
              <div style={{ marginBottom: 16, color: T.textMuted, fontSize: 11 }}>
                The <strong style={{ color: T.textStrong }}>History</strong> tab shows all past workouts. Tap any workout to expand it and see every set. You can <strong style={{ color: "#0ea5e9" }}>edit</strong> a past workout, <strong style={{ color: "#e94560" }}>delete</strong> it, <strong>copy/share</strong> it as formatted text, or tap <strong style={{ color: "#f59e0b" }}>Plan Again</strong> to turn it into a planned workout for another day. When editing, tap <strong style={{ color: "#0ea5e9" }}>Done — Back to History</strong> to exit without saving changes (the original stays intact). Deleted items go to <strong style={{ color: "#e94560" }}>Recently Deleted</strong> at the bottom of History where you can restore them for up to 30 days.
              </div>

              {/* Tips */}
              <div style={{ fontSize: 11, fontWeight: 700, color: T.textStrong, letterSpacing: 1, marginBottom: 8 }}>TIPS</div>
              <div style={{ marginBottom: 8, color: T.textMuted, fontSize: 11 }}>
                <strong style={{ color: T.textStrong }}>Auto-populated weights:</strong> The app remembers your last weight for each exercise and suggests a 5% increase next time.
              </div>
              <div style={{ marginBottom: 8, color: T.textMuted, fontSize: 11 }}>
                <strong style={{ color: T.textStrong }}>Dark/Light mode:</strong> Tap the sun/moon icon in the header. Your preference is saved.
              </div>
              <div style={{ marginBottom: 8, color: T.textMuted, fontSize: 11 }}>
                <strong style={{ color: T.textStrong }}>Syncs everywhere:</strong> Your data is saved to the cloud. Log in on any device and everything is there.
              </div>
              <div style={{ color: T.textMuted, fontSize: 11, marginBottom: 8 }}>
                <strong style={{ color: T.textStrong }}>Backdate workouts:</strong> Forgot to log yesterday? Change the date before starting a workout.
              </div>
              <div style={{ color: T.textMuted, fontSize: 11 }}>
                <strong style={{ color: T.textStrong }}>Auto-save:</strong> Your active workout is continuously saved to the cloud. If your phone dies, the browser crashes, or you accidentally close the app, just re-open it — your workout picks up right where you left off. No more lost sets.
              </div>

              {/* Changelog */}
              <div style={{ fontSize: 11, fontWeight: 700, color: T.textStrong, letterSpacing: 1, marginBottom: 8 }}>CHANGELOG</div>
              {CHANGELOG.map(release => (
                <div key={release.version} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#e94560" }}>v{release.version}</span>
                    <span style={{ fontSize: 9, color: T.textFaint }}>{release.date}</span>
                  </div>
                  {release.changes.map((c, i) => (
                    <div key={i} style={{ fontSize: 10, color: T.textMuted, paddingLeft: 8, marginBottom: 2, lineHeight: 1.5 }}>• {c}</div>
                  ))}
                </div>
              ))}

            </div>

            {/* Footer */}
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${T.borderSubtle}`, textAlign: "center" }}>
              <button onClick={() => setShowHelp(false)} style={{ ...S.btn("#e94560"), padding: "10px 20px" }}>GOT IT</button>
              <div style={{ fontSize: 8, color: T.textFaint, marginTop: 8 }}>v{APP_VERSION} · {APP_BUILD_DATE}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mount the app
