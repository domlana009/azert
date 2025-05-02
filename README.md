
# ReportZen

This is a Next.js application for daily job reporting using Firebase for authentication.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd ReportZen
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Firebase:**
    *   Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   Go to Project Settings > General.
    *   Under "Your apps", click the Web icon (`</>`) to add a web app.
    *   Register your app and copy the `firebaseConfig` object.
    *   Enable Firebase Authentication (Email/Password sign-in method).
    *   **Admin User:** Decide on the email for your initial admin user (e.g., `j.abbay@admin.com`). You will designate this user as admin *after* creating them via the application's admin panel.
    *   **Service Account Key (for Admin Actions):**
        *   Go to Project Settings > Service accounts.
        *   Click "Generate new private key" and confirm. A JSON file will download.
        *   **Option 1 (Recommended for Deployment):** Set the entire content of the downloaded JSON file as an environment variable named `FIREBASE_SERVICE_ACCOUNT_KEY` in your deployment environment (e.g., Vercel). Make sure it's a single line (remove newlines).
        *   **Option 2 (Local Development):** Rename the downloaded file to `serviceAccountKey.json` and place it in the **root directory** of your project (ensure it's listed in your `.gitignore` file to prevent committing it).

4.  **Configure Environment Variables:**
    *   Create a file named `.env` in the root of your project by copying the example file:
        ```bash
        cp .env.example .env
        ```
    *   Open the `.env` file.
    *   Replace the placeholder values (`YOUR_...`) with your actual Firebase project configuration values from the `firebaseConfig` object you copied earlier (prefixed with `NEXT_PUBLIC_`).
    *   **Crucially, set `FIREBASE_SERVICE_ACCOUNT_KEY`** if using Option 1 above. If using Option 2 (local file), this variable can be left empty or removed, but the `serviceAccountKey.json` file **must** be present locally.
    *   If using Genkit with Google AI, add your `GOOGLE_GENAI_API_KEY`.
    *   **(Optional but Recommended for simpler Admin setup):** If you prefer *not* to use Firebase Custom Claims for admin identification initially, you can uncomment and set `NEXT_PUBLIC_ADMIN_UID` to the UID of the admin user *after* you create them via the app. Get the UID from the Firebase Console (Authentication > Users). The `useAuth.tsx` hook currently prioritizes this environment variable method. If you use the custom claim method (checkbox in the create user form), adjust `useAuth.tsx` accordingly to check `decodedToken.admin` instead.

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

6.  Open [http://localhost:9002](http://localhost:9002) (or the specified port) with your browser to see the result.

7.  **Create the Initial Admin User:**
    *   The application currently doesn't have a user signup page. You need to create the *first* user (who will be admin) using the Firebase Console for now:
        *   Go to your Firebase project > Authentication > Users > Add user.
        *   Enter the email you decided on (e.g., `j.abbay@admin.com`) and a password.
    *   **(If using `NEXT_PUBLIC_ADMIN_UID`):** Copy the UID of the user you just created and set it as the value for `NEXT_PUBLIC_ADMIN_UID` in your `.env` file. Restart your development server (`npm run dev`).
    *   Log in to the ReportZen application with the admin credentials.
    *   You should now see the "Admin Panel" button. Click it, then click "Create New User" to add other users.

## Features

*   Tabbed Navigation: Switch between Daily Report, Activity Report, and Truck Tracking sections.
*   Daily Report Form: Input and display for daily reports.
*   Dynamic Data Tables: Interactive tables for activity and truck tracking.
*   Authentication: User login/logout using Firebase Auth.
*   Admin Panel: Basic admin panel (accessible via `/admin`) allowing admins to create new users.

## Technologies Used

*   Next.js (App Router)
*   React
*   TypeScript
*   Tailwind CSS
*   Shadcn/ui
*   Lucide React (Icons)
*   Firebase Authentication
*   Firebase Admin SDK (for server-side actions like user creation)
*   Genkit (for potential GenAI features)
