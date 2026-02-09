import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBsepxniICNXKeCaqIr9cJ0dBB5IzjQGv4",
  authDomain: "mental-scope.firebaseapp.com",
  projectId: "mental-scope",
  storageBucket: "mental-scope.appspot.com",
  messagingSenderId: "462560083248",
  appId: "1:462560083248:web:8f5959b2e45c25f17f9cf5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
