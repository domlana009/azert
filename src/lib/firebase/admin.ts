
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let adminAuthInstance: admin.auth.Auth | null = null;
let initializationError: Error | null = null;
let isInitialized = false;
let initializedVia: string | null = null;

function initializeFirebaseAdmin() {
  if (isInitialized) {
    // Avoid re-logging if already initialized successfully or with the same error
    if (adminAuthInstance) {
      console.log(`Firebase Admin SDK: Already initialized successfully via ${initializedVia || 'unknown'}.`);
    } else if (initializationError) {
      // Don't repeatedly log the same initialization error.
      // A different mechanism should handle persistent errors if needed.
    }
    return;
  }
  isInitialized = true; // Mark as attempted

  let serviceAccountJson: string | null = null;

  // --- Attempt to Load Credentials ---

  // Method 1: Environment Variable (Recommended for deployment)
  console.log("Firebase Admin SDK: Checking environment variable FIREBASE_SERVICE_ACCOUNT_KEY...");
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim() !== '' && process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim() !== '{}') {
      try {
        // Basic JSON validation for environment variable
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        initializedVia = 'environment variable';
        console.log("Firebase Admin SDK: Found valid JSON in FIREBASE_SERVICE_ACCOUNT_KEY environment variable.");
      } catch (e: any) {
          initializationError = new Error(`CRITICAL - Failed to parse service account JSON from environment variable. Ensure it's valid JSON. Error: ${e.message}`);
          console.error(`Firebase Admin SDK: ${initializationError.message}`);
          // Log a snippet, carefully excluding sensitive parts if possible
          // console.error("JSON snippet (start):", (process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '').substring(0, 50) + "...");
          return; // Stop initialization if env var is invalid JSON
      }
  } else {
      console.log("Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found, empty, or just '{}'.");
  }


  // Method 2: Local File (Easier for local dev, ensure it's gitignored)
  if (!serviceAccountJson) {
    // Use the user-specified filename
    const serviceAccountFilename = 'reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json';
    const serviceAccountPath = path.resolve(`./${serviceAccountFilename}`); // Use path.resolve for absolute path
    console.log(`Firebase Admin SDK: Checking for local file at ${serviceAccountPath}...`);
    try {
      if (fs.existsSync(serviceAccountPath)) {
        serviceAccountJson = fs.readFileSync(serviceAccountPath, 'utf8');
        if (serviceAccountJson.trim() === '') {
          console.warn(`Firebase Admin SDK: Local ${serviceAccountFilename} file exists but is empty.`);
          serviceAccountJson = null; // Treat empty file as not found
        } else {
          // Basic JSON validation for local file
          JSON.parse(serviceAccountJson);
          initializedVia = `local file (${serviceAccountFilename})`;
          console.log(`Firebase Admin SDK: Found and read valid JSON from local ${serviceAccountFilename} file.`);
        }
      } else {
        console.log(`Firebase Admin SDK: Local ${serviceAccountFilename} file not found.`);
      }
    } catch (error: any) {
       if (error instanceof SyntaxError) {
           initializationError = new Error(`CRITICAL - Failed to parse service account JSON from ${serviceAccountFilename}. Ensure it's valid JSON. Error: ${error.message}`);
       } else {
           initializationError = new Error(`CRITICAL - Error reading local ${serviceAccountFilename}: ${error.message}`);
       }
       console.error(`Firebase Admin SDK: ${initializationError.message}`);
       serviceAccountJson = null; // Ensure it's null if read/parse failed
       return; // Stop initialization if local file is invalid
    }
  }

  // Check if the SDK is already initialized (might happen in some hot-reload scenarios)
  if (admin.apps.length > 0) {
    console.log(`Firebase Admin SDK: Already initialized (detected existing admin app).`);
    adminAuthInstance = admin.auth(); // Use existing auth instance
    initializedVia = initializedVia || 'existing app detection'; // Update how it was initialized if needed
    initializationError = null; // Clear any potential errors from credential loading if an app already exists
    return;
  }


  // --- Initialize Firebase Admin SDK ---

  // Check if credentials were found
  if (!serviceAccountJson) {
    initializationError = new Error("CRITICAL - No valid service account credentials found. Cannot initialize. Check environment variable 'FIREBASE_SERVICE_ACCOUNT_KEY' or the presence and content of 'reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json' in the project root.");
    console.error(`Firebase Admin SDK: ${initializationError.message}`);
    return;
  }

  let serviceAccount;
  try {
    // Re-parsing should be safe as we validated above, but keep for robustness
    serviceAccount = JSON.parse(serviceAccountJson);
    // More robust validation
    if (!serviceAccount || typeof serviceAccount !== 'object' || !serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        throw new Error(`Parsed service account JSON from ${initializedVia} is invalid or missing required fields (project_id, private_key, client_email). Please verify the content.`);
    }
    // console.log(`Firebase Admin SDK: Successfully re-parsed service account JSON from ${initializedVia}.`); // Redundant log
  } catch (error: any) {
    // This catch block might be redundant if parsing errors are caught earlier, but kept for safety
    initializationError = new Error(`CRITICAL - Failed to parse service account JSON from ${initializedVia || 'unknown source'} during final check. Ensure it's valid JSON. Error: ${error.message}`);
    console.error(`Firebase Admin SDK: ${initializationError.message}`);
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
    initializationError = null; // Clear any previous errors on success
  } catch (error: any) {
    // Handle specific initialization errors
    if (error.code === 'app/duplicate-app') {
       console.warn("Firebase Admin SDK: Attempted to initialize an app that already exists ('app/duplicate-app'). Using existing app's auth service.");
       if (admin.apps.length > 0 && admin.apps[0]) {
           adminAuthInstance = admin.apps[0].auth();
           initializationError = null; // Clear the error as we recovered
           return;
       } else {
            // This case is unlikely if duplicate-app error occurred, but handle defensively
             initializationError = new Error(`CRITICAL - Caught 'app/duplicate-app' error but no existing app found. Initialization failed. Error: ${error.message}`);
             console.error(`Firebase Admin SDK: ${initializationError.message}`);
       }
    } else {
       initializationError = new Error(`CRITICAL - Error during admin.initializeApp() via ${initializedVia || 'unknown source'}. Error: ${error.message}`);
       console.error(`Firebase Admin SDK: ${initializationError.message}`);
       // Log the structure of the service account (excluding private key) for debugging
       console.error("Service Account details used (check project_id, client_email):", { projectId: serviceAccount.project_id, clientEmail: serviceAccount.client_email });
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
         throw new Error(`Firebase Admin SDK access failed: ${initializationError.message}. Check server startup logs for details. Common causes are missing, empty, or invalid service account credentials (env var 'FIREBASE_SERVICE_ACCOUNT_KEY' or local file 'reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json'). Please verify your setup according to the README.md.`);
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
