import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBsepxniICNXKeCaqIr9cjOdBB5IzjQGv4",
  authDomain: "mental-scope.firebaseapp.com",
  projectId: "mental-scope",
  storageBucket: "mental-scope.firebasestorage.app",
  messagingSenderId: "462560083248",
  appId: "1:462560083248:web:8f5959b2e45c25f17f9cf5",
  measurementId: "G-YM6KFM7N9F"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app;
