// This file connects our app to Firebase (a service that stores our
// data online and handles user logins for us).
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

// These are the settings that tell Firebase which project is ours.
// The API key comes from a ".env" file so it is not hard-coded in the code.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "realtime-todo-a97e3.firebaseapp.com",
  databaseURL: "https://realtime-todo-a97e3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "realtime-todo-a97e3",
  storageBucket: "realtime-todo-a97e3.firebasestorage.app",
  messagingSenderId: "627242537064",
  appId: "1:627242537064:web:35b92495484cd2e3116bdd",
  measurementId: "G-Y8PKPLL2HN"
};

// Start Firebase, and grab the two tools we need:
// "auth" (login/signup) and "db" (the database that stores assets).
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot,
};
