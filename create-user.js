// create-user.js
const admin = require("firebase-admin");

// Path to your Firebase service account key JSON file
// Ensure this path is correct and the file exists.
// You might need to adjust the path based on where you run the script from.
let serviceAccount;
try {
  serviceAccount = require("./serviceAccountKey.json"); // Adjust path if necessary
} catch (error) {
  console.error("Error loading service account key file:", error);
  console.error("Ensure 'serviceAccountKey.json' exists in the correct directory.");
  process.exit(1); // Exit if the key file is missing
}


// Check if Firebase Admin SDK is already initialized to prevent errors
if (!admin.apps.length) {
    try {
        // Initialize Firebase Admin SDK
        admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error) {
        console.error("Error initializing Firebase Admin SDK:", error);
        process.exit(1); // Exit if initialization fails
    }
} else {
    console.log("Firebase Admin SDK already initialized.");
}


// --- User Creation ---
const userEmail = "j.abbay@admin.com"; // Correct email
const userPassword = "123456";

// Create user function
async function createUser() {
  try {
    const userRecord = await admin.auth().createUser({
      email: userEmail,
      password: userPassword,
      // You can add other properties like displayName here if needed
      // displayName: "J Abbay",
    });
    console.log("Successfully created new user:", userRecord.uid, `(${userEmail})`);

    // Optionally, set custom claims (like admin role) right after creation
    // await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    // console.log(`Custom claim 'admin: true' set for user ${userRecord.uid}`);

  } catch (error: any) { // Catch specific error type if possible
    if (error.code === 'auth/email-already-exists') {
      console.warn(`User with email ${userEmail} already exists.`);
      // Optionally, try to find the existing user and update claims if needed
      try {
        const existingUser = await admin.auth().getUserByEmail(userEmail);
        console.log(`Found existing user: ${existingUser.uid}`);
        // Example: Ensure admin claim is set if needed
        // if (!existingUser.customClaims?.admin) {
        //   await admin.auth().setCustomUserClaims(existingUser.uid, { admin: true });
        //   console.log(`Set admin claim for existing user ${existingUser.uid}`);
        // }
      } catch (findError) {
        console.error(`Error finding existing user ${userEmail}:`, findError);
      }
    } else {
      console.error("Error creating new user:", error.message || error);
    }
  }
}

// Run the create user function
createUser();

// Note: This script will run and exit. If you need it to stay running (e.g., for a server),
// you'll need to modify it accordingly. For a one-time user creation, this is sufficient.
