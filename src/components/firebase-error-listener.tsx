'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * listens for FirestorePermissionErrors emitted by the errorEmitter
 * and throws them so they can be caught by the Next.js error boundary.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error) => {
      // This will trigger the Next.js error overlay in development
      throw error;
    });
    return unsubscribe;
  }, []);

  return null;
}
