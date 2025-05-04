// services/firebase/firebaseconfig.ts

// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app"; // Import initializeApp and helpers
import { getAuth } from "firebase/auth"; // Import getAuth
import { getFirestore } from "firebase/firestore"; // Import getFirestore for Firestore
// import { getAnalytics } from "firebase/analytics"; // Optional

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


const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);



// Get Auth and Firestore instances
const auth = getAuth(app); // Get the auth instance [cite: 44]
const firestore = getFirestore(app); // Get the firestore instance


// Export the initialized services
export { auth, firestore,app }; // Export auth [cite: 44] and firestore