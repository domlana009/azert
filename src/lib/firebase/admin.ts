
import admin from 'firebase-admin';
// import path from 'path'; // Keep commented unless switching to process.cwd()

// Function to initialize Firebase Admin SDK
const initializeFirebaseAdmin = (): admin.auth.Auth | null => {
  // Check if the SDK is already initialized to prevent re-initialization errors
  if (admin.apps.length > 0) {
    // console.log("Firebase Admin SDK already initialized."); // Reduce console noise
    return admin.auth(); // Return existing auth instance
  }

  console.log("Attempting to initialize Firebase Admin SDK...");

  try {
    // --- Option 1: Try environment variable (Recommended for Deployment) ---
    // Vercel, Netlify, Cloud Run, Docker: Set FIREBASE_SERVICE_ACCOUNT_KEY environment variable
    // with the *entire content* of your service account JSON file (as a single line).
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log("Found FIREBASE_SERVICE_ACCOUNT_KEY environment variable.");
      try {
        // Ensure the environment variable value is valid JSON
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialized successfully via environment variable.");
        return admin.auth(); // Initialization successful
      } catch (e: any) {
         console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY JSON from environment variable:", e.message);
         console.error("Ensure the environment variable contains the complete and valid JSON content of the service account key.");
         // Continue to try the local file method if env var parsing fails
      }
    } else {
       console.log("FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found. Trying local file...");
    }

    // --- Option 2: Fallback to local file (Primarily for Local Development) ---
    // Place 'serviceAccountKey.json' in the project root directory.
    // IMPORTANT: Add 'serviceAccountKey.json' to your .gitignore file to avoid committing secrets!
    console.log("Attempting to initialize Firebase Admin SDK via local serviceAccountKey.json file...");
    try {
       // The path needs to be relative from the *built* file's location in .next/server/...
       // This relative path might be fragile depending on build/deployment specifics.
       // Alternative: const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
       // require(serviceAccountPath); // Requires 'path' import
       const serviceAccountFile = require('../../../serviceAccountKey.json'); // Adjust path if necessary based on build output structure

       admin.initializeApp({
         credential: admin.credential.cert(serviceAccountFile),
       });
       console.log("Firebase Admin SDK initialized successfully via local serviceAccountKey.json file.");
       return admin.auth(); // Initialization successful
    } catch (fileError: any) {
      // Specifically check for MODULE_NOT_FOUND, which is common if the file isn't there
      if (fileError.code === 'MODULE_NOT_FOUND') {
         console.warn("Local serviceAccountKey.json not found at the expected location relative to the build output (e.g., '../../../serviceAccountKey.json'). This is expected if using the environment variable method.");
      } else {
         // Log other errors related to loading/parsing the file
         console.error("Error loading or parsing local serviceAccountKey.json file:", fileError.message);
      }
    }

  } catch (error: any) {
    // Catch potential errors during the admin.initializeApp call itself (less common)
    console.error("Unexpected error during Firebase Admin SDK initialization:", error.message);
  }

  // --- Initialization Failed ---
  // If neither the environment variable nor the local file worked
  console.error("CRITICAL: Firebase Admin SDK initialization failed after trying all methods.");
  console.error("Please verify your Firebase Admin SDK setup:");
  console.error("1. Environment Variable Method (Recommended for Deployment): Ensure 'FIREBASE_SERVICE_ACCOUNT_KEY' environment variable is set with the *complete and valid JSON content* of your service account key (as a single line). Check your hosting provider's environment variable settings.");
  console.error("2. Local File Method (Primarily for Local Dev): Ensure 'serviceAccountKey.json' exists in the *project root directory*, contains valid JSON, and is correctly copied/accessible at runtime (check build process if deploying). Add it to .gitignore!");
  console.error("Refer to README.md or Firebase documentation for detailed setup instructions.");
  return null; // Indicate failure
};

// Initialize and attempt to get the adminAuth instance
const adminAuthInstance = initializeFirebaseAdmin();

// Export the instance only if initialization was successful.
// Throwing an error makes the initialization failure immediate and clear during server startup/request.
if (!adminAuthInstance) {
   // Ensure this error message clearly indicates the user needs to check configuration.
   throw new Error("Firebase Admin SDK could not be initialized. Check server logs for details. Common causes are missing or invalid service account credentials (env var or local file). Please verify your setup according to the README.md.");
}

export const adminAuth = adminAuthInstance;
// Export other admin services if needed, e.g., admin.firestore()
