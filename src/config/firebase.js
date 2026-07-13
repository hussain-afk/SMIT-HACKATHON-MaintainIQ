// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup  } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc,collection, addDoc, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, doc, setDoc, getDoc, collection, addDoc, getDocs, deleteDoc, updateDoc };









