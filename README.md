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
    *   **Requirement:** You need valid service account credentials for server-side operations (like user creation/management). Choose **ONE** method below. **Failure to configure this correctly will cause server-side errors like "Firebase Admin SDK access failed..." or "Firebase Admin SDK could not be initialized...".**
    *   **Method 1 (Recommended for Deployment & Security): Environment Variable**
        *   Go to your Firebase Project Settings > Service accounts.
        *   Click "Generate new private key" and confirm. A JSON file containing your service account key will download.
        *   **Important:** Open the downloaded JSON file. **Copy its ENTIRE content.** The content MUST be valid JSON and typically starts with `{"type": "service_account", ...}` including `project_id`, `private_key`, and `client_email`.
        *   Set this entire JSON content as an environment variable named `FIREBASE_SERVICE_ACCOUNT_KEY`.
        *   **How to set environment variables:**
            *   **Vercel/Netlify/Cloud Run etc.:** Use the platform's dashboard to set the `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable. Paste the full, valid JSON content as the value. Ensure there are no extra spaces or modifications.
            *   **Local `.env` file:** You can add `FIREBASE_SERVICE_ACCOUNT_KEY='{...}'` to your `.env` file (or preferably `.env.local`), replacing `{...}` with the *single-line* JSON content. Be **extremely careful** not to commit this file if it contains the actual key. Using `.env.local` (which is typically gitignored) is safer. **Ensure the JSON is valid (use an online validator if needed).**
            ```dotenv
            # Example for .env.local (MAKE SURE THIS FILE IS IN .gitignore)
            # Ensure the JSON is valid and contains "project_id", "private_key", "client_email"
            FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", "project_id": "reportzen-mixd3", ...}'
            ```
        *   **If using this method, ensure the `FIREBASE_SERVICE_ACCOUNT_KEY` line in your `.env` file is uncommented and correctly set, AND that the local file (`reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json`) is either deleted or its corresponding `FIREBASE_SERVICE_ACCOUNT_KEY` line in `.env` is commented out/empty.** The environment variable takes precedence if set and valid.
    *   **Method 2 (Easier for Local Development, Default Setup): Local File**
        *   Go to your Firebase Project Settings > Service accounts.
        *   Click "Generate new private key" and confirm. A JSON file will download.
        *   Rename the downloaded file to **exactly** `reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json`.
        *   Place this `reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json` file in the **project root directory** (the same level as `package.json`).
        *   **Verify Content:** Ensure the file content is the complete, valid JSON provided by Firebase (it should start with `{ "type": "service_account", ... }` and include `project_id`, `private_key`, `client_email`). **An empty, incomplete, or malformed file will cause initialization errors.**
        *   **CRITICAL:** Add `reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json` to your `.gitignore` file **immediately** to prevent accidentally committing your secret key to version control.
        ```gitignore
        # .gitignore
        reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json
        .env.local
        .env.*.local
        node_modules
        .next
        ```
        *   **If using this method, ensure the `FIREBASE_SERVICE_ACCOUNT_KEY` line in your `.env` file is commented out or empty.**
    *   **Verification:** When the server starts (e.g., `npm run dev`), check the **server console logs** (not the browser console). Look for messages like "Firebase Admin SDK: Initialization successful..." or errors indicating problems reading/parsing credentials (e.g., "CRITICAL - No valid service account credentials found...", "CRITICAL - Failed to parse..."). The server log will indicate if it tried the environment variable or the local file and whether it succeeded or found valid JSON.

