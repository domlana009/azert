
'use server';

import { adminAuth } from '@/lib/firebase/admin';
import { z } from 'zod';

// Define input schema for validation
const ToggleUserStatusInputSchema = z.object({
  uid: z.string().min(1, { message: "UID utilisateur requis." }),
  disable: z.boolean(), // true to disable, false to enable
});

// Define return type
interface ToggleUserStatusResult {
  success: boolean;
  message: string;
}

export async function toggleUserStatusAction(uid: string, disable: boolean): Promise<ToggleUserStatusResult> {
    // --- Authorization Check ---
    // Ensure the caller is an authenticated admin.
    // --- End Auth Check ---

    // Validate input
    const validationResult = ToggleUserStatusInputSchema.safeParse({ uid, disable });
    if (!validationResult.success) {
        const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
        return { success: false, message: `Validation échouée: ${errorMessages}` };
    }

     // Prevent disabling the primary admin defined by environment variable
    if (disable && process.env.NEXT_PUBLIC_ADMIN_UID && uid === process.env.NEXT_PUBLIC_ADMIN_UID) {
        return { success: false, message: "Désactivation de l'administrateur principal non autorisée." };
    }

    try {
        // Update user status
        await adminAuth.updateUser(uid, { disabled: disable });
        console.log(`Successfully ${disable ? 'disabled' : 'enabled'} user: ${uid}`);

        return {
            success: true,
            message: `Utilisateur ${disable ? 'désactivé' : 'activé'} avec succès.`,
        };
    } catch (error: any) {
        console.error(`Error updating status for user ${uid}:`, error);
        let errorMessage = "Erreur lors de la modification du statut de l'utilisateur.";
        if (error.code === 'auth/user-not-found') {
            errorMessage = `Utilisateur avec UID ${uid} non trouvé.`;
        }
        return { success: false, message: errorMessage };
    }
}
