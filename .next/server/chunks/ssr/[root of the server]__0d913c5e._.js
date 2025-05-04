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
"[project]/src/actions/create-user.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/* __next_internal_action_entry_do_not_use__ {"40554d47e8d6b673b1b420820804180861d9155920":"createUserAction"} */ __turbopack_context__.s({
    "createUserAction": (()=>createUserAction)
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
const CreateUserInputSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().email({
        message: "Format d'email invalide."
    }),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].string().min(6, {
        message: "Le mot de passe doit contenir au moins 6 caractères."
    }),
    isAdmin: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$lib$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["z"].boolean().optional()
});
async function /*#__TURBOPACK_DISABLE_EXPORT_MERGING__*/ createUserAction(formData) {
    const adminAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getAdminAuth"])(); // Get the admin auth instance via the getter
    // --- Authentication/Authorization Check (Crucial!) ---
    // This is a basic example. Implement robust checks based on your auth setup.
    // Option 1: Check session/token if passed via headers (more complex)
    // Option 2: Assume this action is only callable from a protected admin page
    //           (simpler, relies on page-level protection)
    // For this example, we'll assume page-level protection.
    // In a real app, verify the caller is truly an admin here.
    // const userToken = headers().get('Authorization')?.split('Bearer ')[1];
    // if (!userToken) return { success: false, message: "Non autorisé." };
    // try {
    //   const decodedToken = await adminAuth.verifyIdToken(userToken);
    //   if (!decodedToken.admin) { // Assuming you set an 'admin' custom claim
    //      return { success: false, message: "Accès refusé." };
    //   }
    // } catch (error) {
    //    console.error("Auth check failed:", error);
    //    return { success: false, message: "Erreur d'authentification." };
    // }
    // --- End Auth Check ---
    const rawData = {
        email: formData.get('email'),
        password: formData.get('password'),
        isAdmin: formData.get('isAdmin') === 'on'
    };
    // Validate input data
    const validationResult = CreateUserInputSchema.safeParse(rawData);
    if (!validationResult.success) {
        // Combine error messages
        const errorMessages = validationResult.error.errors.map((e)=>e.message).join(', ');
        return {
            success: false,
            message: `Validation échouée: ${errorMessages}`
        };
    }
    const { email, password, isAdmin } = validationResult.data;
    try {
        const userRecord = await adminAuth.createUser({
            email: email,
            password: password,
            emailVerified: false,
            disabled: false
        });
        let claimMessage = '';
        // Optionally set custom claims (like admin role)
        if (isAdmin) {
            await adminAuth.setCustomUserClaims(userRecord.uid, {
                admin: true
            });
            claimMessage = " Rôle admin défini.";
        // Note: If using NEXT_PUBLIC_ADMIN_UID method in useAuth.tsx (as currently configured),
        // this custom claim might not be checked by default for identifying admins.
        // Ensure your useAuth.tsx logic aligns with how you define admins (claim vs env var).
        // The checkbox in create-user page is currently commented out to align with the primary NEXT_PUBLIC_ADMIN_UID method.
        }
        console.log('Successfully created new user:', userRecord.uid);
        return {
            success: true,
            message: `User ${email} créé avec succès.${claimMessage}`,
            userId: userRecord.uid
        };
    } catch (error) {
        console.error('Error creating new user:', error);
        let errorMessage = "Erreur lors de la création de l'utilisateur.";
        if (error.code === 'auth/email-already-exists') {
            errorMessage = `L'email ${email} existe déjà.`;
        } else if (error.code === 'auth/invalid-password') {
            errorMessage = "Le mot de passe est invalide (doit comporter au moins 6 caractères)."; // Firebase might enforce this anyway
        }
        // Add more specific error handling as needed
        return {
            success: false,
            message: errorMessage
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createUserAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createUserAction, "40554d47e8d6b673b1b420820804180861d9155920", null);
}}),
"[project]/.next-internal/server/app/admin/create-user/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/create-user.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
;
}}),
"[project]/.next-internal/server/app/admin/create-user/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/create-user.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$create$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/create-user.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$create$2d$user$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$create$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/admin/create-user/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/create-user.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/admin/create-user/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/create-user.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <exports>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "40554d47e8d6b673b1b420820804180861d9155920": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$create$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createUserAction"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$actions$2f$create$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/actions/create-user.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$create$2d$user$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$create$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/admin/create-user/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/create-user.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
}}),
"[project]/.next-internal/server/app/admin/create-user/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/actions/create-user.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "40554d47e8d6b673b1b420820804180861d9155920": (()=>__TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$create$2d$user$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$create$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__["40554d47e8d6b673b1b420820804180861d9155920"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$create$2d$user$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$create$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/admin/create-user/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/create-user.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <module evaluation>');
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$create$2d$user$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$actions$2f$create$2d$user$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$exports$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/admin/create-user/page/actions.js { ACTIONS_MODULE0 => "[project]/src/actions/create-user.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <exports>');
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
"[project]/src/app/admin/create-user/page.tsx (client reference/proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server-edge.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/admin/create-user/page.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/admin/create-user/page.tsx <module evaluation>", "default");
}}),
"[project]/src/app/admin/create-user/page.tsx (client reference/proxy)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server-edge.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2d$edge$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/src/app/admin/create-user/page.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/admin/create-user/page.tsx", "default");
}}),
"[project]/src/app/admin/create-user/page.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$create$2d$user$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/app/admin/create-user/page.tsx (client reference/proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$create$2d$user$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__ = __turbopack_context__.i("[project]/src/app/admin/create-user/page.tsx (client reference/proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$admin$2f$create$2d$user$2f$page$2e$tsx__$28$client__reference$2f$proxy$29$__);
}}),
"[project]/src/app/admin/create-user/page.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/admin/create-user/page.tsx [app-rsc] (ecmascript)"));
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__0d913c5e._.js.map