// services/firebase/firebaseconfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIC7fHWpbHOzsZo2DJCbUbwou-iyXOToQ",
  authDomain: "worksynch-cfde5.firebaseapp.com",
  projectId: "worksynch-cfde5",
  storageBucket: "worksynch-cfde5.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "84910163980",
  appId: "1:84910163980:web:48b4fd362de35dc608c629"
};

// Initialize Firebase - prevent duplicate initialization
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Enable offline persistence for Firestore
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

// Check if we're in development mode - enables emulators if needed
const isDev = process.env.NODE_ENV === 'development' || __DEV__;
if (isDev) {
  // Uncomment these lines if you're using Firebase emulators
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { app, auth, db, functions };
export default { app, auth, db, functions };