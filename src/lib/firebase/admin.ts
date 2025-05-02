
import admin from 'firebase-admin';

// Function to initialize Firebase Admin SDK
const initializeFirebaseAdmin = (): admin.auth.Auth | null => {
  if (admin.apps.length > 0) {
    console.log("Firebase Admin SDK already initialized.");
    return admin.auth(); // Return existing auth instance
  }

  try {
    // Option 1: Try environment variable (Recommended for Vercel/similar platforms)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK initialized via env var.");
      return admin.auth();
    }

    // Option 2: Fallback to local file (for local development)
    try {
       // Use dynamic import to avoid bundling errors if the file doesn't exist in production
       // Adjust the path relative to the compiled output if necessary.
       // Assuming the build process keeps the structure, '../../..' might be needed
       // depending on where the compiled file ends up in .next/server.
       // For now, let's assume the path is relative to the project root during build/runtime.
       const serviceAccountFile = require('../../../serviceAccountKey.json');
       admin.initializeApp({
         credential: admin.credential.cert(serviceAccountFile),
       });
       console.log("Firebase Admin SDK initialized via local file.");
       return admin.auth();
    } catch (fileError: any) {
      if (fileError.code === 'MODULE_NOT_FOUND') {
         console.warn("Local serviceAccountKey.json not found. This is expected if using env var.");
      } else {
         console.error("Error initializing Firebase Admin SDK from local file:", fileError.message);
      }
    }

  } catch (error: any) {
    console.error("General Error initializing Firebase Admin SDK:", error.message);
  }

  // If neither method worked
  console.error("CRITICAL: Firebase Admin SDK initialization failed. Ensure FIREBASE_SERVICE_ACCOUNT_KEY env var is set or serviceAccountKey.json exists and is valid.");
  return null; // Indicate failure
};

// Initialize and export adminAuth
const adminAuthInstance = initializeFirebaseAdmin();

// Export the instance only if initialization was successful
// Server Actions/Components importing this will need to handle the null case or it will throw later.
// Throwing here makes the initialization failure immediate and clear.
if (!adminAuthInstance) {
   throw new Error("Firebase Admin SDK could not be initialized. See server logs for details.");
}

export const adminAuth = adminAuthInstance;
// Export other admin services if needed, e.g., admin.firestore()

