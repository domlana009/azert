module.exports = {

"[externals]/firebase-admin [external] (firebase-admin, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("firebase-admin", () => require("firebase-admin"));

module.exports = mod;
}}),
"[project]/src/lib/firebase/admin.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "adminAuth": (()=>adminAuth)
});
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/firebase-admin [external] (firebase-admin, cjs)");
;
// import path from 'path'; // Keep commented unless switching to process.cwd()
// This is the service account key that is created from the Firebase Console
const serviceAccount = {
    "type": "service_account",
    "project_id": "reportzen-mixd3",
    "private_key_id": "f006f10e8d58e68ee55acf58745bfab3cf123c05",
    "private_key": `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDABEksqxz3OP7J
HRM0uk1jvzov9AcImZdk1+GLnn8ZSQgR4lrlLYhVD9Jn39cND2JVhFqtk3uCaQH+
tJlLxwgDKdJIIt82HF4Nw7PKSPd2xSqGek8yIFAFqwsiq4XnB2wTZ9f97hiYN0hq
ZTl3gTSCF/mvRJmlm3IBYCI4KXQCCCp9BiPhPbx5x+EZb7WnRslsgwNP2awtrMSK
UiqQcN4MCPoD6hxPQzk+MZcEVKuS/MkQS7O0nnN3TIqmpMbKIgBCrnhZI81cOjam
DtfiF8NzdFhcwttlK3REKGnNM9dK+I13LsJlhkd+rmPBPltcDebjjcc7gQCcmNme
8J3B0Ai5AgMBAAECggEACfuPDwFHDGahqbSsbXGBbtNKbqN0rtKcB37zt7hXP5TH
lHUcqE0xiR6Sn++ICiKdHaNiZXjFPeFAscxo1dg0nJl9gwjmat/sVzHany8jnRX2
C9oVqPOmGrgAPbQGI53ZVWRGMJTtdr2/suGtVv8Cyv/9F/VsjtVh3BwdMKdIY9yQ
EIlONolw+dVTKYiFPJbdsAPGJmz03dnjzd70FSyfMqKQ3ffEd1GQnTYLKdEO6N0P
J5HiEduOEcMh0G8Ry1X2oA3iq4Cvr1/9TN1u3TIyxFo6UKFjuB6k4Ncgyd86Tod2
B+OoeMnO0JK+2q+ci6I9Z1xc6h3QV8Jc2FbPzuo1CQKBgQDql8Jw92GmFkcZB2Mh
hame5OTuO+S+oYZoVQykEUa/e32b1mhi/ySy11RffpWA10EqgZsLZ12X61gbiXmq
jPurjXoHLVuUTGZjPG38Bcf5jp5SIcTfKi16rs3nONbiPisCbyA16c24xGLFuMMF
jlePJSYtS3jrcpybjHRG93bCtQKBgQDRievyVwU19m72UI+VIyvqb3bZXhuTaVrx
i7vEeWBQfEzxRBZiiYh75k67O78WWjWDYth01AZlG+Micgr/aAhq0ktKooHk7iQY
X4SAv7Fa7VbbZrStNkTQyS8o2t1AJ2fnrC06I3crTpimQMxweIl4q7NuH1zJ7C7p
568h2lBcdQKBgQDLFtaeNYuz3VVvtZV8T9qoVEBcfj1pSyyw5fArmUlGPAJiBxwX
mAqNSR0iDtQe1jr0MX+oP7Qm8Pc1364UmDjIK5KY5AuENx/siUQuClM1GOK298UX
7cuxieN3aR2ef3N8h/e6tM4ERv+7bFhpVvE2W1LRo6TrMC2j+9QuG84UgQKBgQC5
/1Gftjr74ZoxruUlHylWWkcHQA/+VCDUFJNCHfOuvgeWijfMlATA5niwnqJKdxzV
WaKGYcajbZO6+bxlZrVCDRWkVIg07GbB89esaXxHGDJnYs2yi1+ebVcdTtninpgO
/7jNyLl5ibTart5KX9S3dsI5WEGHQ82I941v4VhAGQKBgGdubhBFJ8skoqokR6DL
FGODcmN6nP9OzrGXcC6g9CTUOP24r1YKHVvnjEdMAIMjFvH6HtJq4BI5zFVR2wSA
zdGVgeYv1jAUDTQ2OVcQYeDYt6kmfTqDW/suyBW2AjXY6davU5kfzyypK8z0CUKy
U3O5ru5Rb6zH/gYSsvhXFL9S
-----END PRIVATE KEY-----`,
    "client_email": "firebase-adminsdk-fbsvc@reportzen-mixd3.iam.gserviceaccount.com",
    "client_id": "106260250081518764874",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40reportzen-mixd3.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
};
// Function to initialize Firebase Admin SDK
const initializeFirebaseAdmin = ()=>{
    // Check if the SDK is already initialized to prevent re-initialization errors
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__["default"].apps.length > 0) {
        // console.log("Firebase Admin SDK already initialized."); // Reduce console noise
        return __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__["default"].auth(); // Return existing auth instance
    }
    console.log("Attempting to initialize Firebase Admin SDK...");
    try {
        __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__["default"].initializeApp({
            credential: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__["default"].credential.cert(serviceAccount)
        });
        console.log('firebase admin Initialized');
    } catch (error) {
        // Catch potential errors during the admin.initializeApp call itself (less common)
        console.error(`Unexpected error during Firebase Admin SDK initialization: ${error.message}`);
    }
    // --- Check Initialization Status ---
    if (__TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__["default"].apps.length > 0) {
        console.log(`Firebase Admin SDK initialization confirmed (via ${initializedVia || 'unknown'}).`);
        return __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin__$5b$external$5d$__$28$firebase$2d$admin$2c$__cjs$29$__["default"].auth();
    }
    // --- Initialization Failed ---
    // If neither the environment variable nor the local file worked
    console.error('CRITICAL: Firebase Admin SDK initialization failed after trying all methods.');
    return null; // Indicate failure
};
// Initialize and attempt to get the adminAuth instance
const adminAuthInstance = initializeFirebaseAdmin();
// Export the instance only if initialization was successful.
// Throwing an error makes the initialization failure immediate and clear during server startup/request.
if (!adminAuthInstance) {
    // Ensure this error message clearly indicates the user needs to check configuration.
    throw new Error('Firebase Admin SDK could not be initialized. Check server logs for detailed errors and setup instructions in README.md.');
}
const adminAuth = adminAuthInstance; // Export other admin services if needed, e.g., admin.firestore()
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase/admin.ts [app-rsc] (ecmascript)");
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
        const userRecord = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminAuth"].createUser({
            email: email,
            password: password,
            emailVerified: false,
            disabled: false
        });
        let claimMessage = '';
        // Optionally set custom claims (like admin role)
        if (isAdmin) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["adminAuth"].setCustomUserClaims(userRecord.uid, {
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
            message: `Utilisateur ${email} créé avec succès.${claimMessage}`,
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

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__fb241e60._.js.map