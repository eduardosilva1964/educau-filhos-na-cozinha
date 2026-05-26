import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: "educau-filhos-na-cozinha.firebaseapp.com",
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: "educau-filhos-na-cozinha.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FB_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);