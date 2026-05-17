/**
 * Firebase Configuration for the Rosaline Bela sanctuary.
 * Standardized with robust build-safe fallbacks for static export cycles.
 * 
 * In 'output: export' mode, environment variables must be prefixed with 
 * NEXT_PUBLIC_ to be available during the build phase on CI/CD platforms.
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIza_BUILD_PLACEHOLDER",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "rosaline-bela.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rosaline-bela",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "rosaline-bela.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000",
};
