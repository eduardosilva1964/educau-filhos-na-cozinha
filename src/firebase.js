import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCzwtEC0AgiS9zWm0le4N-G-e1Z7hn1bLU",
  authDomain: "educau-filhos-na-cozinha.firebaseapp.com",
  projectId: "educau-filhos-na-cozinha",
  storageBucket: "educau-filhos-na-cozinha.firebasestorage.app",
  messagingSenderId: "438524728051",
  appId: "1:438524728051:web:99721e7cf7154001109d86"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);