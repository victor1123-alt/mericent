// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your Firebase config (already have this)
const firebaseConfig = {
  apiKey: "AIzaSyBVycxz4cz1KiUW423O2o3b9QOmpQmK-5o",
  authDomain: "e-commerceweb-app.firebaseapp.com",
  projectId: "e-commerceweb-app",
  storageBucket: "e-commerceweb-app.firebasestorage.app",
  messagingSenderId: "121109295785",
  appId: "1:121109295785:web:471b53de5ee9a6fb2fefb8",
  measurementId: "G-BSLXP63CDR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
