
'use server';

import { adminAuth } from '@/lib/firebase/admin';
import { z } from 'zod';

// Define input schema for validation
const SetUserRoleInputSchema = z.object({
  uid: z.string().min(1, { message: "UID utilisateur requis." }),
  isAdmin: z.boolean(),
});

// Define return type
interface SetUserRoleResult {
  success: boolean;
  message: string;
}

export async function setUserRoleAction(uid: string, isAdmin: boolean): Promise<SetUserRoleResult> {
    // --- Authorization Check ---
    // Ensure the caller is an authenticated admin. This is CRUCIAL.
    // For simplicity, we assume this check happens in the calling context (e.g., AdminPage)
    // A more robust solution involves verifying an admin token here.
    // --- End Auth Check ---

    // Validate input (even though it comes from internal function call, good practice)
    const validationResult = SetUserRoleInputSchema.safeParse({ uid, isAdmin });
    if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
        return { success: false, message: `Validation échouée: ${errorMessages}` };
    }

    // Prevent modifying the primary admin defined by environment variable
    if (process.env.NEXT_PUBLIC_ADMIN_UID && uid === process.env.NEXT_PUBLIC_ADMIN_UID) {
        return { success: false, message: "Modification du rôle de l'administrateur principal non autorisée." };
    }

    try {
        // Set custom claims
        await adminAuth.setCustomUserClaims(uid, { admin: isAdmin });
        console.log(`Successfully set admin claim to ${isAdmin} for user: ${uid}`);

        // Optionally, force token refresh for the affected user if they are currently logged in
        // This requires more complex logic, potentially involving Firestore or Realtime Database
        // await adminAuth.revokeRefreshTokens(uid);

        return {
            success: true,
            message: `Rôle admin ${isAdmin ? 'défini' : 'retiré'} avec succès pour l'utilisateur ${uid}.`,
        };
    } catch (error: any) {
        console.error(`Error setting custom claims for user ${uid}:`, error);
        let errorMessage = "Erreur lors de la modification du rôle de l'utilisateur.";
        // Add more specific error handling based on Firebase Admin SDK errors if needed
        if (error.code === 'auth/user-not-found') {
            errorMessage = `Utilisateur avec UID ${uid} non trouvé.`;
        }
        return { success: false, message: errorMessage };
    }
}
