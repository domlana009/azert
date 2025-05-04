
'use server';

import { getAdminAuth } from '@/lib/firebase/admin'; // Import the getter function
import { z } from 'zod';

// Define input schema for validation
const DeleteUserInputSchema = z.object({
  uid: z.string().min(1, { message: "UID utilisateur requis." }),
});

// Define return type
interface DeleteUserResult {
  success: boolean;
  message: string;
}

export async function deleteUserAction(uid: string): Promise<DeleteUserResult> {
    const adminAuth = getAdminAuth(); // Get the admin auth instance

    // --- Authorization Check ---
    // Ensure the caller is an authenticated admin.
    // --- End Auth Check ---

    // Validate input
    const validationResult = DeleteUserInputSchema.safeParse({ uid });
    if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
        return { success: false, message: `Validation échouée: ${errorMessages}` };
    }

     // Prevent deleting the primary admin defined by environment variable
    if (process.env.NEXT_PUBLIC_ADMIN_UID && uid === process.env.NEXT_PUBLIC_ADMIN_UID) {
        return { success: false, message: "Suppression de l'administrateur principal non autorisée." };
    }


    try {
        // Delete user
        await adminAuth.deleteUser(uid);
        console.log(`Successfully deleted user: ${uid}`);

        return {
            success: true,
            message: `User supprimé avec succès.`,
        };
    } catch (error: any) {
        console.error(`Error deleting user ${uid}:`, error);
        let errorMessage = "Erreur lors de la suppression de l'utilisateur.";
        if (error.code === 'auth/user-not-found') {
            errorMessage = `User avec UID ${uid} non trouvé.`;
        }
        // Add more specific error handling based on Firebase Admin SDK errors if needed
        return { success: false, message: errorMessage };
    }
}
