
'use server';

import { getAdminAuth } from '@/lib/firebase/admin'; // Import the getter function
import type { UserRecord } from 'firebase-admin/auth';

// Define return type
interface ListUsersResult {
  success: boolean;
  message: string;
  users?: {
    uid: string;
    email: string | undefined; // Email might be undefined
    creationTime: string;
    lastSignInTime: string;
    disabled: boolean;
    isAdmin: boolean; // Added isAdmin flag
    allowedSections: string[]; // Added allowed sections
  }[];
}

export async function listUsersAction(): Promise<ListUsersResult> {
   const adminAuth = getAdminAuth(); // Get the admin auth instance

  // --- Authentication/Authorization Check ---
  // Similar to create-user action, ensure the caller is an admin.
  // This is crucial for security. For now, we assume page-level protection.
  // In a real app, implement robust server-side auth checks here.
  // --- End Auth Check ---

  try {
    const listUsersResult = await adminAuth.listUsers(1000); // List up to 1000 users

    const users = listUsersResult.users.map((userRecord: UserRecord) => {
        // Check for the admin custom claim
        const isAdmin = !!userRecord.customClaims?.admin; // Check if customClaims exist and admin is true

        // Get allowed sections claim, default to empty array if missing or invalid
        const allowedSections = Array.isArray(userRecord.customClaims?.allowedSections)
                                  ? userRecord.customClaims?.allowedSections as string[]
                                  : [];


        return {
            uid: userRecord.uid,
            email: userRecord.email,
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
            disabled: userRecord.disabled,
            isAdmin: isAdmin,
            allowedSections: allowedSections, // Include allowed sections
        };
    });

    // Optionally sort users, e.g., by creation time or email
    users.sort((a, b) => new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime());


    return {
      success: true,
      message: `Successfully fetched ${users.length} users.`,
      users: users,
    };
  } catch (error: any) {
    console.error('Error listing users:', error);
    return { success: false, message: `Erreur lors de la récupération des utilisateurs: ${error.message}` };
  }
}
