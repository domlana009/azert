
import admin from 'firebase-admin';

// Ensure service account key is handled securely and not exposed client-side
// Option 1: Use environment variables (Recommended for Vercel/similar platforms)
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized via env var.");
  } catch (error: any) {
     console.error("Error initializing Firebase Admin SDK from env var:", error.message);
     // Fallback or throw error depending on requirements
      // Option 2: Fallback to local file (for local development)
      try {
        const serviceAccountFile = require('../../../serviceAccountKey.json'); // Adjust path if needed
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountFile),
        });
        console.log("Firebase Admin SDK initialized via local file.");
      } catch (fileError: any) {
         console.error("Failed to initialize Firebase Admin SDK from local file:", fileError.message);
         console.error("Ensure FIREBASE_SERVICE_ACCOUNT_KEY env var is set or serviceAccountKey.json exists.");
         // Decide how to handle failure: throw error, or let functions fail later?
         // For now, we just log the error. Functions using adminAuth will fail.
      }
  }
}


export const adminAuth = admin.auth();
// Export other admin services if needed, e.g., admin.firestore()
