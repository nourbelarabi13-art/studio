
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

/**
 * Increments the view count for a novel.
 */
export function incrementNovelView(db: Firestore, novelId: string) {
  const novelRef = doc(db, 'novels', novelId);
  updateDoc(novelRef, {
    views: increment(1)
  }).catch(async () => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: `novels/${novelId}`,
      operation: 'update'
    }));
  });
}

/**
 * Toggles a like for a novel. 
 */
export async function toggleLikeNovel(db: Firestore, novelId: string, userId: string, userName: string) {
  const likeRef = doc(db, 'novels', novelId, 'userLikes', userId);
  const novelRef = doc(db, 'novels', novelId);

  const novelSnap = await getDoc(novelRef);
  const novelData = novelSnap.data();
  const likeSnap = await getDoc(likeRef);

  if (likeSnap.exists()) {
    // Unlike
    deleteDoc(likeRef).then(() => {
      updateDoc(novelRef, { likes: increment(-1) });
    }).catch(() => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: likeRef.path,
        operation: 'delete'
      }));
    });
    return false;
  } else {
    // Like
    setDoc(likeRef, { createdAt: new Date().toISOString() }).then(() => {
      updateDoc(novelRef, { likes: increment(1) });
      
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
    }).catch(() => {
       errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: likeRef.path,
        operation: 'create'
      }));
    });
    return true;
  }
}
