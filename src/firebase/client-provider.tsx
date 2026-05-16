'use client';

import React, { useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './init';
import { FirebaseErrorListener } from '@/components/firebase-error-listener';

/**
 * A client-side wrapper for the FirebaseProvider that handles 
 * initialization internally and includes the error listener.
 */
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Initialize Firebase once on the client
  const { firebaseApp, firestore, auth } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
};
