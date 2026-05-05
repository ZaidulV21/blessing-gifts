// src/firebase/config.js
// Safe initialisation — returns null if env vars are missing
// so the app never crashes before Firebase is connected.

import { initializeApp, getApps } from "firebase/app";
import { getFirestore }  from "firebase/firestore";
import { getStorage }    from "firebase/storage";
import { getAuth }       from "firebase/auth";

const {
  REACT_APP_FIREBASE_API_KEY:            apiKey,
  REACT_APP_FIREBASE_AUTH_DOMAIN:        authDomain,
  REACT_APP_FIREBASE_PROJECT_ID:         projectId,
  REACT_APP_FIREBASE_STORAGE_BUCKET:     storageBucket,
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID: messagingSenderId,
  REACT_APP_FIREBASE_APP_ID:             appId,
} = process.env;

// Only initialise if ALL critical keys are present
const isConfigured = apiKey && projectId && appId;

let app     = null;
let db      = null;
let storage = null;
let auth    = null;

if (isConfigured) {
  try {
    // Avoid duplicate app initialisation (happens in dev with hot reload)
    app     = getApps().length ? getApps()[0] : initializeApp({ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId });
    db      = getFirestore(app);
    storage = storageBucket ? getStorage(app) : null;
    auth    = getAuth(app);
  } catch (err) {
    console.error("Firebase init error:", err.message);
  }
}

export { db, storage, auth };
export default app;