// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth,GoogleAuthProvider} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "loginlms-62fa1.firebaseapp.com",
  projectId: "loginlms-62fa1",
  storageBucket: "loginlms-62fa1.firebasestorage.app",
  messagingSenderId: "880161844177",
  appId: "1:880161844177:web:bfc4f73b56b85386e68ef0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export {auth, provider}