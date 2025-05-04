module.exports = {

"[externals]/next/dist/compiled/next-server/app-page.runtime.dev.js [external] (next/dist/compiled/next-server/app-page.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page.runtime.dev.js"));

module.exports = mod;
}}),
"[project]/src/lib/firebase/config.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// Import the functions you need from the SDKs you need
__turbopack_context__.s({
    "app": (()=>app),
    "auth": (()=>auth)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/app/dist/index.mjs [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm2017.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$totp$2d$d5ff2369$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__o__as__getAuth$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/auth/dist/node-esm/totp-d5ff2369.js [app-ssr] (ecmascript) <export o as getAuth>");
;
;
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: Ensure these environment variables are correctly set in your .env file
const firebaseConfig = {
    apiKey: ("TURBOPACK compile-time value", "AIzaSyDD2kQbx8lp93awx5rSIr86Jm1mIN15Xs8"),
    authDomain: ("TURBOPACK compile-time value", "reportzen-mixd3.firebaseapp.com"),
    projectId: ("TURBOPACK compile-time value", "reportzen-mixd3"),
    storageBucket: ("TURBOPACK compile-time value", "reportzen-mixd3.firebasestorage.app"),
    messagingSenderId: ("TURBOPACK compile-time value", "228045181413"),
    appId: ("TURBOPACK compile-time value", "1:228045181413:web:600fcac96998fed7c35f0c"),
    measurementId: ("TURBOPACK compile-time value", ""),
    dynamicLinksApiKey: ("TURBOPACK compile-time value", "AIzaSyAbjvD-BEdzhaZzIw2AYnMYNQL8egjn_Xw")
};
// Initialize Firebase only if it hasn't been initialized yet
let app;
let auth = null; // Initialize auth to null
// Function to check if API key is potentially valid (basic check)
function isApiKeyPotentiallyValid(apiKey) {
    // Basic check: Not empty and doesn't look like a placeholder
    return !!apiKey && !apiKey.startsWith("YOUR_") && apiKey.length > 10;
}
if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getApps"])().length) {
    // Validate essential config values before initializing
    if (!isApiKeyPotentiallyValid(firebaseConfig.apiKey)) {
        console.error(`Firebase API Key is missing or invalid: '${firebaseConfig.apiKey}'. Please check your .env file (and compare with .env.example) and ensure NEXT_PUBLIC_FIREBASE_API_KEY is set correctly.`);
    // You might want to throw an error here or handle it differently depending on your app's needs
    } else if (!firebaseConfig.projectId) {
        console.error("Firebase Project ID is missing. Please check your .env file (and compare with .env.example) and ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID is set.");
    // Throw or handle error
    } else {
        // Only initialize if essential config seems present and valid
        try {
            app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["initializeApp"])(firebaseConfig);
            // Initialize Firebase Authentication and get a reference to the service only after successful app initialization
            auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$totp$2d$d5ff2369$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__o__as__getAuth$3e$__["getAuth"])(app);
            console.log("Firebase initialized successfully."); // Log success
        } catch (error) {
            console.error("Error initializing Firebase:", error.message || error);
        // Handle initialization error (e.g., show a message to the user)
        // You might want to set a global error state here
        }
    }
} else {
    app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getApp"])();
    // Ensure auth is initialized if the app already exists
    try {
        auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$totp$2d$d5ff2369$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__o__as__getAuth$3e$__["getAuth"])(app);
        console.log("Firebase app already initialized."); // Log info
    } catch (error) {
        console.error("Error getting Firebase Auth for existing app:", error.message || error);
    }
}
// Check if auth initialization failed after trying
if (!auth) {
    console.error("Firebase Authentication could not be initialized. This is often due to missing or invalid configuration in your .env file (e.g., NEXT_PUBLIC_FIREBASE_API_KEY). Please verify your Firebase project settings and ensure your .env file is correctly set up (compare with .env.example).");
}
;
}}),
"[project]/src/hooks/useAuth.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "AuthProvider": (()=>AuthProvider),
    "defaultAdmin": (()=>defaultAdmin),
    "useAuth": (()=>useAuth)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$totp$2d$d5ff2369$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__y__as__onAuthStateChanged$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/auth/dist/node-esm/totp-d5ff2369.js [app-ssr] (ecmascript) <export y as onAuthStateChanged>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$totp$2d$d5ff2369$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__C__as__signOut$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/auth/dist/node-esm/totp-d5ff2369.js [app-ssr] (ecmascript) <export C as signOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase/config.ts [app-ssr] (ecmascript)"); // Adjust path as necessary
