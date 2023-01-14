// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export default { app: app };
