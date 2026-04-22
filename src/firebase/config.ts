import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database, ref, set, onValue, DataSnapshot } from 'firebase/database';
import type { GameState } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.databaseURL &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let db: Database | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
  } catch (e) {
    console.warn('Firebase initialization failed, using localStorage fallback:', e);
  }
}

export function subscribeToState(
  callback: (state: GameState | null) => void
): () => void {
  if (db) {
    const stateRef = ref(db, 'gameState');
    const unsubscribe = onValue(stateRef, (snapshot: DataSnapshot) => {
      callback(snapshot.val());
    });
    return unsubscribe;
  }
  // localStorage fallback
  const handler = (e: StorageEvent) => {
    if (e.key === 'gameState' && e.newValue) {
      callback(JSON.parse(e.newValue));
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

export function saveState(state: GameState): void {
  if (db) {
    set(ref(db, 'gameState'), state);
  }
  // Always save to localStorage as cache
  localStorage.setItem('gameState', JSON.stringify(state));
}

export function loadCachedState(): GameState | null {
  const cached = localStorage.getItem('gameState');
  return cached ? JSON.parse(cached) : null;
}

export { db, ref, set, onValue };
