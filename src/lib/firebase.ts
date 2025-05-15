import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Log the API key at the very start to see if it's loaded by Next.js
// This will log in both server-side (terminal) and client-side (browser console)
console.log(
  "[Firebase Debug] Raw NEXT_PUBLIC_FIREBASE_API_KEY:",
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY
);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

let app: FirebaseApp; // Initialize as null
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

const requiredKeys: (keyof typeof firebaseConfig)[] = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId",
];
let allRequiredKeysPresent = true;
let missingKeysList: string[] = [];

for (const key of requiredKeys) {
  if (!firebaseConfig[key]) {
    allRequiredKeysPresent = false;
    missingKeysList.push(key);
  }
}

if (!allRequiredKeysPresent) {
  const errorMessage = `[Firebase Error] Firebase configuration is missing or undefined for critical keys: ${missingKeysList.join(
    ", "
  )}. 
Please ensure these are correctly set in your .env.local file (prefixed with NEXT_PUBLIC_) and that you have restarted your Next.js development server.
Firebase will NOT be initialized.`;
  console.error(errorMessage);
  // You could throw an error here to halt execution if preferred:
  // throw new Error(errorMessage);
} else {
  if (getApps().length === 0) {
    console.log("[Firebase Debug] Initializing Firebase app with config:", {
      apiKey: firebaseConfig.apiKey ? "*** (loaded)" : "undefined", // Don't log the actual key
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      // Add other keys if needed for debugging, but avoid logging sensitive parts
    });
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
    console.log("[Firebase Debug] Using existing Firebase app.");
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage };
