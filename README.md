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

4.  **Set up Firebase Admin SDK Credentials (for Server-Side Actions):**
    *   **Requirement:** You need valid service account credentials for server-side operations (like user creation/management). Choose **ONE** method below. **Failure to configure this correctly will cause server-side errors.**
    *   **Method 1 (Recommended for Deployment & Security): Environment Variable**
        *   Go to your Firebase Project Settings > Service accounts.
        *   Click "Generate new private key" and confirm. A JSON file containing your service account key will download.
        *   **Important:** Open the downloaded JSON file. **Copy its ENTIRE content.**
        *   Set this entire JSON content as an environment variable named `FIREBASE_SERVICE_ACCOUNT_KEY`.
        *   **How to set environment variables:**
            *   **Vercel/Netlify/Cloud Run etc.:** Use the platform's dashboard to set the `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable. Paste the full, valid JSON content as the value. Ensure there are no extra spaces or modifications.
            *   **Local `.env` file:** You can add `FIREBASE_SERVICE_ACCOUNT_KEY='{...}'` to your `.env` file (or preferably `.env.local`), replacing `{...}` with the *single-line* JSON content. Be **extremely careful** not to commit this file if it contains the actual key. Using `.env.local` (which is typically gitignored) is safer. Ensure the JSON is valid.
            ```dotenv
            # Example for .env.local (MAKE SURE THIS FILE IS IN .gitignore)
            FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", "project_id": "your-project-id", ...}'
            ```
    *   **Method 2 (Easier for Local Development, Use with Caution): Local File**
        *   Go to your Firebase Project Settings > Service accounts.
        *   Click "Generate new private key" and confirm. A JSON file will download.
        *   Rename the downloaded file to **exactly** `reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json`.
        *   Place this `reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json` file in the **root directory** of your project (the same level as `package.json`).
        *   Ensure the file content is the complete, valid JSON provided by Firebase.
        *   **CRITICAL:** Add `reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json` to your `.gitignore` file **immediately** to prevent accidentally committing your secret key to version control.
        ```gitignore
        # .gitignore
        reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json
        .env.local
        .env.*.local
        ```
    *   **Verification:** When the server starts, check the console logs. Look for messages like "Firebase Admin SDK: Initialization successful..." or errors indicating problems reading/parsing credentials.

