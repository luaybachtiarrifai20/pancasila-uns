import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Ganti dengan konfigurasi Firebase Web App Anda
// Anda bisa mendapatkannya di Firebase Console > Project Settings > General > Your Apps (Web)
const firebaseConfig = {
  apiKey: "AIzaSyA2qfKiuewAmq9AOCNLaSj9BTxIMuyE0uE", // Biasanya sama dengan yang di google-services.json
  authDomain: "pancasila-uns.firebaseapp.com",
  projectId: "pancasila-uns",
  storageBucket: "pancasila-uns.firebasestorage.app",
  messagingSenderId: "543989558747",
  appId: "1:543989558747:web:d7eafc994530b6e5b94bfe" // Perlu didapatkan dari Firebase Console, berbeda dengan mobile
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