5.  **Configure Client-Side Environment Variables:**
    *   Create a file named `.env` in the root of your project (if it doesn't exist). You can copy `.env.example` if provided.
    *   Open the `.env` file.
    *   Add the following variables, replacing the placeholder values (`YOUR_...`) with your actual Firebase project configuration values from the `firebaseConfig` object you copied in Step 3 (ensure they are prefixed with `NEXT_PUBLIC_`):
        ```dotenv
        # --- Client-Side Firebase Config ---
        # Replace YOUR_... values with your actual Firebase credentials from Step 3
        NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDD2kQbx8lp93awx5rSIr86Jm1mIN15Xs8
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=reportzen-mixd3.firebaseapp.com
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=reportzen-mixd3
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=reportzen-mixd3.firebasestorage.app
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=228045181413
        NEXT_PUBLIC_FIREBASE_APP_ID=1:228045181413:web:600fcac96998fed7c35f0c
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
        NEXT_PUBLIC_FIREBASE_DYNAMIC_LINKS_API_KEY=AIzaSyAbjvD-BEdzhaZzIw2AYnMYNQL8egjn_Xw

        # --- Genkit / Google AI (Optional) ---
        GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_AI_API_KEY # Add if using Genkit

        # --- Server-Side Admin SDK (Choose Method 1 OR Method 2 from Step 4) ---

        # Method 1: Environment Variable (Paste the FULL and VALID JSON content here or set in deployment environment)
        # If using Method 1, uncomment this line and paste the VALID JSON string. Comment out/empty the local file method setup.
        FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", "project_id": "reportzen-mixd3", ...}'

        # Method 2: Local File (Default for local development)
        # Ensure 'reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json' is in the project root and contains VALID JSON.
        # Keep FIREBASE_SERVICE_ACCOUNT_KEY commented out or empty if using the local file.
        # FIREBASE_SERVICE_ACCOUNT_KEY="" # Keep this empty or commented out for Method 2

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
    *   Enter the **exact email** for your admin (`j.abbay@admin.com`) and a secure password (`123456` **for local testing only - use a strong password in production**).
    *   Click "Add user".
    *   **Copy the User UID** of the user you just created (it should be `CGgYniLRpOPeSaBvYtyYDbr8ZJm1` based on your `.env` setup). You *MUST* ensure this UID matches the one in your `NEXT_PUBLIC_ADMIN_UID` environment variable in your `.env` file. Paste it there if it's different.
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
    *   Use the admin credentials you created manually (`j.abbay@admin.com` / `123456`).
    *   If login fails with "invalid credentials", double-check the email/password and ensure the user exists in the Firebase console (Step 6).
    *   If login fails with API key errors, double-check your `NEXT_PUBLIC_FIREBASE_API_KEY` in `.env`.
    *   If server-side actions fail (like creating/listing users), check the **server console logs** for errors related to "Firebase Admin SDK initialization". Verify Step 4 carefully.
    *   Once logged in, if you set `NEXT_PUBLIC_ADMIN_UID` correctly, you should see the "Admin" button. Click it, then "Create New User" to add others.

## Features

*   Tabbed Navigation: Switch between Daily Report, Activity Report, R0 Report, and Truck Tracking sections based on user permissions.
*   Forms: Input and display for daily reports, activity reports, R0 reports, and truck tracking.
*   Dynamic Data Tables: Interactive tables for activity and truck tracking.
*   Authentication: User login/logout using Firebase Auth.
*   Admin Panel: Basic admin panel (accessible via `/admin`) allowing admins to create new users, manage roles, disable/enable users, and manage section permissions.

## Technologies Used

*   Next.js (App Router)
*   React
*   TypeScript
*   Tailwind CSS
*   Shadcn/ui
*   Lucide React (Icons)
*   Firebase Authentication (Client SDK)
*   Firebase Admin SDK (Server-side for user creation/management/claims)
*   Genkit (for potential GenAI features)
*   date-fns

## Troubleshooting

*   **`Firebase: Error (auth/invalid-api-key)` (Client-side):** Your `NEXT_PUBLIC_FIREBASE_API_KEY` in `.env` is likely incorrect or missing. Verify it against your Firebase project settings. Restart the dev server after changes.
*   **`Firebase: Error (auth/invalid-credential)` (Client-side):** The email or password used for login is incorrect, OR the user does not exist in Firebase Authentication. Ensure you created the user manually first (Step 6).
*   **`Firebase Admin SDK access failed: CRITICAL - No valid service account credentials found...` (Server error during actions):** This is the most common server-side error. It means the Admin SDK could not initialize because it couldn't find or read the credentials.
    *   **Check Server Logs FIRST:** Look at the *very beginning* of your server console output when you start the app (`npm run dev`). You should see logs from `src/lib/firebase/admin.ts` indicating which credential method it tried (environment variable or local file) and whether it succeeded, found an empty file/variable, failed to parse JSON, or couldn't find the file. **This log is crucial.**
    *   **Verify Step 4:** Go back to Step 4 and meticulously re-read the instructions for **either** Method 1 (Env Var) **or** Method 2 (Local File). You must choose *one* and configure it correctly.
    *   **If using Env Var (Method 1):**
        *   Is `FIREBASE_SERVICE_ACCOUNT_KEY` set in your server environment (e.g., Vercel dashboard, `.env.local`)?
        *   Does its value contain the **COMPLETE and VALID JSON** string copied *directly* from the downloaded file? (Check for typos, truncation, invalid JSON syntax like missing quotes, using single quotes instead of double quotes inside the JSON). Ensure it's not just an empty string `{}` or missing required fields like `project_id`, `private_key`, `client_email`. Use an online JSON validator if unsure.
        *   Is the `FIREBASE_SERVICE_ACCOUNT_KEY` line in your `.env` file **commented out or empty** (as the environment variable takes precedence)?
    *   **If using Local File (Method 2 - Default for local dev):**
        *   Does the file `reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json` exist **exactly** in the project root directory (same level as `package.json`)? Check the path mentioned in the server log error.
        *   Is the filename spelled **exactly** correctly?
        *   Does the file contain the **COMPLETE and VALID JSON** content provided by Firebase? Open it and check. It must start with `{ "type": "service_account", ... }`. An empty or malformed file will fail. Use an online JSON validator if unsure.
        *   Is the `FIREBASE_SERVICE_ACCOUNT_KEY` line in your `.env` file **commented out or empty**? If it has a value (even an invalid one), the code might try to use it instead of the file.
        *   Is the file readable by the server process (check file permissions)?
        *   Is the file listed in your `.gitignore`?
*   **`Error parsing service account JSON` (Server log):** The content of your `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable or `reportzen-mixd3-firebase-adminsdk-fbsvc-f006f10e8d.json` file is not valid JSON. Copy it directly from Firebase again. Check for accidental modifications. Use an online JSON validator.
*   **Hydration Errors:** Often caused by rendering differences between server and client. Check for browser-specific APIs (`window`, `localStorage`) used outside `useEffect` or conditional rendering based on non-deterministic values (`Math.random()`, `new Date()`) before hydration. Check for invalid HTML nesting (e.g., whitespace between `<tr>` and `<td>`).
*   **404 Errors:** Double-check your page routes (`src/app/.../page.tsx`) and component imports. Ensure files exist and are correctly named.
*   **Permission Denied (Admin Actions):** If you can log in but admin actions (like listing/creating users) fail with permission errors, ensure the user you are logged in as is correctly identified as an admin (either by matching `NEXT_PUBLIC_ADMIN_UID` or having the `admin: true` custom claim, depending on your `useAuth.tsx` logic).

    