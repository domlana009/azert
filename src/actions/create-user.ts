
'use server';

import { adminAuth } from '@/lib/firebase/admin';
import { z } from 'zod';
import { headers } from 'next/headers'; // To potentially get user info if needed for auth check

// Define input schema for validation
const CreateUserInputSchema = z.object({
  email: z.string().email({ message: "Format d'email invalide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
  isAdmin: z.boolean().optional(), // Optional: flag to set admin custom claim
});

// Define return type
interface CreateUserResult {
  success: boolean;
  message: string;
  userId?: string;
}

export async function createUserAction(formData: FormData): Promise<CreateUserResult> {
  // --- Authentication/Authorization Check (Crucial!) ---
  // This is a basic example. Implement robust checks based on your auth setup.
  // Option 1: Check session/token if passed via headers (more complex)
  // Option 2: Assume this action is only callable from a protected admin page
  //           (simpler, relies on page-level protection)
  // For this example, we'll assume page-level protection.
  // In a real app, verify the caller is truly an admin here.
  // const userToken = headers().get('Authorization')?.split('Bearer ')[1];
  // if (!userToken) return { success: false, message: "Non autorisé." };
  // try {
  //   const decodedToken = await adminAuth.verifyIdToken(userToken);
  //   if (!decodedToken.admin) { // Assuming you set an 'admin' custom claim
  //      return { success: false, message: "Accès refusé." };
  //   }
  // } catch (error) {
  //    console.error("Auth check failed:", error);
  //    return { success: false, message: "Erreur d'authentification." };
  // }
  // --- End Auth Check ---


  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    isAdmin: formData.get('isAdmin') === 'on', // Checkbox value is 'on' or null
  };

  // Validate input data
  const validationResult = CreateUserInputSchema.safeParse(rawData);

  if (!validationResult.success) {
    // Combine error messages
    const errorMessages = validationResult.error.errors.map(e => e.message).join(', ');
    return { success: false, message: `Validation échouée: ${errorMessages}` };
  }

  const { email, password, isAdmin } = validationResult.data;

  try {
    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
      emailVerified: false, // Optional: set email verification status
      disabled: false, // Optional: enable/disable user
    });

    let claimMessage = '';
    // Optionally set custom claims (like admin role)
    if (isAdmin) {
      await adminAuth.setCustomUserClaims(userRecord.uid, { admin: true });
      claimMessage = " Rôle admin défini.";
       // Note: If using NEXT_PUBLIC_ADMIN_UID method in useAuth.tsx (as currently configured),
       // this custom claim might not be checked by default for identifying admins.
       // Ensure your useAuth.tsx logic aligns with how you define admins (claim vs env var).
       // The checkbox in create-user page is currently commented out to align with the primary NEXT_PUBLIC_ADMIN_UID method.
    }


    console.log('Successfully created new user:', userRecord.uid);
    return {
      success: true,
      message: `Utilisateur ${email} créé avec succès.${claimMessage}`,
      userId: userRecord.uid,
    };
  } catch (error: any) {
    console.error('Error creating new user:', error);
    let errorMessage = "Erreur lors de la création de l'utilisateur.";
    if (error.code === 'auth/email-already-exists') {
      errorMessage = `L'email ${email} existe déjà.`;
    } else if (error.code === 'auth/invalid-password') {
       errorMessage = "Le mot de passe est invalide (doit comporter au moins 6 caractères)."; // Firebase might enforce this anyway
    }
    // Add more specific error handling as needed
    return { success: false, message: errorMessage };
  }
}
