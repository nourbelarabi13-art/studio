
'use client';

import { 
  doc, 
  setDoc, 
  Firestore 
} from 'firebase/firestore';
import { EndingVote } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Casts a vote for a story ending choice.
 */
export function castEndingVote(
  db: Firestore, 
  novelId: string, 
  userId: string, 
  choiceIndex: number
) {
  const voteRef = doc(db, 'novels', novelId, 'votes', userId);
  const voteData: EndingVote = {
    userId,
    choiceIndex,
    createdAt: new Date().toISOString(),
  };

  setDoc(voteRef, voteData).catch(() => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: voteRef.path,
      operation: 'write',
      requestResourceData: voteData
    }));
  });
}
