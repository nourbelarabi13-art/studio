
'use client';

import { 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  collection, 
  addDoc,
  Firestore 
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Notification, NotificationType } from '@/lib/types';

/**
 * Creates a notification for a user.
 */
export function createNotification(
  db: Firestore, 
  toUid: string, 
  data: Omit<Notification, 'read' | 'createdAt'>
) {
  const notificationsRef = collection(db, 'users', toUid, 'notifications');
  const notificationData = {
    ...data,
    read: false,
    createdAt: new Date().toISOString()
  };

  addDoc(notificationsRef, notificationData).catch(() => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: `users/${toUid}/notifications`,
      operation: 'create',
      requestResourceData: notificationData
    }));
  });
}

/**
 * Marks a specific notification as read.
 */
export function markNotificationAsRead(db: Firestore, uid: string, notificationId: string) {
  const notificationRef = doc(db, 'users', uid, 'notifications', notificationId);
  updateDoc(notificationRef, { read: true }).catch(() => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: notificationRef.path,
      operation: 'update'
    }));
  });
}

/**
 * Marks all notifications as read for a user.
 * Note: In a real app with many docs, this should be done via a batch or server action.
 * For this MVP, we provide individual mark functions.
 */

/**
 * Deletes a notification.
 */
export function deleteNotification(db: Firestore, uid: string, notificationId: string) {
  const notificationRef = doc(db, 'users', uid, 'notifications', notificationId);
  deleteDoc(notificationRef).catch(() => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: notificationRef.path,
      operation: 'delete'
    }));
  });
}
