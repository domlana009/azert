// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: Ensure these environment variables are correctly set in your .env file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if it hasn't been initialized yet
let app;
if (!getApps().length) {
  // Validate essential config values before initializing
  if (!firebaseConfig.apiKey) {
    console.error("Firebase API Key is missing. Please check your .env file and ensure NEXT_PUBLIC_FIREBASE_API_KEY is set.");
  }
  if (!firebaseConfig.projectId) {
     console.error("Firebase Project ID is missing. Please check your .env file and ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set.");
  }
  // Add more checks as needed

  try {
     app = initializeApp(firebaseConfig);
  } catch (error) {
     console.error("Error initializing Firebase:", error);
     // Handle initialization error (e.g., show a message to the user)
  }

} else {
  app = getApp();
}

// Initialize Firebase Authentication and get a reference to the service
// Ensure 'app' is defined before calling getAuth
const auth = app ? getAuth(app) : null;

// Check if auth initialization failed
if (!auth && app) {
  console.error("Firebase Authentication could not be initialized. Check Firebase config and initialization.");
}

export { app, auth };
