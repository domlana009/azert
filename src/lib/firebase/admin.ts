
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let adminAuthInstance: admin.auth.Auth | null = null;
let initializationError: Error | null = null;
let isInitialized = false;
let initializedVia: string | null = null;

function initializeFirebaseAdmin() {
  if (isInitialized) {
    console.log(`Firebase Admin SDK: Already attempted initialization (via ${initializedVia || 'unknown'}). Status: ${initializationError ? 'Failed' : 'Success'}`);
    return;
  }
  isInitialized = true; // Mark as attempted

  let serviceAccountJson: string | null = null;

  // --- Attempt to Load Credentials ---

  // Method 1: Environment Variable (Recommended for deployment)
  console.log("Firebase Admin SDK: Checking environment variable FIREBASE_SERVICE_ACCOUNT_KEY...");
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim() !== '') {
    serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    initializedVia = 'environment variable';
    console.log("Firebase Admin SDK: Found FIREBASE_SERVICE_ACCOUNT_KEY environment variable.");
  } else {
    console.log("Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found or is empty.");
  }

  // Method 2: Local File (Easier for local dev, ensure it's gitignored)
  if (!serviceAccountJson) {
    const serviceAccountPath = path.resolve('./serviceAccountKey.json'); // Use path.resolve for absolute path
    console.log(`Firebase Admin SDK: Checking for local file at ${serviceAccountPath}...`);
    try {
      if (fs.existsSync(serviceAccountPath)) {
        serviceAccountJson = fs.readFileSync(serviceAccountPath, 'utf8');
        if (serviceAccountJson.trim() === '') {
          console.warn("Firebase Admin SDK: Local serviceAccountKey.json file exists but is empty.");
          serviceAccountJson = null; // Treat empty file as not found
        } else {
          initializedVia = 'local file (serviceAccountKey.json)';
          console.log("Firebase Admin SDK: Found and read local serviceAccountKey.json file.");
        }
      } else {
        console.log("Firebase Admin SDK: Local serviceAccountKey.json file not found.");
      }
    } catch (error: any) {
      console.error(`Firebase Admin SDK: Error reading local serviceAccountKey.json: ${error.message}`);
      serviceAccountJson = null; // Ensure it's null if read failed
    }
  }

  // --- Initialize Firebase Admin SDK ---

  // Check if the SDK is already initialized (might happen in some hot-reload scenarios)
  if (admin.apps.length > 0) {
    console.log(`Firebase Admin SDK: Already initialized (detected existing admin app).`);
    adminAuthInstance = admin.auth(); // Use existing auth instance
    initializedVia = initializedVia || 'existing app detection'; // Update how it was initialized if needed
    return;
  }

  // Check if credentials were found
  if (!serviceAccountJson) {
    initializationError = new Error("CRITICAL - No service account credentials found. Cannot initialize. Check environment variable 'FIREBASE_SERVICE_ACCOUNT_KEY' or the presence and content of 'serviceAccountKey.json' in the project root.");
    console.error(`Firebase Admin SDK: ${initializationError.message}`);
    return;
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
    // Basic validation of parsed content
    if (!serviceAccount || typeof serviceAccount !== 'object' || !serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        throw new Error(`Parsed service account JSON from ${initializedVia} is invalid or missing required fields (project_id, private_key, client_email). Please verify the content of the credentials.`);
    }
    console.log(`Firebase Admin SDK: Successfully parsed service account JSON from ${initializedVia}.`);
  } catch (error: any) {
    initializationError = new Error(`CRITICAL - Failed to parse service account JSON from ${initializedVia || 'unknown source'}. Ensure it's valid JSON. Error: ${error.message}`);
    console.error(`Firebase Admin SDK: ${initializationError.message}`);
    // Log a snippet of the JSON (be careful not to log the private key)
    // console.error("JSON snippet (start):", serviceAccountJson.substring(0, 100) + "...");
    return;
  }

  console.log(`Firebase Admin SDK: Attempting initialization via ${initializedVia}...`);
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Optionally add databaseURL if using Realtime Database
      // databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    console.log(`Firebase Admin SDK: Initialization successful for project ${serviceAccount.project_id}.`);
    adminAuthInstance = admin.auth(); // Assign instance on success
  } catch (error: any) {
    initializationError = new Error(`CRITICAL - Error during admin.initializeApp() via ${initializedVia || 'unknown source'}. Error: ${error.message}`);
    console.error(`Firebase Admin SDK: ${initializationError.message}`);
    // Log the structure of the service account (excluding private key) for debugging
    console.error("Service Account details used (check project_id, client_email):", { projectId: serviceAccount.project_id, clientEmail: serviceAccount.client_email });
    // Check for common specific errors
    if (error.code === 'app/duplicate-app') {
      console.warn("Firebase Admin SDK: Attempted to initialize an app that already exists. This might indicate an issue in the initialization logic flow.");
      // If duplicate app error occurs, try returning the existing default app's auth service
      if (admin.apps.length > 0 && admin.apps[0]) {
        console.log("Firebase Admin SDK: Re-assigning auth service from existing default app.");
        adminAuthInstance = admin.apps[0].auth();
        initializationError = null; // Clear the error as we recovered
        return;
      }
    }
    // Ensure instance is null on failure
    adminAuthInstance = null;
  }
}

// --- Call Initialization ---
// This ensures initialization logic runs only once when the module is first imported.
initializeFirebaseAdmin();


// --- Export Getter Function ---
// This getter ensures that the error is thrown only when the adminAuth is accessed,
// allowing the rest of the app potentially load if admin features aren't immediately needed.
export const getAdminAuth = (): admin.auth.Auth => {
    if (initializationError) {
        // Provide a more detailed error message upon access if initialization failed
         throw new Error(`Firebase Admin SDK access failed: ${initializationError.message}. Check server startup logs for details. Common causes are missing, empty, or invalid service account credentials (env var 'FIREBASE_SERVICE_ACCOUNT_KEY' or local file 'serviceAccountKey.json'). Please verify your setup according to the README.md.`);
    }
    if (!adminAuthInstance) {
        // This case should theoretically not be reached if initialization logic is sound, but added for safety
        throw new Error("Firebase Admin SDK was not initialized successfully, but no specific error was recorded. Check server logs.");
    }
    return adminAuthInstance;
}

// Export other admin services if needed, e.g., admin.firestore()
// export const adminDb = getAdminDb; // Example: Create a getter for Firestore if needed

// // Example getter for Firestore (if using)
// let adminDbInstance: admin.firestore.Firestore | null = null;
// function initializeFirestore() {
//     if (!adminDbInstance && adminAuthInstance) { // Check if auth is initialized first
//         adminDbInstance = admin.firestore();
//     }
// }
// // Call this after admin init or within the getter
// // initializeFirestore();
//
// export const getAdminDb = (): admin.firestore.Firestore => {
//     if (!adminAuthInstance) { // Check auth dependency
//        getAdminAuth(); // This will throw if auth failed
//     }
//     if (!adminDbInstance) {
//         initializeFirestore(); // Attempt to initialize
//         if (!adminDbInstance) {
//              throw new Error("Firebase Firestore Admin SDK could not be initialized.");
//         }
//     }
//     return adminDbInstance;
// }
