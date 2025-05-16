import firebase from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

// Initialize only if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
  });
}

const db = getFirestore();
const admin = firebase; // Alias for clarity in Cloud Functions

export { db, admin };
