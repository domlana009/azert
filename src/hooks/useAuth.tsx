

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
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        // TODO: Fetch additional user data (like role) from your backend/database if needed
        // Example: const userRole = await fetchUserRole(firebaseUser.uid);

        // Simulate fetching user role (replace with actual logic)
        // In a real app, you would fetch this from Firestore or your database
        const getUserRole = async (uid: string): Promise<'admin' | 'user'> => {
          // Example: check if UID matches a known admin UID
          // Replace with your actual role management logic
          if (uid === process.env.NEXT_PUBLIC_ADMIN_UID) { // Example check
            return 'admin';
          }
          return 'user'; // Default role
        };

        const userRole = await getUserRole(firebaseUser.uid);

        const appUser: User = {
          ...firebaseUser,
          // Use the fetched role
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
