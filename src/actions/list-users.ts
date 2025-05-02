'use server';

import { adminAuth } from '@/lib/firebase/admin';
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
  }[];
}

export async function listUsersAction(): Promise<ListUsersResult> {
  // --- Authentication/Authorization Check ---
  // Similar to create-user action, ensure the caller is an admin.
  // This is crucial for security. For now, we assume page-level protection.
  // In a real app, implement robust server-side auth checks here.
  // --- End Auth Check ---

  try {
    const listUsersResult = await adminAuth.listUsers(1000); // List up to 1000 users
    const users = listUsersResult.users.map((userRecord: UserRecord) => ({
        uid: userRecord.uid,
        email: userRecord.email,
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
    }));

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
