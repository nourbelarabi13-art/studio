import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase App, Firestore, and Auth instances.
 * This is safe to call multiple times as it checks for existing apps.
 * 
 * IMPORTANT: This should only be called on the client side during 
 * hydration to prevent build-time network attempts.
 */
export function initializeFirebase() {
  // Ensure we are in a browser environment or handle gracefully
  const isBrowser = typeof window !== 'undefined';
  
  if (!isBrowser) {
    return { firebaseApp: null, firestore: null, auth: null };
  }

  try {
    const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);

    return { firebaseApp, firestore, auth };
  } catch (error) {
    console.error("The Archive could not be initialized during this ritual:", error);
    return { firebaseApp: null, firestore: null, auth: null };
  }
}
