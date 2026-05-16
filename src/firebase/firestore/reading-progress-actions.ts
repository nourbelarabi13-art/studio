
'use client';

import { 
  doc, 
  setDoc, 
  Firestore, 
  serverTimestamp 
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { ReadingProgress } from '@/lib/types';
import { checkAchievements } from './achievement-actions';

/**
 * Saves or updates reading progress for a user and novel.
 */
export function saveReadingProgress(
  db: Firestore, 
  progress: Omit<ReadingProgress, 'lastReadAt'>
) {
  const progressRef = doc(db, 'users', progress.uid, 'progress', progress.novelId);
  
  setDoc(progressRef, {
    ...progress,
    lastReadAt: new Date().toISOString()
  }, { merge: true }).then(() => {
    checkAchievements(db, progress.uid);
  }).catch((error) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: progressRef.path,
      operation: 'write',
      requestResourceData: progress
    }));
  });
}
