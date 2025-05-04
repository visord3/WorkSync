// functions/src/users/createAdmin.ts
import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";

interface CreateAdminData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export const createAdmin = functions.https.onCall(
  async (request) => {
    const { data } = request;

    const { name, email, password, phone = "", address = "" } = data as CreateAdminData;

    if (!name || !email || !password) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Name, email, and password are required."
      );
    }


    try {
      // Create the auth user
      const userRecord = await admin.auth().createUser({ email, password });

      // Grant admin role via custom claim
      await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

      // Add user document in Firestore
      await admin.firestore().collection("users").doc(userRecord.uid).set({
        name,
        email,
        phone,
        address,
        role: "admin",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { uid: userRecord.uid, email: userRecord.email };
    } catch (error: any) {
      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);
