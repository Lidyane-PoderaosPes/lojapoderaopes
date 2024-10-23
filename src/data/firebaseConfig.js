// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyAJgHKBuONivsHsXfH7CVd3oljvpAZSRlI",
  authDomain: "poderaospes-bfa97.firebaseapp.com",
  projectId: "poderaospes-bfa97",
  storageBucket: "poderaospes-bfa97.appspot.com",
  messagingSenderId: "248608965901",
  appId: "1:248608965901:web:b217e7f772dd7bcf949c44"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
