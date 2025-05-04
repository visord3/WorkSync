// services/firebase/firebaseconfig.ts

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration (MAKE SURE THESE ARE CORRECT FOR YOUR PROJECT)
const firebaseConfig = {
  apiKey: "AIzaSyBIC7fHWpbHOzsZo2DJCbUbwou-iyXOToQ", // From your previous file
  authDomain: "worksynch-cfde5.firebaseapp.com",   // From your previous file
  projectId: "worksynch-cfde5",                   // From your previous file
  storageBucket: "worksynch-cfde5.firebasestorage.app", // From your previous file (check if needed)
  messagingSenderId: "84910163980",               // From your previous file
  appId: "1:84910163980:web:48b4fd362de35dc608c629", // From your previous file
  // measurementId: "G-R5KH39FYB6" // Optional, from your previous file
};


initializeApp(firebaseConfig);



// Get Auth and Firestore instances
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default { app, auth, db, functions };