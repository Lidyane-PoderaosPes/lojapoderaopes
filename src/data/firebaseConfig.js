// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAJgHKBuONivsHsXfH7CVd3oljvpAZSRlI",
  authDomain: "poderaospes-bfa97.firebaseapp.com",
  projectId: "poderaospes-bfa97",
  storageBucket: "poderaospes-bfa97.appspot.com",
  messagingSenderId: "248608965901",
  appId: "1:248608965901:web:b217e7f772dd7bcf949c44"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // Inicializando o Firebase Storage

export { db, auth, storage };
