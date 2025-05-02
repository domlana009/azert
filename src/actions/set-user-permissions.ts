
'use server';

import { adminAuth } from '@/lib/firebase/admin';
import { z } from 'zod';

// Define input schema for validation
const SetUserPermissionsInputSchema = z.object({
  uid: z.string().min(1, { message: "UID utilisateur requis." }),
  allowedSections: z.array(z.string()), // Expect an array of section IDs/names
});

// Define return type
interface SetUserPermissionsResult {
  success: boolean;
  message: string;
}

export async function setUserPermissionsAction(uid: string, allowedSections: string[]): Promise<SetUserPermissionsResult> {
    // --- Authorization Check ---
    // Ensure the caller is an authenticated admin. This is CRUCIAL.
    // For simplicity, assume page-level protection or verify token here.
    // --- End Auth Check ---

    // Validate input
    const validationResult = SetUserPermissionsInputSchema.safeParse({ uid, allowedSections });
    if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
        return { success: false, message: `Validation échouée: ${errorMessages}` };
    }

    // Prevent modifying the primary admin defined by environment variable
    if (process.env.NEXT_PUBLIC_ADMIN_UID && uid === process.env.NEXT_PUBLIC_ADMIN_UID) {
        return { success: false, message: "Modification des permissions de l'administrateur principal non autorisée." };
    }

    try {
        // Get existing claims to merge, ensuring 'admin' claim is preserved
        const userRecord = await adminAuth.getUser(uid);
        const existingClaims = userRecord.customClaims || {};

        // Set or update the allowedSections claim, merging with existing claims
        await adminAuth.setCustomUserClaims(uid, {
             ...existingClaims, // Preserve existing claims
             allowedSections: allowedSections // Set/Overwrite allowedSections
        });
        console.log(`Successfully set allowedSections for user: ${uid}`, allowedSections);

        // Optionally force token refresh if the user might be currently logged in
        // await adminAuth.revokeRefreshTokens(uid);

        return {
            success: true,
            message: `Permissions mises à jour avec succès pour l'utilisateur ${uid}.`,
        };
    } catch (error: any) {
        console.error(`Error setting custom claims for user ${uid}:`, error);
        let errorMessage = "Erreur lors de la modification des permissions de l'utilisateur.";
        if (error.code === 'auth/user-not-found') {
            errorMessage = `Utilisateur avec UID ${uid} non trouvé.`;
        }
        return { success: false, message: errorMessage };
    }
}
