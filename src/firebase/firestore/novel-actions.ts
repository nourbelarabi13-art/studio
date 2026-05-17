
'use client';

import { 
  doc, 
  updateDoc, 
  increment, 
  Firestore,
  setDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { createNotification } from './notification-actions';
import { checkAchievements } from './achievement-actions';

/**
 * Increments the view count for a novel and the author's total view count.
 */
export async function incrementNovelView(db: Firestore, novelId: string) {
  const novelRef = doc(db, 'novels', novelId);
  const novelSnap = await getDoc(novelRef);
  
  if (!novelSnap.exists()) return;
  const novelData = novelSnap.data();

  updateDoc(novelRef, {
    views: increment(1)
  }).then(() => {
    // Also update author total views
    if (novelData.authorId) {
      updateDoc(doc(db, 'users', novelData.authorId), {
        totalViews: increment(1)
      }).then(() => {
        checkAchievements(db, novelData.authorId);
      }).catch(() => {
        // Silent error for secondary updates
      });
    }
  }).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: `novels/${novelId}`,
      operation: 'update'
    }));
  });
}

/**
 * Toggles a like for a novel and updates the author's total like count.
 */
export async function toggleLikeNovel(db: Firestore, novelId: string, userId: string, userName: string) {
  const likeRef = doc(db, 'novels', novelId, 'userLikes', userId);
  const novelRef = doc(db, 'novels', novelId);

  const novelSnap = await getDoc(novelRef);
  if (!novelSnap.exists()) return false;
  
  const novelData = novelSnap.data();
  const authorRef = doc(db, 'users', novelData.authorId);
  const likeSnap = await getDoc(likeRef);

  if (likeSnap.exists()) {
    // Unlike
    return deleteDoc(likeRef).then(() => {
      updateDoc(novelRef, { likes: increment(-1) });
      updateDoc(authorRef, { totalLikes: increment(-1) }).then(() => {
        checkAchievements(db, novelData.authorId);
      });
      return false;
    }).catch(() => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: likeRef.path,
        operation: 'delete'
      }));
       return true;
    });
  } else {
    // Like
    const likeData = { createdAt: new Date().toISOString() };
    return setDoc(likeRef, likeData).then(() => {
      updateDoc(novelRef, { likes: increment(1) });
      updateDoc(authorRef, { totalLikes: increment(1) }).then(() => {
        checkAchievements(db, novelData.authorId);
      });
      
      // Notify author
      if (novelData && novelData.authorId !== userId) {
        createNotification(db, novelData.authorId, {
          type: 'like',
          message: `${userName} appreciated your chronicle "${novelData.title}".`,
          fromUserId: userId,
          fromUserName: userName,
          targetId: novelId
        });
      }
      return true;
    }).catch(() => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: likeRef.path,
        operation: 'write',
        requestResourceData: likeData
      }));
       return false;
    });
  }
}
