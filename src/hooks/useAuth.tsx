
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
  getIdTokenResult, // Import getIdTokenResult
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // Adjust path as necessary

// Define a User type for your application, potentially extending FirebaseUser
// Add custom properties like 'role' and 'allowedSections' here
interface User extends FirebaseUser {
  role?: 'admin' | 'user'; // Example: Add a role property
  allowedSections?: string[]; // Add allowed sections property
}

// Define the context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  // allowedSections?: string[]; // Add allowedSections to context type (optional, could also just be on user object)
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
        try {
            // Force refresh the token to get the latest custom claims
            const idTokenResult = await firebaseUser.getIdTokenResult(true);
            const claims = idTokenResult.claims;

            // Determine Role
            let userRole: 'admin' | 'user' = 'user'; // Default to user
            // Priority 1: Check Environment Variable for Admin UID
             if (process.env.NEXT_PUBLIC_ADMIN_UID && firebaseUser.uid === process.env.NEXT_PUBLIC_ADMIN_UID) {
                userRole = 'admin';
            }
            // Priority 2: Check Custom Claim (if env var not set or doesn't match)
            else if (claims.admin === true) {
                 userRole = 'admin';
            }

            // Determine Allowed Sections
            // Default to all sections for admin, otherwise read from claims or default to empty
            let allowedSections: string[];
            if (userRole === 'admin') {
                allowedSections = ['daily-report', 'activity-report', 'r0-report', 'truck-tracking']; // Admins see all
            } else {
                allowedSections = Array.isArray(claims.allowedSections)
                                    ? claims.allowedSections as string[]
                                    : []; // Default to empty array if claim doesn't exist or isn't an array
            }


            const appUser: User = {
                ...firebaseUser,
                role: userRole,
                allowedSections: allowedSections,
            };
            setUser(appUser);

        } catch (error) {
            console.error("Error fetching custom claims:", error);
            // Handle error, maybe set user with default role/permissions?
            const appUser: User = {
                 ...firebaseUser,
                 role: 'user', // Fallback role
                 allowedSections: [], // Fallback permissions
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
