// functions/src/index.ts
import * as admin from "firebase-admin";

// Initialize the admin SDK (only do this once)
admin.initializeApp();

// Export the functions
export { createAdmin } from "./users/createAdmin";
export { createEmployee } from "./users/createEmployee";