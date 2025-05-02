
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Attempt to load service account credentials
// Try environment variable first, then local file

let serviceAccountJson: string | null = null;
let initializedVia: string | null = null; // Keep track of how it was initialized

// Method 1: Environment Variable (Recommended for deployment)
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  initializedVia = 'environment variable';
  console.log("Firebase Admin SDK: Attempting initialization via environment variable.");
} else {
   console.log("Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found.");
}


// Method 2: Local File (Easier for local dev, ensure it's gitignored)
if (!serviceAccountJson) {
   const serviceAccountPath = path.resolve('./serviceAccountKey.json'); // Use path.resolve for absolute path
    console.log(`Firebase Admin SDK: Checking for local file at ${serviceAccountPath}...`);
  try {
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccountJson = fs.readFileSync(serviceAccountPath, 'utf8');
      initializedVia = 'local file (serviceAccountKey.json)';
       console.log("Firebase Admin SDK: Found and using local serviceAccountKey.json file.");
    } else {
       console.log("Firebase Admin SDK: Local serviceAccountKey.json file not found.");
    }
  } catch (error: any) {
    console.error(`Firebase Admin SDK: Error reading local serviceAccountKey.json: ${error.message}`);
    // Proceed without local file if reading fails
    serviceAccountJson = null; // Ensure it's null if read failed
  }
}


// Function to initialize Firebase Admin SDK
const initializeFirebaseAdmin = (): admin.auth.Auth | null => {
  // Check if the SDK is already initialized to prevent re-initialization errors
  if (admin.apps.length > 0) {
    // console.log("Firebase Admin SDK already initialized."); // Reduce console noise
    return admin.auth(); // Return existing auth instance
  }

  // Check if we found credentials
  if (!serviceAccountJson) {
     console.error("Firebase Admin SDK: Initialization failed - No service account credentials found (neither env var nor local file).");
     return null;
  }

   let serviceAccount;
   try {
        serviceAccount = JSON.parse(serviceAccountJson);
        // Basic validation of parsed content
        if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
            console.error("Firebase Admin SDK: Parsed service account JSON is missing required fields (project_id, private_key, client_email).");
            return null;
        }
   } catch (error: any) {
       console.error(`Firebase Admin SDK: Failed to parse service account JSON from ${initializedVia}: ${error.message}`);
       return null;
   }


  console.log(`Firebase Admin SDK: Attempting initialization via ${initializedVia}...`);
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK Initialized successfully.'); // Simplified confirmation
  } catch (error: any) {
    // Catch potential errors during the admin.initializeApp call itself
     console.error(`Firebase Admin SDK: Unexpected error during initialization via ${initializedVia}: ${error.message}`);
     // Log the structure of the service account (excluding private key) for debugging if needed
     // console.error("Service Account structure (check fields):", { projectId: serviceAccount.project_id, clientEmail: serviceAccount.client_email });
     return null; // Explicitly return null on initialization error
  }

  // --- Check Initialization Status ---
  if (admin.apps.length > 0) {
      // Remove the reference to the undefined variable 'initializedVia' here
      console.log(`Firebase Admin SDK initialization confirmed.`);
      return admin.auth();
  }

  // --- Initialization Failed (Should theoretically not be reached if above logic is sound) ---
  console.error('CRITICAL: Firebase Admin SDK initialization failed after attempting credential loading.');
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

