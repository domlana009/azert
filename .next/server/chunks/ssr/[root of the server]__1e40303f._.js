module.exports = {

"[externals]/firebase-admin [external] (firebase-admin, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("firebase-admin", () => require("firebase-admin"));

module.exports = mod;
}}),
"[externals]/fs [external] (fs, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}}),
"[project]/src/lib/firebase/admin.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "getAdminAuth": (()=>getAdminAuth)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/firebase-admin [external] (firebase-admin, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
// --- Initialization State ---
let adminAuthInstance = null;
let initializationError = null;
let isInitializedAttempted = false; // Flag to prevent re-attempting initialization logic unnecessarily
let initializedVia = null; // Track how initialization was successful
let criticalLogMessages = []; // Store critical messages for the final error
// --- Core Initialization Logic (Run Once) ---
function initializeFirebaseAdmin() {
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
    let serviceAccountJson = null;
    let localFilePathChecked = null;
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
        } catch (e) {
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
        const serviceAccountPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(`./${serviceAccountFilename}`); // Get absolute path
        localFilePathChecked = serviceAccountPath; // Record the path we checked
        console.log(`Firebase Admin SDK: Checking for local file at ${serviceAccountPath}...`);
        try {
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(serviceAccountPath)) {
                const fileContent = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(serviceAccountPath, 'utf8');
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
        } catch (error) {
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
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__["default"].apps.length === 0) {
        let serviceAccount;
        try {
            // Re-parsing is safe as we validated structure above
            serviceAccount = JSON.parse(serviceAccountJson);
            console.log(`Firebase Admin SDK: Attempting initialization via ${initializedVia || 'unknown source'}...`);
            __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__["default"].initializeApp({
                credential: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__["default"].credential.cert(serviceAccount)
            });
            console.log(`Firebase Admin SDK: Initialization successful for project ${serviceAccount.project_id} via ${initializedVia}.`);
            adminAuthInstance = __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__["default"].auth(); // Assign instance on success
            initializationError = null; // Clear any previous errors on success
            criticalLogMessages = []; // Clear logs on success
        } catch (error) {
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
        adminAuthInstance = __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__["default"].auth(); // Get auth from the existing default app
        initializationError = null; // Clear potential errors if we're using existing
        criticalLogMessages = [];
    }
}
// --- Run Initialization on Module Load ---
initializeFirebaseAdmin();
const getAdminAuth = ()=>{
    if (initializationError) {
        // Provide a more detailed error message upon access if initialization failed
        throw new Error(`Firebase Admin SDK access failed: ${initializationError.message}. Check server startup logs for details. Common causes are missing, empty, or invalid service account credentials (env var 'FIREBASE_SERVICE_ACCOUNT_KEY' or local file 'reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json'). Please verify your setup according to the README.md.`);
    }
    if (!adminAuthInstance) {
        // This case should theoretically not be reached if initialization logic is sound, but added for safety
        // It might happen if the module somehow gets re-evaluated without re-running the top-level init.
        console.error("Firebase Admin SDK: adminAuthInstance is unexpectedly null despite no recorded initializationError. Re-attempting initialization...");
        initializeFirebaseAdmin(); // Attempt recovery
        if (initializationError) {
            throw new Error(`Firebase Admin SDK access failed after re-initialization attempt: ${initializationError.message}. See logs.`);
        }
        if (!adminAuthInstance) {
            throw new Error("Firebase Admin SDK could not be initialized even after re-attempt. Critical failure. Check server logs.");
        }
        console.warn("Firebase Admin SDK: Recovered adminAuthInstance after re-initialization.");
    }
    return adminAuthInstance;
}; // Export other admin services if needed, ensuring they depend on successful auth init
 // Example for Firestore:
 // let adminDbInstance: admin.firestore.Firestore | null = null;
 // export function getAdminDb(): admin.firestore.Firestore {
 //      getAdminAuth(); // Ensures auth is checked first - will throw if auth failed
 //      if (!adminDbInstance) {
 //          adminDbInstance = admin.firestore();
 //      }
 //      return adminDbInstance;
 // }
}}),
"[project]/src/actions/list-users.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ {"006b1d78a5ad739e8e069569f19c48edace7cf0b73":"listUsersAction"} */ __turbopack_context__.s({
    "listUsersAction": (()=>listUsersAction)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase/admin.ts [app-rsc] (ecmascript)"); // Import the getter function
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function /*#__TURBOPACK_DISABLE_EXPORT_MERGING__*/ listUsersAction() {
    let adminAuth;
    try {
        adminAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAdminAuth"])(); // Get the admin auth instance
    // If getAdminAuth doesn't throw, SDK is initialized
    } catch (error) {
        console.error('Error getting Firebase Admin Auth instance in listUsersAction:', error.message);
        // Return a specific error indicating initialization failure
        return {
            success: false,
            message: `Erreur critique: Impossible d'initialiser Firebase Admin SDK. Vérifiez les logs du serveur. (${error.message})`
        };
    }
    // --- Authentication/Authorization Check ---
    // Ensure the caller is an admin. This is crucial for security.
    // For now, we assume page-level protection. In a real app, implement robust server-side auth checks here.
    // Example (requires passing user token):
    // const userToken = headers().get('Authorization')?.split('Bearer ')[1];
    // if (!userToken) return { success: false, message: "Non autorisé." };
    // try {
    //   const decodedToken = await adminAuth.verifyIdToken(userToken);
    //   if (!decodedToken.admin) { return { success: false, message: "Accès refusé." }; }
    // } catch (error) {
    //    console.error("Auth check failed:", error);
    //    return { success: false, message: "Erreur d'authentification." };
    // }
    // --- End Auth Check ---
    try {
        const listUsersResult = await adminAuth.listUsers(1000); // List up to 1000 users
        const users = listUsersResult.users.map((userRecord)=>{
            // Check for the admin custom claim
            const isAdminByClaim = !!userRecord.customClaims?.admin;
            // Check if UID matches the primary admin UID from env var
            const isAdminByUID = !!("TURBOPACK compile-time value", "CGgYniLRpOPeSaBvYtyYDbr8ZJm1") && userRecord.uid === ("TURBOPACK compile-time value", "CGgYniLRpOPeSaBvYtyYDbr8ZJm1");
            const isAdmin = isAdminByClaim || isAdminByUID; // User is admin if either is true
            // Get allowed sections claim, default to empty array if missing or invalid
            const allowedSections = Array.isArray(userRecord.customClaims?.allowedSections) ? userRecord.customClaims?.allowedSections : [];
            return {
                uid: userRecord.uid,
                email: userRecord.email,
                creationTime: userRecord.metadata.creationTime,
                lastSignInTime: userRecord.metadata.lastSignInTime,
                disabled: userRecord.disabled,
                isAdmin: isAdmin,
                allowedSections: allowedSections
            };
        });
        // Optionally sort users, e.g., by creation time or email
        users.sort((a, b)=>new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime());
        return {
            success: true,
            message: `Successfully fetched ${users.length} users.`,
            users: users
        };
    } catch (error) {
        console.error('Error listing users:', error);
        // Provide more context in the error message
        return {
            success: false,
            message: `Erreur lors de la récupération des utilisateurs: ${error.message}. (Code: ${error.code || 'N/A'})`
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    listUsersAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(listUsersAction, "006b1d78a5ad739e8e069569f19c48edace7cf0b73", null);
}}),
"[project]/src/actions/set-user-role.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ {"608e1289a4990a08598361f2002fe761c8fb280bac":"setUserRoleAction"} */ __turbopack_context__.s({
    "setUserRoleAction": (()=>setUserRoleAction)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase/admin.ts [app-rsc] (ecmascript)"); // Import the getter function
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/lib/index.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
// Define input schema for validation
const SetUserRoleInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].object({
    uid: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().min(1, {
        message: "UID utilisateur requis."
    }),
    isAdmin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].boolean()
});
async function /*#__TURBOPACK_DISABLE_EXPORT_MERGING__*/ setUserRoleAction(uid, isAdmin) {
    const adminAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAdminAuth"])(); // Get the admin auth instance
    // --- Authorization Check ---
    // Ensure the caller is an authenticated admin. This is CRUCIAL.
    // For simplicity, we assume this check happens in the calling context (e.g., AdminPage)
    // A more robust solution involves verifying an admin token here.
    // --- End Auth Check ---
    // Validate input (even though it comes from internal function call, good practice)
    const validationResult = SetUserRoleInputSchema.safeParse({
        uid,
        isAdmin
    });
    if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map((e)=>e.message).join(', ');
        return {
            success: false,
            message: `Validation échouée: ${errorMessages}`
        };
    }
    // Prevent modifying the primary admin defined by environment variable
    if (("TURBOPACK compile-time value", "CGgYniLRpOPeSaBvYtyYDbr8ZJm1") && uid === ("TURBOPACK compile-time value", "CGgYniLRpOPeSaBvYtyYDbr8ZJm1")) {
        return {
            success: false,
            message: "Modification du rôle de l'administrateur principal non autorisée."
        };
    }
    try {
        // Set custom claims
        await adminAuth.setCustomUserClaims(uid, {
            admin: isAdmin
        });
        console.log(`Successfully set admin claim to ${isAdmin} for user: ${uid}`);
        // Optionally, force token refresh for the affected user if they are currently logged in
        // This requires more complex logic, potentially involving Firestore or Realtime Database
        // await adminAuth.revokeRefreshTokens(uid);
        return {
            success: true,
            message: `Rôle admin ${isAdmin ? 'défini' : 'retiré'} avec succès pour l'utilisateur ${uid}.`
        };
    } catch (error) {
        console.error(`Error setting custom claims for user ${uid}:`, error);
        let errorMessage = "Erreur lors de la modification du rôle de l'utilisateur.";
        // Add more specific error handling based on Firebase Admin SDK errors if needed
        if (error.code === 'auth/user-not-found') {
            errorMessage = `User avec UID ${uid} non trouvé.`;
        }
        return {
            success: false,
            message: errorMessage
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    setUserRoleAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(setUserRoleAction, "608e1289a4990a08598361f2002fe761c8fb280bac", null);
}}),
"[project]/src/actions/toggle-user-status.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ {"60777149fa00a297b4036514b0bbcdad65bb07272c":"toggleUserStatusAction"} */ __turbopack_context__.s({
    "toggleUserStatusAction": (()=>toggleUserStatusAction)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase/admin.ts [app-rsc] (ecmascript)"); // Import the getter function
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/lib/index.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
// Define input schema for validation
const ToggleUserStatusInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].object({
    uid: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().min(1, {
        message: "UID utilisateur requis."
    }),
    disable: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].boolean()
});
async function /*#__TURBOPACK_DISABLE_EXPORT_MERGING__*/ toggleUserStatusAction(uid, disable) {
    const adminAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAdminAuth"])(); // Get the admin auth instance
    // --- Authorization Check ---
    // Ensure the caller is an authenticated admin.
    // --- End Auth Check ---
    // Validate input
    const validationResult = ToggleUserStatusInputSchema.safeParse({
        uid,
        disable
    });
    if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map((e)=>e.message).join(', ');
        return {
            success: false,
            message: `Validation échouée: ${errorMessages}`
        };
    }
    // Prevent disabling the primary admin defined by environment variable
    if (disable && ("TURBOPACK compile-time value", "CGgYniLRpOPeSaBvYtyYDbr8ZJm1") && uid === ("TURBOPACK compile-time value", "CGgYniLRpOPeSaBvYtyYDbr8ZJm1")) {
        return {
            success: false,
            message: "Désactivation de l'administrateur principal non autorisée."
        };
    }
    try {
        // Update user status
        await adminAuth.updateUser(uid, {
            disabled: disable
        });
        console.log(`Successfully ${disable ? 'disabled' : 'enabled'} user: ${uid}`);
        return {
            success: true,
            message: `User ${disable ? 'désactivé' : 'activé'} avec succès.`
        };
    } catch (error) {
        console.error(`Error updating status for user ${uid}:`, error);
        let errorMessage = "Erreur lors de la modification du statut de l'utilisateur.";
        if (error.code === 'auth/user-not-found') {
            errorMessage = `User avec UID ${uid} non trouvé.`;
        }
        return {
            success: false,
            message: errorMessage
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    toggleUserStatusAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(toggleUserStatusAction, "60777149fa00a297b4036514b0bbcdad65bb07272c", null);
}}),
"[project]/src/actions/delete-user.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ {"406c787133dba9542061b5c4060a2268b8f770bbf5":"deleteUserAction"} */ __turbopack_context__.s({
    "deleteUserAction": (()=>deleteUserAction)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase/admin.ts [app-rsc] (ecmascript)"); // Import the getter function
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/lib/index.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
// Define input schema for validation
const DeleteUserInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].object({
    uid: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().min(1, {
        message: "UID utilisateur requis."
    })
});
async function /*#__TURBOPACK_DISABLE_EXPORT_MERGING__*/ deleteUserAction(uid) {
    const adminAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAdminAuth"])(); // Get the admin auth instance
    // --- Authorization Check ---
    // Ensure the caller is an authenticated admin.
    // --- End Auth Check ---
    // Validate input
    const validationResult = DeleteUserInputSchema.safeParse({
        uid
    });
    if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map((e)=>e.message).join(', ');
        return {
            success: false,
            message: `Validation échouée: ${errorMessages}`
        };
    }
    // Prevent deleting the primary admin defined by environment variable
    if (("TURBOPACK compile-time value", "CGgYniLRpOPeSaBvYtyYDbr8ZJm1") && uid === ("TURBOPACK compile-time value", "CGgYniLRpOPeSaBvYtyYDbr8ZJm1")) {
        return {
            success: false,
            message: "Suppression de l'administrateur principal non autorisée."
        };
    }
    try {
        // Delete user
        await adminAuth.deleteUser(uid);
        console.log(`Successfully deleted user: ${uid}`);
        return {
            success: true,
            message: `User supprimé avec succès.`
        };
    } catch (error) {
        console.error(`Error deleting user ${uid}:`, error);
        let errorMessage = "Erreur lors de la suppression de l'utilisateur.";
        if (error.code === 'auth/user-not-found') {
            errorMessage = `User avec UID ${uid} non trouvé.`;
        }
        // Add more specific error handling based on Firebase Admin SDK errors if needed
        return {
            success: false,
            message: errorMessage
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    deleteUserAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteUserAction, "406c787133dba9542061b5c4060a2268b8f770bbf5", null);
}}),
"[project]/src/actions/set-user-permissions.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ {"607756e443c07ddccbd29d4809de895c62f507369c":"setUserPermissionsAction"} */ __turbopack_context__.s({
    "setUserPermissionsAction": (()=>setUserPermissionsAction)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$app$2d$render$2f$encryption$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/app-render/encryption.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase/admin.ts [app-rsc] (ecmascript)"); // Import the getter function
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/lib/index.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
// Define input schema for validation
const SetUserPermissionsInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].object({
    uid: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().min(1, {
        message: "UID utilisateur requis."
    }),
    allowedSections: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string())
});
async function /*#__TURBOPACK_DISABLE_EXPORT_MERGING__*/ setUserPermissionsAction(uid, allowedSections) {
    const adminAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAdminAuth"])(); // Get the admin auth instance
    // --- Authorization Check ---
    // Ensure the caller is an authenticated admin. This is CRUCIAL.
    // For simplicity, assume page-level protection or verify token here.
    // --- End Auth Check ---
    // Validate input
    const validationResult = SetUserPermissionsInputSchema.safeParse({
        uid,
        allowedSections
    });
    if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map((e)=>e.message).join(', ');
        return {
            success: false,
            message: `Validation échouée: ${errorMessages}`
        };
    }
    // Prevent modifying the primary admin defined by environment variable
    if (("TURBOPACK compile-time value", "CGgYniLRpOPeSaBvYtyYDbr8ZJm1") && uid === ("TURBOPACK compile-time value", "CGgYniLRpOPeSaBvYtyYDbr8ZJm1")) {
        return {
            success: false,
            message: "Modification des permissions de l'administrateur principal non autorisée."
        };
    }
    try {
        // Get existing claims to merge, ensuring 'admin' claim is preserved
        const userRecord = await adminAuth.getUser(uid);
        const existingClaims = userRecord.customClaims || {};
        // Set or update the allowedSections claim, merging with existing claims
        await adminAuth.setCustomUserClaims(uid, {
            ...existingClaims,
            allowedSections: allowedSections // Set/Overwrite allowedSections
        });
        console.log(`Successfully set allowedSections for user: ${uid}`, allowedSections);
        // Optionally force token refresh if the user might be currently logged in
        // await adminAuth.revokeRefreshTokens(uid);
        return {
            success: true,
            message: `Permissions mises à jour avec succès pour l'utilisateur ${uid}.`
        };
    } catch (error) {
        console.error(`Error setting custom claims for user ${uid}:`, error);
        let errorMessage = "Erreur lors de la modification des permissions de l'utilisateur.";
        if (error.code === 'auth/user-not-found') {
            errorMessage = `User avec UID ${uid} non trouvé.`;
        }
        return {
            success: false,
            message: errorMessage
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    setUserPermissionsAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(setUserPermissionsAction, "607756e443c07ddccbd29d4809de895c62f507369c", null);
}}),
"[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/list-users.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/actions/set-user-role.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/actions/toggle-user-status.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE3 => \"[project]/src/actions/delete-user.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE4 => \"[project]/src/actions/set-user-permissions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
;
;
;
;
;
}}),
"[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/list-users.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/actions/set-user-role.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/actions/toggle-user-status.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE3 => \"[project]/src/actions/delete-user.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE4 => \"[project]/src/actions/set-user-permissions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$list$2d$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/list-users.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$role$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/set-user-role.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$toggle$2d$user$2d$status$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/toggle-user-status.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$delete$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/delete-user.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/set-user-permissions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$list$2d$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$role$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$toggle$2d$user$2d$status$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE3__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$delete$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE4__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/list-users.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/actions/set-user-role.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/src/actions/toggle-user-status.ts [app-rsc] (ecmascript)", ACTIONS_MODULE3 => "[project]/src/actions/delete-user.ts [app-rsc] (ecmascript)", ACTIONS_MODULE4 => "[project]/src/actions/set-user-permissions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/list-users.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/actions/set-user-role.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/actions/toggle-user-status.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE3 => \"[project]/src/actions/delete-user.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE4 => \"[project]/src/actions/set-user-permissions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <exports>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "006b1d78a5ad739e8e069569f19c48edace7cf0b73": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$list$2d$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["listUsersAction"]),
    "406c787133dba9542061b5c4060a2268b8f770bbf5": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$delete$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteUserAction"]),
    "607756e443c07ddccbd29d4809de895c62f507369c": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setUserPermissionsAction"]),
    "60777149fa00a297b4036514b0bbcdad65bb07272c": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$toggle$2d$user$2d$status$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["toggleUserStatusAction"]),
    "608e1289a4990a08598361f2002fe761c8fb280bac": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$role$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setUserRoleAction"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$list$2d$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/list-users.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$role$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/set-user-role.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$toggle$2d$user$2d$status$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/toggle-user-status.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$delete$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/delete-user.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/set-user-permissions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$list$2d$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$role$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$toggle$2d$user$2d$status$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE3__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$delete$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE4__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/list-users.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/actions/set-user-role.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/src/actions/toggle-user-status.ts [app-rsc] (ecmascript)", ACTIONS_MODULE3 => "[project]/src/actions/delete-user.ts [app-rsc] (ecmascript)", ACTIONS_MODULE4 => "[project]/src/actions/set-user-permissions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/list-users.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/actions/set-user-role.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/actions/toggle-user-status.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE3 => \"[project]/src/actions/delete-user.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE4 => \"[project]/src/actions/set-user-permissions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "006b1d78a5ad739e8e069569f19c48edace7cf0b73": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$list$2d$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$role$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$toggle$2d$user$2d$status$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE3__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$delete$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE4__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["006b1d78a5ad739e8e069569f19c48edace7cf0b73"]),
    "406c787133dba9542061b5c4060a2268b8f770bbf5": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$list$2d$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$role$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$toggle$2d$user$2d$status$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE3__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$delete$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE4__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["406c787133dba9542061b5c4060a2268b8f770bbf5"]),
    "607756e443c07ddccbd29d4809de895c62f507369c": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$list$2d$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$role$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$toggle$2d$user$2d$status$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE3__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$delete$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE4__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["607756e443c07ddccbd29d4809de895c62f507369c"]),
    "60777149fa00a297b4036514b0bbcdad65bb07272c": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$list$2d$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$role$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$toggle$2d$user$2d$status$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE3__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$delete$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE4__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["60777149fa00a297b4036514b0bbcdad65bb07272c"]),
    "608e1289a4990a08598361f2002fe761c8fb280bac": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$list$2d$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$role$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$toggle$2d$user$2d$status$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE3__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$delete$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE4__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["608e1289a4990a08598361f2002fe761c8fb280bac"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$list$2d$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$role$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$toggle$2d$user$2d$status$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE3__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$delete$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE4__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/list-users.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/actions/set-user-role.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/src/actions/toggle-user-status.ts [app-rsc] (ecmascript)", ACTIONS_MODULE3 => "[project]/src/actions/delete-user.ts [app-rsc] (ecmascript)", ACTIONS_MODULE4 => "[project]/src/actions/set-user-permissions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <module evaluation>');
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$list$2d$users$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$role$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$toggle$2d$user$2d$status$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE3__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$delete$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE4__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$set$2d$user$2d$permissions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/admin/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/list-users.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/actions/set-user-role.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/src/actions/toggle-user-status.ts [app-rsc] (ecmascript)", ACTIONS_MODULE3 => "[project]/src/actions/delete-user.ts [app-rsc] (ecmascript)", ACTIONS_MODULE4 => "[project]/src/actions/set-user-permissions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <exports>');
}}),
"[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}}),
"[project]/src/app/layout.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/layout.tsx [app-rsc] (ecmascript)"));
}}),
"[project]/src/app/admin/layout.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/admin/layout.tsx [app-rsc] (ecmascript)"));
}}),
"[project]/src/app/admin/page.tsx (client reference/proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server-edge.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/admin/page.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/admin/page.tsx <module evaluation>", "default");
}}),
"[project]/src/app/admin/page.tsx (client reference/proxy)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server-edge.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/admin/page.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/admin/page.tsx", "default");
}}),
"[project]/src/app/admin/page.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/app/admin/page.tsx (client reference/proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__ = __turbopack_context__.i("[project]/src/app/admin/page.tsx (client reference/proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__);
}}),
"[project]/src/app/admin/page.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/admin/page.tsx [app-rsc] (ecmascript)"));
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__1e40303f._.js.map