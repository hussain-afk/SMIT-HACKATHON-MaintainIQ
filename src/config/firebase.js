import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBUA30-6ADlRFv7kgqdfKEvKtqIVKQlYAs",
  authDomain: "e-commerce-d4e08.firebaseapp.com",
  projectId: "e-commerce-d4e08",
  storageBucket: "e-commerce-d4e08.firebasestorage.app",
  messagingSenderId: "352690466549",
  appId: "1:352690466549:web:e5022d120b4cfaae4bdfbc",
  measurementId: "G-MRR22P6HTK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
