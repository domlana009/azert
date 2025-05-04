
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// --- Initialization State ---
let adminAuthInstance: admin.auth.Auth | null = null;
let initializationError: Error | null = null;
let isInitializedAttempted = false; // Flag to prevent re-attempting initialization logic unnecessarily
let initializedVia: string | null = null; // Track how initialization was successful


// --- Core Initialization Logic (Run Once) ---
function initializeFirebaseAdmin(): void {
    // Only attempt initialization once per process lifecycle
    if (isInitializedAttempted) {
        if (adminAuthInstance) {
             // console.log(`Firebase Admin SDK: Already initialized successfully via ${initializedVia}.`); // Optional: reduce noise
        } else if (initializationError) {
             // console.error(`Firebase Admin SDK: Initialization previously failed: ${initializationError.message}`); // Optional: reduce noise
        }
        return;
    }
    isInitializedAttempted = true; // Mark that we are attempting/have attempted initialization

    console.log("Firebase Admin SDK: Starting initialization attempt...");

    let serviceAccountJson: string | null = null;
    let localFilePathChecked: string | null = null;

    // --- Method 1: Environment Variable ---
    console.log("Firebase Admin SDK: Checking environment variable FIREBASE_SERVICE_ACCOUNT_KEY...");
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim() !== '' && process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim() !== '{}') {
        console.log("Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT_KEY environment variable found.");
        try {
            serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
            // Validate JSON structure rigorously
            const parsed = JSON.parse(serviceAccountJson);
            if (!parsed || typeof parsed !== 'object' || !parsed.project_id || !parsed.private_key || !parsed.client_email) {
                console.error("Firebase Admin SDK: Environment variable JSON content:", serviceAccountJson.substring(0, 100) + "..."); // Log first 100 chars for debugging
                throw new Error("Environment variable JSON is missing required fields (project_id, private_key, client_email).");
            }
            initializedVia = 'environment variable';
            console.log(`Firebase Admin SDK: Found valid JSON in FIREBASE_SERVICE_ACCOUNT_KEY for project ${parsed.project_id}.`);
        } catch (e: any) {
            initializationError = new Error(`CRITICAL - Failed to parse service account JSON from environment variable. Ensure it's valid JSON. Error: ${e.message}`);
            console.error(`Firebase Admin SDK: ${initializationError.message}`);
            // Do NOT proceed if env var is set but invalid
            return;
        }
    } else {
        console.log("Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT_KEY environment variable not found, empty, or just '{}'.");
    }

    // --- Method 2: Local File ---
    if (!serviceAccountJson) {
        const serviceAccountFilename = 'reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json';
        const serviceAccountPath = path.resolve(`./${serviceAccountFilename}`); // Get absolute path
        localFilePathChecked = serviceAccountPath; // Record the path we checked
        console.log(`Firebase Admin SDK: Checking for local file at ${serviceAccountPath}...`);
        try {
            if (fs.existsSync(serviceAccountPath)) {
                const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
                if (fileContent.trim() === '') {
                    console.warn(`Firebase Admin SDK: Local file ${serviceAccountFilename} exists but is empty.`);
                    // Treat empty file as not found for credential purposes
                } else {
                    console.log(`Firebase Admin SDK: Found local file ${serviceAccountFilename}. Reading content...`);
                    serviceAccountJson = fileContent;
                    // Validate JSON structure rigorously
                    const parsed = JSON.parse(serviceAccountJson);
                     if (!parsed || typeof parsed !== 'object' || !parsed.project_id || !parsed.private_key || !parsed.client_email) {
                         console.error("Firebase Admin SDK: Local file JSON content:", serviceAccountJson.substring(0, 100) + "..."); // Log first 100 chars
                        throw new Error(`Local file ${serviceAccountFilename} JSON is missing required fields (project_id, private_key, client_email).`);
                    }
                    initializedVia = `local file (${serviceAccountFilename})`;
                    console.log(`Firebase Admin SDK: Found and read valid JSON from ${serviceAccountFilename} for project ${parsed.project_id}.`);
                }
            } else {
                console.log(`Firebase Admin SDK: Local file ${serviceAccountFilename} not found at ${serviceAccountPath}.`);
            }
        } catch (error: any) {
            if (error instanceof SyntaxError) {
                initializationError = new Error(`CRITICAL - Failed to parse service account JSON from ${serviceAccountFilename}. Ensure it's valid JSON. Error: ${error.message}`);
            } else {
                initializationError = new Error(`CRITICAL - Error reading local file ${serviceAccountFilename}: ${error.message}`);
            }
            console.error(`Firebase Admin SDK: ${initializationError.message}`);
             // Do NOT proceed if local file is found but invalid
            return;
        }
    }

    // --- Check if Credentials Were Found ---
    if (!serviceAccountJson) {
        let errorMessage = "CRITICAL - No valid service account credentials found. Cannot initialize.";
        errorMessage += " Checked environment variable 'FIREBASE_SERVICE_ACCOUNT_KEY'";
        if (localFilePathChecked) {
            errorMessage += ` and local file at '${localFilePathChecked}'.`;
        } else {
            errorMessage += ".";
        }
        initializationError = new Error(errorMessage);
        console.error(`Firebase Admin SDK: ${initializationError.message}`);
        return; // Stop initialization
    }

    // --- Check for Existing Firebase App ---
    // Note: This check might be less reliable in serverless/edge environments where state isn't guaranteed.
    // It's generally safer to initialize only once based on credential loading.
    if (admin.apps.length > 0) {
        console.log(`Firebase Admin SDK: Detected existing Firebase app instance. Using its auth service.`);
        try {
            adminAuthInstance = admin.auth(); // Try getting auth from the first app
             initializedVia = initializedVia || 'existing app detection'; // Update track if not set by cred loading
             initializationError = null; // Clear any potential errors if we found an existing app
             return; // Successfully using existing app
        } catch (existingAppError: any) {
             console.warn(`Firebase Admin SDK: Error getting auth from existing app instance: ${existingAppError.message}. Will attempt fresh initialization.`);
             // Clear existing app state and proceed with fresh initialization
             adminAuthInstance = null;
             initializationError = null; // Reset error state for new attempt
             // Potentially delete existing apps if causing conflicts:
             // await Promise.all(admin.apps.map(app => app?.delete()));
        }

    }

    // --- Initialize Firebase Admin SDK ---
    let serviceAccount;
    try {
        // Re-parsing is safe as we validated structure above
        serviceAccount = JSON.parse(serviceAccountJson);
        console.log(`Firebase Admin SDK: Attempting initialization via ${initializedVia || 'unknown source'}...`);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            // Optionally add databaseURL if using Realtime Database
            // databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
        });
        console.log(`Firebase Admin SDK: Initialization successful for project ${serviceAccount.project_id}.`);
        adminAuthInstance = admin.auth(); // Assign instance on success
        initializationError = null; // Clear any previous errors on success
    } catch (error: any) {
        initializationError = new Error(`CRITICAL - Error during admin.initializeApp() via ${initializedVia || 'unknown source'}. Error: ${error.message}`);
        console.error(`Firebase Admin SDK: ${initializationError.message}`);
        // Log details useful for debugging initialization failure
        console.error("Service Account Project ID used:", serviceAccount?.project_id || 'N/A');
        console.error("Service Account Client Email used:", serviceAccount?.client_email || 'N/A');
        adminAuthInstance = null; // Ensure instance is null on failure
    }
}

