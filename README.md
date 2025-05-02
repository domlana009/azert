# R0

This is a Next.js application for daily job reporting using Firebase for authentication.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd R0
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Firebase Project:**
    *   Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   Go to Project Settings > General.
    *   Under "Your apps", click the Web icon (`</>`) to add a web app.
    *   Register your app and copy the `firebaseConfig` object. You'll need these values for the `.env` file (client-side setup).
    *   **Enable Firebase Authentication:** Go to Authentication > Sign-in method, and enable the **Email/Password** provider.
    *   **(Optional but helpful):** Note your Project ID from Project Settings.

4.  **Set up Firebase Admin SDK Credentials (for Server-Side Actions like User Creation):**
    *   **Requirement:** You need service account credentials for server-side operations. Choose **ONE** of the following methods:
    *   **Method 1 (Recommended for Deployment & Security): Environment Variable**
        *   Go to your Firebase Project Settings > Service accounts.
        *   Click "Generate new private key" and confirm. A JSON file containing your service account key will download.
        *   **Important:** Open the downloaded JSON file. Copy its **entire content**.
        *   Set this entire JSON content as an environment variable named `FIREBASE_SERVICE_ACCOUNT_KEY`.
        *   **How to set environment variables:**
            *   **Vercel/Netlify/Cloud Run etc.:** Use the platform's dashboard to set the `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable. Paste the full JSON content as the value. Make sure there are no extra spaces or line breaks.
            *   **Local `.env` file:** You can add `FIREBASE_SERVICE_ACCOUNT_KEY='{...}'` to your `.env` file, replacing `{...}` with `{...}` with the *single-line* JSON content. Be extremely careful not to accidentally commit this file if it contains the actual key. Using a separate `.env.local` (which is typically gitignored) is safer for local keys.
    *   **Method 2 (Easier for Local Development, Use with Caution): Local File**
        *   Go to your Firebase Project Settings > Service accounts.
        *   Click "Generate new private key" and confirm. A JSON file will download.
        *   Rename the downloaded file to exactly `serviceAccountKey.json`.
        *   Place this `serviceAccountKey.json` file in the **root directory** of your project (the same level as `package.json`).
        *   **CRITICAL:** Add `serviceAccountKey.json` to your `.gitignore` file immediately to prevent accidentally committing your secret key to version control.
        ```gitignore
        # .gitignore
        serviceAccountKey.json
        .env.local
        .env.*.local
        ```

