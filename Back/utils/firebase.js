import firebase from 'firebase-admin';
import serviceAccount from './firebase_key.json' with {type: 'json'};
import { getFirestore } from 'firebase-admin/firestore';

const app = firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
});

const db = getFirestore(app);

export default db;