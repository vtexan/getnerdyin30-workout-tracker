// NOTE: This is a client-side Firebase API key, not a secret.
// It is safe to expose in source code — access is controlled by
// Firebase Auth and Firestore Security Rules, not by the key itself.
// See: https://firebase.google.com/docs/projects/api-keys

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyClaFN6GEpbheA7uSlOSSKKYBUntukG1Qs",
  authDomain: "getnerdyin30-tracker.firebaseapp.com",
  projectId: "getnerdyin30-tracker",
  storageBucket: "getnerdyin30-tracker.firebasestorage.app",
  messagingSenderId: "726007897188",
  appId: "1:726007897188:web:82b7c6a966d50b98cd5371",
  measurementId: "G-HCC427Q6C9"
};

// Firebase is loaded via CDN <script> tags in index.html (v8 compat)
firebase.initializeApp(FIREBASE_CONFIG);

export const auth = firebase.auth();
export const db = firebase.firestore();

db.enablePersistence({ synchronizeTabs: true }).catch(err => {
  if (err.code === "failed-precondition") console.warn("Offline persistence unavailable: multiple tabs open");
  else if (err.code === "unimplemented") console.warn("Offline persistence not supported in this browser");
});

export const googleProvider = new firebase.auth.GoogleAuthProvider();

export const loadData = async (uid) => {
  try {
    const snap = await db.collection("users").doc(uid).collection("data").doc("workouts").get();
    return snap.exists ? snap.data() : null;
  } catch (e) { console.error("Load failed:", e); return null; }
};

export const saveData = async (uid, data) => {
  try {
    await db.collection("users").doc(uid).collection("data").doc("workouts").set(data);
  } catch (e) { console.error("Save failed:", e); }
};

export const saveActiveWorkoutDraft = async (uid, workout) => {
  try {
    if (workout) {
      await db.collection("users").doc(uid).collection("data").doc("activeDraft").set(workout);
    } else {
      await db.collection("users").doc(uid).collection("data").doc("activeDraft").delete();
    }
  } catch (e) { console.error("Draft save failed:", e); }
};

export const loadActiveWorkoutDraft = async (uid) => {
  try {
    const snap = await db.collection("users").doc(uid).collection("data").doc("activeDraft").get();
    return snap.exists ? snap.data() : null;
  } catch (e) { console.error("Draft load failed:", e); return null; }
};
