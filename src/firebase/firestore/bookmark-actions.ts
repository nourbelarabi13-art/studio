
'use client';

import { 
  doc, 
  setDoc, 
  deleteDoc, 
  Firestore, 
  getDoc 
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Bookmark, BookmarkCategory } from '@/lib/types';

/**
 * Toggles a bookmark for a user.
 */
export async function toggleBookmark(
  db: Firestore, 
  uid: string, 
  novelId: string, 
  novelData: { title: string; coverImage: string; authorUsername: string },
  category: BookmarkCategory = 'read-later'
) {
  const bookmarkRef = doc(db, 'users', uid, 'bookmarks', novelId);
  const bookmarkSnap = await getDoc(bookmarkRef);

  if (bookmarkSnap.exists() && bookmarkSnap.data().category === category) {
    // Remove if same category
    deleteDoc(bookmarkRef).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: bookmarkRef.path,
        operation: 'delete'
      }));
    });
    return false;
  } else {
    // Add or update category
    const bookmarkData: Bookmark = {
      uid,
      novelId,
      novelTitle: novelData.title,
      coverImage: novelData.coverImage,
      authorUsername: novelData.authorUsername,
      category,
      createdAt: new Date().toISOString()
    };

    setDoc(bookmarkRef, bookmarkData).catch(() => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: bookmarkRef.path,
        operation: 'write',
        requestResourceData: bookmarkData
      }));
    });
    return true;
  }
}