"use client"; // Ensure this is a client component
;
;
;
;
// Create the context with a default value
// The default value is used when a component tries to access the context outside of a provider
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    user: null,
    loading: true,
    logout: async ()=>{}
});
const AuthProvider = ({ children })=>{
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Check if auth object is available before subscribing
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auth"]) {
            console.error("Firebase auth object is not available. Authentication cannot be initialized. Check Firebase config.");
            setLoading(false); // Stop loading as auth state cannot be determined
            return; // Exit useEffect early
        }
        // Subscribe to Firebase auth state changes
        const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$totp$2d$d5ff2369$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__y__as__onAuthStateChanged$3e$__["onAuthStateChanged"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auth"], async (firebaseUser)=>{
            if (firebaseUser) {
                // User is signed in
                try {
                    // Force refresh the token to get the latest custom claims
                    const idTokenResult = await firebaseUser.getIdTokenResult(true);
                    const claims = idTokenResult.claims;
                    // Determine Role
                    let userRole = 'user'; // Default to user
                    // Priority 1: Check Environment Variable for Admin UID
                    if (("TURBOPACK compile-time value", "CGgYniLRpOPeSaBvYtyYDbr8ZJm1") && firebaseUser.uid === ("TURBOPACK compile-time value", "CGgYniLRpOPeSaBvYtyYDbr8ZJm1")) {
                        userRole = 'admin';
                    } else if (claims.admin === true) {
                        userRole = 'admin';
                    }
                    // Determine Allowed Sections
                    // Default to all sections for admin, otherwise read from claims or default to empty
                    let allowedSections;
                    if (userRole === 'admin') {
                        allowedSections = [
                            'daily-report',
                            'activity-report',
                            'r0-report',
                            'truck-tracking'
                        ]; // Admins see all
                    } else {
                        allowedSections = Array.isArray(claims.allowedSections) ? claims.allowedSections : []; // Default to empty array if claim doesn't exist or isn't an array
                    }
                    const appUser = {
                        ...firebaseUser,
                        role: userRole,
                        allowedSections: allowedSections
                    };
                    setUser(appUser);
                } catch (error) {
                    console.error("Error fetching custom claims:", error);
                    // Handle error, maybe set user with default role/permissions?
                    const appUser = {
                        ...firebaseUser,
                        role: 'user',
                        allowedSections: []
                    };
                    setUser(appUser);
                }
            } else {
                // User is signed out
                setUser(null);
            }
            setLoading(false); // Set loading to false once auth state is determined
        });
        // Cleanup subscription on unmount
        return ()=>unsubscribe();
    }, []); // Empty dependency array ensures this runs only once on mount
    // Logout function
    const logout = async ()=>{
        // Check if auth is available before trying to sign out
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auth"]) {
            console.error("Cannot logout: Firebase auth is not initialized.");
            return; // Prevent attempting sign out if auth is null
        }
        setLoading(true); // Optionally set loading state during logout
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$totp$2d$d5ff2369$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__C__as__signOut$3e$__["signOut"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["auth"]);
            setUser(null); // Clear user state immediately
        } catch (error) {
            console.error("Error signing out: ", error);
        // Handle logout errors if necessary
        } finally{
            setLoading(false); // Ensure loading is false after attempt
        }
    };
    // Value object passed to the provider
    const value = {
        user,
        loading,
        logout
    };
    // Correcting the return statement to ensure proper JSX syntax
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/hooks/useAuth.tsx",
        lineNumber: 146,
        columnNumber: 5
    }, this);
};
const useAuth = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        // Ensure the hook is used within an AuthProvider
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
const defaultAdmin = {
    email: "j.abbay@admin.com"
};
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__ab2eadbd._.js.map