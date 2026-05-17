
'use client';

import { collection, addDoc, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Report } from '@/lib/types';

/**
 * Submits a new report to the sanctuary Guardians.
 */
export async function submitReport(
  db: Firestore, 
  reportData: Omit<Report, 'id' | 'createdAt' | 'status'>
) {
  const reportsRef = collection(db, 'reports');
  const finalData = {
    ...reportData,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  return addDoc(reportsRef, finalData).catch(async (serverError) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: 'reports',
      operation: 'create',
      requestResourceData: finalData
    }));
    throw serverError;
  });
}
