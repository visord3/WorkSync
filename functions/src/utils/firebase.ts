
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

export default admin;
export { createAdmin } from "../users/createAdmin";
