import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db, googleProvider, loadData, saveData, saveActiveWorkoutDraft, loadActiveWorkoutDraft } from '../firebase.js';
import { getInitialData, purgeExpiredTrash } from '../constants.js';

const WorkoutContext = createContext(null);

export function WorkoutProvider({ children }) {
  // ── Core app state ──
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [theme, setTheme] = useState("dark");
  const [dataLoaded, setDataLoaded] = useState(false);

  // ── Auth ──
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // ── Active workout ──
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [workoutLocation, setWorkoutLocation] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [showMidWorkoutPicker, setShowMidWorkoutPicker] = useState(false);
  const [swappingExerciseIdx, setSwappingExerciseIdx] = useState(null);

  // ── Plan editor ──
  const [planningDate, setPlanningDate] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planName, setPlanName] = useState("");
  const [planExerciseConfigs, setPlanExerciseConfigs] = useState([]);
  const [planWarmup, setPlanWarmup] = useState("");
  const [planCooldown, setPlanCooldown] = useState("");

  // ── Template editor ──
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [tplName, setTplName] = useState("");
  const [tplExerciseConfigs, setTplExerciseConfigs] = useState([]);
  const [tplWarmup, setTplWarmup] = useState("");
  const [tplCooldown, setTplCooldown] = useState("");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [buildingTemplate, setBuildingTemplate] = useState(null);

  // ── History & log editing ──
  const [editingLogIdx, setEditingLogIdx] = useState(null);
  const [editingLogName, setEditingLogName] = useState(null);
  const [expandedLogIdx, setExpandedLogIdx] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  // ── Exercise library ──
  const [sharedExercises, setSharedExercises] = useState([]);
  const [shareToLibrary, setShareToLibrary] = useState(true);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: "", category: "posterior", muscle: "", videoUrl: "" });
  const [editingExercise, setEditingExercise] = useState(null);
  const [librarySearch, setLibrarySearch] = useState("");
  const [exerciseSearch, setExerciseSearch] = useState("");

  // ── Calendar ──
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(null);

  // ── UI toggles ──
  const [showHelp, setShowHelp] = useState(false);
  const [dismissedHints, setDismissedHints] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gn30-hints") || "{}"); } catch { return {}; }
  });

  const dismissHint = (key) => {
    const updated = { ...dismissedHints, [key]: true };
    setDismissedHints(updated);
    localStorage.setItem("gn30-hints", JSON.stringify(updated));
  };

  // ── Firebase auth listener ──
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, name: firebaseUser.displayName, email: firebaseUser.email, photo: firebaseUser.photoURL });
        const saved = await loadData(firebaseUser.uid);
        const loadedData = saved || getInitialData();
        if (loadedData.recentlyDeleted && loadedData.recentlyDeleted.length > 0) {
          loadedData.recentlyDeleted = purgeExpiredTrash(loadedData.recentlyDeleted);
        }
        setData(loadedData);
        setDataLoaded(true);
        try {
          const draft = await loadActiveWorkoutDraft(firebaseUser.uid);
          if (draft && draft.exercises) {
            setActiveWorkout(draft);
            setView("active");
          }
        } catch (e) { console.error("Draft restore failed:", e); }
        try {
          const prefSnap = await db.collection("users").doc(firebaseUser.uid).collection("data").doc("preferences").get();
          if (prefSnap.exists && prefSnap.data().theme) setTheme(prefSnap.data().theme);
        } catch (e) { console.error("Theme load failed:", e); }
        try {
          const sharedSnap = await db.collection("shared").doc("exercises").collection("library").get();
          const shared = [];
          sharedSnap.forEach(doc => shared.push({ ...doc.data(), id: doc.id }));
          setSharedExercises(shared);
        } catch (e) { console.error("Shared exercises load failed:", e); }
      } else {
        setUser(null);
        setData(null);
      }
      setAuthLoading(false);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ── Auto-save active workout draft ──
  useEffect(() => {
    if (!user || !dataLoaded) return;
    const timer = setTimeout(() => {
      saveActiveWorkoutDraft(user.uid, activeWorkout);
    }, 500);
    return () => clearTimeout(timer);
  }, [activeWorkout, user, dataLoaded]);

  // ── Auth actions ──
  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await auth.signInWithPopup(googleProvider);
    } catch (e) {
      console.error("Sign in failed:", e);
      if (e.code !== "auth/popup-closed-by-user") {
        setAuthError("Sign in failed. Please try again.");
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setData(null);
      setDataLoaded(false);
      setActiveWorkout(null);
      setView("dashboard");
    } catch (e) { console.error("Sign out failed:", e); }
  };

  // ── Theme ──
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (user) {
      db.collection("users").doc(user.uid).collection("data").doc("preferences")
        .set({ theme: next }, { merge: true })
        .catch(e => console.error("Theme save failed:", e));
    }
  };

  // ── Reorder helper ──
  const moveItem = (arr, from, to) => {
    const updated = [...arr];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    return updated;
  };

  // ── Persist to Firestore ──
  const persist = useCallback((newData) => {
    setData(newData);
    if (user && dataLoaded) saveData(user.uid, newData);
  }, [user, dataLoaded]);

  const value = {
    // Core
    data, setData, loading, view, setView, theme, dataLoaded, setDataLoaded,
    // Auth
    user, setUser, authLoading, authError, handleSignIn, handleSignOut,
    // Active workout
    activeWorkout, setActiveWorkout,
    selectedExercises, setSelectedExercises,
    workoutName, setWorkoutName,
    workoutDate, setWorkoutDate,
    workoutLocation, setWorkoutLocation,
    locationSearch, setLocationSearch,
    showMidWorkoutPicker, setShowMidWorkoutPicker,
    swappingExerciseIdx, setSwappingExerciseIdx,
    // Plan editor
    planningDate, setPlanningDate,
    editingPlan, setEditingPlan,
    planName, setPlanName,
    planExerciseConfigs, setPlanExerciseConfigs,
    planWarmup, setPlanWarmup,
    planCooldown, setPlanCooldown,
    // Template editor
    editingTemplate, setEditingTemplate,
    tplName, setTplName,
    tplExerciseConfigs, setTplExerciseConfigs,
    tplWarmup, setTplWarmup,
    tplCooldown, setTplCooldown,
    showSaveTemplate, setShowSaveTemplate,
    templateName, setTemplateName,
    buildingTemplate, setBuildingTemplate,
    // History
    editingLogIdx, setEditingLogIdx,
    editingLogName, setEditingLogName,
    expandedLogIdx, setExpandedLogIdx,
    copiedIdx, setCopiedIdx,
    // Library
    sharedExercises, setSharedExercises,
    shareToLibrary, setShareToLibrary,
    showAddExercise, setShowAddExercise,
    newExercise, setNewExercise,
    editingExercise, setEditingExercise,
    librarySearch, setLibrarySearch,
    exerciseSearch, setExerciseSearch,
    // Calendar
    calendarMonth, setCalendarMonth,
    calendarSelectedDate, setCalendarSelectedDate,
    // UI
    showHelp, setShowHelp,
    dismissedHints, dismissHint,
    // Helpers
    toggleTheme, moveItem, persist,
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkout must be used within a WorkoutProvider");
  return ctx;
}
