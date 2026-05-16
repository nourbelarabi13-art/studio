
'use client';

import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  Firestore 
} from 'firebase/firestore';
import { Comment } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { createNotification } from './notification-actions';

/**
 * Adds a comment to a novel.
 */
export function addComment(
  db: Firestore, 
  novelId: string, 
  novelTitle: string,
  authorId: string,
  userId: string, 
  userName: string, 
  text: string, 
  parentId?: string
) {
  const commentsRef = collection(db, 'novels', novelId, 'comments');
  const commentData: Omit<Comment, 'id'> = {
    userId,
    userName,
    text,
    parentId,
    createdAt: new Date().toISOString(),
  };

  addDoc(commentsRef, commentData).then((docRef) => {
    // Notify author if not the same person
    if (authorId !== userId && !parentId) {
      createNotification(db, authorId, {
        type: 'comment',
        message: `${userName} whispered a thought on "${novelTitle}".`,
        fromUserId: userId,
        fromUserName: userName,
        targetId: novelId
      });
    }
  }).catch(() => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: `novels/${novelId}/comments`,
      operation: 'create',
      requestResourceData: commentData
    }));
  });
}

/**
 * Deletes a comment.
 */
export function deleteComment(db: Firestore, novelId: string, commentId: string) {
  const commentRef = doc(db, 'novels', novelId, 'comments', commentId);
  deleteDoc(commentRef).catch(() => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: commentRef.path,
      operation: 'delete'
    }));
  });
}
