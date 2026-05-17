
'use client';

import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  Firestore 
} from 'firebase/firestore';
import { SideNote } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Adds a private side note to a novel.
 */
export async function addSideNote(
  db: Firestore, 
  novelId: string, 
  data: Omit<SideNote, 'id' | 'createdAt'>
) {
  const notesRef = collection(db, 'novels', novelId, 'notes');
  const noteData = {
    ...data,
    createdAt: new Date().toISOString(),
  };

  addDoc(notesRef, noteData).catch(() => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: `novels/${novelId}/notes`,
      operation: 'create',
      requestResourceData: noteData
    }));
  });
}

/**
 * Deletes a side note.
 */
export function deleteSideNote(db: Firestore, novelId: string, noteId: string) {
  const noteRef = doc(db, 'novels', novelId, 'notes', noteId);
  deleteDoc(noteRef).catch(() => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: noteRef.path,
      operation: 'delete'
    }));
  });
}
