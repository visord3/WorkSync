// services/firebase/firebaseconfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Define hardcoded Firebase configuration
// In a production app, you should use environment variables
// but for this fix, we'll use hardcoded values to ensure it works
const firebaseConfig = {
  apiKey: "AIzaSyAYYsURgTegcWjyAVpz55nzQnUwdD0_PFI",  // Replace with your actual API key
  authDomain: "worksynch-cfde5.firebaseapp.com",      // From your .firebaserc file
  projectId: "worksynch-cfde5",                       // From your .firebaserc file
  storageBucket: "worksynch-cfde5.appspot.com",
  messagingSenderId: "123456789",                     // Replace with your actual sender ID
  appId: "1:123456789:web:abcdef1234567890abcdef"     // Replace with your actual app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Enable offline persistence for Firestore
try {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firebase persistence could not be enabled - multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firebase persistence not available in this browser');
      } else {
        console.error('Firebase persistence error:', err);
      }
    });
} catch (error) {
  console.warn('Error initializing IndexedDB persistence. Continuing without offline capability.', error);
}

// Check if we're in development mode
const isDev = __DEV__;
if (isDev) {
  // If using emulators, uncomment these lines
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectFunctionsEmulator(functions, 'localhost', 5001);
  console.log('Running in development mode');
}

export { app, auth, db, functions };
export default { app, auth, db, functions };