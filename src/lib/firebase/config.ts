
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
let auth: ReturnType<typeof getAuth> | null = null; // Initialize auth to null

// Function to check if API key is potentially valid (basic check)
function isApiKeyPotentiallyValid(apiKey?: string): boolean {
  // Basic check: Not empty and doesn't look like a placeholder
  return !!apiKey && !apiKey.startsWith("YOUR_") && apiKey.length > 10;
}

if (!getApps().length) {
  // Validate essential config values before initializing
  if (!isApiKeyPotentiallyValid(firebaseConfig.apiKey)) {
    console.error(`Firebase API Key is missing or invalid: '${firebaseConfig.apiKey}'. Please check your .env file and ensure NEXT_PUBLIC_FIREBASE_API_KEY is set correctly.`);
    // You might want to throw an error here or handle it differently depending on your app's needs
  } else if (!firebaseConfig.projectId) {
     console.error("Firebase Project ID is missing. Please check your .env file and ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set.");
     // Throw or handle error
  } else {
      // Only initialize if essential config seems present and valid
      try {
         app = initializeApp(firebaseConfig);
         // Initialize Firebase Authentication and get a reference to the service only after successful app initialization
         auth = getAuth(app);
         console.log("Firebase initialized successfully."); // Log success
      } catch (error: any) { // Catch specific error type if possible
         console.error("Error initializing Firebase:", error.message || error);
         // Handle initialization error (e.g., show a message to the user)
         // You might want to set a global error state here
      }
  }

} else {
  app = getApp();
   // Ensure auth is initialized if the app already exists
  try {
    auth = getAuth(app);
     console.log("Firebase app already initialized."); // Log info
  } catch (error: any) {
     console.error("Error getting Firebase Auth for existing app:", error.message || error);
  }
}


// Check if auth initialization failed after trying
if (!auth) { // Only log if auth is still null after attempts
  console.error("Firebase Authentication could not be initialized. This is often due to missing or invalid configuration in your .env file (e.g., NEXT_PUBLIC_FIREBASE_API_KEY). Please verify your Firebase project settings.");
}

// Export auth, which might be null if initialization failed
export { app, auth };
