// functions/src/users/createEmployee.ts
import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";

interface CreateEmployeeData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  department?: string;
}

export const createEmployee = functions.https.onCall(
  async (request) => {
    const { data, auth } = request;

    if (!auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "You must be logged in to create an employee."
      );
    }

    // Check if caller is admin or superAdmin
    const callerUid = auth.uid;
    const callerDoc = await admin.firestore().collection("users").doc(callerUid).get();
    
    if (!callerDoc.exists) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "User does not exist."
      );
    }
    
    const callerData = callerDoc.data();
    if (callerData?.role !== "admin" && callerData?.role !== "superAdmin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can create employees."
      );
    }

    const { name, email, password, phone = "", address = "", department = "" } = data as CreateEmployeeData;

    if (!name || !email || !password) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Name, email, and password are required."
      );
    }

    try {
      // Create the auth user
      const userRecord = await admin.auth().createUser({ email, password });

      // Add user document in Firestore
      await admin.firestore().collection("users").doc(userRecord.uid).set({
        name,
        email,
        phone,
        address,
        department,
        role: "employee",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: callerUid
      });

      return { uid: userRecord.uid, email: userRecord.email };
    } catch (error: any) {
      throw new functions.https.HttpsError("internal", error.message);
    }
  }
);