// --- Run Initialization on Module Load ---
initializeFirebaseAdmin();

// --- Export Getter Function (Throws on Access if Initialization Failed) ---
export const getAdminAuth = (): admin.auth.Auth => {
    if (initializationError) {
        // Provide a detailed error message upon access if initialization failed
         throw new Error(`Firebase Admin SDK access failed: ${initializationError.message}. Check server startup logs for details. Common causes are missing, empty, or invalid service account credentials (env var 'FIREBASE_SERVICE_ACCOUNT_KEY' or local file 'reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json'). Please verify your setup according to the README.md.`);
    }
    if (!adminAuthInstance) {
        // This case signifies a logic error in initialization if reached without initializationError being set.
        throw new Error("Firebase Admin SDK was not initialized successfully, and no specific error was recorded. This indicates an unexpected state. Check server logs.");
    }
    return adminAuthInstance;
};

// Export other admin services if needed, ensuring they depend on successful auth init
// Example for Firestore:
// let adminDbInstance: admin.firestore.Firestore | null = null;
// function getAdminDb(): admin.firestore.Firestore {
//      getAdminAuth(); // Ensures auth is checked first - will throw if auth failed
//      if (!adminDbInstance) {
//          adminDbInstance = admin.firestore();
//      }
//      return adminDbInstance;
// }
// export { getAdminDb };
