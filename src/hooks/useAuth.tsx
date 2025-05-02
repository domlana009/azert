

"use client"; // Ensure this is a client component

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode, // Import ReactNode for children prop type
} from 'react';
import {
  onAuthStateChanged,
  signOut,
  User as FirebaseUser, // Rename Firebase User type
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // Adjust path as necessary

// Define a User type for your application, potentially extending FirebaseUser
// Add custom properties like 'role' here
interface User extends FirebaseUser {
  role?: 'admin' | 'user'; // Example: Add a role property
}

// Define the context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

// Create the context with a default value
// The default value is used when a component tries to access the context outside of a provider
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {}, // Default logout does nothing
});

// Define the provider props type
interface AuthProviderProps {
  children: ReactNode; // Type for children prop
}

// Create the AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if auth object is available before subscribing
    if (!auth) {
      console.error("Firebase auth object is not available. Authentication cannot be initialized. Check Firebase config.");
      setLoading(false); // Stop loading as auth state cannot be determined
      return; // Exit useEffect early
    }

    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        // In a real app, you would fetch this from Firestore or your database
        const getUserRole = async (uid: string): Promise<'admin' | 'user'> => {
            // Priority 1: Check Environment Variable for Admin UID
            if (process.env.NEXT_PUBLIC_ADMIN_UID && uid === process.env.NEXT_PUBLIC_ADMIN_UID) {
                return 'admin';
            }

            // Priority 2: Check Custom Claims (if env var not set or doesn't match)
            // Note: Getting custom claims client-side requires an ID token refresh.
            // Consider if this check is needed client-side or if role should be
            // managed purely via the env var or fetched securely from a backend.
            // For simplicity here, we'll rely primarily on the env var check.
            // If you need claim-based roles, implement token refresh and claim checking:
            // try {
            //   const idTokenResult = await firebaseUser.getIdTokenResult(true); // Force refresh
            //   if (idTokenResult.claims.admin === true) {
            //     return 'admin';
            //   }
            // } catch (error) {
            //   console.error("Error fetching custom claims:", error);
            // }

            // Default Role
            return 'user';
        };


        const userRole = await getUserRole(firebaseUser.uid);

        const appUser: User = {
          ...firebaseUser,
          // Use the determined role
          role: userRole,
        };
        setUser(appUser);
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false); // Set loading to false once auth state is determined
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Logout function
  const logout = async () => {
    // Check if auth is available before trying to sign out
     if (!auth) {
       console.error("Cannot logout: Firebase auth is not initialized.");
       return; // Prevent attempting sign out if auth is null
     }
    setLoading(true); // Optionally set loading state during logout
    try {
      await signOut(auth);
      setUser(null); // Clear user state immediately
    } catch (error) {
      console.error("Error signing out: ", error);
      // Handle logout errors if necessary
    } finally {
      setLoading(false); // Ensure loading is false after attempt
    }
  };

  // Value object passed to the provider
  const value: AuthContextType = { user, loading, logout };

  // Correcting the return statement to ensure proper JSX syntax
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Ensure the hook is used within an AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Default admin credentials (example only - DO NOT USE IN PRODUCTION)
export const defaultAdmin = {
    email: "j.abbay@admin.com", // Example admin email
    // NEVER store plain text passwords in code.
    // This is only for demonstration if manually creating the user.
    // password: "123456"
};

// Function to create the default admin user if they don't exist
// THIS IS UNSAFE AND FOR LOCAL DEVELOPMENT/DEMO ONLY.
// In production, manage users securely via Firebase Console or Admin SDK backend.
// async function ensureDefaultAdminExists() {
//   if (!auth) return; // Don't run if auth isn't initialized
//   try {
//     // Try to sign in to check if user exists - THIS IS NOT A RELIABLE CHECK
//     // A better approach involves backend logic or Admin SDK functions if needed.
//     // This client-side check is highly insecure and easily bypassed.
//     // **AVOID this pattern in production.**
//      await signInWithEmailAndPassword(auth, defaultAdmin.email, "some_temp_password_to_check");
//      console.log(`Admin user ${defaultAdmin.email} likely exists.`);
//      // Sign out immediately after check
//      await signOut(auth);
//   } catch (error: any) {
//     if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
//       console.log(`Admin user ${defaultAdmin.email} not found, attempting to create...`);
//       try {
//         // This requires Email/Password sign-in to be enabled in Firebase
//         // AND potentially Sign up (new users) enabled.
//         // *** SECURITY RISK: Client-side user creation like this is generally unsafe. ***
//         // const userCredential = await createUserWithEmailAndPassword(auth, defaultAdmin.email, defaultAdmin.password);
//         // console.log(`Default admin user ${userCredential.user.email} created successfully.`);
//         // TODO: You would need backend logic (e.g., Cloud Function triggered on user creation)
//         // to securely set the admin custom claim or update a role in Firestore.
//         // Client-side cannot set custom claims.
//       } catch (creationError) {
//         console.error("Error creating default admin user:", creationError);
//       }
//     } else {
//       // Other sign-in error
//       console.error("Error checking for admin user:", error);
//     }
//   }
// }

// Uncomment and call this *carefully* during development setup if needed,
// understanding the security implications.
// ensureDefaultAdminExists();

