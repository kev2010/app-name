// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { decode } from "base-64";
// import { getAnalytics } from "firebase/analytics";
// Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDWdNYk56toUnyp_ReUXWZLzeTKmXn0Zg",
  authDomain: "thoughts-f813e.firebaseapp.com",
  projectId: "thoughts-f813e",
  storageBucket: "thoughts-f813e.appspot.com",
  messagingSenderId: "921730820705",
  appId: "1:921730820705:web:c8bf394c60b7095cf91820",
  measurementId: "G-ZFBGCLMZ52",
};

if (typeof atob === "undefined") {
  global.atob = decode;
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Get a reference to the storage service, which is used to create references in your storage bucket
export const storage = getStorage();
// const analytics = getAnalytics(app);
