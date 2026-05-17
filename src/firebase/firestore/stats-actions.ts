'use client';

import { 
  doc, 
  setDoc, 
  increment, 
  Firestore 
} from 'firebase/firestore';

/**
 * Increments the global site-wide view counter.
 * Uses setDoc with merge: true to ensure the document exists.
 */
export async function incrementGlobalViews(db: Firestore) {
  const statsRef = doc(db, 'stats', 'site');
  
  try {
    await setDoc(statsRef, {
      totalViews: increment(1)
    }, { merge: true });
  } catch (error) {
    console.warn("The Oracle could not record this arrival:", error);
  }
}
