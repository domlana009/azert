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
    *   Go to Authentication > Users and add at least one user. Note the UID of the user you want to be the admin.

4.  **Configure Environment Variables:**
    *   Create a file named `.env` in the root of your project by copying the example file:
        ```bash
        cp .env.example .env
        ```
    *   Open the `.env` file.
    *   Replace the placeholder values (`YOUR_...`) with your actual Firebase project configuration values from the `firebaseConfig` object you copied earlier.
    *   Replace `REPLACE_WITH_ADMIN_USER_UID` with the actual UID of the user you designated as admin.
    *   If using Genkit with Google AI, add your `GOOGLE_GENAI_API_KEY`.

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```

6.  Open [http://localhost:9002](http://localhost:9002) (or the specified port) with your browser to see the result.

## Features

*   Tabbed Navigation: Switch between Daily Report, Activity Report, and Truck Tracking sections.
*   Daily Report Form: Input and display for daily reports.
*   Dynamic Data Tables: Interactive tables for activity and truck tracking.
*   Authentication: User login/logout using Firebase Auth.
*   Admin Panel: Basic admin panel link visible only to users with the 'admin' role.

## Technologies Used

*   Next.js (App Router)
*   React
*   TypeScript
*   Tailwind CSS
*   Shadcn/ui
*   Lucide React (Icons)
*   Firebase Authentication
*   Genkit (for potential GenAI features)
```