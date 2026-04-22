// src/firebase.js
// 👉 REMPLACE CES VALEURS par celles de ton projet Firebase
// Va sur https://console.firebase.google.com → Créer un projet → Ajouter une app Web

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "REMPLACE_PAR_TON_API_KEY",
  authDomain: "REMPLACE_PAR_TON_AUTH_DOMAIN",
  projectId: "REMPLACE_PAR_TON_PROJECT_ID",
  storageBucket: "REMPLACE_PAR_TON_STORAGE_BUCKET",
  messagingSenderId: "REMPLACE_PAR_TON_MESSAGING_SENDER_ID",
  appId: "REMPLACE_PAR_TON_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
