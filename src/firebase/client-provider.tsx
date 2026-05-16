'use client';

import React, { useState, useEffect } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './init';
import { FirebaseErrorListener } from '@/components/firebase-error-listener';

/**
 * A client-side wrapper for the FirebaseProvider that handles 
 * initialization internally and ensures hydration safety.
 */
export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [firebase, setFirebase] = useState<{
    firebaseApp: any;
    firestore: any;
    auth: any;
  } | null>(null);

  useEffect(() => {
    const services = initializeFirebase();
    setFirebase(services);
    setMounted(true);
  }, []);

  return (
    <FirebaseProvider 
      firebaseApp={firebase?.firebaseApp || null} 
      firestore={firebase?.firestore || null} 
      auth={firebase?.auth || null}
    >
      <FirebaseErrorListener />
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </FirebaseProvider>
  );
};
