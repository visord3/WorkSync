// functions/src/index.ts
import * as admin from "firebase-admin";

// Initialize the admin SDK (only do this once)
admin.initializeApp();

// Export the createAdmin function from your users/createAdmin.ts file
export { createAdmin } from "./users/createAdmin";
