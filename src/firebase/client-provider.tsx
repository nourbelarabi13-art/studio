'use client';

import React, { useState, useEffect } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './init';
import { FirebaseErrorListener } from '@/components/firebase-error-listener';

/**
 * A client-side wrapper for the FirebaseProvider that handles 
 * initialization internally and ensures hydration safety.
 * 
 * This is the primary gatekeeper ensuring Firebase only manifests
 * when a physical traveler (browser) is present.
 */
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [firebase, setFirebase] = useState<{
    firebaseApp: any;
    firestore: any;
    auth: any;
  } | null>(null);

  useEffect(() => {
    // Initialize Firebase only on the client after initial mount
    // to avoid mismatch between server-rendered and client-rendered HTML.
    const instances = initializeFirebase();
    setFirebase(instances);
  }, []);

  return (
    <FirebaseProvider 
      firebaseApp={firebase?.firebaseApp || null} 
      firestore={firebase?.firestore || null} 
      auth={firebase?.auth || null}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
};