5.  **Configure Client-Side Environment Variables:**
    *   Create a file named `.env` in the root of your project (if it doesn't exist). You can copy `.env.example` if provided.
    *   Open the `.env` file.
    *   Add the following variables, replacing the placeholder values (`YOUR_...`) with your actual Firebase project configuration values from the `firebaseConfig` object you copied in Step 3 (ensure they are prefixed with `NEXT_PUBLIC_`):
        ```dotenv
        # --- Client-Side Firebase Config ---
        NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDD2kQbx8lp93awx5rSIr86Jm1mIN15Xs8
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=reportzen-mixd3.firebaseapp.com
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=reportzen-mixd3
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=reportzen-mixd3.firebasestorage.app
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=228045181413
        NEXT_PUBLIC_FIREBASE_APP_ID=1:228045181413:web:600fcac96998fed7c35f0c
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
        # You might need this if using dynamic links (seems unlikely for this app, but included)
        NEXT_PUBLIC_FIREBASE_DYNAMIC_LINKS_API_KEY=AIzaSyAbjvD-BEdzhaZzIw2AYnMYNQL8egjn_Xw

        # --- Genkit / Google AI (Optional) ---
        GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_AI_API_KEY

        # --- Server-Side Admin SDK (Only one needed - Env Var or Local File) ---
        # Method 1: Environment Variable (Paste the FULL JSON content here or set in deployment environment)
        # Ensure it's a single line if pasting directly into .env / .env.local
        FIREBASE_SERVICE_ACCOUNT_KEY="{\"type\":\"service_account\",\"project_id\":\"reportzen-mixd3\",\"private_key_id\":\"f006f10e8d58e68ee55acf58745bfab3cf123c05\",\"private_key\":\"-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDABEksqxz3OP7J\\nHRM0uk1jvzov9AcImZdk1+GLnn8ZSQgR4lrlLYhVD9Jn39cND2JVhFqtk3uCaQH+\\ntJlLxwgDKdJIIt82HF4Nw7PKSPd2xSqGek8yIFAFqwsiq4XnB2wTZ9f97hiYN0hq\\nZTl3gTSCF/mvRJmlm3IBYCI4KXQCCCp9BiPhPbx5x+EZb7WnRslsgwNP2awtrMSK\\nUiqQcN4MCPoD6hxPQzk+MZcEVKuS/MkQS7O0nnN3TIqmpMbKIgBCrnhZI81cOjam\\nDtfiF8NzdFhcwttlK3REKGnNM9dK+I13LsJlhkd+rmPBPltcDebjjcc7gQCcmNme\\n8J3B0Ai5AgMBAAECggEACfuPDwFHDGahqbSsbXGBbtNKbqN0rtKcB37zt7hXP5TH\\nlHUcqE0xiR6Sn++ICiKdHaNiZXjFPeFAscxo1dg0nJl9gwjmat/sVzHany8jnRX2\\nC9oVqPOmGrgAPbQGI53ZVWRGMJTtdr2/suGtVv8Cyv/9F/VsjtVh3BwdMKdIY9yQ\\nEIlONolw+dVTKYiFPJbdsAPGJmz03dnjzd70FSyfMqKQ3ffEd1GQnTYLKdEO6N0P\\nJ5HiEduOEcMh0G8Ry1X2oA3iq4Cvr1/9TN1u3TIyxFo6UKFjuB6k4Ncgyd86Tod2\\nB+OoeMnO0JK+2q+ci6I9Z1xc6h3QV8Jc2FbPzuo1CQKBgQDql8Jw92GmFkcZB2Mh\\nhame5OTuO+S+oYZoVQykEUa/e32b1mhi/ySy11RffpWA10EqgZsLZ12X61gbiXmq\\njPurjXoHLVuUTGZjPG38Bcf5jp5SIcTfKi16rs3nONbiPisCbyA16c24xGLFuMMF\\njlePJSYtS3jrcpybjHRG93bCtQKBgQDRievyVwU19m72UI+VIyvqb3bZXhuTaVrx\\ni7vEeWBQfEzxRBZiiYh75k67O78WWjWDYth01AZlG+Micgr/aAhq0ktKooHk7iQY\\nX4SAv7Fa7VbbZrStNkTQyS8o2t1AJ2fnrC06I3crTpimQMxweIl4q7NuH1zJ7C7p\\n568h2lBcdQKBgQDLFtaeNYuz3VVvtZV8T9qoVEBcfj1pSyyw5fArmUlGPAJiBxwX\\nmAqNSR0iDtQe1jr0MX+oP7Qm8Pc1364UmDjIK5KY5AuENx/siUQuClM1GOK298UX\\n7cuxieN3aR2ef3N8h/e6tM4ERv+7bFhpVvE2W1LRo6TrMC2j+9QuG84UgQKBgQC5\\n/1Gftjr74ZoxruUlHylWWkcHQA/+VCDUFJNCHfOuvgeWijfMlATA5niwnqJKdxzV\\nWaKGYcajbZO6+bxlZrVCDRWkVIg07GbB89esaXxHGDJnYs2yi1+ebVcdTtninpgO\\n/7jNyLl5ibTart5KX9S3dsI5WEGHQ82I941v4VhAGQKBgGdubhBFJ8skoqokR6DL\\nFGODcmN6nP9OzrGXcC6g9CTUOP24r1YKHVvnjEdMAIMjFvH6HtJq4BI5zFVR2wSA\\nzdGVgeYv1jAUDTQ2OVcQYeDYt6kmfTqDW/suyBW2AjXY6davU5kfzyypK8z0CUKy\\nU3O5ru5Rb6zH/gYSsvhXFL9S\\n-----END PRIVATE KEY-----\\n\",\"client_email\":\"firebase-adminsdk-fbsvc@reportzen-mixd3.iam.gserviceaccount.com\",\"client_id\":\"106260250081518764874\",\"auth_uri\":\"https://accounts.google.com/o/oauth2/auth\",\"token_uri\":\"https://oauth2.googleapis.com/token\",\"auth_provider_x509_cert_url\":\"https://www.googleapis.com/oauth2/v1/certs\",\"client_x509_cert_url\":\"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40reportzen-mixd3.iam.gserviceaccount.com\",\"universe_domain\":\"googleapis.com\"}"


        # Method 2: Local File (Leave FIREBASE_SERVICE_ACCOUNT_KEY empty or remove it if using the local file)
        # Ensure the file is named 'reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json'
        # FIREBASE_SERVICE_ACCOUNT_KEY=

        # --- Admin User Identification ---
        # Option 1 (Simpler): Set this to the UID of the user you manually create as admin in Step 6.
        # The useAuth hook prioritizes this. Get the UID from Firebase Console > Authentication > Users.
        NEXT_PUBLIC_ADMIN_UID=CGgYniLRpOPeSaBvYtyYDbr8ZJm1

        # Option 2 (Custom Claims): Alternatively, you can use Firebase Custom Claims.
        # If you check the "Set as Admin" box when creating a user via the app's Admin Panel,
        # it sets a custom claim { admin: true }. You would then need to modify
        # src/hooks/useAuth.tsx to check `idTokenResult.claims.admin === true` instead of NEXT_PUBLIC_ADMIN_UID.
        ```
    *   **Important:** Double-check `NEXT_PUBLIC_FIREBASE_API_KEY`. An invalid or missing key is a very common cause of client-side errors.

6.  **IMPORTANT: Create the Initial Admin User in Firebase Console (Required):**
    *   Go to your Firebase project > Authentication > Users.
    *   Click "Add user".
    *   Enter the **exact email** for your admin (e.g., `j.abbay@admin.com`) and a secure password (e.g., `123456` **for local testing only - use a strong password in production**).
    *   Click "Add user".
    *   **Copy the User UID** of the user you just created (it should be `CGgYniLRpOPeSaBvYtyYDbr8ZJm1`). You'll need this for the `NEXT_PUBLIC_ADMIN_UID` environment variable in your `.env` file (if using that method). Paste it there.
    *   **You MUST complete this step before attempting to log in as the admin user.** Failure to do so will result in login errors (`auth/invalid-credential`).

7.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    *   *(Restart the server if you modified `.env` or `reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json`)*

8.  Open [http://localhost:9002](http://localhost:9002) (or the specified port) with your browser.

9.  **Log in as Admin:**
    *   Use the admin credentials you created manually (e.g., `j.abbay@admin.com` / `123456`).
    *   If login fails with "invalid credentials", double-check the email/password and ensure the user exists in the Firebase console.
    *   If login fails with API key errors, double-check your `NEXT_PUBLIC_FIREBASE_API_KEY` in `.env`.
    *   If server-side actions fail (like creating users), check the server console logs for errors related to "Firebase Admin SDK initialization". Verify Step 4.
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

*   **`Firebase: Error (auth/invalid-api-key)` (Client-side):** Your `NEXT_PUBLIC_FIREBASE_API_KEY` in `.env` is likely incorrect or missing. Verify it against your Firebase project settings. Restart the dev server after changes.
*   **`Firebase: Error (auth/invalid-credential)` (Client-side):** The email or password used for login is incorrect, OR the user does not exist in Firebase Authentication. Ensure you created the user manually first (Step 6).
*   **`Firebase Admin SDK could not be initialized` (Server log):** Your server-side Admin SDK credentials are not configured correctly (Step 4). Check server logs for detailed errors from `src/lib/firebase/admin.ts`.
    *   **If using Env Var:** Ensure `FIREBASE_SERVICE_ACCOUNT_KEY` is set in the server environment (or `.env.local`) and contains the **complete, valid JSON** string. Check for typos or truncation.
    *   **If using Local File:** Ensure `reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json` exists in the project root, is named correctly, contains valid JSON, and is readable by the server process. Make sure it's in `.gitignore`.
*   **`Cannot find module 'reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json'` (Server log):** If using the local file method, the server cannot find the file. Ensure it's named correctly and placed in the project root.
*   **`Error parsing service account JSON` (Server log):** The content of your `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable or `reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json` file is not valid JSON. Copy it directly from Firebase again.
*   **Hydration Errors:** Often caused by rendering differences between server and client. Check for browser-specific APIs (`window`, `localStorage`) used outside `useEffect` or conditional rendering based on non-deterministic values (`Math.random()`, `new Date()`) before hydration.
*   **404 Errors:** Double-check your page routes (`src/app/.../page.tsx`) and component imports. Ensure files exist and are correctly named.
