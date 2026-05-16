
'use client';

import { 
  doc, 
  setDoc, 
  deleteDoc, 
  increment, 
  updateDoc, 
  Firestore, 
  getDoc 
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Toggles a follow relationship between two users.
 */
export async function toggleFollow(db: Firestore, followerId: string, followingId: string) {
  if (followerId === followingId) return false;
  
  const followId = `${followerId}_${followingId}`;
  const followRef = doc(db, 'follows', followId);
  const followerRef = doc(db, 'users', followerId);
  const followingRef = doc(db, 'users', followingId);

  const followSnap = await getDoc(followRef);

  if (followSnap.exists()) {
    // Unfollow
    deleteDoc(followRef).then(() => {
      updateDoc(followerRef, { followingCount: increment(-1) });
      updateDoc(followingRef, { followerCount: increment(-1) });
    }).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: followRef.path,
        operation: 'delete'
      }));
    });
    return false;
  } else {
    // Follow
    setDoc(followRef, {
      followerId,
      followingId,
      createdAt: new Date().toISOString()
    }).then(() => {
      updateDoc(followerRef, { followingCount: increment(1) });
      updateDoc(followingRef, { followerCount: increment(1) });
    }).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: followRef.path,
        operation: 'create'
      }));
    });
    return true;
  }
}
