
import admin from 'firebase-admin';
import path from 'path'; // Import path for potentially more robust file path resolution

// Function to initialize Firebase Admin SDK
const initializeFirebaseAdmin = (): admin.auth.Auth | null => {
  if (admin.apps.length > 0) {
    // console.log("Firebase Admin SDK already initialized."); // Reduce console noise
    return admin.auth(); // Return existing auth instance
  }

  console.log("Attempting to initialize Firebase Admin SDK...");

  try {
    // Option 1: Try environment variable (Recommended for Vercel/similar platforms)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log("Found FIREBASE_SERVICE_ACCOUNT_KEY environment variable.");
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialized successfully via environment variable.");
        return admin.auth();
      } catch (e: any) {
         console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY from environment variable:", e.message);
         // Continue to try local file if env var parsing fails
      }
    } else {
       console.log("FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found.");
    }

    // Option 2: Fallback to local file (for local development)
    // Ensure serviceAccountKey.json is in the project root directory
    // IMPORTANT: Make sure 'serviceAccountKey.json' is added to your .gitignore file!
    console.log("Attempting to initialize Firebase Admin SDK via local serviceAccountKey.json file...");
    try {
       // Use a path relative to the project root. process.cwd() should give the project root.
       // const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccountKey.json');
       // console.log(`Looking for service account file at: ${serviceAccountPath}`);
       // const serviceAccountFile = require(serviceAccountPath);

       // Using relative path from compiled output might be fragile. Let's stick to the previous attempt.
       // The path needs to be relative from the *built* file in .next/server
       const serviceAccountFile = require('../../../serviceAccountKey.json');

       admin.initializeApp({
         credential: admin.credential.cert(serviceAccountFile),
       });
       console.log("Firebase Admin SDK initialized successfully via local serviceAccountKey.json file.");
       return admin.auth();
    } catch (fileError: any) {
      if (fileError.code === 'MODULE_NOT_FOUND') {
         console.warn("Local serviceAccountKey.json not found in the expected location relative to the build output. This is expected if using the environment variable method.");
         // console.warn(`(Tried path relative from build output: ../../../serviceAccountKey.json)`); // More debug info
      } else {
         console.error("Error loading or parsing local serviceAccountKey.json file:", fileError.message);
      }
    }

  } catch (error: any) {
    // Catch errors during initializeApp itself
    console.error("Error during admin.initializeApp:", error.message);
  }

  // If neither method worked
  console.error("CRITICAL: Firebase Admin SDK initialization failed.");
  console.error("Please ensure either the FIREBASE_SERVICE_ACCOUNT_KEY environment variable is set correctly (JSON content as a single line)");
  console.error("OR a valid serviceAccountKey.json file exists in the project root directory (and is correctly copied during build/runtime).");
  console.error("Refer to README.md for setup instructions.");
  return null; // Indicate failure
};

// Initialize and export adminAuth
const adminAuthInstance = initializeFirebaseAdmin();

// Export the instance only if initialization was successful
// Throwing an error makes the initialization failure immediate and clear.
if (!adminAuthInstance) {
   throw new Error("Firebase Admin SDK could not be initialized. Check server logs for details. Common causes are missing or invalid service account credentials (env var or local file).");
}

export const adminAuth = adminAuthInstance;
// Export other admin services if needed, e.g., admin.firestore()

