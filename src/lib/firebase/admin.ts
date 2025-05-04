
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// --- Initialization State ---
let adminAuthInstance: admin.auth.Auth | null = null;
let initializationError: Error | null = null;
let isInitializedAttempted = false; // Flag to prevent re-attempting initialization logic unnecessarily
let initializedVia: string | null = null; // Track how initialization was successful
let criticalLogMessages: string[] = []; // Store critical messages for the final error


// --- Core Initialization Logic (Run Once) ---
function initializeFirebaseAdmin(): void {
    // Only attempt initialization once per process lifecycle
    if (isInitializedAttempted) {
        // Optional: reduce console noise on subsequent calls
        // if (adminAuthInstance) { console.log(`Firebase Admin SDK: Already initialized successfully via ${initializedVia}.`); }
        // else if (initializationError) { console.error(`Firebase Admin SDK: Initialization previously failed: ${initializationError.message}`); }
        return;
    }
    isInitializedAttempted = true; // Mark that we are attempting/have attempted initialization

    console.log("Firebase Admin SDK: Starting initialization attempt...");
    criticalLogMessages = []; // Reset messages for this attempt

    let serviceAccountJson: string | null = null;
    let localFilePathChecked: string | null = null;
    let envVarChecked = false;

    // --- Method 1: Environment Variable ---
    envVarChecked = true;
    console.log("Firebase Admin SDK: Checking environment variable FIREBASE_SERVICE_ACCOUNT_KEY...");
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim() !== '' && process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim() !== '{}') {
        console.log("Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT_KEY environment variable found (non-empty).");
        try {
            serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
            // Validate JSON structure rigorously
            const parsed = JSON.parse(serviceAccountJson);
            if (!parsed || typeof parsed !== 'object' || !parsed.project_id || !parsed.private_key || !parsed.client_email) {
                const partialJson = serviceAccountJson.substring(0, 100) + (serviceAccountJson.length > 100 ? "..." : "");
                console.error(`Firebase Admin SDK: Environment variable JSON content seems invalid or incomplete: ${partialJson}`);
                const errorMsg = "CRITICAL - Environment variable JSON is missing required fields (project_id, private_key, client_email).";
                criticalLogMessages.push(errorMsg);
                throw new Error(errorMsg);
            }
            initializedVia = 'environment variable';
            console.log(`Firebase Admin SDK: Found valid JSON in FIREBASE_SERVICE_ACCOUNT_KEY for project ${parsed.project_id}.`);
        } catch (e: any) {
            const errorMsg = `CRITICAL - Failed to parse service account JSON from environment variable. Ensure it's valid JSON. Error: ${e.message}`;
            criticalLogMessages.push(errorMsg);
            console.error(`Firebase Admin SDK: ${errorMsg}`);
            initializationError = new Error(errorMsg);
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
                    const warnMsg = `WARN - Local file ${serviceAccountFilename} exists but is empty. It will be ignored.`;
                    console.warn(`Firebase Admin SDK: ${warnMsg}`);
                    criticalLogMessages.push(warnMsg);
                } else {
                    console.log(`Firebase Admin SDK: Found local file ${serviceAccountFilename}. Reading content...`);
                    serviceAccountJson = fileContent;
                    // Validate JSON structure rigorously
                    const parsed = JSON.parse(serviceAccountJson);
                     if (!parsed || typeof parsed !== 'object' || !parsed.project_id || !parsed.private_key || !parsed.client_email) {
                         const partialJson = serviceAccountJson.substring(0, 100) + (serviceAccountJson.length > 100 ? "..." : "");
                         console.error(`Firebase Admin SDK: Local file JSON content seems invalid or incomplete: ${partialJson}`);
                         const errorMsg = `CRITICAL - Local file ${serviceAccountFilename} JSON is missing required fields (project_id, private_key, client_email).`;
                         criticalLogMessages.push(errorMsg);
                        throw new Error(errorMsg);
                    }
                    initializedVia = `local file (${serviceAccountFilename})`;
                    console.log(`Firebase Admin SDK: Found and read valid JSON from ${serviceAccountFilename} for project ${parsed.project_id}.`);
                }
            } else {
                console.log(`Firebase Admin SDK: Local file ${serviceAccountFilename} not found at ${serviceAccountPath}.`);
            }
        } catch (error: any) {
            let errorMsg;
            if (error instanceof SyntaxError) {
                errorMsg = `CRITICAL - Failed to parse service account JSON from ${serviceAccountFilename}. Ensure it's valid JSON. Error: ${error.message}`;
            } else {
                errorMsg = `CRITICAL - Error reading local file ${serviceAccountFilename}: ${error.message}`;
            }
            criticalLogMessages.push(errorMsg);
            console.error(`Firebase Admin SDK: ${errorMsg}`);
            initializationError = new Error(errorMsg);
             // Do NOT proceed if local file is found but invalid
            return;
        }
    }

    // --- Check if Credentials Were Found ---
    if (!serviceAccountJson) {
        let errorMessage = "CRITICAL - No valid service account credentials found. Cannot initialize.";
        if (envVarChecked) errorMessage += " Checked environment variable 'FIREBASE_SERVICE_ACCOUNT_KEY'";
        if (localFilePathChecked) {
            errorMessage += `${envVarChecked ? ' and' : ' Checked'} local file at '${localFilePathChecked}'`;
        }
        errorMessage += ".";
        criticalLogMessages.push(errorMessage);
        console.error(`Firebase Admin SDK: ${errorMessage}`);
        initializationError = new Error(errorMessage);
        return; // Stop initialization
    }

    // --- Initialize Firebase Admin SDK (Only if not already initialized) ---
    // Check if the default app already exists to avoid re-initialization error
    if (admin.apps.length === 0) {
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
            console.log(`Firebase Admin SDK: Initialization successful for project ${serviceAccount.project_id} via ${initializedVia}.`);
            adminAuthInstance = admin.auth(); // Assign instance on success
            initializationError = null; // Clear any previous errors on success
            criticalLogMessages = []; // Clear logs on success
        } catch (error: any) {
            const errorMsg = `CRITICAL - Error during admin.initializeApp() via ${initializedVia || 'unknown source'}. Error: ${error.message}`;
            criticalLogMessages.push(errorMsg);
            console.error(`Firebase Admin SDK: ${errorMsg}`);
            // Log details useful for debugging initialization failure
            console.error("Service Account Project ID used:", serviceAccount?.project_id || 'N/A');
            console.error("Service Account Client Email used:", serviceAccount?.client_email || 'N/A');
            initializationError = new Error(errorMsg);
            adminAuthInstance = null; // Ensure instance is null on failure
        }
    } else {
        // If apps array is not empty, assume it's already initialized (by this process or another import)
        console.log(`Firebase Admin SDK: Default app already exists. Using existing auth instance (initialized via ${initializedVia || 'previous import'}).`);
        adminAuthInstance = admin.auth(); // Get auth from the existing default app
        initializationError = null; // Clear potential errors if we're using existing
        criticalLogMessages = [];
    }
}

