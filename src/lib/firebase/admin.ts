
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let serviceAccountJson: string | null = null;
let initializedVia: string | null = null; // Keep track of how it was initialized

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

const initializeFirebaseAdmin = (): admin.auth.Auth | null => {
  // Check if the SDK is already initialized
  if (admin.apps.length > 0) {
    console.log(`Firebase Admin SDK: Already initialized (was initialized via ${initializedVia || 'unknown method'}).`);
    return admin.auth(); // Return existing auth instance
  }

  // Check if credentials were found
  if (!serviceAccountJson) {
     console.error("Firebase Admin SDK: CRITICAL - No service account credentials found. Cannot initialize. Check environment variable 'FIREBASE_SERVICE_ACCOUNT_KEY' or the presence and content of 'serviceAccountKey.json' in the project root.");
     return null;
  }

   let serviceAccount;
   try {
        serviceAccount = JSON.parse(serviceAccountJson);
        // Basic validation of parsed content
        if (!serviceAccount || typeof serviceAccount !== 'object' || !serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
            console.error(`Firebase Admin SDK: Parsed service account JSON from ${initializedVia} is invalid or missing required fields (project_id, private_key, client_email). Please verify the content of the credentials.`);
            // Optionally log the structure for debugging (excluding private key)
            // console.error("Parsed structure (invalid):", { projectId: serviceAccount?.project_id, clientEmail: serviceAccount?.client_email });
            return null;
        }
        console.log(`Firebase Admin SDK: Successfully parsed service account JSON from ${initializedVia}.`);
   } catch (error: any) {
       console.error(`Firebase Admin SDK: CRITICAL - Failed to parse service account JSON from ${initializedVia}. Ensure it's valid JSON. Error: ${error.message}`);
       // Log a snippet of the JSON (be careful not to log the private key)
       // console.error("JSON snippet (start):", serviceAccountJson.substring(0, 100) + "...");
       return null;
   }


  console.log(`Firebase Admin SDK: Attempting initialization via ${initializedVia}...`);
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Optionally add databaseURL if using Realtime Database
      // databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
    console.log(`Firebase Admin SDK: Initialization successful for project ${serviceAccount.project_id}.`);
  } catch (error: any) {
     console.error(`Firebase Admin SDK: CRITICAL - Error during admin.initializeApp() via ${initializedVia}. Error: ${error.message}`);
     // Log the structure of the service account (excluding private key) for debugging
     console.error("Service Account details used (check project_id, client_email):", { projectId: serviceAccount.project_id, clientEmail: serviceAccount.client_email });
     // Check for common specific errors
     if (error.code === 'app/duplicate-app') {
         console.warn("Firebase Admin SDK: Attempted to initialize an app that already exists. This might indicate an issue in the initialization logic flow.");
         // If duplicate app error occurs, try returning the existing default app's auth service
         if (admin.apps.length > 0 && admin.apps[0]) {
             console.log("Firebase Admin SDK: Returning auth service from existing default app.");
             return admin.apps[0].auth();
         }
     }
     return null;
  }

  // --- Check Initialization Status Post-Attempt ---
  if (admin.apps.length > 0) {
      console.log(`Firebase Admin SDK: Initialization confirmed.`);
      return admin.auth();
  }

  // --- Initialization Failed (Should not be reached if logic above is sound) ---
  console.error('Firebase Admin SDK: CRITICAL - Initialization failed unexpectedly after attempting credential loading and parsing.');
  return null;
};

// --- Attempt Initialization ---
const adminAuthInstance = initializeFirebaseAdmin();

// --- Export or Throw Error ---
if (!adminAuthInstance) {
   // Ensure this error message clearly indicates the user needs to check configuration.
   // It repeats the critical messages logged above but ensures the process stops.
   throw new Error("Firebase Admin SDK could not be initialized. Check server logs for details (scroll up). Common causes are missing, empty, or invalid service account credentials (env var 'FIREBASE_SERVICE_ACCOUNT_KEY' or local file 'serviceAccountKey.json'). Please verify your setup according to the README.md, ensuring the credentials JSON is complete and correctly formatted.");
}

export const adminAuth = adminAuthInstance;
// Export other admin services if needed, e.g., admin.firestore()
// export const adminDb = admin.firestore();