5.  **Configure Client-Side Environment Variables:**
    *   Create a file named `.env` in the root of your project (if it doesn't exist). You can copy `.env.example` if provided.
    *   Open the `.env` file.
    *   Add the following variables, replacing the placeholder values (`YOUR_...`) with your actual Firebase project configuration values from the `firebaseConfig` object you copied in Step 3 (ensure they are prefixed with `NEXT_PUBLIC_`):
        ```dotenv
        NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
        NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID # Optional
        NEXT_PUBLIC_FIREBASE_DYNAMIC_LINKS_API_KEY=AIzaSyAbjvD-BEdzhaZzIw2AYnMYNQL8egjn_Xw # Add this if needed

        # For Genkit / Google AI (Optional)
        GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_AI_API_KEY

        # --- Admin SDK ---
        # Use this OR the serviceAccountKey.json file, not both are strictly required to be set *here*
        # If using the local file method, this can be left blank.
        # If using the env var method, this MUST contain the full JSON content.
        FIREBASE_SERVICE_ACCOUNT_KEY=

        # --- Admin User Identification ---
        # Option 1 (Simpler): Set this to the UID of the user you manually create as admin in Step 6.
        # The useAuth hook prioritizes this. Get the UID from Firebase Console > Authentication > Users.
        NEXT_PUBLIC_ADMIN_UID=YOUR_MANUALLY_CREATED_ADMIN_USER_UID

        # Option 2 (Custom Claims): Alternatively, you can use Firebase Custom Claims.
        # If you check the "Set as Admin" box when creating a user via the app's Admin Panel,
        # it sets a custom claim { admin: true }. You would then need to modify
        # src/hooks/useAuth.tsx to check `idTokenResult.claims.admin === true` instead of NEXT_PUBLIC_ADMIN_UID.
        ```
    *   **Important:** Double-check `NEXT_PUBLIC_FIREBASE_API_KEY`. An invalid key is a common cause of errors.

6.  **IMPORTANT: Create the Initial Admin User in Firebase Console (Required):**
    *   Go to your Firebase project > Authentication > Users.
    *   Click "Add user".
    *   Enter the **exact email** for your admin (e.g., `j.abbay@admin.com`) and a secure password (e.g., `123456` **for local testing only - use a strong password in production**).
    *   Click "Add user".
    *   **Copy the User UID** of the user you just created. You'll need this for the `NEXT_PUBLIC_ADMIN_UID` environment variable in your `.env` file (if using that method). Paste it there.
    *   **You MUST complete this step before attempting to log in as the admin user.** Failure to do so will result in login errors (`auth/invalid-credential`).

7.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    *   *(Restart the server if you modified `.env` files)*

8.  Open [http://localhost:9002](http://localhost:9002) (or the specified port) with your browser.

9.  **Log in as Admin:**
    *   Use the admin credentials you created manually (e.g., `j.abbay@admin.com` / `123456`).
    *   If login fails with "invalid credentials", double-check the email/password and ensure the user exists in the Firebase console.
    *   If login fails with API key errors, double-check your `NEXT_PUBLIC_FIREBASE_API_KEY` in `.env`.
    *   Once logged in, if you set `NEXT_PUBLIC_ADMIN_UID` correctly, you should see the "Admin Panel" button. Click it, then "Create New User" to add others.

## Features

*   Tabbed Navigation: Switch between Daily Report, Activity Report, R0 Report, and Truck Tracking sections.
*   Forms: Input and display for daily reports, activity reports, R0 reports, and truck tracking.
*   Dynamic Data Tables: Interactive tables for activity and truck tracking.
*   Authentication: User login/logout using Firebase Auth.
*   Admin Panel: Basic admin panel (accessible via `/admin`) allowing admins to create new users and manage permissions.

## Technologies Used

*   Next.js (App Router)
*   React
*   TypeScript
*   Tailwind CSS
*   Shadcn/ui
*   Lucide React (Icons)
*   Firebase Authentication (Client SDK)
*   Firebase Admin SDK (Server-side for user creation/management)
*   Genkit (for potential GenAI features)
*   date-fns

## Troubleshooting

*   **`Firebase: Error (auth/invalid-api-key)`:** Your `NEXT_PUBLIC_FIREBASE_API_KEY` in `.env` is likely incorrect or missing. Verify it against your Firebase project settings.
*   **`Firebase: Error (auth/invalid-credential)`:** The email or password used for login is incorrect, OR the user does not exist in Firebase Authentication. Ensure you created the user manually first (Step 6).
*   **`Firebase Admin SDK could not be initialized` (Server log):** Your server-side Admin SDK credentials are not configured correctly. Check Step 4: ensure either `FIREBASE_SERVICE_ACCOUNT_KEY` env var is set (with the full JSON content) OR `serviceAccountKey.json` is present in the project root and readable by the server process. Check server logs for more detailed errors from `src/lib/firebase/admin.ts`.
*   **`Cannot find module 'serviceAccountKey.json'` (Server log):** If using the local file method, the server cannot find the file. Ensure it's named correctly and placed in the project root.
*   **Hydration Errors:** Often caused by rendering differences between server and client. Check for browser-specific APIs (`window`, `localStorage`) used outside `useEffect` or conditional rendering based on non-deterministic values (`Math.random()`, `new Date()`) before hydration.
*   **404 Errors:** Double-check your page routes and component imports. Ensure files exist and are correctly named.