// --- Run Initialization on Module Load ---
initializeFirebaseAdmin();

// --- Export Getter Function (Throws on Access if Initialization Failed) ---
export const getAdminAuth = (): admin.auth.Auth => {
    if (initializationError) {
        // Provide a more detailed error message upon access if initialization failed
         throw new Error(`Firebase Admin SDK access failed: ${initializationError.message}. Check server startup logs for details. Common causes are missing, empty, or invalid service account credentials (env var 'FIREBASE_SERVICE_ACCOUNT_KEY' or local file 'reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json'). Please verify your setup according to the README.md.`);
    }
    if (!adminAuthInstance) {
        // This case should theoretically not be reached if initialization logic is sound, but added for safety
        // It might happen if the module somehow gets re-evaluated without re-running the top-level init.
        console.error("Firebase Admin SDK: adminAuthInstance is unexpectedly null despite no recorded initializationError. Re-attempting initialization...");
        initializeFirebaseAdmin(); // Attempt recovery
        if (initializationError) { // Check again after re-attempt
            throw new Error(`Firebase Admin SDK access failed after re-initialization attempt: ${initializationError.message}. See logs.`);
        }
        if(!adminAuthInstance){
             throw new Error("Firebase Admin SDK could not be initialized even after re-attempt. Critical failure. Check server logs.");
        }
        console.warn("Firebase Admin SDK: Recovered adminAuthInstance after re-initialization.");
    }
    return adminAuthInstance;
};

// Export other admin services if needed, ensuring they depend on successful auth init
// Example for Firestore:
// let adminDbInstance: admin.firestore.Firestore | null = null;
// export function getAdminDb(): admin.firestore.Firestore {
//      getAdminAuth(); // Ensures auth is checked first - will throw if auth failed
//      if (!adminDbInstance) {
//          adminDbInstance = admin.firestore();
//      }
//      return adminDbInstance;
// }

    